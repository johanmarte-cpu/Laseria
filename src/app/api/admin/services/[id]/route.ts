import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { serviceFormSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = serviceFormSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const service = await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ service });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const usedInAppointments = await prisma.appointmentService.findFirst({ where: { serviceId: id } });
  if (usedInAppointments) {
    // Preserve history: services referenced by past/upcoming appointments are
    // deactivated instead of deleted so appointment_services stays intact.
    const service = await prisma.service.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ service, deactivatedInstead: true });
  }

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
