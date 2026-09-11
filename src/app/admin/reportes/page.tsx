import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, DollarSign, Receipt, TrendingUp, Wallet, FileCheck } from "lucide-react";
import {
  getSalesReport,
  getEmployeePerformanceReport,
  getEmployeePaymentsReport,
  getLowStockProducts,
  startOfDay,
} from "@/lib/admin-data";
import { Container } from "@/components/ui/container";
import { formatMoney, formatDate, cn, toLocalDate } from "@/lib/utils";
import { paymentMethodLabel, paymentConceptLabel } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Reportes" };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const RANGE_PRESETS = [
  { key: "week", label: "Últimos 7 días" },
  { key: "month", label: "Este mes" },
  { key: "quarter", label: "Últimos 90 días" },
] as const;

const BARE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function resolveRange(preset: string | undefined, customFrom: string | undefined, customTo: string | undefined) {
  const now = new Date();
  const to = startOfDay(now);
  if (preset === "custom" && customFrom && customTo && BARE_DATE_RE.test(customFrom) && BARE_DATE_RE.test(customTo)) {
    const parsedFrom = startOfDay(toLocalDate(customFrom));
    const parsedTo = startOfDay(toLocalDate(customTo));
    return parsedFrom <= parsedTo ? { from: parsedFrom, to: parsedTo } : { from: parsedTo, to: parsedFrom };
  }
  if (preset === "week") {
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return { from, to };
  }
  if (preset === "quarter") {
    const from = new Date(to);
    from.setDate(from.getDate() - 89);
    return { from, to };
  }
  return { from: startOfMonth(now), to };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { range, from: fromParam, to: toParam } = await searchParams;
  const isCustom = range === "custom" && !!fromParam && !!toParam;
  const activeRange = isCustom ? "custom" : RANGE_PRESETS.some((r) => r.key === range) ? range! : "month";
  const { from, to } = resolveRange(activeRange, fromParam, toParam);

  const [salesReport, employeePerformance, employeePayments, lowStock] = await Promise.all([
    getSalesReport(from, to),
    getEmployeePerformanceReport(from, to),
    getEmployeePaymentsReport(from, to),
    getLowStockProducts(),
  ]);

  const maxMethodAmount = Math.max(1, ...salesReport.byMethod.map((m) => m.amount));
  const maxEmployeePayment = Math.max(1, ...employeePayments.byEmployee.map((e) => e.total));

  return (
    <Container className="px-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Reportes</h1>
          <p className="mt-2 text-ink-muted">Desempeño de ventas, tratamientos, equipo y nómina.</p>
        </div>
        <div className="flex gap-2">
          {RANGE_PRESETS.map((r) => (
            <Link
              key={r.key}
              href={`/admin/reportes?range=${r.key}`}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold",
                activeRange === r.key ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
              )}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <form
        action="/admin/reportes"
        className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4"
      >
        <input type="hidden" name="range" value="custom" />
        <div className="min-w-0">
          <label htmlFor="from" className="block text-xs font-medium text-ink-muted">
            Buscar período desde
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={toDateInputValue(from)}
            className="mt-1 w-full max-w-[160px] rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="to" className="block text-xs font-medium text-ink-muted">
            Hasta
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={toDateInputValue(to)}
            className="mt-1 w-full max-w-[160px] rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <button
          type="submit"
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold",
            activeRange === "custom" ? "bg-ink text-white" : "bg-beige text-ink-soft hover:bg-beige/70"
          )}
        >
          Buscar período
        </button>
        <p className="min-w-0 basis-full text-xs text-ink-muted">
          Útil para buscar por el período exacto de un pago a empleados, aunque no coincida con los presets de
          arriba.
        </p>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={DollarSign} label="Ingresos totales" value={formatMoney(salesReport.totalRevenue)} />
        <StatCard icon={Receipt} label="Transacciones" value={String(salesReport.transactionCount)} />
        <StatCard icon={TrendingUp} label="Ticket promedio" value={formatMoney(salesReport.averageTicket)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">Ingresos por método de pago</h2>
          <div className="mt-5 space-y-3">
            {salesReport.byMethod.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin ventas en este período.</p>
            ) : (
              salesReport.byMethod.map((m) => (
                <div key={m.method}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">{paymentMethodLabel(m.method)}</span>
                    <span className="font-medium text-ink">{formatMoney(m.amount)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-beige">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(m.amount / maxMethodAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-cancelled" strokeWidth={1.75} />
            <h2 className="font-display text-xl text-ink">Inventario bajo</h2>
          </div>
          <div className="mt-5 space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-ink-muted">Todo el inventario está en buen nivel.</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-semibold text-status-cancelled">{p.stock} unidades</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">Productos más vendidos</h2>
          <div className="mt-5 space-y-3">
            {salesReport.topProducts.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin ventas de productos en este período.</p>
            ) : (
              salesReport.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-beige text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-ink">{p.name}</span>
                  <span className="text-ink-muted">{p.quantity} und.</span>
                  <span className="w-20 text-right font-medium text-ink">{formatMoney(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-xl text-ink">Servicios más solicitados</h2>
          <div className="mt-5 space-y-3">
            {salesReport.topServices.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin servicios facturados en este período.</p>
            ) : (
              salesReport.topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-beige text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-ink">{s.name}</span>
                  <span className="text-ink-muted">{s.quantity} und.</span>
                  <span className="w-20 text-right font-medium text-ink">{formatMoney(s.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="p-6 pb-0">
          <h2 className="font-display text-xl text-ink">Desempeño por empleado</h2>
        </div>
        <table className="mt-4 w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-6 py-3">Empleado</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-center">Citas completadas</th>
              <th className="px-6 py-3 text-center">No asistió</th>
              <th className="px-6 py-3 text-right">Ingresos por servicios</th>
              <th className="px-6 py-3 text-right">Ventas procesadas</th>
            </tr>
          </thead>
          <tbody>
            {employeePerformance.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-6 py-4 text-ink">{e.name}</td>
                <td className="px-6 py-4 text-ink-soft">{STAFF_ROLE_LABELS[e.role as StaffRole] ?? e.role}</td>
                <td className="px-6 py-4 text-center text-ink-soft">{e.appointmentsCompleted}</td>
                <td className="px-6 py-4 text-center text-ink-soft">{e.appointmentsNoShow}</td>
                <td className="px-6 py-4 text-right text-ink">{formatMoney(e.serviceRevenue)}</td>
                <td className="px-6 py-4 text-right text-ink">
                  {e.salesCount > 0 ? `${formatMoney(e.salesRevenue)} (${e.salesCount})` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-gold-dark" strokeWidth={1.75} />
        <h2 className="font-display text-2xl text-ink">Nómina — Pagos a empleados</h2>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Comprobantes cuyo período de pago se solapa con el rango seleccionado arriba.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard icon={Wallet} label="Nómina pagada en el período" value={formatMoney(employeePayments.totalPaid)} />
        <StatCard icon={FileCheck} label="Comprobantes emitidos" value={String(employeePayments.paymentCount)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h3 className="font-display text-xl text-ink">Pagado por empleado</h3>
          <div className="mt-5 space-y-3">
            {employeePayments.byEmployee.length === 0 ? (
              <p className="text-sm text-ink-muted">Sin pagos a empleados en este período.</p>
            ) : (
              employeePayments.byEmployee.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-soft">
                      {e.name}{" "}
                      <span className="text-xs text-ink-muted">
                        ({STAFF_ROLE_LABELS[e.role as StaffRole] ?? e.role})
                      </span>
                    </span>
                    <span className="font-medium text-ink">{formatMoney(e.total)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-beige">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(e.total / maxEmployeePayment) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <div className="p-6 pb-0">
            <h3 className="font-display text-xl text-ink">Comprobantes en el período</h3>
          </div>
          <table className="mt-4 w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3">Comprobante</th>
                <th className="px-5 py-3">Empleado</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Período</th>
                <th className="px-5 py-3 text-right">Neto</th>
              </tr>
            </thead>
            <tbody>
              {employeePayments.payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink-muted">
                    Sin comprobantes en este período.
                  </td>
                </tr>
              ) : (
                employeePayments.payments.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-beige/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/pagos/${p.id}`} className="font-medium text-ink hover:text-gold-dark">
                        {p.paymentNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {p.employee.firstName} {p.employee.lastName}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{paymentConceptLabel(p.concept)}</td>
                    <td className="px-5 py-3 text-ink-soft">
                      {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink">{formatMoney(p.netAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <Icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
