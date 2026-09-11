"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, to12h } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { AppointmentDetailModal } from "@/components/admin/appointments/appointment-detail-modal";
import type { AdminAppointment } from "@/components/admin/types";

type View = "day" | "week" | "month";

export function AgendaView({ appointments }: { appointments: AdminAppointment[] }) {
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<AdminAppointment | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>();
    for (const a of appointments) {
      const key = a.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [appointments]);

  function goPrev() {
    setCurrentDate((d) => (view === "day" ? addDays(d, -1) : view === "week" ? addWeeks(d, -1) : addMonths(d, -1)));
  }
  function goNext() {
    setCurrentDate((d) => (view === "day" ? addDays(d, 1) : view === "week" ? addWeeks(d, 1) : addMonths(d, 1)));
  }

  const titleLabel =
    view === "day"
      ? format(currentDate, "EEEE d 'de' MMMM", { locale: es })
      : view === "week"
        ? `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })}`
        : format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Calendario</h1>
        <div className="flex gap-2">
          {(["day", "week", "month"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                view === v ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
              )}
            >
              {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goPrev}>
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </Button>
        <div className="flex items-center gap-3">
          <p className="text-center font-display text-xl capitalize text-ink">{titleLabel}</p>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-beige"
          >
            Hoy
          </button>
        </div>
        <Button variant="ghost" size="sm" onClick={goNext}>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="mt-6">
        {view === "day" && (
          <DayView date={currentDate} appointments={byDate.get(format(currentDate, "yyyy-MM-dd")) ?? []} onSelect={setSelected} />
        )}
        {view === "week" && <WeekView date={currentDate} byDate={byDate} onSelect={setSelected} />}
        {view === "month" && (
          <MonthView
            date={currentDate}
            byDate={byDate}
            onSelectDay={(d) => {
              setCurrentDate(d);
              setView("day");
            }}
          />
        )}
      </div>

      {selected && <AppointmentDetailModal appointment={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DayView({
  appointments,
  onSelect,
}: {
  date: Date;
  appointments: AdminAppointment[];
  onSelect: (a: AdminAppointment) => void;
}) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
        No hay citas programadas para este día.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-left transition-colors hover:border-gold/50"
        >
          <div className="flex items-center gap-3">
            <span className="w-20 text-sm font-semibold text-ink">
              {to12h(a.startTime)}–{to12h(a.endTime)}
            </span>
            <ProfessionalAvatar
              firstName={a.professional.firstName}
              lastName={a.professional.lastName}
              photoUrl={a.professional.photoUrl}
              className="h-9 w-9 text-xs"
            />
            <div>
              <p className="text-sm font-medium text-ink">
                {a.customer.firstName} {a.customer.lastName}
              </p>
              <p className="text-xs text-ink-muted">{a.services.map((s) => s.service.name).join(", ")}</p>
            </div>
          </div>
          <StatusBadge status={a.status} />
        </button>
      ))}
    </div>
  );
}

function WeekView({
  date,
  byDate,
  onSelect,
}: {
  date: Date;
  byDate: Map<string, AdminAppointment[]>;
  onSelect: (a: AdminAppointment) => void;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });

  return (
    <div className="grid gap-3 lg:grid-cols-7">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayAppointments = byDate.get(key) ?? [];
        return (
          <div key={key} className="rounded-2xl border border-line bg-white p-3">
            <p className={cn("text-center text-xs font-semibold uppercase", isToday(day) ? "text-gold-dark" : "text-ink-muted")}>
              {format(day, "EEE d", { locale: es })}
            </p>
            <div className="mt-2 space-y-1.5">
              {dayAppointments.length === 0 ? (
                <p className="py-2 text-center text-[11px] text-ink-muted">—</p>
              ) : (
                dayAppointments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className="w-full rounded-lg bg-beige px-2 py-1.5 text-left text-[11px] text-ink transition-colors hover:bg-nude"
                  >
                    <span className="font-semibold">{to12h(a.startTime)}</span> {a.customer.firstName}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({
  date,
  byDate,
  onSelectDay,
}: {
  date: Date;
  byDate: Map<string, AdminAppointment[]>;
  onSelectDay: (d: Date) => void;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });
  const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
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
          const count = (byDate.get(key) ?? []).length;
          const inMonth = isSameMonth(day, date);
          return (
            <button
              key={key}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                !inMonth && "text-ink-muted/30",
                inMonth && "text-ink hover:bg-beige",
                isToday(day) && "font-bold text-gold-dark"
              )}
            >
              {format(day, "d")}
              {count > 0 && (
                <span className="mt-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
