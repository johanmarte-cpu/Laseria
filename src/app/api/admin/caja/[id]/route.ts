import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { closeCashSessionSchema } from "@/lib/validations";
import { closeCashSession } from "@/lib/cash-register";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const session = await prisma.cashSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "Caja no encontrada." }, { status: 404 });

  const isManagement = guard.role === "admin" || guard.role === "manager";
  if (!isManagement && session.employeeId !== guard.employeeId) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const session = await prisma.cashSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: "Caja no encontrada." }, { status: 404 });

  const isManagement = guard.role === "admin" || guard.role === "manager";
  if (!isManagement && session.employeeId !== guard.employeeId) {
    return NextResponse.json({ error: "Acceso no autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (body?.action !== "close") {
    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  }

  const parsed = closeCashSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await closeCashSession(id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    sessionId: result.sessionId,
    emailSent: result.emailSent,
    emailError: result.emailError,
  });
}
