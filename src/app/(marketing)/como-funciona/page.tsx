import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { ShieldCheck, Clock3, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Descubre cómo funciona la depilación láser en Lasería, paso a paso.",
};

const EXPECT = [
  {
    icon: Clock3,
    title: "¿Cuántas sesiones necesito?",
    description:
      "En promedio entre 6 y 8 sesiones espaciadas cada 4-6 semanas, según tipo de piel y vello.",
  },
  {
    icon: ShieldCheck,
    title: "¿Es seguro?",
    description:
      "Sí. Utilizamos tecnología láser certificada, apta para la mayoría de los tonos de piel.",
  },
  {
    icon: Sparkles,
    title: "¿Duele?",
    description: "La mayoría de clientas describen una sensación de calor leve, muy tolerable.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
          Proceso simple
        </span>
        <h1 className="mt-3 font-display text-5xl text-ink">Cómo funciona</h1>
        <p className="mt-4 text-ink-muted">
          Reservar y disfrutar tu tratamiento en Lasería es un proceso simple, pensado para tu
          comodidad.
        </p>
      </Container>

      <HowItWorks />

      <Container className="max-w-4xl">
        <h2 className="text-center font-display text-3xl text-ink">Lo que debes saber</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {EXPECT.map((item) => (
            <div key={item.title} className="rounded-3xl border border-line bg-white p-6">
              <item.icon className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <ButtonLink href="/reservar" size="lg">
            Reservar mi cita
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
