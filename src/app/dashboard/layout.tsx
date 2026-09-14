import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { DashboardSidebar, MobileDashboardNav } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.customerId) redirect("/login");

  const customer = await prisma.customer.findUnique({ where: { id: session.user.customerId } });
  if (!customer) redirect("/login");

  return (
    <div className="min-h-screen bg-beige">
      <header className="border-b border-line bg-white print:hidden">
        <Container className="flex h-20 items-center justify-between">
          <Logo className="h-12" />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-muted sm:block">
              Hola, <span className="font-semibold text-ink">{customer.firstName}</span>
            </span>
            <Suspense fallback={null}>
              <MobileDashboardNav />
            </Suspense>
          </div>
        </Container>
      </header>

      <Container className="grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-28 rounded-2xl bg-white p-4">
            <Suspense fallback={null}>
              <DashboardSidebar />
            </Suspense>
          </div>
        </aside>
        <main>{children}</main>
      </Container>
    </div>
  );
}
