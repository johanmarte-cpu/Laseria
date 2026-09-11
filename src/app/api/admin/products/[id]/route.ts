import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { productFormSchema } from "@/lib/validations";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = productFormSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.sku) {
    const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
    if (existingSku && existingSku.id !== id) {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU." }, { status: 409 });
    }
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ product });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const usedInSales = await prisma.saleItem.findFirst({ where: { productId: id } });
  if (usedInSales) {
    const product = await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ product, deactivatedInstead: true });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
