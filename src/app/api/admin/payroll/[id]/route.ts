import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const payment = await prisma.employeePayment.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, role: true, cedula: true, photoUrl: true } },
      processedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!payment) return NextResponse.json({ error: "Comprobante no encontrado." }, { status: 404 });

  // Admin/manager can view any voucher; anyone else may only view their own.
  const isManagement = guard.role === "admin" || guard.role === "manager";
  if (!isManagement && payment.employeeId !== guard.employeeId) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }

  return NextResponse.json({ payment });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  }

  const payment = await prisma.employeePayment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Comprobante no encontrado." }, { status: 404 });
  if (payment.status === "cancelled") {
    return NextResponse.json({ error: "Este comprobante ya está cancelado." }, { status: 400 });
  }

  await prisma.employeePayment.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
