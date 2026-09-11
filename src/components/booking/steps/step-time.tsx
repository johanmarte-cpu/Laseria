"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn, to12h } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";

type Slot = { time: string; available: boolean };

export function StepTime({
  professionalId,
  date,
  durationMinutes,
  selectedTime,
  onSelect,
}: {
  professionalId: string;
  date: string;
  durationMinutes: number;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/availability?professionalId=${professionalId}&date=${date}&duration=${durationMinutes}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("request-failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos cargar los horarios. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [professionalId, date, durationMinutes]);

  const hasAvailable = slots?.some((s) => s.available) ?? true;

  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Elige el horario</h2>
      <p className="mt-2 text-sm text-ink-muted">Los horarios ya reservados aparecen deshabilitados.</p>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      {loading && (
        <div className="mt-10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-dark" />
        </div>
      )}

      {!loading && !error && slots && !hasAvailable && (
        <Alert tone="info" className="mt-4">
          No encontramos horarios disponibles para esta fecha. Intenta con otra fecha.
        </Alert>
      )}

      {!loading && slots && hasAvailable && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                !slot.available && "cursor-not-allowed border-line/60 bg-beige/50 text-ink-muted/40 line-through",
                slot.available && selectedTime !== slot.time && "border-line bg-white text-ink hover:border-gold/50",
                selectedTime === slot.time && "border-gold bg-ink text-white"
              )}
            >
              {to12h(slot.time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
