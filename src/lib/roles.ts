// Central definition of staff roles and what each one can reach in /admin.
// "customer" is a separate, non-staff role handled entirely by /dashboard —
// it never appears in this list.

export const STAFF_ROLES = ["admin", "manager", "receptionist", "professional"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type AppRole = StaffRole | "customer";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  receptionist: "Recepcionista / Cajero",
  professional: "Profesional",
};

export type Section =
  | "dashboard"
  | "calendar"
  | "appointments"
  | "customers"
  | "services"
  | "employees"
  | "products"
  | "sales"
  | "caja"
  | "reports"
  | "payroll";

// The permission matrix. "professional" is intentionally left out of every
// section except calendar/profile — they only ever see their own agenda,
// enforced both here and by data-level filtering (their own employeeId) in
// the pages themselves. "payroll" (salaries) is deliberately as restricted as
// "employees" — same admin/manager audience that manages staff records.
const SECTION_ACCESS: Record<Section, StaffRole[]> = {
  dashboard: ["admin", "manager", "receptionist"],
  calendar: ["admin", "manager", "receptionist", "professional"],
  appointments: ["admin", "manager", "receptionist"],
  customers: ["admin", "manager", "receptionist"],
  services: ["admin", "manager"],
  employees: ["admin", "manager"],
  products: ["admin", "manager", "receptionist"],
  sales: ["admin", "manager", "receptionist"],
  caja: ["admin", "manager", "receptionist"],
  reports: ["admin", "manager"],
  payroll: ["admin", "manager"],
};

export function canAccess(role: StaffRole, section: Section): boolean {
  return SECTION_ACCESS[section].includes(role);
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

// A manager may manage receptionist/professional accounts but never create
// or edit an admin or another manager — only an admin can do that.
export function canManageEmployeeRole(actingRole: StaffRole, targetRole: string): boolean {
  if (actingRole === "admin") return true;
  if (actingRole === "manager") return targetRole === "receptionist" || targetRole === "professional";
  return false;
}

// Where a staff member lands after login / when hitting a section they can't access.
export function staffHomeRoute(role: StaffRole): string {
  return role === "professional" ? "/admin/calendario" : "/admin";
}
