"use client";

import { useMemo, useState } from "react";
import { Check, Clock } from "lucide-react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { TreatmentArt } from "@/components/ui/treatment-art";
import type { WizardService } from "@/components/booking/types";

export function StepTreatment({
  services,
  selectedIds,
  onToggle,
  initialCategory,
}: {
  services: WizardService[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  initialCategory?: string;
}) {
  const availableCategories = SERVICE_CATEGORIES.filter((c) =>
    services.some((s) => s.category === c.value)
  );
  const [activeCategory, setActiveCategory] = useState(
    initialCategory && availableCategories.some((c) => c.value === initialCategory)
      ? initialCategory
      : (availableCategories[0]?.value ?? "")
  );

  const items = useMemo(
    () => services.filter((s) => s.category === activeCategory),
    [services, activeCategory]
  );

  return (
    <div>
      <h2 className="font-display text-3xl text-ink">Elige tu tratamiento</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Puedes seleccionar uno o varios tratamientos para tu cita.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {availableCategories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.value
                ? "bg-ink text-white"
                : "bg-beige text-ink-soft hover:bg-nude"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((service) => {
          const selected = selectedIds.includes(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggle(service.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                selected
                  ? "border-gold bg-blush/40 shadow-sm"
                  : "border-line bg-white hover:border-gold/50"
              )}
            >
              <TreatmentArt visualKey={service.category} className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-ink">{service.name}</h3>
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-gold bg-gold text-white" : "border-line"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{service.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <span className="font-display text-lg text-ink">{formatPrice(service.price)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
