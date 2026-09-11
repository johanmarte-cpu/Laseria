import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toDisplayAppointment } from "@/lib/appointment-mapper";
import { AppointmentCard } from "@/components/dashboard/appointment-card";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mis citas" };

const TABS = [
  { key: "upcoming", label: "Próximas" },
  { key: "past", label: "Pasadas" },
  { key: "cancelled", label: "Canceladas" },
] as const;

export default async function MyAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? tab! : "upcoming";

  const session = await auth();
  const customerId = session!.user.customerId!;

  const appointments = await prisma.appointment.findMany({
    where: { customerId },
    include: { professional: true, services: { include: { service: true } } },
    orderBy: { date: "desc" },
  });

  const now = new Date(new Date().toDateString());
  const filtered = appointments.filter((a) => {
    if (activeTab === "cancelled") return a.status === "cancelled";
    if (activeTab === "past") return a.status === "completed" || (a.date < now && a.status !== "cancelled");
    return a.date >= now && a.status !== "cancelled" && a.status !== "completed";
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Mis citas</h1>
        <ButtonLink href="/reservar" size="sm">
          Reservar cita
        </ButtonLink>
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/citas?tab=${t.key}`}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === t.key ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            No tienes citas en esta categoría.
          </div>
        ) : (
          filtered.map((a) => <AppointmentCard key={a.id} appointment={toDisplayAppointment(a)} />)
        )}
      </div>
    </div>
  );
}
