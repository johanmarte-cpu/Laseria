"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label, Input, Textarea } from "@/components/ui/form";
import { StepDate } from "@/components/booking/steps/step-date";
import { StepTime } from "@/components/booking/steps/step-time";
import { formatPrice, cn } from "@/lib/utils";
import type { AdminService, AdminProfessional, AdminCustomer } from "@/components/admin/types";

export function NewAppointmentModal({
  services,
  professionals,
  customers,
  onClose,
}: {
  services: AdminService[];
  professionals: AdminProfessional[];
  customers: AdminCustomer[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "confirmed">("confirmed");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = services
    .filter((s) => serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services
    .filter((s) => serviceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const filteredCustomers = useMemo(() => {
    if (!customerQuery.trim()) return customers.slice(0, 8);
    const q = customerQuery.toLowerCase();
    return customers
      .filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
      .slice(0, 8);
  }, [customers, customerQuery]);

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setDate(null);
    setTime(null);
  }

  const canSubmit =
    serviceIds.length > 0 &&
    professionalId &&
    date &&
    time &&
    (customerMode === "existing"
      ? Boolean(customerId)
      : newCustomer.firstName && newCustomer.lastName && newCustomer.email && newCustomer.phone);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerMode === "existing" ? customerId : undefined,
        newCustomer: customerMode === "new" ? newCustomer : undefined,
        professionalId,
        serviceIds,
        date,
        startTime: time,
        notes,
        status,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos crear la cita.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <Modal title="Nueva cita" onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <Label>Cliente</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCustomerMode("existing")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold",
                customerMode === "existing" ? "bg-ink text-white" : "bg-beige text-ink-soft"
              )}
            >
              Cliente existente
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode("new")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold",
                customerMode === "new" ? "bg-ink text-white" : "bg-beige text-ink-soft"
              )}
            >
              Cliente nuevo
            </button>
          </div>

          {customerMode === "existing" ? (
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <Input
                  className="pl-9"
                  placeholder="Buscar por nombre, email o teléfono"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                />
              </div>
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCustomerId(c.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      customerId === c.id ? "bg-blush/60 text-ink" : "hover:bg-beige text-ink-soft"
                    )}
                  >
                    {c.firstName} {c.lastName} · {c.email}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Nombre"
                value={newCustomer.firstName}
                onChange={(e) => setNewCustomer((s) => ({ ...s, firstName: e.target.value }))}
              />
              <Input
                placeholder="Apellido"
                value={newCustomer.lastName}
                onChange={(e) => setNewCustomer((s) => ({ ...s, lastName: e.target.value }))}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer((s) => ({ ...s, email: e.target.value }))}
              />
              <Input
                placeholder="Teléfono"
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div>
          <Label>Tratamientos</Label>
          <div className="grid max-h-40 gap-1.5 overflow-y-auto">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm",
                  serviceIds.includes(s.id) ? "bg-blush/60 text-ink" : "hover:bg-beige text-ink-soft"
                )}
              >
                <span>{s.name}</span>
                <span className="text-xs text-ink-muted">{formatPrice(s.price)}</span>
              </button>
            ))}
          </div>
          {serviceIds.length > 0 && (
            <p className="mt-2 text-xs text-ink-muted">
              Total: {formatPrice(totalPrice)} · {totalDuration} min
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="professional">Profesional</Label>
          <select
            id="professional"
            value={professionalId}
            onChange={(e) => {
              setProfessionalId(e.target.value);
              setDate(null);
              setTime(null);
            }}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="">Selecciona una profesional</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        {professionalId && totalDuration > 0 && (
          <div className="space-y-6 border-t border-line pt-5">
            <StepDate
              professionalId={professionalId}
              durationMinutes={totalDuration}
              selectedDate={date}
              onSelect={(d) => {
                setDate(d);
                setTime(null);
              }}
            />
            {date && (
              <StepTime
                professionalId={professionalId}
                date={date}
                durationMinutes={totalDuration}
                selectedTime={time}
                onSelect={setTime}
              />
            )}
          </div>
        )}

        <div>
          <Label htmlFor="admin-status">Estado inicial</Label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "pending" | "confirmed")}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="confirmed">Confirmada</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>

        <div>
          <Label htmlFor="admin-notes">Notas</Label>
          <Textarea id="admin-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <Button size="lg" className="mt-6 w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear cita
      </Button>
    </Modal>
  );
}
