import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the NextAuth config — used directly by src/middleware.ts
// (which runs on the Edge runtime). It must never import bcryptjs or the
// Prisma client: neither works on Edge, and pulling either in here bloats
// the middleware bundle well past Vercel's Edge Function size limit (this
// is exactly what happened before this file existed — middleware.ts used to
// import the full src/auth.ts, dragging in bcrypt + @prisma/client and
// pushing the bundle to ~1.1 MB against a 1 MB limit).
//
// The actual `Credentials` provider (which does need bcrypt + Prisma to look
// up and verify a user) lives only in src/auth.ts, which spreads this config
// and adds `providers`. Only src/auth.ts is imported by API routes and
// server components — never by middleware.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
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
  providers: [],
} satisfies NextAuthConfig;
