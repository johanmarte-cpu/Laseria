"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input, Textarea } from "@/components/ui/form";
import { formatMoney } from "@/lib/utils";

export function CloseSessionForm({ sessionId, expectedCash }: { sessionId: string; expectedCash: number }) {
  const router = useRouter();
  const [countedCash, setCountedCash] = useState(expectedCash);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difference = Math.round((countedCash - expectedCash) * 100) / 100;

  async function handleSubmit() {
    if (!confirm("¿Cerrar esta caja? No podrás registrar más ventas en este turno.")) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/caja/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", countedCash, notes }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos cerrar la caja.");
      return;
    }

    if (body.emailSent === false) {
      alert(
        `Caja cerrada, pero el correo del reporte no pudo enviarse: ${body.emailError ?? "error desconocido"}. Revisa la configuración de RESEND_API_KEY.`
      );
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-2xl border border-line bg-white p-6">
        <FormField label="Efectivo esperado" htmlFor="expected-cash">
          <div
            id="expected-cash"
            className="w-full rounded-xl border border-line bg-beige px-4 py-3 text-sm text-ink-soft"
          >
            {formatMoney(expectedCash)}
          </div>
        </FormField>

        <div className="mt-4">
          <FormField label="Efectivo contado (RD$)" htmlFor="counted-cash">
            <Input
              id="counted-cash"
              type="number"
              min={0}
              step="0.01"
              value={countedCash}
              onChange={(e) => setCountedCash(Number(e.target.value) || 0)}
            />
          </FormField>
        </div>

        <p
          className={
            difference === 0
              ? "mt-3 text-sm text-status-confirmed"
              : difference > 0
                ? "mt-3 text-sm text-gold-dark"
                : "mt-3 text-sm text-status-cancelled"
          }
        >
          {difference === 0
            ? "Cuadre exacto."
            : difference > 0
              ? `Sobrante de ${formatMoney(difference)}.`
              : `Faltante de ${formatMoney(Math.abs(difference))}.`}
        </p>

        <div className="mt-4">
          <FormField label="Notas del cierre" htmlFor="closing-notes" optional>
            <Textarea id="closing-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={submitting} onClick={handleSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Cerrar caja y enviar reporte
      </Button>
    </div>
  );
}
