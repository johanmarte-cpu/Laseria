import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "@/components/booking/types";

export function BookingProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <div>
      <div className="hidden items-center sm:flex">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < currentIndex && "bg-ink text-white",
                  i === currentIndex && "bg-gold text-white",
                  i > currentIndex && "bg-beige text-ink-muted"
                )}
              >
                {i < currentIndex ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : i + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-medium",
                  i === currentIndex ? "text-ink" : "text-ink-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-px flex-1", i < currentIndex ? "bg-ink" : "bg-line")} />
            )}
          </div>
        ))}
      </div>

      <div className="sm:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
          Paso {currentIndex + 1} de {STEPS.length}
        </p>
        <p className="mt-1 font-display text-xl text-ink">{STEPS[currentIndex].label}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-beige">
          <div
            className="h-full rounded-full bg-gold transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
