import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/lib/validations";
import { createBooking } from "@/lib/booking";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await auth();
  const existingCustomerId =
    session?.user?.role === "customer" ? session.user.customerId ?? null : null;

  const result = await createBooking(parsed.data, existingCustomerId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      appointmentId: result.appointmentId,
      bookingNumber: result.bookingNumber,
      tempCredentials: result.tempCredentials,
    },
    { status: 201 }
  );
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "customer" || !session.user.customerId) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { customerId: session.user.customerId },
    include: { services: { include: { service: true } }, professional: true, payment: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return NextResponse.json({ appointments });
}
