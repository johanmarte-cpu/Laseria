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
import { employeeFormSchema, type EmployeeFormInput } from "@/lib/validations";
import { STAFF_ROLES, STAFF_ROLE_LABELS, canManageEmployeeRole, type StaffRole } from "@/lib/roles";
import { CredentialsReveal } from "@/components/admin/employees/credentials-reveal";
import type { AdminEmployee } from "@/components/admin/types";

export function EmployeeFormModal({
  employee,
  actingRole,
  onClose,
}: {
  employee: AdminEmployee | null;
  actingRole: StaffRole;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const assignableRoles = STAFF_ROLES.filter((r) => canManageEmployeeRole(actingRole, r));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email ?? "",
          phone: employee.phone,
          cedula: employee.cedula ?? "",
          salary: employee.salary,
          role: employee.role,
          specialty: employee.specialty,
          bio: employee.bio,
          photoUrl: employee.photoUrl || "1",
          active: employee.active,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          cedula: "",
          salary: 0,
          role: assignableRoles[assignableRoles.length - 1] ?? "professional",
          specialty: "",
          bio: "",
          photoUrl: "1",
          active: true,
        },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: EmployeeFormInput) {
    setSubmitting(true);
    setError(null);

    const res = await fetch(employee ? `/api/admin/employees/${employee.id}` : "/api/admin/employees", {
      method: employee ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos guardar el empleado.");
      return;
    }

    if (!employee && body.tempPassword) {
      setCreatedCredentials({ email: data.email, password: body.tempPassword });
      router.refresh();
      return;
    }

    onClose();
    router.refresh();
  }

  if (createdCredentials) {
    return (
      <Modal title="Empleado creado" onClose={onClose}>
        <Alert tone="success" className="mb-4">
          La cuenta se creó correctamente. Comparte esta contraseña temporal — el empleado puede cambiarla luego desde
          su perfil.
        </Alert>
        <CredentialsReveal email={createdCredentials.email} password={createdCredentials.password} onDone={onClose} />
      </Modal>
    );
  }

  return (
    <Modal title={employee ? "Editar empleado" : "Nuevo empleado"} onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="e-firstName" error={errors.firstName?.message}>
            <Input id="e-firstName" {...register("firstName")} />
          </FormField>
          <FormField label="Apellido" htmlFor="e-lastName" error={errors.lastName?.message}>
            <Input id="e-lastName" {...register("lastName")} />
          </FormField>
        </div>

        <FormField label="Email (usuario de acceso)" htmlFor="e-email" error={errors.email?.message}>
          <Input id="e-email" type="email" {...register("email")} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Teléfono" htmlFor="e-phone" optional error={errors.phone?.message}>
            <Input id="e-phone" type="tel" {...register("phone")} />
          </FormField>
          <FormField label="Cédula" htmlFor="e-cedula" optional error={errors.cedula?.message}>
            <Input id="e-cedula" placeholder="000-0000000-0" {...register("cedula")} />
          </FormField>
        </div>

        <FormField label="Sueldo mensual (RD$)" htmlFor="e-salary" error={errors.salary?.message}>
          <Input id="e-salary" type="number" min={0} step="0.01" {...register("salary", { valueAsNumber: true })} />
        </FormField>

        <div>
          <Label htmlFor="e-role">Rol / privilegios</Label>
          <select
            id="e-role"
            {...register("role")}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        {selectedRole === "professional" && (
          <>
            <FormField label="Especialidad" htmlFor="e-specialty" error={errors.specialty?.message}>
              <Input id="e-specialty" {...register("specialty")} />
            </FormField>
            <FormField label="Biografía" htmlFor="e-bio" optional error={errors.bio?.message}>
              <Textarea id="e-bio" {...register("bio")} />
            </FormField>
          </>
        )}

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
            {...register("active")}
          />
          Empleado activo (su cuenta puede iniciar sesión)
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {employee ? "Guardar cambios" : "Crear empleado"}
        </Button>
      </form>
    </Modal>
  );
}
