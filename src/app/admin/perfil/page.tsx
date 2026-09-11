import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { STAFF_ROLE_LABELS, isStaffRole } from "@/lib/roles";
import { StaffProfileForm } from "@/components/admin/profile/staff-profile-form";
import { StaffChangePasswordForm } from "@/components/admin/profile/staff-change-password-form";
import { formatDate, formatMoney } from "@/lib/utils";
import { paymentConceptLabel } from "@/lib/constants";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function StaffProfilePage() {
  const session = await auth();
  const role = session!.user.role;
  const employeeId = session!.user.employeeId!;

  const [employee, payments] = await Promise.all([
    prisma.professional.findUnique({ where: { id: employeeId } }),
    prisma.employeePayment.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  if (!employee) return null;

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Mi perfil</h1>
      <p className="mt-2 text-ink-muted">
        {isStaffRole(role) ? STAFF_ROLE_LABELS[role] : ""} — actualiza tu información y contraseña.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Información personal</h2>
        <div className="mt-6">
          <StaffProfileForm
            email={employee.email ?? ""}
            defaultValues={{ firstName: employee.firstName, lastName: employee.lastName, phone: employee.phone }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Contraseña</h2>
        <div className="mt-6">
          <StaffChangePasswordForm />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Mis pagos</h2>
        <p className="mt-1 text-sm text-ink-muted">Historial de comprobantes emitidos a tu nombre.</p>
        <div className="mt-5 space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-ink-muted">Todavía no tienes comprobantes de pago.</p>
          ) : (
            payments.map((p) => (
              <Link
                key={p.id}
                href={`/admin/pagos/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-4 py-3 text-sm hover:bg-beige"
              >
                <div>
                  <p className="font-medium text-ink">{p.paymentNumber}</p>
                  <p className="text-xs text-ink-muted">
                    {paymentConceptLabel(p.concept)} · {formatDate(p.createdAt.toISOString())}
                    {p.status === "cancelled" && " · Cancelado"}
                  </p>
                </div>
                <span className="font-display text-lg text-ink">{formatMoney(p.netAmount)}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
