import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ServiceCard } from "@/components/marketing/service-card";
import { getActiveServices } from "@/lib/data";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tratamientos",
  description: "Conoce todos los tratamientos de depilación láser disponibles en Lasería.",
};

export default async function TratamientosPage() {
  const services = await getActiveServices();

  return (
    <div className="py-16 lg:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Catálogo completo
          </span>
          <h1 className="mt-3 font-display text-5xl text-ink">Nuestros tratamientos</h1>
          <p className="mt-4 text-ink-muted">
            Tecnología láser avanzada para cada zona del cuerpo, con protocolos seguros y
            personalizados.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {SERVICE_CATEGORIES.map((cat) => {
            const items = services.filter((s) => s.category === cat.value);
            if (items.length === 0) return null;
            return (
              <section key={cat.value} id={cat.value}>
                <h2 className="font-display text-3xl text-ink">{cat.label}</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((s) => (
                    <ServiceCard
                      key={s.id}
                      id={s.id}
                      name={s.name}
                      description={s.description}
                      durationMinutes={s.durationMinutes}
                      price={s.price}
                      category={s.category}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
