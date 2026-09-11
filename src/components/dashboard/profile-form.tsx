"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import { FormField, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ProfileForm({
  email,
  defaultValues,
}: {
  email: string;
  defaultValues: ProfileUpdateInput;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({ resolver: zodResolver(profileUpdateSchema), defaultValues });

  async function onSubmit(data: ProfileUpdateInput) {
    setLoading(true);
    setSuccess(false);
    setServerError(null);

    const res = await fetch("/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      setServerError("No pudimos guardar tus cambios. Intenta de nuevo.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {success && <Alert tone="success">Tus datos se actualizaron correctamente.</Alert>}
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormField label="Email" htmlFor="p-email">
        <Input id="p-email" value={email} disabled />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="p-firstName" error={errors.firstName?.message}>
          <Input id="p-firstName" {...register("firstName")} />
        </FormField>
        <FormField label="Apellido" htmlFor="p-lastName" error={errors.lastName?.message}>
          <Input id="p-lastName" {...register("lastName")} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Teléfono" htmlFor="p-phone" error={errors.phone?.message}>
          <Input id="p-phone" type="tel" placeholder="809-555-4477" {...register("phone")} />
        </FormField>
        <FormField label="Fecha de nacimiento" htmlFor="p-birthDate" optional error={errors.birthDate?.message}>
          <Input id="p-birthDate" type="date" {...register("birthDate")} />
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

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
