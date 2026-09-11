import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guards";
import { getAdminStats } from "@/lib/admin-data";

export async function GET() {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
