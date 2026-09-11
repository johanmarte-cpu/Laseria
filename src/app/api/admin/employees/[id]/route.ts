import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { employeeFormSchema } from "@/lib/validations";
import { canManageEmployeeRole, isStaffRole } from "@/lib/roles";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = employeeFormSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const target = await prisma.professional.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });

  if (
    !isStaffRole(target.role) ||
    !canManageEmployeeRole(guard.role, target.role) ||
    (parsed.data.role && !canManageEmployeeRole(guard.role, parsed.data.role))
  ) {
    return NextResponse.json({ error: "No tienes permiso para editar este empleado." }, { status: 403 });
  }

  const { email, cedula: rawCedula, ...rest } = parsed.data;

  if (email && email.toLowerCase() !== target.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (emailTaken) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email." }, { status: 409 });
    }
  }

  const cedula = rawCedula !== undefined ? rawCedula.trim() || null : undefined;
  if (cedula && cedula !== target.cedula) {
    const cedulaTaken = await prisma.professional.findUnique({ where: { cedula } });
    if (cedulaTaken) {
      return NextResponse.json({ error: "Ya existe un empleado con esa cédula." }, { status: 409 });
    }
  }

  const employee = await prisma.professional.update({
    where: { id },
    data: {
      ...rest,
      ...(email ? { email: email.toLowerCase() } : {}),
      ...(cedula !== undefined ? { cedula } : {}),
    },
  });

  // Keep the login account's role and email in sync with the employee record.
  if (target.userId && (parsed.data.role || email)) {
    await prisma.user.update({
      where: { id: target.userId },
      data: {
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
      },
    });
  }

  return NextResponse.json({ employee });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const target = await prisma.professional.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Empleado no encontrado." }, { status: 404 });
  if (!canManageEmployeeRole(guard.role, target.role)) {
    return NextResponse.json({ error: "No tienes permiso para desactivar este empleado." }, { status: 403 });
  }

  // Never hard-delete — appointments/sales reference this employee, and
  // deactivating also locks their login (see auth.ts authorize()).
  const employee = await prisma.professional.update({
    where: { id },
    data: { active: false },
  });
  return NextResponse.json({ employee });
}
