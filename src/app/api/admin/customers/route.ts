import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guards";
import { getAdminCustomers } from "@/lib/admin-data";

export async function GET(request: Request) {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const customers = await getAdminCustomers(q);
  return NextResponse.json({ customers });
}
