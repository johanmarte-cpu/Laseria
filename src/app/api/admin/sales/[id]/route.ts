import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { customer: true, employee: true, items: true, appointment: true },
  });
  if (!sale) return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });

  return NextResponse.json({ sale });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  }

  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
  if (sale.status === "cancelled") {
    return NextResponse.json({ error: "Esta venta ya está cancelada." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id }, data: { status: "cancelled" } });
    for (const item of sale.items) {
      if (item.itemType === "product" && item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    if (sale.appointmentId) {
      await tx.payment.updateMany({
        where: { appointmentId: sale.appointmentId },
        data: { status: "cancelled" },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
