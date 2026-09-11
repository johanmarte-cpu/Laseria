import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { NewPaymentForm } from "@/components/admin/payroll/new-payment-form";

export const metadata: Metadata = { title: "Nuevo pago" };

export default async function NewPaymentPage() {
  const employees = await prisma.professional.findMany({
    where: { active: true },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, role: true, salary: true },
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Nuevo pago</h1>
      <p className="mt-2 text-ink-muted">Registra un pago y emite su comprobante.</p>

      <div className="mt-8">
        <NewPaymentForm employees={employees} />
      </div>
    </div>
  );
}
