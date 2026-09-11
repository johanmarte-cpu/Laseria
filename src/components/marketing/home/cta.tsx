import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-blush/10 blur-3xl" />

          <h2 className="relative font-display text-4xl text-white sm:text-5xl">
            ¿Lista para comenzar?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/70">
            Agenda tu primera sesión con Lasería.
          </p>
          <div className="relative mt-10">
            <ButtonLink href="/reservar" size="lg" className="bg-white text-ink hover:bg-gold hover:text-white">
              Reservar ahora
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
