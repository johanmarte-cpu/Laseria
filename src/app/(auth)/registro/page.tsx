import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta en Lasería y gestiona tus citas fácilmente.",
};

export default function RegistroPage() {
  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 sm:p-10">
      <h1 className="font-display text-3xl text-ink">Crea tu cuenta</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Regístrate para reservar y gestionar tus citas en Lasería.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-ink hover:text-gold-dark">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
