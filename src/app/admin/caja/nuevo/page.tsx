import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOpenSession } from "@/lib/cash-register";
import { OpenSessionForm } from "@/components/admin/caja/open-session-form";

export const metadata: Metadata = { title: "Abrir caja" };

export default async function NewCashSessionPage() {
  const session = await auth();
  const employeeId = session!.user.employeeId!;

  const existing = await getOpenSession(employeeId);
  if (existing) redirect(`/admin/caja/${existing.id}`);

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Abrir caja</h1>
      <p className="mt-2 text-ink-muted">Registra el fondo inicial para comenzar tu turno.</p>

      <div className="mt-8">
        <OpenSessionForm />
      </div>
    </div>
  );
}
