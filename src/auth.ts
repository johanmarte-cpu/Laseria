import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { isStaffRole } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { customer: true, employee: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Staff accounts are gated by their employee record being active —
        // deactivating an employee (see /admin/empleados) locks them out
        // immediately without needing to touch the User row.
        if (isStaffRole(user.role) && (!user.employee || !user.employee.active)) {
          return null;
        }

        const displayName = user.customer
          ? `${user.customer.firstName} ${user.customer.lastName}`
          : user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.email;

        return {
          id: user.id,
          email: user.email,
          name: displayName,
          role: user.role as "customer" | "admin" | "manager" | "receptionist" | "professional",
          customerId: user.customer?.id ?? null,
          employeeId: user.employee?.id ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.customerId = user.customerId;
        token.employeeId = user.employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.customerId = token.customerId;
        session.user.employeeId = token.employeeId;
      }
      return session;
    },
  },
});
