import Link from "next/link";
import { Clock } from "lucide-react";
import { TreatmentArt } from "@/components/ui/treatment-art";
import { formatDuration, formatPrice } from "@/lib/utils";

export function ServiceCard({
  id,
  name,
  description,
  durationMinutes,
  price,
  category,
}: {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
}) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10">
      <TreatmentArt visualKey={category} className="h-40 w-full" />
      <div className="p-6">
        <h3 className="font-display text-xl text-ink">{name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {formatDuration(durationMinutes)}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="font-display text-xl text-ink">{formatPrice(price)}</p>
          <Link
            href={`/reservar?serviceId=${id}`}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  );
}
