import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { formatMoney, formatDate } from "@/lib/utils";
import { paymentMethodLabel, SALON_INFO } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";
import type { OpenCashSessionInput, CloseCashSessionInput } from "@/lib/validations";

export async function listCashSessions(role: StaffRole, employeeId: string) {
  const isManagement = role === "admin" || role === "manager";
  return prisma.cashSession.findMany({
    where: isManagement ? undefined : { employeeId },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, role: true } },
      _count: { select: { sales: { where: { status: "paid" } } } },
    },
    orderBy: { openedAt: "desc" },
  });
}

export type CashSessionResult =
  | { ok: true; sessionId: string; sessionNumber: string }
  | { ok: false; status: number; error: string };

function generateSessionNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `CAJA-${timePart}${rand}`;
}

export async function getOpenSession(employeeId: string) {
  return prisma.cashSession.findFirst({ where: { employeeId, status: "open" } });
}

export async function openCashSession(input: OpenCashSessionInput, employeeId: string): Promise<CashSessionResult> {
  const existing = await getOpenSession(employeeId);
  if (existing) {
    return { ok: false, status: 409, error: "Ya tienes una caja abierta. Ciérrala antes de abrir otra." };
  }

  const session = await prisma.cashSession.create({
    data: {
      sessionNumber: generateSessionNumber(),
      employeeId,
      openingAmount: input.openingAmount,
      openingNotes: input.notes ?? "",
    },
  });

  return { ok: true, sessionId: session.id, sessionNumber: session.sessionNumber };
}

