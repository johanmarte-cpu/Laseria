"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input } from "@/components/ui/form";

type Sequence = { ncfType: string; label: string; nextNumber: number; endNumber: number };

export function NcfSequencesForm({ sequences }: { sequences: Sequence[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(sequences);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateRow(ncfType: string, patch: Partial<Sequence>) {
    setRows((prev) => prev.map((r) => (r.ncfType === ncfType ? { ...r, ...patch } : r)));
  }

  async function save(row: Sequence) {
    setSavingType(row.ncfType);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/ncf-sequences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ncfType: row.ncfType, nextNumber: row.nextNumber, endNumber: row.endNumber }),
    });

    setSavingType(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "No pudimos guardar la secuencia.");
      return;
    }
    setSuccess(`Secuencia ${row.ncfType} actualizada.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {rows.map((row) => {
        const remaining = row.endNumber - row.nextNumber + 1;
        return (
          <div key={row.ncfType} className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl text-ink">
                  {row.ncfType} — {row.label}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {remaining > 0 ? `${remaining} comprobantes disponibles` : "Secuencia agotada"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Próximo número" htmlFor={`next-${row.ncfType}`}>
                <Input
                  id={`next-${row.ncfType}`}
                  type="number"
                  min={1}
                  value={row.nextNumber}
                  onChange={(e) => updateRow(row.ncfType, { nextNumber: Number(e.target.value) || 1 })}
                />
              </FormField>
              <FormField label="Número final autorizado" htmlFor={`end-${row.ncfType}`}>
                <Input
                  id={`end-${row.ncfType}`}
                  type="number"
                  min={1}
                  value={row.endNumber}
                  onChange={(e) => updateRow(row.ncfType, { endNumber: Number(e.target.value) || 1 })}
                />
              </FormField>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => save(row)}
              disabled={savingType === row.ncfType}
            >
              {savingType === row.ncfType && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar secuencia
            </Button>
          </div>
        );
      })}
    </div>
  );
}
