import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { createPaymentSchema } from "@/lib/validations";
import { createEmployeePayment } from "@/lib/payroll";

export async function GET(request: Request) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");

  const payments = await prisma.employeePayment.findMany({
    where: employeeId ? { employeeId } : undefined,
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, role: true, cedula: true, photoUrl: true } },
      processedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await createEmployeePayment(parsed.data, guard.employeeId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      { paymentId: result.paymentId, paymentNumber: result.paymentNumber },
      { status: 201 }
    );
  } catch (err) {
    console.error("payroll create failed", err);
    return NextResponse.json({ error: "No pudimos registrar el pago." }, { status: 500 });
  }
}
