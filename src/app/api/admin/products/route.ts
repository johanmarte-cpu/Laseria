import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { productFormSchema } from "@/lib/validations";

export async function GET() {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const products = await prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existingSku) {
    return NextResponse.json({ error: "Ya existe un producto con ese SKU." }, { status: 409 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json({ product }, { status: 201 });
}
