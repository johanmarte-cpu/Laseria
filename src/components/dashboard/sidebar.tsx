"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, CalendarDays, CalendarPlus, History, UserRound, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumen", icon: LayoutGrid },
  { href: "/dashboard/citas", label: "Mis citas", icon: CalendarDays },
  { href: "/reservar", label: "Reservar cita", icon: CalendarPlus },
  { href: "/dashboard/citas?tab=past", label: "Historial", icon: History },
  { href: "/dashboard/perfil", label: "Perfil", icon: UserRound },
];

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  return (
    <nav className="flex h-full flex-col justify-between">
      <div className="space-y-1">
        {LINKS.map((link) => {
          const [linkPath, linkQuery] = link.href.split("?");
          const linkTab = new URLSearchParams(linkQuery).get("tab");
          const isActive =
            link.href === "/reservar"
              ? false
              : pathname === linkPath && (linkTab ?? null) === currentTab;
          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-ink text-white" : "text-ink-soft hover:bg-beige"
              )}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-muted transition-colors hover:bg-beige hover:text-status-cancelled"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Cerrar sesión
      </button>
    </nav>
  );
}

export function MobileDashboardNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
        aria-label="Abrir menú"
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-white p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-ink">Menú</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-beige"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-6">
            <DashboardSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
