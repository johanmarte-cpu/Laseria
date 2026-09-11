import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { signConsentSchema } from "@/lib/validations";

// Staff-assisted consent: recepción/profesional (o admin/manager) llenan el
// formulario junto al cliente en el local, a diferencia de
// api/customer/consent (que el cliente firma él mismo desde su panel).
const CONSENT_STAFF_ROLES: ("admin" | "manager" | "receptionist" | "professional")[] = [
  "admin",
  "manager",
  "receptionist",
  "professional",
];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(CONSENT_STAFF_ROLES);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const consent = await prisma.consentForm.findUnique({ where: { customerId: id } });
  return NextResponse.json({ consent });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(CONSENT_STAFF_ROLES);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });

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
    where: { customerId: id },
    create: {
      customerId: id,
      fullName,
      cedula: cedula ?? "",
      acceptedPhotos,
      filledByEmployeeId: guard.employeeId,
    },
    update: {
      fullName,
      cedula: cedula ?? "",
      acceptedPhotos,
      signedAt: new Date(),
      filledByEmployeeId: guard.employeeId,
    },
  });

  return NextResponse.json({ consent });
}
