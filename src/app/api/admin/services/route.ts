import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { serviceFormSchema } from "@/lib/validations";

const COMBINING_MARKS = /[̀-ͯ]/g;

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const guard = await requireStaff(["admin", "manager", "receptionist"]);
  if (guard instanceof NextResponse) return guard;

  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = serviceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let slug = slugify(parsed.data.name);
  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const service = await prisma.service.create({
    data: { ...parsed.data, slug },
  });

  return NextResponse.json({ service }, { status: 201 });
}
