import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmployeesTable } from "@/components/admin/employees/employees-table";
import type { StaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Empleados" };

export default async function AdminEmployeesPage() {
  const session = await auth();
  const employees = await prisma.professional.findMany({
    include: { schedules: true },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });

  return (
    <EmployeesTable
      employees={employees.map((e) => ({ ...e, role: e.role as StaffRole }))}
      actingRole={session!.user.role as StaffRole}
    />
  );
}
