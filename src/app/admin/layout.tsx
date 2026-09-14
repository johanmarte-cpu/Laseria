import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { AdminSidebar, MobileAdminNav } from "@/components/admin/sidebar";
import { isStaffRole, STAFF_ROLE_LABELS } from "@/lib/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) redirect("/login");
  const role = session.user.role;

  return (
    <div className="min-h-screen bg-beige">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 bg-ink p-6 lg:block print:hidden">
          <Logo variant="text" className="text-2xl" />
          <p className="mt-1 text-xs uppercase tracking-widest text-white/50">
            {STAFF_ROLE_LABELS[role]}
          </p>
          <div className="mt-8">
            <AdminSidebar role={role} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-line bg-ink lg:hidden print:hidden">
            <Container className="flex h-20 items-center justify-between">
              <Logo variant="text" className="text-xl" />
              <MobileAdminNav role={role} />
            </Container>
          </header>
          <Container className="py-10">{children}</Container>
        </div>
      </div>
    </div>
  );
}
