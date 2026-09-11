import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/api-guards";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;

  const customer = await prisma.customer.findUnique({
    where: { id: guard.customerId },
    include: { user: { select: { email: true } } },
  });
  if (!customer) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  return NextResponse.json({ customer });
}

export async function PATCH(request: Request) {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.update({
    where: { id: guard.customerId },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      marketingOptIn: parsed.data.marketingOptIn ?? false,
    },
  });

  return NextResponse.json({ customer });
}
