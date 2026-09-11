"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { RescheduleModal } from "@/components/dashboard/reschedule-modal";
import { formatDate, formatDuration, formatPrice, to12h } from "@/lib/utils";
import type { DisplayAppointment } from "@/components/dashboard/types";

export function AppointmentCard({ appointment }: { appointment: DisplayAppointment }) {
  const router = useRouter();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isModifiable = appointment.status === "pending" || appointment.status === "confirmed";
  const isPast = new Date(appointment.date) < new Date(new Date().toDateString());
  const canModify = isModifiable && !isPast;

  async function handleCancel() {
    setCancelling(true);
    setCancelError(null);
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCancelError(body.error ?? "No pudimos cancelar tu cita.");
      setCancelling(false);
      return;
    }
    setCancelling(false);
    setShowCancel(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProfessionalAvatar
            firstName={appointment.professional.firstName}
            lastName={appointment.professional.lastName}
            photoUrl={appointment.professional.photoUrl}
            className="h-11 w-11"
          />
          <div>
            <p className="font-display text-lg text-ink">
              {appointment.services.map((s) => s.name).join(" + ")}
            </p>
            <p className="text-xs text-ink-muted">
              con {appointment.professional.firstName} {appointment.professional.lastName}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-ink-muted">Fecha</p>
          <p className="mt-0.5 capitalize text-ink">{formatDate(appointment.date)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Hora</p>
          <p className="mt-0.5 text-ink">{to12h(appointment.startTime)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Duración</p>
          <p className="mt-0.5 text-ink">{formatDuration(appointment.totalDuration)}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Precio</p>
          <p className="mt-0.5 text-ink">{formatPrice(appointment.totalPrice)}</p>
        </div>
      </div>

      {canModify && (
        <div className="mt-5 flex gap-3 border-t border-line pt-5">
          <Button variant="secondary" size="sm" onClick={() => setShowReschedule(true)}>
            Reprogramar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>
            Cancelar
          </Button>
        </div>
      )}

      {showReschedule && (
        <RescheduleModal appointment={appointment} onClose={() => setShowReschedule(false)} />
      )}

      {showCancel && (
        <Modal title="Cancelar cita" onClose={() => setShowCancel(false)}>
          {cancelError && (
            <Alert tone="error" className="mb-4">
              {cancelError}
            </Alert>
          )}
          <p className="text-sm text-ink-soft">
            ¿Segura que deseas cancelar tu cita del {formatDate(appointment.date)} a las{" "}
            {to12h(appointment.startTime)}? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCancel(false)}>
              Volver
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
              Sí, cancelar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