/** Aggregated report of a session's sales — used both for the live "current status" view and the closing email. */
export async function buildSessionReport(sessionId: string) {
  const session = await prisma.cashSession.findUnique({
    where: { id: sessionId },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, role: true } },
      sales: {
        where: { status: "paid" },
        include: { items: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!session) return null;

  const totalRevenue = session.sales.reduce((sum, s) => sum + s.total, 0);
  const byMethod = new Map<string, number>();
  for (const s of session.sales) {
    byMethod.set(s.paymentMethod, (byMethod.get(s.paymentMethod) ?? 0) + s.total);
  }
  const cashRevenue = byMethod.get("cash") ?? 0;
  const expectedCash = Math.round((session.openingAmount + cashRevenue) * 100) / 100;

  return {
    session,
    totalRevenue,
    transactionCount: session.sales.length,
    byMethod: Array.from(byMethod.entries()).map(([method, amount]) => ({ method, amount })),
    expectedCash,
  };
}

export type SessionReport = NonNullable<Awaited<ReturnType<typeof buildSessionReport>>>;

export async function closeCashSession(
  sessionId: string,
  input: CloseCashSessionInput
): Promise<CashSessionResult & { emailSent?: boolean; emailError?: string | null }> {
  const report = await buildSessionReport(sessionId);
  if (!report) return { ok: false, status: 404, error: "Caja no encontrada." };
  if (report.session.status !== "open") {
    return { ok: false, status: 409, error: "Esta caja ya está cerrada." };
  }

  const difference = Math.round((input.countedCash - report.expectedCash) * 100) / 100;

  const closed = await prisma.cashSession.update({
    where: { id: sessionId },
    data: {
      closedAt: new Date(),
      countedCash: input.countedCash,
      expectedCash: report.expectedCash,
      difference,
      closingNotes: input.notes ?? "",
      status: "closed",
    },
  });

  const recipientRaw = process.env.CASH_REPORT_EMAIL || SALON_INFO.email;
  const recipients = recipientRaw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const html = renderSessionReportEmail({ ...report, countedCash: input.countedCash, difference });
  const emailResult = await sendEmail({
    to: recipients,
    subject: `Cierre de caja ${closed.sessionNumber} — ${report.session.employee.firstName} ${report.session.employee.lastName}`,
    html,
  });

  await prisma.cashSession.update({
    where: { id: sessionId },
    data: {
      reportEmailStatus: emailResult.ok ? "sent" : "failed",
      reportEmailTo: recipients.join(", "),
    },
  });

  return {
    ok: true,
    sessionId: closed.id,
    sessionNumber: closed.sessionNumber,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? null : emailResult.error,
  };
}

function renderSessionReportEmail(
  report: SessionReport & { countedCash: number; difference: number }
) {
  const { session, totalRevenue, transactionCount, byMethod, expectedCash, countedCash, difference } = report;
  const employeeName = `${session.employee.firstName} ${session.employee.lastName}`;
  const roleLabel = STAFF_ROLE_LABELS[session.employee.role as StaffRole] ?? session.employee.role;
  const diffLabel = difference === 0 ? "Cuadre exacto" : difference > 0 ? "Sobrante" : "Faltante";
  const diffColor = difference === 0 ? "#16794f" : difference > 0 ? "#9a6b00" : "#b3261e";

  const methodRows = byMethod
    .map(
      (m) => `<tr><td style="padding:6px 0;color:#4b4741;">${paymentMethodLabel(m.method)}</td>
      <td style="padding:6px 0;text-align:right;font-weight:600;color:#1c1a17;">${formatMoney(m.amount)}</td></tr>`
    )
    .join("");

  const saleRows = session.sales
    .map(
      (s) => `<tr>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;color:#4b4741;">${s.saleNumber}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;color:#4b4741;">${formatDate(s.createdAt.toISOString())}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;color:#4b4741;">${paymentMethodLabel(s.paymentMethod)}</td>
        <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;color:#1c1a17;">${formatMoney(s.total)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;color:#1c1a17;">
    <h1 style="font-size:22px;margin-bottom:4px;">Cierre de caja ${session.sessionNumber}</h1>
    <p style="color:#6b655c;margin-top:0;">${SALON_INFO.name} — ${SALON_INFO.address}</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
      <tr><td style="color:#6b655c;padding:3px 0;">Cajero</td><td style="text-align:right;">${employeeName} (${roleLabel})</td></tr>
      <tr><td style="color:#6b655c;padding:3px 0;">Apertura</td><td style="text-align:right;">${formatDate(session.openedAt.toISOString())}</td></tr>
      <tr><td style="color:#6b655c;padding:3px 0;">Cierre</td><td style="text-align:right;">${session.closedAt ? formatDate(session.closedAt.toISOString()) : "—"}</td></tr>
      <tr><td style="color:#6b655c;padding:3px 0;">Fondo inicial</td><td style="text-align:right;">${formatMoney(session.openingAmount)}</td></tr>
    </table>

    <h2 style="font-size:16px;border-bottom:1px solid #e4ded3;padding-bottom:6px;">Facturado en el turno</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
      <tr><td style="padding:6px 0;color:#4b4741;">Transacciones</td><td style="text-align:right;font-weight:600;">${transactionCount}</td></tr>
      <tr><td style="padding:6px 0;color:#4b4741;">Total facturado</td><td style="text-align:right;font-weight:600;">${formatMoney(totalRevenue)}</td></tr>
      ${methodRows}
    </table>

    <h2 style="font-size:16px;border-bottom:1px solid #e4ded3;padding-bottom:6px;">Arqueo de efectivo</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
      <tr><td style="padding:6px 0;color:#4b4741;">Efectivo esperado (fondo + ventas en efectivo)</td><td style="text-align:right;font-weight:600;">${formatMoney(expectedCash)}</td></tr>
      <tr><td style="padding:6px 0;color:#4b4741;">Efectivo contado</td><td style="text-align:right;font-weight:600;">${formatMoney(countedCash)}</td></tr>
      <tr><td style="padding:6px 0;color:${diffColor};">${diffLabel}</td><td style="text-align:right;font-weight:700;color:${diffColor};">${formatMoney(Math.abs(difference))}</td></tr>
    </table>

    ${session.closingNotes ? `<p style="background:#f7f3ec;border-radius:8px;padding:12px;font-size:13px;color:#4b4741;">${session.closingNotes}</p>` : ""}

    <h2 style="font-size:16px;border-bottom:1px solid #e4ded3;padding-bottom:6px;">Detalle de ventas</h2>
    ${
      session.sales.length === 0
        ? `<p style="color:#6b655c;font-size:14px;">No se registraron ventas en este turno.</p>`
        : `<table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr style="text-align:left;color:#6b655c;text-transform:uppercase;font-size:11px;">
              <th style="padding:5px 8px;">Venta</th><th style="padding:5px 8px;">Fecha</th><th style="padding:5px 8px;">Pago</th><th style="padding:5px 8px;text-align:right;">Total</th>
            </tr>
            ${saleRows}
          </table>`
    }

    <p style="margin-top:24px;font-size:12px;color:#9a948a;">Reporte generado automáticamente por el panel administrativo de ${SALON_INFO.name}.</p>
  </div>`;
}
