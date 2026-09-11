import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarRange, Users, DollarSign, TrendingUp } from "lucide-react";
import { getAdminStats, getTodayAgenda } from "@/lib/admin-data";
import { StatusBadge } from "@/components/ui/badge";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { formatPrice, to12h } from "@/lib/utils";

export const metadata: Metadata = { title: "Panel administrativo" };

export default async function AdminDashboardPage() {
  const [stats, agenda] = await Promise.all([getAdminStats(), getTodayAgenda()]);

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Dashboard</h1>
      <p className="mt-2 text-ink-muted">Resumen general de la actividad de Lasería.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Citas hoy" value={String(stats.todayCount)} />
        <StatCard icon={CalendarRange} label="Citas esta semana" value={String(stats.weekCount)} />
        <StatCard icon={Users} label="Clientes nuevos (semana)" value={String(stats.newCustomersThisWeek)} />
        <StatCard
          icon={DollarSign}
          label="Ingresos estimados (mes)"
          value={formatPrice(stats.estimatedRevenue)}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Agenda de hoy</h2>
            <Link href="/admin/calendario" className="text-sm font-semibold text-ink hover:text-gold-dark">
              Ver calendario
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {agenda.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-muted">No hay citas programadas para hoy.</p>
            ) : (
              agenda.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 text-sm font-semibold text-ink">{to12h(a.startTime)}</span>
                    <ProfessionalAvatar
                      firstName={a.professional.firstName}
                      lastName={a.professional.lastName}
                      photoUrl={a.professional.photoUrl}
                      className="h-8 w-8 text-xs"
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {a.customer.firstName} {a.customer.lastName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {a.services.map((s) => s.service.name).join(", ")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold-dark" strokeWidth={1.75} />
            <h2 className="font-display text-xl text-ink">Tratamientos más reservados</h2>
          </div>
          <p className="mt-1 text-xs text-ink-muted">Este mes</p>

          <div className="mt-5 space-y-4">
            {stats.topServices.length === 0 ? (
              <p className="text-sm text-ink-muted">Aún no hay datos suficientes.</p>
            ) : (
              stats.topServices.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-beige text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-ink">{s.name}</span>
                  <span className="text-sm font-semibold text-ink-muted">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <Icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}
