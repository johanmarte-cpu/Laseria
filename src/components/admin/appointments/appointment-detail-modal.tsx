"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Receipt, FileSignature } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label, Textarea } from "@/components/ui/form";
import { StepDate } from "@/components/booking/steps/step-date";
import { StepTime } from "@/components/booking/steps/step-time";
import { APPOINTMENT_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { formatDate, to12h } from "@/lib/utils";
import type { AdminAppointment } from "@/components/admin/types";

const PROFESSIONAL_STATUS_OPTIONS = APPOINTMENT_STATUSES.filter(
  (s) => s.value === "confirmed" || s.value === "completed" || s.value === "no_show"
);

export function AppointmentDetailModal({
  appointment,
  onClose,
}: {
  appointment: AdminAppointment;
  onClose: () => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  // A professional only ever manages their own agenda: they can mark a visit
  // completed/no-show, but never touch payment status, notes, or reschedule
  // someone else's slot — the API enforces this too (see api/admin/appointments/[id]).
  const isProfessionalView = session?.user?.role === "professional";

  const [status, setStatus] = useState(appointment.status);
  const [paymentStatus, setPaymentStatus] = useState(appointment.payment?.status ?? "pending");
  const [notes, setNotes] = useState(appointment.notes);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    const body = isProfessionalView
      ? { status }
      : {
          status,
          paymentStatus,
          notes,
          ...(rescheduling && newDate && newTime ? { date: newDate, startTime: newTime } : {}),
        };

    const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      const resBody = await res.json().catch(() => ({}));
      setError(resBody.error ?? "No pudimos guardar los cambios.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <Modal title={`Cita ${appointment.bookingNumber}`} onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="space-y-5">
        <div className="rounded-xl bg-beige p-4 text-sm">
          <p className="font-medium text-ink">
            {appointment.customer.firstName} {appointment.customer.lastName}
            {!isProfessionalView && ` · ${appointment.customer.phone}`}
          </p>
          <p className="mt-1 text-ink-muted">
            {appointment.services.map((s) => s.service.name).join(", ")}
          </p>
          <p className="mt-1 text-ink-muted">
            {formatDate(appointment.date)} · {to12h(appointment.startTime)}
          </p>
          {!isProfessionalView && (
            <p className="mt-1 text-ink-muted">
              con {appointment.professional.firstName} {appointment.professional.lastName}
            </p>
          )}
        </div>

        {isProfessionalView ? (
          <div>
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            >
              {PROFESSIONAL_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  {APPOINTMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="paymentStatus">Estado de pago</Label>
                <select
                  id="paymentStatus"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="border-t border-line pt-5">
              {!rescheduling ? (
                <button
                  type="button"
                  onClick={() => setRescheduling(true)}
                  className="text-sm font-semibold text-ink hover:text-gold-dark"
                >
                  Cambiar fecha y hora (actual: {formatDate(appointment.date)}, {to12h(appointment.startTime)})
                </button>
              ) : (
                <div className="space-y-6">
                  <StepDate
                    professionalId={appointment.professional.id}
                    durationMinutes={appointment.totalDuration}
                    selectedDate={newDate}
                    onSelect={(d) => {
                      setNewDate(d);
                      setNewTime(null);
                    }}
                  />
                  {newDate && (
                    <StepTime
                      professionalId={appointment.professional.id}
                      date={newDate}
                      durationMinutes={appointment.totalDuration}
                      selectedTime={newTime}
                      onSelect={setNewTime}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink
          href={`/admin/clientes/${appointment.customer.id}/consentimiento`}
          variant="secondary"
          className="flex-1"
        >
          <FileSignature className="h-4 w-4" strokeWidth={1.75} />
          Consentimiento
        </ButtonLink>
        {!isProfessionalView && (
          <ButtonLink
            href={`/admin/ventas/nueva?appointmentId=${appointment.id}`}
            variant="secondary"
            className="flex-1"
          >
            <Receipt className="h-4 w-4" strokeWidth={1.75} />
            Facturar cita
          </ButtonLink>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button className="flex-1" onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </Modal>
  );
}
