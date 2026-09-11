import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const toneStyles: Record<Tone, { bg: string; text: string; icon: typeof AlertCircle }> = {
  error: { bg: "bg-status-cancelled/10", text: "text-status-cancelled", icon: AlertCircle },
  success: { bg: "bg-status-confirmed/10", text: "text-status-confirmed", icon: CheckCircle2 },
  info: { bg: "bg-beige", text: "text-ink-soft", icon: Info },
};

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const s = toneStyles[tone];
  const Icon = s.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm", s.bg, s.text, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{children}</span>
    </div>
  );
}
