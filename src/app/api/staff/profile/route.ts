import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string(),
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
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const employee = await prisma.professional.update({
    where: { id: guard.employeeId },
    data: parsed.data,
  });
  return NextResponse.json({ employee });
}
