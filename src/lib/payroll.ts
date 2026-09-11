import { prisma } from "@/lib/prisma";
import type { CreatePaymentInput } from "@/lib/validations";

export type PayrollResult =
  | { ok: true; paymentId: string; paymentNumber: string }
  | { ok: false; status: number; error: string };

function generatePaymentNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `COMP-${timePart}${rand}`;
}

export async function createEmployeePayment(
  input: CreatePaymentInput,
  processedById: string
): Promise<PayrollResult> {
  const employee = await prisma.professional.findUnique({ where: { id: input.employeeId } });
  if (!employee || !employee.active) {
    return { ok: false, status: 404, error: "Empleado no encontrado o inactivo." };
  }

  const periodStart = new Date(`${input.periodStart}T00:00:00`);
  const periodEnd = new Date(`${input.periodEnd}T00:00:00`);
  if (periodEnd < periodStart) {
    return { ok: false, status: 400, error: "El fin del período no puede ser anterior al inicio." };
  }

  const netAmount = Math.round((input.grossAmount - input.deductions) * 100) / 100;

  const payment = await prisma.employeePayment.create({
    data: {
      paymentNumber: generatePaymentNumber(),
      employeeId: input.employeeId,
      processedById,
      concept: input.concept,
      periodStart,
      periodEnd,
      grossAmount: input.grossAmount,
      deductions: input.deductions,
      netAmount,
      paymentMethod: input.paymentMethod,
      notes: input.notes ?? "",
    },
  });

  return { ok: true, paymentId: payment.id, paymentNumber: payment.paymentNumber };
}
