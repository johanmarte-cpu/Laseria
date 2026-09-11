import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { canManageEmployeeRole, isStaffRole } from "@/lib/roles";
import { generateTempPassword } from "@/lib/utils";

// Admin/manager-initiated password reset — generates a new temporary
// password for the employee's login account, same pattern as employee
// creation (src/app/api/admin/employees/route.ts). Unlike self-service
// change-password, this never needs the old password.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const target = await prisma.professional.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });

  if (!isStaffRole(target.role) || !canManageEmployeeRole(guard.role, target.role)) {
    return NextResponse.json(
      { error: "No tienes permiso para restablecer la contraseña de este empleado." },
      { status: 403 }
    );
  }

  if (!target.userId) {
    return NextResponse.json({ error: "Este empleado no tiene una cuenta de acceso." }, { status: 404 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await prisma.user.update({ where: { id: target.userId }, data: { passwordHash } });

  return NextResponse.json({ tempPassword });
}
