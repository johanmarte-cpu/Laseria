"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input, Label, Textarea } from "@/components/ui/form";
import { NCF_TYPES } from "@/lib/ncf";
import { PAYMENT_METHODS } from "@/lib/constants";
import { cn, formatMoney } from "@/lib/utils";
import type { AdminCustomer } from "@/components/admin/types";

type CatalogService = { id: string; name: string; price: number };
type CatalogProduct = { id: string; name: string; price: number; stock: number };

type CartLine = {
  key: string;
  itemType: "product" | "service";
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxStock?: number;
};

export function Pos({
  products,
  services,
  customers,
  initialAppointment,
}: {
  products: CatalogProduct[];
  services: CatalogService[];
  customers: AdminCustomer[];
  initialAppointment: {
    id: string;
    customerId: string;
    customerName: string;
    services: { id: string; name: string; price: number }[];
  } | null;
}) {
  const router = useRouter();

  const [customerMode, setCustomerMode] = useState<"existing" | "walkin">(
    initialAppointment ? "existing" : "existing"
  );
  const [customerQuery, setCustomerQuery] = useState(initialAppointment?.customerName ?? "");
  const [customerId, setCustomerId] = useState<string | null>(initialAppointment?.customerId ?? null);
  const [walkinName, setWalkinName] = useState("");

  const [cart, setCart] = useState<CartLine[]>(
    initialAppointment
      ? initialAppointment.services.map((s) => ({
          key: `service-${s.id}`,
          itemType: "service",
          id: s.id,
          name: s.name,
          unitPrice: s.price,
          quantity: 1,
        }))
      : []
  );
  const [catalogQuery, setCatalogQuery] = useState("");
  const [ncfType, setNcfType] = useState<"B01" | "B02">("B02");
  const [customerRnc, setCustomerRnc] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!customerQuery.trim()) return customers.slice(0, 6);
    const q = customerQuery.toLowerCase();
    return customers
      .filter((c) => `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [customers, customerQuery]);

  const catalogItems = useMemo(() => {
    const q = catalogQuery.toLowerCase();
    const productItems = products
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .map((p) => ({ itemType: "product" as const, id: p.id, name: p.name, price: p.price, stock: p.stock }));
    const serviceItems = services
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .map((s) => ({ itemType: "service" as const, id: s.id, name: s.name, price: s.price, stock: undefined }));
    return [...productItems, ...serviceItems];
  }, [products, services, catalogQuery]);

  function addToCart(item: { itemType: "product" | "service"; id: string; name: string; price: number; stock?: number }) {
    const key = `${item.itemType}-${item.id}`;
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        { key, itemType: item.itemType, id: item.id, name: item.name, unitPrice: item.price, quantity: 1, maxStock: item.stock },
      ];
    });
  }

  function updateQuantity(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discountAmount = Math.min(discount, subtotal);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  const total = taxableAmount + taxAmount;

  const ncfMeta = NCF_TYPES.find((t) => t.value === ncfType)!;
  const canSubmit =
    cart.length > 0 &&
    (customerMode === "existing" ? Boolean(customerId) : walkinName.trim().length > 1) &&
    (!ncfMeta.requiresRnc || customerRnc.trim().length > 0);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerMode === "existing" ? customerId ?? undefined : undefined,
        customerName: customerMode === "walkin" ? walkinName : undefined,
        customerRnc: customerRnc || undefined,
        appointmentId: initialAppointment?.id,
        ncfType,
        paymentMethod,
        discount: discountAmount,
        notes,
        items: cart.map((l) => ({
          itemType: l.itemType,
          productId: l.itemType === "product" ? l.id : undefined,
          serviceId: l.itemType === "service" ? l.id : undefined,
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos procesar la venta.");
      return;
    }

    router.push(`/admin/ventas/${body.saleId}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-white p-6">
          <Label>Cliente</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCustomerMode("existing")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold",
                customerMode === "existing" ? "bg-ink text-white" : "bg-beige text-ink-soft"
              )}
            >
              Cliente existente
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode("walkin")}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold",
                customerMode === "walkin" ? "bg-ink text-white" : "bg-beige text-ink-soft"
              )}
            >
              Cliente al mostrador
            </button>
          </div>

          {customerMode === "existing" ? (
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
                <Input
                  className="pl-9"
                  placeholder="Buscar por nombre, email o teléfono"
                  value={customerQuery}
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    setCustomerId(null);
                  }}
                />
              </div>
              {!customerId && (
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCustomerId(c.id);
                        setCustomerQuery(`${c.firstName} ${c.lastName}`);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-beige"
                    >
                      {c.firstName} {c.lastName} · {c.email}
                    </button>
                  ))}
                </div>
              )}
              {customerId && <p className="mt-2 text-xs text-status-confirmed">Cliente seleccionada ✓</p>}
            </div>
          ) : (
            <div className="mt-3">
              <Input
                placeholder="Nombre del cliente"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <Label>Agregar productos o servicios</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" strokeWidth={1.75} />
            <Input
              className="pl-9"
              placeholder="Buscar en el catálogo"
              value={catalogQuery}
              onChange={(e) => setCatalogQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 grid max-h-64 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {catalogItems.map((item) => (
              <button
                key={`${item.itemType}-${item.id}`}
                type="button"
                onClick={() => addToCart(item)}
                disabled={item.itemType === "product" && item.stock === 0}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-beige disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>
                  {item.name}
                  {item.itemType === "product" && (
                    <span className="ml-1.5 text-[10px] uppercase text-ink-muted">
                      {item.stock === 0 ? "agotado" : `stock: ${item.stock}`}
                    </span>
                  )}
                </span>
                <span className="text-xs text-ink-muted">{formatMoney(item.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-white p-6">
          <Label>Carrito</Label>
          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">Agrega productos o servicios.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((line) => (
                <div key={line.key} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{line.name}</p>
                    <p className="text-xs text-ink-muted">{formatMoney(line.unitPrice)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.key, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-beige"
                    >
                      <Minus className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <span className="w-5 text-center text-xs">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.key, 1)}
                      disabled={line.maxStock !== undefined && line.quantity >= line.maxStock}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-beige disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      className="ml-1 text-ink-muted hover:text-status-cancelled"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <Label htmlFor="ncf-type">Tipo de comprobante (NCF)</Label>
          <select
            id="ncf-type"
            value={ncfType}
            onChange={(e) => setNcfType(e.target.value as "B01" | "B02")}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {NCF_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.value} — {t.label}
              </option>
            ))}
          </select>

          {ncfMeta.requiresRnc && (
            <div className="mt-3">
              <Label htmlFor="rnc">RNC / Cédula del cliente</Label>
              <Input id="rnc" value={customerRnc} onChange={(e) => setCustomerRnc(e.target.value)} />
            </div>
          )}

          <div className="mt-3">
            <Label htmlFor="payment-method">Método de pago</Label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <Label htmlFor="discount">Descuento (RD$)</Label>
            <Input
              id="discount"
              type="number"
              min={0}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>

          <div className="mt-3">
            <Label htmlFor="sale-notes">Notas</Label>
            <Textarea id="sale-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="mt-1 flex justify-between text-ink-soft">
              <span>Descuento</span>
              <span>-{formatMoney(discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-ink-soft">
            <span>ITBIS (18%)</span>
            <span>{formatMoney(taxAmount)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-xl text-ink">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button size="lg" className="w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Cobrar
        </Button>
      </div>
    </div>
  );
}

