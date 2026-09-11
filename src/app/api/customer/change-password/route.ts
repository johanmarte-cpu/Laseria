import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/api-guards";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.findUnique({ where: { id: guard.customerId } });
  if (!customer) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: customer.userId } });
  if (!user) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
