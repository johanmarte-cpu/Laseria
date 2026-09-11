"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations";
import { FormField, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function StaffChangePasswordForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput) {
    setLoading(true);
    setSuccess(false);
    setServerError(null);

    const res = await fetch("/api/staff/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "No pudimos actualizar tu contraseña.");
      return;
    }
    setSuccess(true);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {success && <Alert tone="success">Tu contraseña se actualizó correctamente.</Alert>}
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormField label="Contraseña actual" htmlFor="scp-current" error={errors.currentPassword?.message}>
        <Input id="scp-current" type="password" {...register("currentPassword")} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nueva contraseña" htmlFor="scp-new" error={errors.newPassword?.message}>
          <Input id="scp-new" type="password" {...register("newPassword")} />
        </FormField>
        <FormField label="Confirmar nueva contraseña" htmlFor="scp-confirm" error={errors.confirmPassword?.message}>
          <Input id="scp-confirm" type="password" {...register("confirmPassword")} />
        </FormField>
      </div>

      <Button type="submit" variant="secondary" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Actualizar contraseña
      </Button>
    </form>
  );
}
