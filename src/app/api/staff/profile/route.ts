import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { NAME_REGEX, NAME_MESSAGE, DR_PHONE_REGEX, PHONE_MESSAGE } from "@/lib/validations";

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tu nombre").regex(NAME_REGEX, NAME_MESSAGE),
  lastName: z.string().trim().min(2, "Ingresa tu apellido").regex(NAME_REGEX, NAME_MESSAGE),
  phone: z.string().trim().regex(DR_PHONE_REGEX, PHONE_MESSAGE),
});

export async function GET() {
  const guard = await requireStaff();
  if (guard instanceof NextResponse) return guard;

  const employee = await prisma.professional.findUnique({ where: { id: guard.employeeId } });
  if (!employee) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ employee });
}

export async function PATCH(request: Request) {
  const guard = await requireStaff();
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const employee = await prisma.professional.update({
    where: { id: guard.employeeId },
    data: parsed.data,
  });
  return NextResponse.json({ employee });
}
