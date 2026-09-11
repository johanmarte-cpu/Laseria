import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de Lasería.",
};

export default function RecuperarPage() {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 sm:p-10">
      <h1 className="font-display text-3xl text-ink">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Ingresa tu email y te enviaremos instrucciones para restablecerla.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-semibold text-ink hover:text-gold-dark">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
