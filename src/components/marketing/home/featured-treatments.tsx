import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { TreatmentArt } from "@/components/ui/treatment-art";
import { formatPrice } from "@/lib/utils";
import { getFeaturedTreatments } from "@/lib/data";

export async function FeaturedTreatments() {
  const treatments = await getFeaturedTreatments();

  return (
    <section className="bg-beige py-20 lg:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-4xl text-ink sm:text-5xl">Tratamientos destacados</h2>
            <p className="mt-4 max-w-lg text-ink-muted">
              Elige la zona que quieres tratar y agenda tu sesión en minutos.
            </p>
          </div>
          <Link
            href="/tratamientos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-dark"
          >
            Ver todos los tratamientos
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t) => (
            <div
              key={t.category}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm shadow-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10"
            >
              <TreatmentArt visualKey={t.category} className="h-48 w-full" />
              <div className="p-6">
                <h3 className="font-display text-2xl text-ink">{t.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-ink-muted">Desde</span>
                    <p className="font-display text-xl text-ink">
                      {t.priceFrom !== null ? formatPrice(t.priceFrom) : "—"}
                    </p>
                  </div>
                  <Link
                    href={`/reservar?categoria=${t.category}`}
                    className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
