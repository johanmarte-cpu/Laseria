import Link from "next/link";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { NAV_LINKS } from "@/lib/constants";
import { isStaffRole } from "@/lib/roles";

export async function Header() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const accountHref = session?.user
    ? isStaffRole(session.user.role)
      ? "/admin"
      : "/dashboard"
    : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Logo className="h-14" />

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <>
              <ButtonLink href={accountHref} variant="ghost" size="sm">
                Mi cuenta
              </ButtonLink>
              <SignOutButton />
            </>
          ) : (
            <ButtonLink href={accountHref} variant="ghost" size="sm">
              Iniciar sesión
            </ButtonLink>
          )}
          <ButtonLink href="/reservar" size="sm">
            Reservar cita
          </ButtonLink>
        </div>

        <MobileMenu links={NAV_LINKS} isLoggedIn={isLoggedIn} accountHref={accountHref} />
      </Container>
    </header>
  );
}
