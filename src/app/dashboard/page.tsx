import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarCheck, History, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toDisplayAppointment } from "@/lib/appointment-mapper";
import { AppointmentCard } from "@/components/dashboard/appointment-card";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function DashboardOverviewPage() {
  const session = await auth();
  const customerId = session!.user.customerId!;

  const [customer, appointments] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId } }),
    prisma.appointment.findMany({
      where: { customerId },
      include: { professional: true, services: { include: { service: true } } },
      orderBy: { date: "asc" },
    }),
  ]);

  const now = new Date(new Date().toDateString());
  const upcoming = appointments
    .filter((a) => new Date(a.date) >= now && a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const past = appointments.filter((a) => a.status === "completed");
  const nextAppointment = upcoming[0];

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Hola, {customer?.firstName} 👋</h1>
      <p className="mt-2 text-ink-muted">Este es el resumen de tu cuenta en Lasería.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Total de citas" value={String(appointments.length)} />
        <StatCard
          icon={History}
          label="Última visita"
          value={past[0] ? formatDate(past[past.length - 1].date) : "—"}
        />
        <StatCard
          icon={CalendarCheck}
          label="Próxima cita"
          value={nextAppointment ? formatDate(nextAppointment.date) : "—"}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Próxima cita</h2>
          <Link href="/dashboard/citas" className="text-sm font-semibold text-ink hover:text-gold-dark">
            Ver todas
          </Link>
        </div>

        <div className="mt-4">
          {nextAppointment ? (
            <AppointmentCard appointment={toDisplayAppointment(nextAppointment)} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-gold-dark" strokeWidth={1.5} />
              <p className="mt-4 text-ink-muted">Todavía no tienes citas próximas.</p>
              <ButtonLink href="/reservar" className="mt-6">
                Reservar mi cita
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <Icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
      <p className="mt-3 font-display text-2xl capitalize text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}
