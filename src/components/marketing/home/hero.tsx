import { Sparkles, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { InstallAppButton } from "@/components/pwa/install-app-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-beige">
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-blush/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[-5%] h-80 w-80 rounded-full bg-nude/50 blur-3xl" />

      <Container className="relative grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-dark">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Depilación láser de última generación
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
            Tu piel, <span className="italic text-gold-dark">tu mejor versión.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Depilación láser avanzada para una piel suave, segura y libre de preocupaciones.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/reservar" size="lg">
              Reservar mi cita
            </ButtonLink>
            <ButtonLink href="/tratamientos" variant="secondary" size="lg">
              Ver tratamientos
            </ButtonLink>
            <InstallAppButton />
          </div>

          <div className="mt-10 flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-gold-dark" strokeWidth={1.75} />
            Tecnología segura, certificada y aprobada para todo tipo de piel.
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-ink/10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, #FFFFFF 0%, #F3E5E5 45%, #E8D8CC 100%)",
              }}
            />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/30" />
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20" />
            <Sparkles
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-gold-dark/70"
              strokeWidth={0.75}
            />
          </div>

          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-6 py-4 shadow-xl shadow-ink/10 sm:-left-10">
            <p className="font-display text-3xl text-ink">+2,500</p>
            <p className="text-xs text-ink-muted">tratamientos realizados</p>
          </div>

          <div className="absolute -top-6 -right-4 rounded-2xl bg-white px-5 py-3 shadow-xl shadow-ink/10 sm:-right-8">
            <p className="font-display text-2xl text-ink">98%</p>
            <p className="text-xs text-ink-muted">clientas satisfechas</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
