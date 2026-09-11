"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function StepDate({
  professionalId,
  durationMinutes,
  selectedDate,
  onSelect,
}: {
  professionalId: string;
  durationMinutes: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [availableDates, setAvailableDates] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/availability/dates?professionalId=${professionalId}&duration=${durationMinutes}`)
      .then((res) => {
        if (!res.ok) throw new Error("request-failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setAvailableDates(new Set<string>(data.availableDates));
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos cargar la disponibilidad. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [professionalId, durationMinutes]);

  const today = startOfDay(new Date());
  const horizonEnd = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const hasAnyAvailability = availableDates ? availableDates.size > 0 : true;

  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Elige la fecha</h2>
      <p className="mt-2 text-sm text-ink-muted">Solo mostramos fechas con disponibilidad real.</p>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      {!loading && !error && !hasAnyAvailability && (
        <Alert tone="info" className="mt-4">
          No encontramos horarios disponibles próximamente. Escríbenos por WhatsApp y te ayudamos.
        </Alert>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            disabled={isSameMonth(month, today)}
            aria-label="Mes anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <p className="font-display text-lg capitalize text-ink">
            {format(month, "MMMM yyyy", { locale: es })}
          </p>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            disabled={isSameMonth(month, horizonEnd)}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative mt-5">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-gold-dark" />
            </div>
          )}

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-muted">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, month);
              const isPast = isBefore(day, today) && !isToday(day);
              const outOfHorizon = day > horizonEnd;
              const isAvailable = availableDates?.has(key) ?? false;
              const disabled = !inMonth || isPast || outOfHorizon || !isAvailable;
              const selected = selectedDate === key;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(key)}
                  className={cn(
                    "relative aspect-square rounded-xl text-sm font-medium transition-colors",
                    !inMonth && "invisible",
                    disabled && inMonth && "text-ink-muted/40",
                    !disabled && "text-ink hover:bg-beige",
                    selected && "bg-ink text-white hover:bg-ink",
                    isToday(day) && !selected && "font-bold text-gold-dark"
                  )}
                >
                  {format(day, "d")}
                  {isAvailable && !selected && inMonth && !isPast && (
                    <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
