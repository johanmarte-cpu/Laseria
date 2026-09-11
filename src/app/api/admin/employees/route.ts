import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/api-guards";
import { employeeFormSchema } from "@/lib/validations";
import { canManageEmployeeRole, isStaffRole } from "@/lib/roles";
import { generateTempPassword } from "@/lib/utils";

export async function GET() {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const employees = await prisma.professional.findMany({
    include: { schedules: true },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const guard = await requireStaff(["admin", "manager"]);
  if (guard instanceof NextResponse) return guard;

  const body = await request.json().catch(() => null);
  const parsed = employeeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (!isStaffRole(data.role) || !canManageEmployeeRole(guard.role, data.role)) {
    return NextResponse.json(
      { error: "No tienes permiso para crear un empleado con ese rol." },
      { status: 403 }
    );
  }

  const email = data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Ya existe una cuenta con este email." }, { status: 409 });
  }

  const cedula = data.cedula.trim() || null;
  if (cedula) {
    const existingCedula = await prisma.professional.findUnique({ where: { cedula } });
    if (existingCedula) {
      return NextResponse.json({ error: "Ya existe un empleado con esa cédula." }, { status: 409 });
    }
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: data.role,
      employee: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          phone: data.phone,
          cedula,
          salary: data.salary,
          role: data.role,
          specialty: data.specialty,
          bio: data.bio,
          photoUrl: data.photoUrl,
          active: data.active,
          ...(data.role === "professional"
            ? {
                schedules: {
                  create: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
                    dayOfWeek,
                    startTime: "09:00",
                    endTime: "18:00",
                    breakStart: "13:00",
                    breakEnd: "14:00",
                  })),
                },
              }
            : {}),
        },
      },
    },
    include: { employee: { include: { schedules: true } } },
  });

  return NextResponse.json(
    { employee: user.employee, tempPassword },
    { status: 201 }
  );
}
