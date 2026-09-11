import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        className
      )}
      style={{
        color: `var(--color-${meta.color})`,
        backgroundColor: `color-mix(in srgb, var(--color-${meta.color}) 12%, white)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `var(--color-${meta.color})` }}
      />
      {meta.label}
    </span>
  );
}
