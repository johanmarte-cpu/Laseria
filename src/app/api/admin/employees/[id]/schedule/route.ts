import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";

const scheduleRowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  breakStart: z.string().nullable().optional(),
  breakEnd: z.string().nullable().optional(),
});

const putSchema = z.object({
  schedules: z.array(scheduleRowSchema),
  timeOff: z.array(z.object({ date: z.string(), reason: z.string().optional() })).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const [schedules, timeOff] = await Promise.all([
    prisma.professionalSchedule.findMany({ where: { professionalId: id }, orderBy: { dayOfWeek: "asc" } }),
    prisma.professionalTimeOff.findMany({ where: { professionalId: id }, orderBy: { date: "asc" } }),
  ]);

  return NextResponse.json({ schedules, timeOff });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.professionalSchedule.deleteMany({ where: { professionalId: id } }),
    prisma.professionalSchedule.createMany({
      data: parsed.data.schedules.map((s) => ({ ...s, professionalId: id })),
    }),
    ...(parsed.data.timeOff
      ? [
          prisma.professionalTimeOff.deleteMany({ where: { professionalId: id } }),
          prisma.professionalTimeOff.createMany({
            data: parsed.data.timeOff.map((t) => ({
              professionalId: id,
              date: new Date(`${t.date}T00:00:00`),
              reason: t.reason ?? null,
            })),
          }),
        ]
      : []),
  ]);

  const [schedules, timeOff] = await Promise.all([
    prisma.professionalSchedule.findMany({ where: { professionalId: id }, orderBy: { dayOfWeek: "asc" } }),
    prisma.professionalTimeOff.findMany({ where: { professionalId: id }, orderBy: { date: "asc" } }),
  ]);

  return NextResponse.json({ schedules, timeOff });
}
