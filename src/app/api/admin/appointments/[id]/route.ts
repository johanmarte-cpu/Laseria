import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { adminUpdateAppointmentSchema } from "@/lib/validations";
import { computeSlotsForSchedule, timeToMinutes } from "@/lib/availability";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager", "receptionist", "professional"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = adminUpdateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const data = parsed.data;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });

  // A professional may only mark their own appointments as completed/no-show
  // — no reschedule, no editing other staff's agenda.
  if (guard.role === "professional") {
    if (appointment.professionalId !== guard.employeeId) {
      return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
    }
    const onlyStatusChange =
      (data.status === "completed" || data.status === "no_show") &&
      !data.date &&
      !data.startTime &&
      !data.professionalId &&
      data.notes === undefined &&
      !data.paymentStatus;
    if (!onlyStatusChange) {
      return NextResponse.json({ error: "Solo puedes marcar tus citas como completadas o no asistidas." }, { status: 403 });
    }
    await prisma.appointment.update({ where: { id }, data: { status: data.status } });
    const updated = await prisma.appointment.findUnique({
      where: { id },
      include: { customer: true, professional: true, services: { include: { service: true } }, payment: true },
    });
    return NextResponse.json({ appointment: updated });
  }

  const professionalId = data.professionalId ?? appointment.professionalId;
  const isMovingSlot = Boolean(data.date || data.startTime || data.professionalId);

  const updateData: Record<string, unknown> = {};

  if (isMovingSlot) {
    const dateStr = data.date ?? appointment.date.toISOString().slice(0, 10);
    const startTime = data.startTime ?? appointment.startTime;
    const date = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = date.getDay();

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { schedules: { where: { dayOfWeek } }, timeOff: true },
    });
    if (!professional) return NextResponse.json({ error: "Profesional no encontrada." }, { status: 404 });

    const existingAppointments = await prisma.appointment.findMany({
      where: { professionalId, date, status: { not: "cancelled" }, id: { not: id } },
      select: { startTime: true, endTime: true },
    });

    const requestedMinutes = timeToMinutes(startTime);
    const hasTimeOff = professional.timeOff.some((t) => t.date.toDateString() === date.toDateString());
    const schedule = professional.schedules[0];

    if (!hasTimeOff && schedule) {
      const slots = computeSlotsForSchedule(schedule, existingAppointments, appointment.totalDuration);
      const match = slots.find((s) => timeToMinutes(s.time) === requestedMinutes && s.available);
      if (!match) {
        return NextResponse.json(
          { error: "Este horario se solapa con otra cita de la profesional." },
          { status: 409 }
        );
      }
    } else {
      const overlap = existingAppointments.some((a) => {
        const start = timeToMinutes(a.startTime);
        const end = timeToMinutes(a.endTime);
        return requestedMinutes < end && requestedMinutes + appointment.totalDuration > start;
      });
      if (overlap) {
        return NextResponse.json(
          { error: "Este horario se solapa con otra cita de la profesional." },
          { status: 409 }
        );
      }
    }

    updateData.date = date;
    updateData.startTime = startTime;
    updateData.endTime = minutesToHHMM(requestedMinutes + appointment.totalDuration);
    updateData.professionalId = professionalId;
  }

  if (data.status) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await prisma.appointment.update({ where: { id }, data: updateData });

  if (data.paymentStatus) {
    await prisma.payment.updateMany({
      where: { appointmentId: id },
      data: { status: data.paymentStatus },
    });
  }

  const updated = await prisma.appointment.findUnique({
    where: { id },
    include: { customer: true, professional: true, services: { include: { service: true } }, payment: true },
  });

  return NextResponse.json({ appointment: updated });
}

function minutesToHHMM(total: number) {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
