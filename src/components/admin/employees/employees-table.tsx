"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Clock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import { cn, formatMoney } from "@/lib/utils";
import { STAFF_ROLES, STAFF_ROLE_LABELS, canManageEmployeeRole, type StaffRole } from "@/lib/roles";
import { EmployeeFormModal } from "@/components/admin/employees/employee-form-modal";
import { ScheduleModal } from "@/components/admin/employees/schedule-modal";
import { ResetPasswordModal } from "@/components/admin/employees/reset-password-modal";
import type { AdminEmployee } from "@/components/admin/types";

export function EmployeesTable({ employees, actingRole }: { employees: AdminEmployee[]; actingRole: StaffRole }) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [editing, setEditing] = useState<AdminEmployee | null>(null);
  const [scheduling, setScheduling] = useState<AdminEmployee | null>(null);
  const [resettingPassword, setResettingPassword] = useState<AdminEmployee | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(
    () => (roleFilter === "all" ? employees : employees.filter((e) => e.role === roleFilter)),
    [employees, roleFilter]
  );

  async function toggleActive(e: AdminEmployee) {
    await fetch(`/api/admin/employees/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !e.active }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Empleados</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo empleado
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRoleFilter("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold",
            roleFilter === "all" ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
          )}
        >
          Todos
        </button>
        {STAFF_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold",
              roleFilter === r ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-beige"
            )}
          >
            {STAFF_ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => {
          const canManage = canManageEmployeeRole(actingRole, e.role);
          return (
            <div key={e.id} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-start justify-between">
                <ProfessionalAvatar firstName={e.firstName} lastName={e.lastName} photoUrl={e.photoUrl} className="h-14 w-14" />
                <div className="flex flex-col items-end gap-1.5">
                  <span className="rounded-full bg-blush/60 px-2.5 py-1 text-[10px] font-semibold uppercase text-gold-dark">
                    {STAFF_ROLE_LABELS[e.role]}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                      e.active ? "bg-status-confirmed/10 text-status-confirmed" : "bg-ink/5 text-ink-muted"
                    )}
                  >
                    {e.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <h3 className="mt-4 font-display text-lg text-ink">
                {e.firstName} {e.lastName}
              </h3>
              <p className="text-xs text-ink-muted">{e.email}</p>
              {e.cedula && <p className="mt-1 text-xs text-ink-muted">Cédula: {e.cedula}</p>}
              <p className="mt-1 text-xs text-ink-muted">Sueldo: {formatMoney(e.salary)}/mes</p>
              {e.role === "professional" && (
                <>
                  <p className="mt-1 text-xs text-ink-muted">{e.specialty}</p>
                  <p className="mt-1 text-xs text-ink-muted">{e.schedules.length} días laborales configurados</p>
                </>
              )}

              {canManage && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(e)}>
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Editar
                  </Button>
                  {e.role === "professional" && (
                    <Button variant="secondary" size="sm" onClick={() => setScheduling(e)}>
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Horario
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setResettingPassword(e)}>
                    <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Restablecer contraseña
                  </Button>
                  <button
                    type="button"
                    onClick={() => toggleActive(e)}
                    className="ml-auto rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-beige"
                  >
                    {e.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {creating && <EmployeeFormModal employee={null} actingRole={actingRole} onClose={() => setCreating(false)} />}
      {editing && <EmployeeFormModal employee={editing} actingRole={actingRole} onClose={() => setEditing(null)} />}
      {scheduling && <ScheduleModal employee={scheduling} onClose={() => setScheduling(null)} />}
      {resettingPassword && (
        <ResetPasswordModal employee={resettingPassword} onClose={() => setResettingPassword(null)} />
      )}
    </div>
  );
}
