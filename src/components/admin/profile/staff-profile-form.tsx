"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FormField, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type FormValues = { firstName: string; lastName: string; phone: string };

export function StaffProfileForm({ email, defaultValues }: { email: string; defaultValues: FormValues }) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  async function onSubmit(data: FormValues) {
    setLoading(true);
    setSuccess(false);
    setServerError(null);

    const res = await fetch("/api/staff/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      setServerError("No pudimos guardar tus cambios.");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {success && <Alert tone="success">Tus datos se actualizaron correctamente.</Alert>}
      {serverError && <Alert tone="error">{serverError}</Alert>}

      <FormField label="Email" htmlFor="sp-email">
        <Input id="sp-email" value={email} disabled />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre" htmlFor="sp-firstName" error={errors.firstName?.message}>
          <Input id="sp-firstName" {...register("firstName", { required: true, minLength: 2 })} />
        </FormField>
        <FormField label="Apellido" htmlFor="sp-lastName" error={errors.lastName?.message}>
          <Input id="sp-lastName" {...register("lastName", { required: true, minLength: 2 })} />
        </FormField>
      </div>

      <FormField label="Teléfono" htmlFor="sp-phone" error={errors.phone?.message}>
        <Input id="sp-phone" type="tel" {...register("phone")} />
      </FormField>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
