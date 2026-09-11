"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { customerInfoSchema, type CustomerInfoInput } from "@/lib/validations";
import { FormField, Input, Textarea } from "@/components/ui/form";

export function StepCustomer({
  defaultValues,
  isLoggedIn,
  onValidChange,
}: {
  defaultValues: CustomerInfoInput;
  isLoggedIn: boolean;
  onValidChange: (valid: boolean, data: CustomerInfoInput) => void;
}) {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm<CustomerInfoInput>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues,
    mode: "onChange",
  });

  const values = watch();

  useEffect(() => {
    onValidChange(isValid, values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, JSON.stringify(values)]);

  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Tus datos</h2>
      <p className="mt-2 text-sm text-ink-muted">
        {isLoggedIn
          ? "Confirma tus datos de contacto para esta cita."
          : "Crearemos tu cuenta automáticamente para que puedas gestionar tu cita."}
      </p>

      <form className="mt-6 space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="c-firstName" error={errors.firstName?.message}>
            <Input id="c-firstName" disabled={isLoggedIn} {...register("firstName")} />
          </FormField>
          <FormField label="Apellido" htmlFor="c-lastName" error={errors.lastName?.message}>
            <Input id="c-lastName" disabled={isLoggedIn} {...register("lastName")} />
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Email" htmlFor="c-email" error={errors.email?.message}>
            <Input id="c-email" type="email" disabled={isLoggedIn} {...register("email")} />
          </FormField>
          <FormField label="Teléfono" htmlFor="c-phone" error={errors.phone?.message}>
            <Input id="c-phone" type="tel" disabled={isLoggedIn} {...register("phone")} />
          </FormField>
        </div>

        <FormField label="Fecha de nacimiento" htmlFor="c-birthDate" error={errors.birthDate?.message} optional>
          <Input id="c-birthDate" type="date" {...register("birthDate")} />
        </FormField>

        <FormField label="Comentarios o notas" htmlFor="c-notes" error={errors.notes?.message} optional>
          <Textarea id="c-notes" placeholder="¿Algo que debamos saber antes de tu cita?" {...register("notes")} />
        </FormField>

        <label className="flex items-start gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
            {...register("wantsReminders")}
          />
          Quiero recibir recordatorios y promociones de Lasería.
        </label>
      </form>
    </div>
  );
}
