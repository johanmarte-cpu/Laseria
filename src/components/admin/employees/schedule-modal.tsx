"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Label } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";
import type { AdminEmployee } from "@/components/admin/types";

const DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

type DayRow = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
};

export function ScheduleModal({
  employee,
  onClose,
}: {
  employee: AdminEmployee;
  onClose: () => void;
}) {
  const router = useRouter();
  const [days, setDays] = useState<Record<number, DayRow>>(() => {
    const initial: Record<number, DayRow> = {};
    for (const d of DAYS) {
      const existing = employee.schedules.find((s) => s.dayOfWeek === d.value);
      initial[d.value] = existing
        ? {
            enabled: true,
            startTime: existing.startTime,
            endTime: existing.endTime,
            breakStart: existing.breakStart ?? "",
            breakEnd: existing.breakEnd ?? "",
          }
        : { enabled: false, startTime: "09:00", endTime: "18:00", breakStart: "13:00", breakEnd: "14:00" };
    }
    return initial;
  });

  const [timeOff, setTimeOff] = useState<{ date: string; reason: string }[]>([]);
  const [newTimeOffDate, setNewTimeOffDate] = useState("");
  const [loadingTimeOff, setLoadingTimeOff] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/employees/${employee.id}/schedule`)
      .then((res) => res.json())
      .then((data) => {
        setTimeOff(
          (data.timeOff ?? []).map((t: { date: string; reason: string | null }) => ({
            date: t.date.slice(0, 10),
            reason: t.reason ?? "",
          }))
        );
      })
      .finally(() => setLoadingTimeOff(false));
  }, [employee.id]);

  function updateDay(day: number, patch: Partial<DayRow>) {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  function addTimeOff() {
    if (!newTimeOffDate) return;
    if (timeOff.some((t) => t.date === newTimeOffDate)) return;
    setTimeOff((prev) => [...prev, { date: newTimeOffDate, reason: "" }].sort((a, b) => a.date.localeCompare(b.date)));
    setNewTimeOffDate("");
  }

  function removeTimeOff(date: string) {
    setTimeOff((prev) => prev.filter((t) => t.date !== date));
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    const schedules = DAYS.filter((d) => days[d.value].enabled).map((d) => ({
      dayOfWeek: d.value,
      startTime: days[d.value].startTime,
      endTime: days[d.value].endTime,
      breakStart: days[d.value].breakStart || null,
      breakEnd: days[d.value].breakEnd || null,
    }));

    const res = await fetch(`/api/admin/employees/${employee.id}/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules, timeOff }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("No pudimos guardar el horario.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <Modal title={`Horario de ${employee.firstName}`} onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="max-h-[55vh] space-y-6 overflow-y-auto pr-1">
        <div>
          <Label>Días y horario laboral</Label>
          <div className="space-y-2">
            {DAYS.map((d) => {
              const row = days[d.value];
              return (
                <div key={d.value} className="rounded-xl border border-line p-3">
                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      onChange={(e) => updateDay(d.value, { enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
                    />
                    {d.label}
                  </label>
                  {row.enabled && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="mb-1 block text-xs text-ink-muted">Entrada</span>
                          <Input
                            type="time"
                            className="px-3"
                            value={row.startTime}
                            onChange={(e) => updateDay(d.value, { startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-ink-muted">Salida</span>
                          <Input
                            type="time"
                            className="px-3"
                            value={row.endTime}
                            onChange={(e) => updateDay(d.value, { endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="mb-1 block text-xs text-ink-muted">Descanso desde</span>
                          <Input
                            type="time"
                            className="px-3"
                            value={row.breakStart}
                            onChange={(e) => updateDay(d.value, { breakStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-ink-muted">Descanso hasta</span>
                          <Input
                            type="time"
                            className="px-3"
                            value={row.breakEnd}
                            onChange={(e) => updateDay(d.value, { breakEnd: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <Label>Días no disponibles</Label>
          <div className="flex gap-2">
            <Input type="date" value={newTimeOffDate} onChange={(e) => setNewTimeOffDate(e.target.value)} />
            <Button type="button" variant="secondary" onClick={addTimeOff}>
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
          <div className="mt-3 space-y-1.5">
            {loadingTimeOff ? (
              <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
            ) : timeOff.length === 0 ? (
              <p className="text-xs text-ink-muted">Sin fechas bloqueadas.</p>
            ) : (
              timeOff.map((t) => (
                <div
                  key={t.date}
                  className="flex items-center justify-between rounded-lg bg-beige px-3 py-2 text-sm text-ink"
                >
                  <span className="capitalize">{formatDate(t.date)}</span>
                  <button
                    type="button"
                    onClick={() => removeTimeOff(t.date)}
                    className="text-ink-muted hover:text-status-cancelled"
                    aria-label="Quitar fecha"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Button size="lg" className="mt-6 w-full" disabled={submitting} onClick={handleSave}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar horario
      </Button>
    </Modal>
  );
}
