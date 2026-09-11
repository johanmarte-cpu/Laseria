"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { FormField, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "No pudimos crear tu cuenta. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (!result || result.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="firstName" error={errors.firstName?.message}>
          <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
        </FormField>
        <FormField label="Apellido" htmlFor="lastName" error={errors.lastName?.message}>
          <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FormField>

      <FormField label="Teléfono" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="809-555-4477" {...register("phone")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </FormField>
        <FormField
          label="Confirmar contraseña"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
          {...register("marketingOptIn")}
        />
        Quiero recibir recordatorios y promociones de Lasería.
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  );
}
