import type { Metadata } from "next";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SALON_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos y agenda tu cita en Lasería.",
};

export default function ContactoPage() {
  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-4xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Estamos para ayudarte
          </span>
          <h1 className="mt-3 font-display text-5xl text-ink">Contacto</h1>
          <p className="mt-4 text-ink-muted">
            Escríbenos por WhatsApp o visítanos — con gusto resolvemos tus dudas.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-line bg-white p-8">
            <MapPin className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl text-ink">Dirección</h3>
            <p className="mt-2 text-sm text-ink-muted">{SALON_INFO.address}</p>
          </div>

          <div className="rounded-3xl border border-line bg-white p-8">
            <Clock className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl text-ink">Horarios</h3>
            <div className="mt-2 space-y-1 text-sm text-ink-muted">
              {SALON_INFO.hours.map((h) => (
                <p key={h.days}>
                  {h.days}: {h.time}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-8">
            <Phone className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl text-ink">Teléfono</h3>
            <p className="mt-2 text-sm text-ink-muted">{SALON_INFO.phone}</p>
          </div>

          <div className="rounded-3xl border border-line bg-white p-8">
            <Mail className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl text-ink">Email</h3>
            <p className="mt-2 text-sm text-ink-muted">{SALON_INFO.email}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-beige p-10 text-center">
          <MessageCircle className="h-8 w-8 text-gold-dark" strokeWidth={1.5} />
          <h3 className="font-display text-2xl text-ink">Escríbenos por WhatsApp</h3>
          <p className="max-w-sm text-sm text-ink-muted">
            La forma más rápida de resolver dudas o coordinar tu tratamiento.
          </p>
          <ButtonLink href={`https://wa.me/${SALON_INFO.whatsapp}`} size="lg">
            Abrir WhatsApp
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
