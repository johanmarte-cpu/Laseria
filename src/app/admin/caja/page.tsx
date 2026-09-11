import type { Metadata } from "next";
import Link from "next/link";
import { CircleDot } from "lucide-react";
import { auth } from "@/auth";
import { ButtonLink } from "@/components/ui/button";
import { SessionsTable } from "@/components/admin/caja/sessions-table";
import { getOpenSession, listCashSessions } from "@/lib/cash-register";
import { formatDate, formatMoney } from "@/lib/utils";
import type { StaffRole } from "@/lib/roles";

export const metadata: Metadata = { title: "Caja" };

export default async function CajaPage() {
  const session = await auth();
  const role = session!.user.role as StaffRole;
  const employeeId = session!.user.employeeId!;

  const [ownOpenSession, sessions] = await Promise.all([
    getOpenSession(employeeId),
    listCashSessions(role, employeeId),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Caja</h1>
          <p className="mt-2 text-ink-muted">Apertura y cierre de caja por turno.</p>
        </div>
        {!ownOpenSession && <ButtonLink href="/admin/caja/nuevo">Abrir caja</ButtonLink>}
      </div>

      {ownOpenSession ? (
        <Link
          href={`/admin/caja/${ownOpenSession.id}`}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-status-confirmed/30 bg-status-confirmed/5 p-6 hover:bg-status-confirmed/10"
        >
          <div className="flex items-center gap-3">
            <CircleDot className="h-5 w-5 text-status-confirmed" strokeWidth={1.75} />
            <div>
              <p className="font-display text-lg text-ink">
                Tienes una caja abierta — {ownOpenSession.sessionNumber}
              </p>
              <p className="text-sm text-ink-muted">
                Abierta el {formatDate(ownOpenSession.openedAt)} con fondo inicial {formatMoney(ownOpenSession.openingAmount)}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-status-confirmed">Ver y cerrar →</span>
        </Link>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-sm text-ink-muted">
          No tienes una caja abierta. Ábrela antes de registrar ventas para que queden asociadas a tu turno.
        </p>
      )}

      <div className="mt-8">
        <h2 className="font-display text-xl text-ink">Historial</h2>
        <div className="mt-4">
          <SessionsTable
            sessions={sessions.map((s) => ({
              id: s.id,
              sessionNumber: s.sessionNumber,
              openingAmount: s.openingAmount,
              openingNotes: s.openingNotes,
              openedAt: s.openedAt.toISOString(),
              closedAt: s.closedAt ? s.closedAt.toISOString() : null,
              countedCash: s.countedCash,
              expectedCash: s.expectedCash,
              difference: s.difference,
              closingNotes: s.closingNotes,
              status: s.status,
              reportEmailStatus: s.reportEmailStatus,
              reportEmailTo: s.reportEmailTo,
              employee: s.employee,
              _count: s._count,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
