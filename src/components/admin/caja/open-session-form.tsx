"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input, Textarea } from "@/components/ui/form";

export function OpenSessionForm() {
  const router = useRouter();
  const [openingAmount, setOpeningAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/caja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openingAmount, notes }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos abrir la caja.");
      return;
    }

    router.push(`/admin/caja/${body.sessionId}`);
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-2xl border border-line bg-white p-6">
        <FormField label="Fondo inicial (RD$)" htmlFor="opening-amount">
          <Input
            id="opening-amount"
            type="number"
            min={0}
            step="0.01"
            value={openingAmount}
            onChange={(e) => setOpeningAmount(Number(e.target.value) || 0)}
          />
        </FormField>

        <div className="mt-4">
          <FormField label="Notas" htmlFor="opening-notes" optional>
            <Textarea id="opening-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={submitting} onClick={handleSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Abrir caja
      </Button>
    </div>
  );
}
