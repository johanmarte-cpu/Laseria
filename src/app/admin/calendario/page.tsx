import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AgendaView } from "@/components/admin/calendar/agenda-view";

export const metadata: Metadata = { title: "Calendario" };

export default async function AdminCalendarPage() {
  const session = await auth();
  const today = new Date();
  const rangeStart = new Date(today);
  rangeStart.setDate(rangeStart.getDate() - 60);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + 60);

  // A professional only ever sees their own agenda — everyone else sees the
  // full salon calendar.
  const professionalFilter =
    session?.user?.role === "professional" ? { professionalId: session.user.employeeId! } : {};

  const appointments = await prisma.appointment.findMany({
    where: { date: { gte: rangeStart, lte: rangeEnd }, ...professionalFilter },
    include: {
      customer: true,
      professional: true,
      services: { include: { service: true } },
      payment: true,
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <AgendaView
      appointments={appointments.map((a) => ({
        id: a.id,
        bookingNumber: a.bookingNumber,
        date: a.date.toISOString(),
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        totalPrice: a.totalPrice,
        totalDuration: a.totalDuration,
        notes: a.notes,
        customer: a.customer,
        professional: a.professional,
        services: a.services,
        payment: a.payment,
      }))}
    />
  );
}
