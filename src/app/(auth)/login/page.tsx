import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { STAFF_ROLE_LABELS, isStaffRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta de Lasería.",
};

export default async function LoginPage() {
  const session = await auth();
  const user = session?.user;
  const roleLabel = user && isStaffRole(user.role) ? STAFF_ROLE_LABELS[user.role] : "Clienta";
  const accountHref = user && isStaffRole(user.role) ? "/admin" : "/dashboard";

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 sm:p-10">
      <h1 className="font-display text-3xl text-ink">Bienvenida de nuevo</h1>
      <p className="mt-2 text-sm text-ink-muted">Inicia sesión para gestionar tus citas.</p>

      {user && (
        <div className="mt-6 rounded-2xl border border-line bg-beige/60 p-4 text-sm">
          <p className="text-ink">
            Ya iniciaste sesión como <span className="font-semibold">{user.name}</span> ({roleLabel}, {user.email}).
          </p>
          <p className="mt-1 text-ink-muted">
            Para entrar con otra cuenta, cierra esta sesión primero, o simplemente escribe las credenciales de la
            otra cuenta abajo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={accountHref}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-gold-dark"
            >
              Ir a mi cuenta
            </Link>
            <SignOutButton variant="secondary" size="sm" callbackUrl="/login">
              Cerrar sesión
            </SignOutButton>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-ink hover:text-gold-dark">
          Crea una aquí
        </Link>
      </p>
    </div>
  );
}
