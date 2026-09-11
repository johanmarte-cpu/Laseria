"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentArt } from "@/components/ui/treatment-art";
import { formatDuration, formatPrice, cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import { ServiceFormModal } from "@/components/admin/services/service-form-modal";
import type { AdminService } from "@/components/admin/types";

export function ServicesTable({ services }: { services: AdminService[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este tratamiento? Si tiene citas asociadas se desactivará en su lugar.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  async function toggleActive(service: AdminService) {
    await fetch(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !service.active }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Servicios</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo tratamiento
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl border border-line bg-white">
            <TreatmentArt visualKey={s.category} className="h-32 w-full" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg text-ink">{s.name}</h3>
                  <p className="text-xs text-ink-muted">{categoryLabel(s.category)}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                    s.active ? "bg-status-confirmed/10 text-status-confirmed" : "bg-ink/5 text-ink-muted"
                  )}
                >
                  {s.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-muted">{formatDuration(s.durationMinutes)}</span>
                <span className="font-display text-lg text-ink">{formatPrice(s.price)}</span>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                <Button variant="secondary" size="sm" onClick={() => setEditing(s)}>
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Editar
                </Button>
                <button
                  type="button"
                  onClick={() => toggleActive(s)}
                  className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-beige"
                >
                  {s.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-status-cancelled transition-colors hover:bg-status-cancelled/10"
                  aria-label="Eliminar tratamiento"
                >
                  {deletingId === s.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && <ServiceFormModal service={null} onClose={() => setCreating(false)} />}
      {editing && <ServiceFormModal service={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
