"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreatmentArt } from "@/components/ui/treatment-art";
import { formatPrice, cn } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { ProductFormModal } from "@/components/admin/products/product-form-modal";
import type { AdminProduct } from "@/components/admin/types";

export function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto? Si tiene ventas asociadas se desactivará en su lugar.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    router.refresh();
  }

  async function toggleActive(product: AdminProduct) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl text-ink">Productos</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo producto
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const lowStock = p.stock <= LOW_STOCK_THRESHOLD;
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-white">
              <TreatmentArt visualKey={p.imageUrl || p.category} className="h-32 w-full" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg text-ink">{p.name}</h3>
                    <p className="text-xs text-ink-muted">
                      {p.category} · SKU {p.sku}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase",
                      p.active ? "bg-status-confirmed/10 text-status-confirmed" : "bg-ink/5 text-ink-muted"
                    )}
                  >
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      lowStock ? "font-semibold text-status-cancelled" : "text-ink-muted"
                    )}
                  >
                    {lowStock && <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />}
                    {p.stock} en inventario
                  </span>
                  <span className="font-display text-lg text-ink">{formatPrice(p.price)}</span>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(p)}>
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Editar
                  </Button>
                  <button
                    type="button"
                    onClick={() => toggleActive(p)}
                    className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-beige"
                  >
                    {p.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-status-cancelled transition-colors hover:bg-status-cancelled/10"
                    aria-label="Eliminar producto"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {creating && <ProductFormModal product={null} onClose={() => setCreating(false)} />}
      {editing && <ProductFormModal product={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
