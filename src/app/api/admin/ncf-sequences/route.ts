import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { ncfSequenceUpdateSchema } from "@/lib/validations";
import { NCF_TYPES } from "@/lib/ncf";

export async function GET() {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const sequences = await prisma.ncfSequence.findMany({ orderBy: { ncfType: "asc" } });
  return NextResponse.json({ sequences });
}

export async function PUT(request: Request) {
  const guard = await requireStaff(["admin"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = ncfSequenceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  if (parsed.data.endNumber < parsed.data.nextNumber) {
    return NextResponse.json({ error: "El número final debe ser mayor o igual al siguiente número." }, { status: 400 });
  }

  const meta = NCF_TYPES.find((t) => t.value === parsed.data.ncfType);
  const sequence = await prisma.ncfSequence.upsert({
    where: { ncfType: parsed.data.ncfType },
    update: { nextNumber: parsed.data.nextNumber, endNumber: parsed.data.endNumber },
    create: {
      ncfType: parsed.data.ncfType,
      label: meta?.label ?? parsed.data.ncfType,
      nextNumber: parsed.data.nextNumber,
      endNumber: parsed.data.endNumber,
    },
  });

  return NextResponse.json({ sequence });
}
