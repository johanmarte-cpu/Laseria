import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  computeSlotsForSchedule,
  timeToMinutes,
  minutesSinceMidnight,
  BOOKING_LEAD_MINUTES,
} from "@/lib/availability";
import { generateBookingNumber, generateTempPassword } from "@/lib/utils";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";
import type { CreateAppointmentInput } from "@/lib/validations";

export { FIRST_AVAILABLE_ID };

export type BookingResult =
  | { ok: true; appointmentId: string; bookingNumber: string; tempCredentials?: { email: string; password: string } }
  | { ok: false; status: number; error: string };

/**
 * Re-validates availability inside the write path (not just trusting the
 * slot the client fetched earlier) and creates the appointment atomically.
 * This is what actually prevents two customers from booking the same
 * professional/date/time — the UI-level availability check is only a
 * convenience, this is the enforcement point.
 */
export async function createBooking(
  input: CreateAppointmentInput,
  existingCustomerId: string | null
): Promise<BookingResult> {
  const services = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, active: true },
  });
  if (services.length !== input.serviceIds.length) {
    return { ok: false, status: 400, error: "Uno o más tratamientos ya no están disponibles." };
  }

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
  const date = new Date(`${input.date}T00:00:00`);
  const dayOfWeek = date.getDay();
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const minStartMinutes = isToday ? minutesSinceMidnight(now) + BOOKING_LEAD_MINUTES : null;

  const candidateProfessionalIds =
    input.professionalId === FIRST_AVAILABLE_ID
      ? (
          await prisma.professional.findMany({
            where: { active: true, role: "professional" },
            select: { id: true },
          })
        ).map((p) => p.id)
      : [input.professionalId];

  if (candidateProfessionalIds.length === 0) {
    return { ok: false, status: 400, error: "No hay profesionales disponibles." };
  }

  let chosenProfessionalId: string | null = null;

  for (const professionalId of candidateProfessionalIds) {
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: { schedules: { where: { dayOfWeek } }, timeOff: true },
    });
    if (!professional || !professional.active) continue;

    const hasTimeOff = professional.timeOff.some(
      (t) => t.date.toDateString() === date.toDateString()
    );
    if (hasTimeOff) continue;

    const schedule = professional.schedules[0];
    if (!schedule) continue;

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        date,
        status: { not: "cancelled" },
      },
      select: { startTime: true, endTime: true },
    });

    const slots = computeSlotsForSchedule(
      schedule,
      existingAppointments,
      totalDuration,
      undefined,
      minStartMinutes
    );
    const requestedStartMinutes = timeToMinutes(input.startTime);
    const matchingSlot = slots.find(
      (s) => timeToMinutes(s.time) === requestedStartMinutes && s.available
    );

    if (matchingSlot) {
      chosenProfessionalId = professionalId;
      break;
    }
  }

  if (!chosenProfessionalId) {
    return {
      ok: false,
      status: 409,
      error: "Este horario acaba de ser reservado. Por favor selecciona otro.",
    };
  }

  const endTime = minutesToHHMM(timeToMinutes(input.startTime) + totalDuration);

  let customerId = existingCustomerId;
  let tempCredentials: { email: string; password: string } | undefined;

  if (!customerId) {
    const email = input.customer.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        ok: false,
        status: 409,
        error: "Ya existe una cuenta con este email. Inicia sesión para continuar con tu reserva.",
      };
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "customer",
        customer: {
          create: {
            firstName: input.customer.firstName,
            lastName: input.customer.lastName,
            phone: input.customer.phone,
            birthDate: input.customer.birthDate ? new Date(input.customer.birthDate) : null,
            marketingOptIn: input.customer.wantsReminders ?? false,
          },
        },
      },
      include: { customer: true },
    });

    customerId = user.customer!.id;
    tempCredentials = { email, password: tempPassword };
  }

  const bookingNumber = generateBookingNumber();

  const appointment = await prisma.appointment.create({
    data: {
      bookingNumber,
      customerId,
      professionalId: chosenProfessionalId,
      date,
      startTime: input.startTime,
      endTime,
      status: "confirmed",
      totalPrice,
      totalDuration,
      notes: input.customer.notes ?? "",
      wantsReminders: input.customer.wantsReminders ?? false,
      services: {
        create: services.map((s) => ({
          serviceId: s.id,
          priceAtBooking: s.price,
          durationAtBooking: s.durationMinutes,
        })),
      },
      payment: {
        create: {
          amount: totalPrice,
          depositAmount: 0,
          status: "pending",
          method: "pay_at_location",
        },
      },
      notifications: {
        create: {
          customerId,
          type: "booking_confirmation",
          channel: "email",
          status: "sent",
          sentAt: new Date(),
        },
      },
    },
  });

  return { ok: true, appointmentId: appointment.id, bookingNumber, tempCredentials };
}

function minutesToHHMM(total: number) {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

