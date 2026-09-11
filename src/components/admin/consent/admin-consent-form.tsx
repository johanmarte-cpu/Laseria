"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

type Consent = {
  fullName: string;
  cedula: string;
  acceptedPhotos: boolean;
  signedAt: string;
  filledBy: { firstName: string; lastName: string } | null;
} | null;

export function AdminConsentForm({
  customerId,
  defaultName,
  consent,
}: {
  customerId: string;
  defaultName: string;
  consent: Consent;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(!consent);
  const [fullName, setFullName] = useState(consent?.fullName || defaultName);
  const [cedula, setCedula] = useState(consent?.cedula || "");
  const [acceptedTreatment, setAcceptedTreatment] = useState(false);
  const [acceptedPhotos, setAcceptedPhotos] = useState(consent?.acceptedPhotos ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/customers/${customerId}/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, cedula, acceptedTreatment, acceptedPhotos }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos registrar el consentimiento.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (consent && !editing) {
    return (
      <div className="print:block">
        <Alert tone="success" className="print:hidden">
          Consentimiento firmado el {formatDate(consent.signedAt)} por {consent.fullName}.
        </Alert>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Nombre completo</dt>
            <dd className="mt-1 text-ink">{consent.fullName}</dd>
          </div>
          {consent.cedula && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Cédula</dt>
              <dd className="mt-1 text-ink">{consent.cedula}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Fecha de firma</dt>
            <dd className="mt-1 text-ink">{formatDate(consent.signedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Uso de fotos</dt>
            <dd className="mt-1 text-ink">{consent.acceptedPhotos ? "Autorizado" : "No autorizado"}</dd>
          </div>
          {consent.filledBy && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Registrado por</dt>
              <dd className="mt-1 text-ink">
                {consent.filledBy.firstName} {consent.filledBy.lastName} (personal de Lasería)
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            Imprimir
          </Button>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Actualizar firma
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}

      <Alert tone="info">
        Estás completando este consentimiento en nombre del cliente. Léelo junto a él/ella antes de firmar y
        confirma que está de acuerdo con el contenido.
      </Alert>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nombre completo (firma)" htmlFor="admin-consent-name">
          <Input id="admin-consent-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormField>
        <FormField label="Cédula" htmlFor="admin-consent-cedula" optional>
          <Input
            id="admin-consent-cedula"
            placeholder="000-0000000-0"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />
        </FormField>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
          checked={acceptedTreatment}
          onChange={(e) => setAcceptedTreatment(e.target.checked)}
        />
        El cliente ha leído y comprendido el consentimiento informado descrito arriba, y autoriza a que se le
        realice el tratamiento de depilación láser.
      </label>

      <label className="flex items-start gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line text-gold focus:ring-gold/30"
          checked={acceptedPhotos}
          onChange={(e) => setAcceptedPhotos(e.target.checked)}
        />
        (Opcional) El cliente autoriza el uso de fotografías de antes/después de su tratamiento con fines de
        marketing de Lasería.
      </label>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmit} disabled={submitting || !acceptedTreatment}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar consentimiento
        </Button>
        {consent && (
          <Button variant="secondary" onClick={() => setEditing(false)} disabled={submitting}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
