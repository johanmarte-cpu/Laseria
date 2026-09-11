"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink print:hidden"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
      Volver
    </button>
  );
}
