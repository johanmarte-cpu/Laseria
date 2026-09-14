import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/badge";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { formatDate, to12h } from "@/lib/utils";
import { BackLink } from "@/components/admin/consent/back-link";

export const metadata: Metadata = { title: "Historial del cliente" };

export default async function AdminCustomerHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const appointments = await prisma.appointment.findMany({
    where: { customerId: id },
    include: { professional: true, services: { include: { service: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <BackLink />
      <h1 className="mt-3 font-display text-4xl text-ink">Historial de tratamientos</h1>
      <p className="mt-2 text-ink-muted">
        Cliente: {customer.firstName} {customer.lastName} · {appointments.length}{" "}
        {appointments.length === 1 ? "cita registrada" : "citas registradas"}
      </p>

      <div className="mt-8 space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
            Este cliente aún no tiene citas registradas.
          </div>
        ) : (
          appointments.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ProfessionalAvatar
                    firstName={a.professional.firstName}
                    lastName={a.professional.lastName}
                    photoUrl={a.professional.photoUrl}
                    className="h-10 w-10 text-sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {formatDate(a.date)} · {to12h(a.startTime)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Atendido por {a.professional.firstName} {a.professional.lastName}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <p className="mt-4 text-sm text-ink-soft">
                {a.services.map((s) => s.service.name).join(", ")}
              </p>

              <div className="mt-4 rounded-xl bg-beige p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Notas de tratamiento
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink-soft">
                  {a.notes || "Sin notas registradas."}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
