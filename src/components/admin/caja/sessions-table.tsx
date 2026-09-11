"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/form";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";
import type { AdminCashSession } from "@/components/admin/types";

export function SessionsTable({ sessions }: { sessions: AdminCashSession[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sessions;
    const q = query.toLowerCase();
    return sessions.filter(
      (s) =>
        s.sessionNumber.toLowerCase().includes(q) ||
        `${s.employee.firstName} ${s.employee.lastName}`.toLowerCase().includes(q)
    );
  }, [sessions, query]);

  return (
    <div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        <Input
          className="pl-9"
          placeholder="Buscar por número de caja o cajero"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">Caja</th>
              <th className="px-5 py-3">Cajero</th>
              <th className="px-5 py-3">Apertura</th>
              <th className="px-5 py-3">Cierre</th>
              <th className="px-5 py-3 text-center">Ventas</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink-muted">
                  No hay cajas que coincidan con tu búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0 hover:bg-beige/50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/caja/${s.id}`} className="font-medium text-ink hover:text-gold-dark">
                      {s.sessionNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {s.employee.firstName} {s.employee.lastName}
                    <p className="text-xs text-ink-muted">
                      {STAFF_ROLE_LABELS[s.employee.role as StaffRole] ?? s.employee.role}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{formatDate(s.openedAt)}</td>
                  <td className="px-5 py-4 text-ink-soft">{s.closedAt ? formatDate(s.closedAt) : "—"}</td>
                  <td className="px-5 py-4 text-center text-ink-soft">{s._count?.sales ?? 0}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                        s.status === "open"
                          ? "bg-status-confirmed/10 text-status-confirmed"
                          : "bg-beige text-ink-soft"
                      )}
                    >
                      {s.status === "open" ? "Abierta" : "Cerrada"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-ink">
                    {s.difference === null ? (
                      "—"
                    ) : (
                      <span
                        className={
                          s.difference === 0
                            ? "text-status-confirmed"
                            : s.difference > 0
                              ? "text-gold-dark"
                              : "text-status-cancelled"
                        }
                      >
                        {s.difference >= 0 ? "+" : "-"}
                        {formatMoney(Math.abs(s.difference))}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
