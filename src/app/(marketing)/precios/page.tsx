import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { getActiveServices } from "@/lib/data";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Precios",
  description: "Consulta los precios de todos los tratamientos de depilación láser en Lasería.",
};

export default async function PreciosPage() {
  const services = await getActiveServices();

  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-4xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Precios transparentes
          </span>
          <h1 className="mt-3 font-display text-5xl text-ink">Lista de precios</h1>
          <p className="mt-4 text-ink-muted">
            Sin sorpresas: el precio que ves es el precio que pagas por sesión.
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {SERVICE_CATEGORIES.map((cat) => {
            const items = services.filter((s) => s.category === cat.value);
            if (items.length === 0) return null;
            return (
              <div key={cat.value}>
                <h2 className="font-display text-2xl text-ink">{cat.label}</h2>
                <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-5"
                    >
                      <div>
                        <p className="font-medium text-ink">{s.name}</p>
                        <p className="text-xs text-ink-muted">{formatDuration(s.durationMinutes)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-display text-xl text-ink">{formatPrice(s.price)}</p>
                        <Link
                          href={`/reservar?serviceId=${s.id}`}
                          className="rounded-full border border-ink/20 px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-beige"
                        >
                          Reservar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl bg-beige p-10 text-center">
          <h3 className="font-display text-2xl text-ink">¿Quieres combinar tratamientos?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Puedes seleccionar varias zonas en un mismo turno al momento de reservar.
          </p>
          <ButtonLink href="/reservar" className="mt-6">
            Reservar ahora
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
