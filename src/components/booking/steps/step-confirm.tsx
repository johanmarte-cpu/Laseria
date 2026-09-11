"use client";

import { Loader2, Sparkles } from "lucide-react";
import { formatDate, formatDuration, formatPrice, to12h } from "@/lib/utils";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import type { CustomerInfoInput } from "@/lib/validations";
import type { WizardProfessional, WizardService } from "@/components/booking/types";

export function StepConfirm({
  services,
  professional,
  date,
  time,
  customer,
  submitting,
  error,
  onConfirm,
}: {
  services: WizardService[];
  professional: WizardProfessional | null;
  date: string;
  time: string;
  customer: CustomerInfoInput;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
}) {
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Confirma tu cita</h2>
      <p className="mt-2 text-sm text-ink-muted">Revisa los detalles antes de confirmar.</p>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <div className="mt-6 space-y-6 rounded-2xl border border-line bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Tratamiento{services.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-2 space-y-1">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm text-ink">
                <span>{s.name}</span>
                <span className="text-ink-muted">{formatPrice(s.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 border-t border-line pt-5">
          {professional ? (
            <>
              <ProfessionalAvatar
                firstName={professional.firstName}
                lastName={professional.lastName}
                photoUrl={professional.photoUrl}
                className="h-10 w-10"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Profesional
                </p>
                <p className="text-sm text-ink">
                  {professional.firstName} {professional.lastName}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Profesional
                </p>
                <p className="text-sm text-ink">Primera disponible</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Fecha</p>
            <p className="mt-1 capitalize text-ink">{formatDate(date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Hora</p>
            <p className="mt-1 text-ink">{to12h(time)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Duración</p>
            <p className="mt-1 text-ink">{formatDuration(totalDuration)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Precio total</p>
            <p className="mt-1 font-display text-lg text-ink">{formatPrice(totalPrice)}</p>
          </div>
        </div>

        <div className="border-t border-line pt-5 text-sm text-ink-muted">
          <p>
            {customer.firstName} {customer.lastName} · {customer.email} · {customer.phone}
          </p>
        </div>
      </div>

      <Button size="lg" className="mt-8 w-full" onClick={onConfirm} disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmar cita
      </Button>
    </div>
  );
}
