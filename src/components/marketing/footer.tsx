import Link from "next/link";
import { Camera, MessageCircle, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { NAV_LINKS, SALON_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-line bg-beige">
      <Container className="grid gap-12 py-16 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo className="h-16" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Depilación láser avanzada para una piel suave, segura y libre de preocupaciones.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={SALON_INFO.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Lasería"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-gold hover:text-white"
            >
              <Camera className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <a
              href={`https://wa.me/${SALON_INFO.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp de Lasería"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-gold hover:text-white"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Navegación</h3>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Visítanos</h3>
          <div className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{SALON_INFO.address}</span>
          </div>
          <div className="mt-3 flex items-start gap-2 text-sm text-ink-muted">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div className="space-y-1">
              {SALON_INFO.hours.map((h) => (
                <p key={h.days}>
                  {h.days}: {h.time}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Legal</h3>
          <ul className="mt-4 space-y-3">
            <li>
              <Link href="/privacidad" className="text-sm text-ink-muted transition-colors hover:text-ink">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="text-sm text-ink-muted transition-colors hover:text-ink">
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line/70 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Lasería. Todos los derechos reservados.</p>
          <p>Hecho con cuidado para tu piel.</p>
        </Container>
      </div>
    </footer>
  );
}
