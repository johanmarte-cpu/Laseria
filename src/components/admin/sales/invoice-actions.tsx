"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function InvoiceActions({ saleId, status }: { saleId: string; status: string }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("¿Cancelar esta venta? El inventario de los productos se restaurará.")) return;
    setCancelling(true);
    setError(null);

    const res = await fetch(`/api/admin/sales/${saleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });

    setCancelling(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos cancelar la venta.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 print:hidden">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" strokeWidth={1.75} />
          Imprimir
        </Button>
        {status === "paid" && (
          <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            Cancelar venta
          </Button>
        )}
      </div>
    </div>
  );
}
