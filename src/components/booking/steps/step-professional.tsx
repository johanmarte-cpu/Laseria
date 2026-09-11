"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIRST_AVAILABLE_ID } from "@/lib/constants";
import { ProfessionalAvatar } from "@/components/ui/professional-avatar";
import type { WizardProfessional } from "@/components/booking/types";

export function StepProfessional({
  professionals,
  selectedId,
  onSelect,
}: {
  professionals: WizardProfessional[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Elige tu profesional</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Selecciona a tu especialista de confianza o deja que te asignemos una.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect(FIRST_AVAILABLE_ID)}
          aria-pressed={selectedId === FIRST_AVAILABLE_ID}
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
            selectedId === FIRST_AVAILABLE_ID
              ? "border-gold bg-blush/40 shadow-sm"
              : "border-line bg-white hover:border-gold/50"
          )}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <Sparkles className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg text-ink">Primera profesional disponible</h3>
            <p className="mt-0.5 text-xs text-ink-muted">Te asignamos el horario más próximo.</p>
          </div>
          {selectedId === FIRST_AVAILABLE_ID && (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </div>
          )}
        </button>

        {professionals.map((pro) => {
          const selected = selectedId === pro.id;
          return (
            <button
              key={pro.id}
              type="button"
              onClick={() => onSelect(pro.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                selected ? "border-gold bg-blush/40 shadow-sm" : "border-line bg-white hover:border-gold/50"
              )}
            >
              <ProfessionalAvatar
                firstName={pro.firstName}
                lastName={pro.lastName}
                photoUrl={pro.photoUrl}
                className="h-14 w-14 shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-display text-lg text-ink">
                  {pro.firstName} {pro.lastName}
                </h3>
                <p className="mt-0.5 text-xs text-ink-muted">{pro.specialty}</p>
              </div>
              {selected && (
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
