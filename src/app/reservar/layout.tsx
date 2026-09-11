import { X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { Container } from "@/components/ui/container";

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-line">
        <Container className="flex h-20 items-center justify-between">
          <Logo className="h-14" />
          <Link
            href="/"
            aria-label="Cerrar y volver al inicio"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
