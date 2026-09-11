import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Elige una nueva contraseña para tu cuenta de Lasería.",
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 sm:p-10">
      <h1 className="font-display text-3xl text-ink">Elige tu nueva contraseña</h1>
      <p className="mt-2 text-sm text-ink-muted">Debe tener al menos 8 caracteres.</p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <ResetPasswordForm token={token ?? ""} />
        </Suspense>
      </div>
    </div>
  );
}
