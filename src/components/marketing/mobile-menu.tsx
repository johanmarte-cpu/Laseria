"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function MobileMenu({
  links,
  isLoggedIn,
  accountHref,
}: {
  links: readonly { href: string; label: string }[];
  isLoggedIn: boolean;
  accountHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige"
      >
        <Menu className="h-6 w-6" strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 animate-fade-in bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo className="h-12" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-beige"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line py-4 font-display text-2xl text-ink-soft transition-colors hover:text-gold-dark"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 px-6 py-6">
              <ButtonLink href="/reservar" size="lg" className="w-full">
                Reservar cita
              </ButtonLink>
              <ButtonLink href={accountHref} variant="secondary" size="lg" className="w-full">
                {isLoggedIn ? "Mi cuenta" : "Iniciar sesión"}
              </ButtonLink>
              {isLoggedIn && (
                <SignOutButton variant="secondary" size="lg" className="w-full" />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
