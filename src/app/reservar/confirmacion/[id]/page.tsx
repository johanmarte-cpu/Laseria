import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { formatDate, formatDuration, formatPrice, to12h } from "@/lib/utils";

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bookingNumber?: string }>;
}) {
  const { id } = await params;
  const { bookingNumber } = await searchParams;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { professional: true, services: { include: { service: true } }, customer: true },
  });

  if (!appointment || (bookingNumber && appointment.bookingNumber !== bookingNumber)) {
    notFound();
  }

  const gcalUrl = buildGoogleCalendarUrl(appointment);

  return (
    <Container className="max-w-xl py-16 text-center lg:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-confirmed/10 text-status-confirmed">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
      </div>

      <h1 className="mt-6 font-display text-4xl text-ink">¡Tu cita está confirmada!</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Te enviamos un correo de confirmación. Guarda tu número de reserva.
      </p>

      <div className="mt-10 space-y-6 rounded-3xl border border-line bg-white p-8 text-left">
        <div className="flex items-center justify-between border-b border-line pb-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Número de reserva
          </span>
          <span className="font-display text-xl text-gold-dark">{appointment.bookingNumber}</span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Tratamiento{appointment.services.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {appointment.services.map((s) => (
              <li key={s.id}>{s.service.name}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <ProfessionalAvatar
            firstName={appointment.professional.firstName}
            lastName={appointment.professional.lastName}
            photoUrl={appointment.professional.photoUrl}
            className="h-10 w-10"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Profesional
            </p>
            <p className="text-sm text-ink">
              {appointment.professional.firstName} {appointment.professional.lastName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Fecha</p>
            <p className="mt-1 capitalize text-ink">{formatDate(appointment.date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Hora</p>
            <p className="mt-1 text-ink">{to12h(appointment.startTime)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Duración</p>
            <p className="mt-1 text-ink">{formatDuration(appointment.totalDuration)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Precio</p>
            <p className="mt-1 font-display text-lg text-ink">{formatPrice(appointment.totalPrice)}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href={gcalUrl} variant="secondary" target="_blank">
          Agregar al calendario
        </ButtonLink>
        <ButtonLink href="/dashboard/citas">Ver mis citas</ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Volver al inicio
        </ButtonLink>
      </div>
    </Container>
  );
}

function buildGoogleCalendarUrl(appointment: {
  date: Date;
  startTime: string;
  endTime: string;
  bookingNumber: string;
}) {
  const dateStr = appointment.date.toISOString().slice(0, 10).replace(/-/g, "");
  const start = `${dateStr}T${appointment.startTime.replace(":", "")}00`;
  const end = `${dateStr}T${appointment.endTime.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Cita en Lasería (${appointment.bookingNumber})`,
    dates: `${start}/${end}`,
    details: "Tu cita en Lasería. Te esperamos 10 minutos antes.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
