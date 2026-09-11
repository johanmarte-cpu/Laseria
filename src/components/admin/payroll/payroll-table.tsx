"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { paymentConceptLabel, paymentMethodLabel } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";
import type { AdminPayment } from "@/components/admin/types";

export function PayrollTable({ payments }: { payments: AdminPayment[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return payments;
    const q = query.toLowerCase();
    return payments.filter(
      (p) =>
        p.paymentNumber.toLowerCase().includes(q) ||
        `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase().includes(q)
    );
  }, [payments, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Pagos</h1>
        <ButtonLink href="/admin/pagos/nuevo">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo pago
        </ButtonLink>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        <Input
          className="pl-9"
          placeholder="Buscar por comprobante o empleado"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">Comprobante</th>
              <th className="px-5 py-3">Empleado</th>
              <th className="px-5 py-3">Concepto</th>
              <th className="px-5 py-3">Período</th>
              <th className="px-5 py-3">Pago</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Neto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink-muted">
                  No hay pagos que coincidan con tu búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-beige/50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/pagos/${p.id}`} className="font-medium text-ink hover:text-gold-dark">
                      {p.paymentNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {p.employee.firstName} {p.employee.lastName}
                    <p className="text-xs text-ink-muted">
                      {STAFF_ROLE_LABELS[p.employee.role as StaffRole] ?? p.employee.role}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{paymentConceptLabel(p.concept)}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {formatDate(p.periodStart)} – {formatDate(p.periodEnd)}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{paymentMethodLabel(p.paymentMethod)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                        p.status === "paid"
                          ? "bg-status-confirmed/10 text-status-confirmed"
                          : "bg-status-cancelled/10 text-status-cancelled"
                      )}
                    >
                      {p.status === "paid" ? "Pagado" : "Cancelado"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-ink">{formatMoney(p.netAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
