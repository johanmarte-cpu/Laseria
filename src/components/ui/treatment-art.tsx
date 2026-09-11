import {
  Sparkles,
  Sun,
  Flower2,
  Waves,
  Leaf,
  Gem,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// The catalog ships with on-brand generative art instead of stock photography
// so the MVP has zero external image dependencies. `visualKey` matches a
// service's category (or "1"/"2"/"3" for professional avatars) and picks a
// deterministic gradient + icon pairing from the brand palette.
const VARIANTS: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  rostro: { icon: Sun, from: "#F3E5E5", to: "#E8D8CC" },
  axilas: { icon: Sparkles, from: "#F5F0EA", to: "#E8D8CC" },
  brazos: { icon: Leaf, from: "#E8D8CC", to: "#F3E5E5" },
  piernas: { icon: Waves, from: "#F5F0EA", to: "#F3E5E5" },
  bikini: { icon: Flower2, from: "#F3E5E5", to: "#F5F0EA" },
  "cuerpo-completo": { icon: Gem, from: "#E8D8CC", to: "#C9A96E" },
};

const FALLBACK_KEYS = Object.keys(VARIANTS);

export function TreatmentArt({
  visualKey,
  className,
  iconClassName,
}: {
  visualKey: string;
  className?: string;
  iconClassName?: string;
}) {
  const variant =
    VARIANTS[visualKey] ?? VARIANTS[FALLBACK_KEYS[visualKey.length % FALLBACK_KEYS.length]];
  const Icon = variant.icon;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${variant.from}, ${variant.to})` }}
      aria-hidden="true"
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
      <Icon className={cn("relative h-10 w-10 text-ink/40", iconClassName)} strokeWidth={1.25} />
    </div>
  );
}
