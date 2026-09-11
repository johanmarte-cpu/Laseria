import { Container } from "@/components/ui/container";
import { CalendarCheck, Sparkles, Wand2 } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Elige tu tratamiento",
    description: "Selecciona una o varias zonas según lo que quieras tratar.",
  },
  {
    icon: CalendarCheck,
    title: "Selecciona fecha y hora",
    description: "Escoge a tu profesional y el horario que mejor te convenga.",
  },
  {
    icon: Wand2,
    title: "Ven a tu cita y disfruta",
    description: "Relájate: nosotras nos encargamos del resto.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">Cómo funciona</h2>
          <p className="mt-4 text-ink-muted">Reservar tu cita toma menos de dos minutos.</p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative text-center">
              {i < STEPS.length - 1 && (
                <div className="absolute top-8 left-[60%] hidden h-px w-full bg-line lg:block" />
              )}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
                <step.icon className="h-6 w-6" strokeWidth={1.5} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl text-ink">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
