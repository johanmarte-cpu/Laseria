import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { CloseSessionForm } from "@/components/admin/caja/close-session-form";
import { PrintButton } from "@/components/admin/caja/print-button";
import { buildSessionReport } from "@/lib/cash-register";
import { formatDate, formatMoney } from "@/lib/utils";
import { SALON_INFO, paymentMethodLabel } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Detalle de caja" };

export default async function CashSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const report = await buildSessionReport(id);
  if (!report) notFound();
  const { session: cashSession, totalRevenue, transactionCount, byMethod, expectedCash } = report;

  const isManagement = session.user.role === "admin" || session.user.role === "manager";
  const isOwner = session.user.employeeId === cashSession.employeeId;
  if (!isManagement && !isOwner) notFound();

  const canClose = cashSession.status === "open" && (isManagement || isOwner);

  return (
    <Container className="max-w-2xl px-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <h1 className="font-display text-4xl text-ink">Caja {cashSession.sessionNumber}</h1>
        {cashSession.status === "open" ? (
          <span className="rounded-full bg-status-confirmed/10 px-3 py-1 text-xs font-semibold text-status-confirmed">
            Abierta
          </span>
        ) : (
          <span className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-ink-soft">Cerrada</span>
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
            <p className="text-xs uppercase tracking-widest text-ink-muted">Reporte de caja</p>
            <p className="font-display text-xl text-gold-dark">{cashSession.sessionNumber}</p>
            <p className="mt-1 text-xs text-ink-muted">{formatDate(cashSession.openedAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-b border-line pb-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Cajero</p>
            <p className="mt-1 text-ink">
              {cashSession.employee.firstName} {cashSession.employee.lastName}
            </p>
            <p className="text-xs text-ink-muted">
              {STAFF_ROLE_LABELS[cashSession.employee.role as StaffRole] ?? cashSession.employee.role}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Turno</p>
            <p className="mt-1 text-ink">Apertura: {formatDate(cashSession.openedAt)}</p>
            <p className="text-xs text-ink-muted">
              Cierre: {cashSession.closedAt ? formatDate(cashSession.closedAt) : "En curso"}
            </p>
            <p className="text-xs text-ink-muted">Fondo inicial: {formatMoney(cashSession.openingAmount)}</p>
          </div>
        </div>

        <div className="mt-6 border-b border-line pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Facturado en el turno</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Transacciones</span>
              <span className="font-medium text-ink">{transactionCount}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Total facturado</span>
              <span className="font-medium text-ink">{formatMoney(totalRevenue)}</span>
            </div>
            {byMethod.map((m) => (
              <div key={m.method} className="flex justify-between text-ink-muted">
                <span className="pl-4">{paymentMethodLabel(m.method)}</span>
                <span>{formatMoney(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {cashSession.status === "closed" && (
          <div className="mt-6 border-b border-line pb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Arqueo de efectivo</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Efectivo esperado</span>
                <span className="font-medium text-ink">{formatMoney(cashSession.expectedCash ?? expectedCash)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Efectivo contado</span>
                <span className="font-medium text-ink">{formatMoney(cashSession.countedCash ?? 0)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-display text-lg text-ink">
                <span>{cashSession.difference === 0 ? "Cuadre exacto" : cashSession.difference! > 0 ? "Sobrante" : "Faltante"}</span>
                <span>{formatMoney(Math.abs(cashSession.difference ?? 0))}</span>
              </div>
            </div>
            {cashSession.closingNotes && (
              <div className="mt-4 rounded-xl bg-beige p-4 text-sm text-ink-soft">{cashSession.closingNotes}</div>
            )}
            <p className="mt-4 text-xs text-ink-muted">
              Reporte por correo:{" "}
              {cashSession.reportEmailStatus === "sent"
                ? `enviado a ${cashSession.reportEmailTo}`
                : cashSession.reportEmailStatus === "failed"
                  ? "no se pudo enviar (revisa la configuración de email)"
                  : "pendiente"}
            </p>
          </div>
        )}

        {cashSession.openingNotes && (
          <div className="mt-6 rounded-xl bg-beige p-4 text-sm text-ink-soft">{cashSession.openingNotes}</div>
        )}
      </div>

      {cashSession.status === "closed" && (
        <div className="mt-6 print:hidden">
          <PrintButton />
        </div>
      )}

      {canClose && (
        <div className="mt-6 print:hidden">
          <CloseSessionForm sessionId={cashSession.id} expectedCash={expectedCash} />
        </div>
      )}
    </Container>
  );
}
