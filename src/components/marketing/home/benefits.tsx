import { Cpu, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";

const BENEFITS = [
  {
    icon: Cpu,
    title: "Tecnología avanzada",
    description: "Equipos láser de última generación, seguros para todo tipo de piel.",
  },
  {
    icon: GraduationCap,
    title: "Profesionales capacitadas",
    description: "Especialistas certificadas con formación internacional continua.",
  },
  {
    icon: Sparkles,
    title: "Tratamientos personalizados",
    description: "Protocolos adaptados a tu tipo de piel y tono de vello.",
  },
  {
    icon: TrendingUp,
    title: "Resultados progresivos",
    description: "Seguimiento sesión a sesión para resultados visibles y duraderos.",
  },
];

export function Benefits() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            La experiencia <span className="italic text-gold-dark">Lasería</span>
          </h2>
          <p className="mt-4 text-ink-muted">
            Cuidamos cada detalle para que tu tratamiento sea seguro, cómodo y efectivo.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group rounded-3xl border border-line bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush text-gold-dark transition-colors group-hover:bg-gold group-hover:text-white">
                <b.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-xl text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
