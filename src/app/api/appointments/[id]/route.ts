import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/api-guards";
import {
  computeSlotsForSchedule,
  timeToMinutes,
  minutesSinceMidnight,
  BOOKING_LEAD_MINUTES,
} from "@/lib/availability";

const rescheduleSchema = z.object({
  action: z.literal("reschedule"),
  date: z.string().min(1),
  startTime: z.string().min(1),
});

const cancelSchema = z.object({
  action: z.literal("cancel"),
});

const patchSchema = z.discriminatedUnion("action", [rescheduleSchema, cancelSchema]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const appointment = await prisma.appointment.findFirst({
    where: { id, customerId: guard.customerId },
    include: { services: { include: { service: true } }, professional: true, payment: true },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }
  return NextResponse.json({ appointment });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCustomer();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, customerId: guard.customerId },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }
  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return NextResponse.json(
      { error: "Esta cita ya no puede modificarse." },
      { status: 400 }
    );
  }

  if (parsed.data.action === "cancel") {
    await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
    });
    await prisma.payment.updateMany({
      where: { appointmentId: id },
      data: { status: "cancelled" },
    });
    await prisma.notification.create({
      data: {
        customerId: guard.customerId,
        appointmentId: id,
        type: "cancellation",
        channel: "email",
        status: "sent",
        sentAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Reschedule — re-validate the new slot the same way a fresh booking would.
  const date = new Date(`${parsed.data.date}T00:00:00`);
  const dayOfWeek = date.getDay();

  const professional = await prisma.professional.findUnique({
    where: { id: appointment.professionalId },
    include: { schedules: { where: { dayOfWeek } }, timeOff: true },
  });
  if (!professional || !professional.active) {
    return NextResponse.json({ error: "La profesional ya no está disponible." }, { status: 409 });
  }
  const hasTimeOff = professional.timeOff.some((t) => t.date.toDateString() === date.toDateString());
  const schedule = professional.schedules[0];
  if (hasTimeOff || !schedule) {
    return NextResponse.json(
      { error: "No encontramos horarios disponibles para esta fecha." },
      { status: 409 }
    );
  }

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      professionalId: appointment.professionalId,
      date,
      status: { not: "cancelled" },
      id: { not: id },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const minStartMinutes = isToday ? minutesSinceMidnight(now) + BOOKING_LEAD_MINUTES : null;
  const slots = computeSlotsForSchedule(
    schedule,
    existingAppointments,
    appointment.totalDuration,
    undefined,
    minStartMinutes
  );
  const requestedMinutes = timeToMinutes(parsed.data.startTime);
  const matchingSlot = slots.find((s) => timeToMinutes(s.time) === requestedMinutes && s.available);

  if (!matchingSlot) {
    return NextResponse.json(
      { error: "Este horario acaba de ser reservado. Por favor selecciona otro." },
      { status: 409 }
    );
  }

  const endTime = minutesToHHMM(requestedMinutes + appointment.totalDuration);

  await prisma.appointment.update({
    where: { id },
    data: {
      date,
      startTime: parsed.data.startTime,
      endTime,
      status: "confirmed",
    },
  });
  await prisma.notification.create({
    data: {
      customerId: guard.customerId,
      appointmentId: id,
      type: "reschedule",
      channel: "email",
      status: "sent",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

function minutesToHHMM(total: number) {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
