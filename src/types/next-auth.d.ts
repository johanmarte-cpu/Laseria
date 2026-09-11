import { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    role: AppRole;
    customerId?: string | null;
    employeeId?: string | null;
  }

  interface Session {
    user: {
      role: AppRole;
      customerId?: string | null;
      employeeId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: AppRole;
    customerId?: string | null;
    employeeId?: string | null;
  }
}
