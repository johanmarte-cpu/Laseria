import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { PaymentActions } from "@/components/admin/payroll/payment-actions";
import { formatDate, formatMoney } from "@/lib/utils";
import { SALON_INFO, paymentConceptLabel, paymentMethodLabel } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Comprobante de pago" };

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const payment = await prisma.employeePayment.findUnique({
    where: { id },
    include: { employee: true, processedBy: true },
  });
  if (!payment) notFound();

  const isManagement = session.user.role === "admin" || session.user.role === "manager";
  const isOwner = session.user.employeeId === payment.employeeId;
  if (!isManagement && !isOwner) notFound();

  return (
    <Container className="max-w-2xl px-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <h1 className="font-display text-4xl text-ink">Comprobante {payment.paymentNumber}</h1>
        {payment.status === "cancelled" ? (
          <span className="rounded-full bg-status-cancelled/10 px-3 py-1 text-xs font-semibold text-status-cancelled">
            Cancelado
          </span>
        ) : (
          <span className="rounded-full bg-status-confirmed/10 px-3 py-1 text-xs font-semibold text-status-confirmed">
            Pagado
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-8">
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <Logo className="h-12" />
            <p className="mt-2 text-xs text-ink-muted">{SALON_INFO.address}</p>
            <p className="text-xs text-ink-muted">{SALON_INFO.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-ink-muted">Comprobante de pago</p>
            <p className="font-display text-xl text-gold-dark">{payment.paymentNumber}</p>
            <p className="mt-1 text-xs text-ink-muted">{formatDate(payment.createdAt.toISOString())}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-b border-line pb-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Empleado</p>
            <p className="mt-1 text-ink">
              {payment.employee.firstName} {payment.employee.lastName}
            </p>
            <p className="text-xs text-ink-muted">
              {STAFF_ROLE_LABELS[payment.employee.role as StaffRole] ?? payment.employee.role}
            </p>
            {payment.employee.cedula && <p className="text-xs text-ink-muted">Cédula: {payment.employee.cedula}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Detalle</p>
            <p className="mt-1 text-ink">{paymentConceptLabel(payment.concept)}</p>
            <p className="text-xs text-ink-muted">
              Período: {formatDate(payment.periodStart.toISOString())} – {formatDate(payment.periodEnd.toISOString())}
            </p>
            <p className="text-xs text-ink-muted">{paymentMethodLabel(payment.paymentMethod)}</p>
          </div>
        </div>

        <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Monto bruto</span>
            <span>{formatMoney(payment.grossAmount)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Deducciones</span>
            <span>-{formatMoney(payment.deductions)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-display text-lg text-ink">
            <span>Neto pagado</span>
            <span>{formatMoney(payment.netAmount)}</span>
          </div>
        </div>

        {payment.notes && (
          <div className="mt-6 rounded-xl bg-beige p-4 text-sm text-ink-soft">{payment.notes}</div>
        )}

        <p className="mt-6 text-xs text-ink-muted">
          Procesado por {payment.processedBy.firstName} {payment.processedBy.lastName}
        </p>
      </div>

      <div className="mt-6">
        <PaymentActions paymentId={payment.id} status={payment.status} canManage={isManagement} />
      </div>
    </Container>
  );
}
