"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { StepDate } from "@/components/booking/steps/step-date";
import { StepTime } from "@/components/booking/steps/step-time";
import type { DisplayAppointment } from "@/components/dashboard/types";

export function RescheduleModal({
  appointment,
  onClose,
}: {
  appointment: DisplayAppointment;
  onClose: () => void;
}) {
  const router = useRouter();
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!date || !time) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reschedule", date, startTime: time }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos reprogramar tu cita. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onClose();
    router.refresh();
  }

  return (
    <Modal title="Reprogramar cita" onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="max-h-[50vh] space-y-6 overflow-y-auto pr-1">
        <StepDate
          professionalId={appointment.professional.id}
          durationMinutes={appointment.totalDuration}
          selectedDate={date}
          onSelect={(d) => {
            setDate(d);
            setTime(null);
          }}
        />
        {date && (
          <StepTime
            professionalId={appointment.professional.id}
            date={date}
            durationMinutes={appointment.totalDuration}
            selectedTime={time}
            onSelect={setTime}
          />
        )}
      </div>

      <Button className="mt-6 w-full" size="lg" disabled={!date || !time || submitting} onClick={handleConfirm}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmar nuevo horario
      </Button>
    </Modal>
  );
}
