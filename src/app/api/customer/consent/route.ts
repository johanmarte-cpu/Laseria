import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/api-guards";
import { signConsentSchema } from "@/lib/validations";

export async function GET() {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;

  const consent = await prisma.consentForm.findUnique({ where: { customerId: guard.customerId } });
  return NextResponse.json({ consent });
}

export async function POST(request: Request) {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = signConsentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { fullName, cedula, acceptedPhotos } = parsed.data;

  const consent = await prisma.consentForm.upsert({
    where: { customerId: guard.customerId },
    create: {
      customerId: guard.customerId,
      fullName,
      cedula: cedula ?? "",
      acceptedPhotos,
    },
    update: {
      fullName,
      cedula: cedula ?? "",
      acceptedPhotos,
      signedAt: new Date(),
    },
  });

  return NextResponse.json({ consent });
}
