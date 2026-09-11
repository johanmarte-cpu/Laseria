import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAdminCustomers } from "@/lib/admin-data";
import { AppointmentsTable } from "@/components/admin/appointments/appointments-table";

export const metadata: Metadata = { title: "Citas" };

export default async function AdminAppointmentsPage() {
  const [appointments, services, professionals, customerRows] = await Promise.all([
    prisma.appointment.findMany({
      include: {
        customer: true,
        professional: true,
        services: { include: { service: true } },
        payment: true,
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    }),
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.professional.findMany({
      where: { active: true, role: "professional" },
      include: { schedules: true },
      orderBy: { firstName: "asc" },
    }),
    getAdminCustomers(),
  ]);

  return (
    <AppointmentsTable
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
      services={services}
      professionals={professionals}
      customers={customerRows}
    />
  );
}
