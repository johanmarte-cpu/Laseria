import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { adminCreateAppointmentSchema } from "@/lib/validations";
import { computeSlotsForSchedule, timeToMinutes } from "@/lib/availability";
import { generateBookingNumber, generateTempPassword } from "@/lib/utils";

export async function GET(request: Request) {
  const guard = await requireStaff(["admin", "manager", "receptionist", "professional"]);
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");
  // A professional can only ever see their own agenda, regardless of what
  // was requested — this is the data-level enforcement of that rule.
  const professionalId =
    guard.role === "professional" ? guard.employeeId : searchParams.get("professionalId");

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
              ...(to ? { lte: new Date(`${to}T00:00:00`) } : {}),
            },
          }
        : {}),
      ...(status ? { status } : {}),
      ...(professionalId ? { professionalId } : {}),
    },
    include: {
      customer: true,
      professional: true,
      services: { include: { service: true } },
      payment: true,
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = adminCreateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  let customerId = data.customerId ?? null;

  if (!customerId) {
    if (!data.newCustomer) {
      return NextResponse.json(
        { error: "Selecciona un cliente existente o ingresa uno nuevo." },
        { status: 400 }
      );
    }
    const email = data.newCustomer.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email. Búscalo en el listado de clientes." },
        { status: 409 }
      );
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
            firstName: data.newCustomer.firstName,
            lastName: data.newCustomer.lastName,
            phone: data.newCustomer.phone,
          },
        },
      },
      include: { customer: true },
    });
    customerId = user.customer!.id;
  }

  const services = await prisma.service.findMany({ where: { id: { in: data.serviceIds } } });
  if (services.length !== data.serviceIds.length) {
    return NextResponse.json({ error: "Uno o más tratamientos no existen." }, { status: 400 });
  }
  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  const date = new Date(`${data.date}T00:00:00`);
  const dayOfWeek = date.getDay();

  const professional = await prisma.professional.findUnique({
    where: { id: data.professionalId },
    include: { schedules: { where: { dayOfWeek } }, timeOff: true },
  });
  if (!professional || professional.role !== "professional") {
    return NextResponse.json({ error: "Profesional no encontrada." }, { status: 404 });
  }

  const existingAppointments = await prisma.appointment.findMany({
    where: { professionalId: data.professionalId, date, status: { not: "cancelled" } },
    select: { startTime: true, endTime: true },
  });

  const schedule = professional.schedules[0];
  const requestedMinutes = timeToMinutes(data.startTime);
  const hasTimeOff = professional.timeOff.some((t) => t.date.toDateString() === date.toDateString());

  if (!hasTimeOff && schedule) {
    const slots = computeSlotsForSchedule(schedule, existingAppointments, totalDuration);
    const matchingSlot = slots.find((s) => timeToMinutes(s.time) === requestedMinutes && s.available);
    if (!matchingSlot) {
      return NextResponse.json(
        { error: "Este horario se solapa con otra cita de la profesional." },
        { status: 409 }
      );
    }
  } else {
    // Admin is booking outside the professional's normal schedule (manual override) —
    // still block a hard overlap against existing appointments.
    const overlap = existingAppointments.some((a) => {
      const start = timeToMinutes(a.startTime);
      const end = timeToMinutes(a.endTime);
      return requestedMinutes < end && requestedMinutes + totalDuration > start;
    });
    if (overlap) {
      return NextResponse.json(
        { error: "Este horario se solapa con otra cita de la profesional." },
        { status: 409 }
      );
    }
  }

  const endTime = minutesToHHMM(requestedMinutes + totalDuration);

  const appointment = await prisma.appointment.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId,
      professionalId: data.professionalId,
      date,
      startTime: data.startTime,
      endTime,
      status: data.status,
      totalPrice,
      totalDuration,
      notes: data.notes ?? "",
      services: {
        create: services.map((s) => ({
          serviceId: s.id,
          priceAtBooking: s.price,
          durationAtBooking: s.durationMinutes,
        })),
      },
      payment: { create: { amount: totalPrice, status: "pending", method: "pay_at_location" } },
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

  return NextResponse.json({ appointmentId: appointment.id }, { status: 201 });
}

function minutesToHHMM(total: number) {
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
