import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStaffRole, canAccess, staffHomeRoute, type Section } from "@/lib/roles";

// Longest-prefix match from pathname to the permission section it belongs to.
const SECTION_ROUTES: [string, Section][] = [
  ["/admin/calendario", "calendar"],
  ["/admin/citas", "appointments"],
  ["/admin/clientes", "customers"],
  ["/admin/servicios", "services"],
  ["/admin/empleados", "employees"],
  ["/admin/productos", "products"],
  ["/admin/ventas", "sales"],
  ["/admin/caja", "caja"],
  ["/admin/reportes", "reports"],
  ["/admin/pagos", "payroll"],
  ["/admin", "dashboard"],
];

function sectionFor(pathname: string): Section | null {
  for (const [prefix, section] of SECTION_ROUTES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return section;
  }
  return null;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  // Staff (admin/manager/receptionist/professional) and customers each get
  // their own area — a customer must never reach /admin/* even by guessing
  // the URL, and staff never see the customer dashboard. Within /admin,
  // every section is further gated by the role's permission matrix.
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!role || !isStaffRole(role)) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    if (nextUrl.pathname === "/admin/perfil") {
      return NextResponse.next();
    }
    // An employee can always view a voucher for one of their own payments —
    // ownership (not role) is what's checked, and only the page itself can
    // know which payment ID belongs to which employee, so that check happens
    // there instead of here.
    if (nextUrl.pathname.startsWith("/admin/pagos/") && nextUrl.pathname !== "/admin/pagos/nuevo") {
      return NextResponse.next();
    }
    const section = sectionFor(nextUrl.pathname);
    if (section && !canAccess(role, section)) {
      return NextResponse.redirect(new URL(staffHomeRoute(role), nextUrl));
    }
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role && isStaffRole(role)) {
      return NextResponse.redirect(new URL(staffHomeRoute(role), nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
