"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input, Textarea, Label } from "@/components/ui/form";
import { serviceFormSchema, type ServiceFormInput } from "@/lib/validations";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import type { AdminService } from "@/components/admin/types";

export function ServiceFormModal({
  service,
  onClose,
}: {
  service: AdminService | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service
      ? {
          name: service.name,
          category: service.category,
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: service.price,
          imageUrl: service.imageUrl,
          active: service.active,
        }
      : {
          name: "",
          category: SERVICE_CATEGORIES[0].value,
          description: "",
          durationMinutes: 30,
          price: 0,
          imageUrl: SERVICE_CATEGORIES[0].value,
          active: true,
        },
  });

  async function onSubmit(data: ServiceFormInput) {
    setSubmitting(true);
    setError(null);
    const payload = { ...data, imageUrl: data.category };

    const res = await fetch(service ? `/api/admin/services/${service.id}` : "/api/admin/services", {
      method: service ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos guardar el tratamiento.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <Modal title={service ? "Editar tratamiento" : "Nuevo tratamiento"} onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField label="Nombre" htmlFor="s-name" error={errors.name?.message}>
          <Input id="s-name" {...register("name")} />
        </FormField>

        <div>
          <Label htmlFor="s-category">Categoría</Label>
          <select
            id="s-category"
            {...register("category")}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <FormField label="Descripción" htmlFor="s-description" error={errors.description?.message}>
          <Textarea id="s-description" {...register("description")} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Duración (minutos)" htmlFor="s-duration" error={errors.durationMinutes?.message}>
            <Input id="s-duration" type="number" {...register("durationMinutes", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Precio (RD$)" htmlFor="s-price" error={errors.price?.message}>
            <Input id="s-price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          </FormField>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
            {...register("active")}
          />
          Tratamiento activo (visible para reservar)
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {service ? "Guardar cambios" : "Crear tratamiento"}
        </Button>
      </form>
    </Modal>
  );
}
