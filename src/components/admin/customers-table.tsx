"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileSignature, History } from "lucide-react";
import { Input } from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";
import type { AdminCustomer } from "@/components/admin/types";

export function CustomersTable({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, query]);

  return (
    <div>
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre, email o teléfono"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3 text-center"># Citas</th>
              <th className="px-5 py-3">Última cita</th>
              <th className="px-5 py-3">Próxima cita</th>
              <th className="px-5 py-3">Consentimiento</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-ink-muted">
                  No encontramos clientes con esa búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-ink-muted">{c.email}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{c.phone}</td>
                  <td className="px-5 py-4 text-center text-ink-soft">{c.appointmentsCount}</td>
                  <td className="px-5 py-4 text-ink-soft">
                    {c.lastVisit ? formatDate(c.lastVisit) : "—"}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {c.nextAppointment ? formatDate(c.nextAppointment) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                        c.consentSignedAt
                          ? "bg-status-confirmed/10 text-status-confirmed"
                          : "bg-status-cancelled/10 text-status-cancelled"
                      )}
                    >
                      {c.consentSignedAt ? `Firmado ${formatDate(c.consentSignedAt)}` : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/clientes/${c.id}/historial`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold/50 hover:text-ink"
                      >
                        <History className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Historial
                      </Link>
                      <Link
                        href={`/admin/clientes/${c.id}/consentimiento`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold/50 hover:text-ink"
                      >
                        <FileSignature className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Consentimiento
                      </Link>
                    </div>
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
