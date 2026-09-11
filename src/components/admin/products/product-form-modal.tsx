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
import { productFormSchema, type ProductFormInput } from "@/lib/validations";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import type { AdminProduct } from "@/components/admin/types";

export function ProductFormModal({ product, onClose }: { product: AdminProduct | null; onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          description: product.description,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          imageUrl: product.imageUrl || "cuerpo-completo",
          active: product.active,
        }
      : {
          name: "",
          sku: "",
          category: PRODUCT_CATEGORIES[0],
          description: "",
          price: 0,
          cost: 0,
          stock: 0,
          imageUrl: "cuerpo-completo",
          active: true,
        },
  });

  async function onSubmit(data: ProductFormInput) {
    setSubmitting(true);
    setError(null);

    const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
      method: product ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos guardar el producto.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <Modal title={product ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="p-name" error={errors.name?.message}>
            <Input id="p-name" {...register("name")} />
          </FormField>
          <FormField label="SKU" htmlFor="p-sku" error={errors.sku?.message}>
            <Input id="p-sku" {...register("sku")} />
          </FormField>
        </div>

        <div>
          <Label htmlFor="p-category">Categoría</Label>
          <select
            id="p-category"
            {...register("category")}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <FormField label="Descripción" htmlFor="p-description" optional error={errors.description?.message}>
          <Textarea id="p-description" {...register("description")} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Precio (RD$)" htmlFor="p-price" error={errors.price?.message}>
            <Input id="p-price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Costo (RD$)" htmlFor="p-cost" optional error={errors.cost?.message}>
            <Input id="p-cost" type="number" step="0.01" {...register("cost", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Inventario" htmlFor="p-stock" error={errors.stock?.message}>
            <Input id="p-stock" type="number" {...register("stock", { valueAsNumber: true })} />
          </FormField>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
            {...register("active")}
          />
          Producto activo (visible para la venta)
        </label>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {product ? "Guardar cambios" : "Crear producto"}
        </Button>
      </form>
    </Modal>
  );
}
