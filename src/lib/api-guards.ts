import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";
import { isStaffRole, type StaffRole } from "@/lib/roles";

export async function requireCustomer(): Promise<
  { session: Session; customerId: string } | NextResponse
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (session.user.role !== "customer" || !session.user.customerId) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }
  return { session, customerId: session.user.customerId };
}

/**
 * Guards a staff-only API route. Pass `allowedRoles` to restrict further
 * (e.g. `["admin", "manager"]` for reports); omit it to allow any staff role.
 */
export async function requireStaff(
  allowedRoles?: StaffRole[]
): Promise<{ session: Session; role: StaffRole; employeeId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const role = session.user.role;
  if (!isStaffRole(role) || !session.user.employeeId) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "No tienes permiso para esta acción." }, { status: 403 });
  }
  return { session, role, employeeId: session.user.employeeId };
}

/** Back-compat alias for routes that are strictly admin-only. */
export function requireAdmin() {
  return requireStaff(["admin"]);
}
