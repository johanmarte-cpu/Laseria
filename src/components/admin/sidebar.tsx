"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  CalendarRange,
  CalendarClock,
  Users,
  Sparkles,
  UserCog,
  Package,
  Receipt,
  Wallet,
  Banknote,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccess, type StaffRole, type Section } from "@/lib/roles";

const LINKS: { href: string; label: string; icon: typeof LayoutGrid; section: Section }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, section: "dashboard" },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarRange, section: "calendar" },
  { href: "/admin/citas", label: "Citas", icon: CalendarClock, section: "appointments" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, section: "customers" },
  { href: "/admin/ventas", label: "Ventas", icon: Receipt, section: "sales" },
  { href: "/admin/caja", label: "Caja", icon: Banknote, section: "caja" },
  { href: "/admin/productos", label: "Productos", icon: Package, section: "products" },
  { href: "/admin/servicios", label: "Servicios", icon: Sparkles, section: "services" },
  { href: "/admin/empleados", label: "Empleados", icon: UserCog, section: "employees" },
  { href: "/admin/pagos", label: "Pagos", icon: Wallet, section: "payroll" },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3, section: "reports" },
];

export function AdminSidebar({ role, onNavigate }: { role: StaffRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = LINKS.filter((l) => canAccess(role, l.section)).map((l) =>
    l.section === "calendar" && role === "professional" ? { ...l, label: "Mi agenda" } : l
  );

  return (
    <nav className="flex h-full flex-col justify-between">
      <div className="space-y-1">
        {links.map((link) => {
          const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/admin/perfil"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            pathname === "/admin/perfil" ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <UserCircle className="h-4 w-4" strokeWidth={1.75} />
          Mi perfil
        </Link>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        Cerrar sesión
      </button>
    </nav>
  );
}

export function MobileAdminNav({ role }: { role: StaffRole }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-4 w-4" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink p-6 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-white">Menú</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-6">
            <AdminSidebar role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
