"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/form";
import { ButtonLink } from "@/components/ui/button";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/constants";
import type { AdminSale } from "@/components/admin/types";

export function SalesTable({ sales, isAdmin }: { sales: AdminSale[]; isAdmin: boolean }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sales;
    const q = query.toLowerCase();
    return sales.filter(
      (s) =>
        s.saleNumber.toLowerCase().includes(q) ||
        (s.ncf ?? "").toLowerCase().includes(q) ||
        (s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : s.customerName).toLowerCase().includes(q)
    );
  }, [sales, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Ventas</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <Link
              href="/admin/ventas/secuencias"
              className="inline-flex items-center rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-beige"
            >
              Secuencias NCF
            </Link>
          )}
          <ButtonLink href="/admin/ventas/nueva">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nueva venta
          </ButtonLink>
        </div>
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        <Input
          className="pl-9"
          placeholder="Buscar por NCF, # de venta o cliente"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">NCF</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Pago</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-muted">
                  No hay ventas que coincidan con tu búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-beige/50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/ventas/${s.id}`} className="font-medium text-ink hover:text-gold-dark">
                      {s.ncf ?? s.saleNumber}
                    </Link>
                    <p className="text-xs text-ink-muted">{s.saleNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : s.customerName || "—"}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-4 text-ink-soft">{paymentMethodLabel(s.paymentMethod)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                        s.status === "paid"
                          ? "bg-status-confirmed/10 text-status-confirmed"
                          : "bg-status-cancelled/10 text-status-cancelled"
                      )}
                    >
                      {s.status === "paid" ? "Pagada" : "Cancelada"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-ink">{formatMoney(s.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
