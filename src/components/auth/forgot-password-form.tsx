"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { FormField, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [demoResetUrl, setDemoResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    setSent(true);
    setDemoResetUrl(body.demoResetUrl ?? null);
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <Alert tone="success">
          Si existe una cuenta con ese email, te enviamos instrucciones para restablecer tu
          contraseña.
        </Alert>
        {demoResetUrl && (
          <Alert tone="info">
            Este proyecto aún no tiene un proveedor de email conectado (ver README, Fase 2). Para
            que puedas probar el flujo completo, aquí está tu enlace de restablecimiento:{" "}
            <Link href={demoResetUrl} className="font-semibold underline">
              continuar
            </Link>
            .
          </Alert>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <FormField label="Email" htmlFor="fp-email" error={errors.email?.message}>
        <Input id="fp-email" type="email" autoComplete="email" {...register("email")} />
      </FormField>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar instrucciones
        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
      </Button>
    </form>
  );
}
