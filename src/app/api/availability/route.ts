import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeSlotsForSchedule,
  mergeSlotAvailability,
  minutesSinceMidnight,
  BOOKING_LEAD_MINUTES,
} from "@/lib/availability";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const durationParam = searchParams.get("duration");
  const professionalId = searchParams.get("professionalId") ?? FIRST_AVAILABLE_ID;

  if (!dateParam || !durationParam) {
    return NextResponse.json({ error: "Faltan parámetros: date y duration." }, { status: 400 });
  }

  const duration = Number(durationParam);
  const date = new Date(`${dateParam}T00:00:00`);
  if (Number.isNaN(date.getTime()) || Number.isNaN(duration)) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }
  const dayOfWeek = date.getDay();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const minStartMinutes = isToday ? minutesSinceMidnight(now) + BOOKING_LEAD_MINUTES : null;

  const professionals = await prisma.professional.findMany({
    where: {
      active: true,
      role: "professional",
      ...(professionalId !== FIRST_AVAILABLE_ID ? { id: professionalId } : {}),
    },
    include: {
      schedules: { where: { dayOfWeek } },
      timeOff: true,
    },
  });

  if (professionals.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  const slotLists = await Promise.all(
    professionals.map(async (professional) => {
      const hasTimeOff = professional.timeOff.some(
        (t) => t.date.toDateString() === date.toDateString()
      );
      const schedule = professional.schedules[0];
      if (hasTimeOff || !schedule) return [];

      const existingAppointments = await prisma.appointment.findMany({
        where: { professionalId: professional.id, date, status: { not: "cancelled" } },
        select: { startTime: true, endTime: true },
      });

      return computeSlotsForSchedule(schedule, existingAppointments, duration, undefined, minStartMinutes);
    })
  );

  const slots = mergeSlotAvailability(slotLists);

  return NextResponse.json({ slots });
}
