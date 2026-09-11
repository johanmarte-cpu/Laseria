"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn, formatDate, formatPrice, to12h } from "@/lib/utils";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { AppointmentDetailModal } from "@/components/admin/appointments/appointment-detail-modal";
import { NewAppointmentModal } from "@/components/admin/appointments/new-appointment-modal";
import type { AdminAppointment, AdminService, AdminProfessional, AdminCustomer } from "@/components/admin/types";

export function AppointmentsTable({
  appointments,
  services,
  professionals,
  customers,
}: {
  appointments: AdminAppointment[];
  services: AdminService[];
  professionals: AdminProfessional[];
  customers: AdminCustomer[];
}) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack =
          `${a.customer.firstName} ${a.customer.lastName} ${a.bookingNumber} ${a.professional.firstName}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Citas</h1>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nueva cita
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
          <Input
            className="w-64 pl-9"
            placeholder="Buscar cliente, reserva o profesional"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold",
              statusFilter === "all" ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
            )}
          >
            Todas
          </button>
          {APPOINTMENT_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                statusFilter === s.value ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Tratamiento</th>
              <th className="px-5 py-3">Profesional</th>
              <th className="px-5 py-3">Fecha y hora</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-ink-muted">
                  No hay citas que coincidan con tu búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-beige/50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">
                      {a.customer.firstName} {a.customer.lastName}
                    </p>
                    <p className="text-xs text-ink-muted">{a.bookingNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {a.services.map((s) => s.service.name).join(", ")}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    {a.professional.firstName} {a.professional.lastName}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">
                    <span className="capitalize">{formatDate(a.date)}</span> · {to12h(a.startTime)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-ink">{formatPrice(a.totalPrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && <AppointmentDetailModal appointment={selected} onClose={() => setSelected(null)} />}
      {showNew && (
        <NewAppointmentModal
          services={services}
          professionals={professionals}
          customers={customers}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  );
}
