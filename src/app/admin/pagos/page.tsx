import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PayrollTable } from "@/components/admin/payroll/payroll-table";

export const metadata: Metadata = { title: "Pagos" };

export default async function AdminPayrollPage() {
  const payments = await prisma.employeePayment.findMany({
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, role: true, cedula: true, photoUrl: true } },
      processedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PayrollTable
      payments={payments.map((p) => ({
        id: p.id,
        paymentNumber: p.paymentNumber,
        concept: p.concept,
        periodStart: p.periodStart.toISOString(),
        periodEnd: p.periodEnd.toISOString(),
        grossAmount: p.grossAmount,
        deductions: p.deductions,
        netAmount: p.netAmount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        notes: p.notes,
        createdAt: p.createdAt.toISOString(),
        employee: p.employee,
        processedBy: p.processedBy,
      }))}
    />
  );
}
