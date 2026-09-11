import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guards";
import { openCashSessionSchema } from "@/lib/validations";
import { openCashSession, listCashSessions } from "@/lib/cash-register";

export async function GET() {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const sessions = await listCashSessions(guard.role, guard.employeeId);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = openCashSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await openCashSession(parsed.data, guard.employeeId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ sessionId: result.sessionId, sessionNumber: result.sessionNumber }, { status: 201 });
}
