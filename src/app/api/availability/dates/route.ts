import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeSlotsForSchedule, minutesSinceMidnight, BOOKING_LEAD_MINUTES } from "@/lib/availability";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";

/**
 * Returns the set of dates within [today, today+60] that have at least one
 * bookable slot, so the calendar can disable everything else up front
 * instead of letting the user pick a dead date and find out after the fact.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const durationParam = searchParams.get("duration");
  const professionalId = searchParams.get("professionalId") ?? FIRST_AVAILABLE_ID;

  const duration = Number(durationParam);
  if (!durationParam || Number.isNaN(duration)) {
    return NextResponse.json({ error: "Falta el parámetro duration." }, { status: 400 });
  }

  const HORIZON_DAYS = 60;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + HORIZON_DAYS);

  const professionals = await prisma.professional.findMany({
    where: {
      active: true,
      role: "professional",
      ...(professionalId !== FIRST_AVAILABLE_ID ? { id: professionalId } : {}),
    },
    include: {
      schedules: true,
      timeOff: { where: { date: { gte: today, lte: rangeEnd } } },
    },
  });

  if (professionals.length === 0) {
    return NextResponse.json({ availableDates: [] });
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: { in: professionals.map((p) => p.id) },
      date: { gte: today, lte: rangeEnd },
      status: { not: "cancelled" },
    },
    select: { professionalId: true, date: true, startTime: true, endTime: true },
  });

  const availableDates = new Set<string>();
  const now = new Date();

  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    const dayOfWeek = day.getDay();
    const dayKey = day.toISOString().slice(0, 10);
    const minStartMinutes = i === 0 ? minutesSinceMidnight(now) + BOOKING_LEAD_MINUTES : null;

    for (const professional of professionals) {
      const hasTimeOff = professional.timeOff.some(
        (t) => t.date.toDateString() === day.toDateString()
      );
      if (hasTimeOff) continue;

      const schedule = professional.schedules.find((s) => s.dayOfWeek === dayOfWeek);
      if (!schedule) continue;

      const dayAppointments = appointments
        .filter((a) => a.professionalId === professional.id && a.date.toDateString() === day.toDateString())
        .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));

      const slots = computeSlotsForSchedule(schedule, dayAppointments, duration, undefined, minStartMinutes);
      if (slots.some((s) => s.available)) {
        availableDates.add(dayKey);
        break;
      }
    }
  }

  return NextResponse.json({ availableDates: Array.from(availableDates).sort() });
}
