import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const professionals = await prisma.professional.findMany({
    where: { active: true, role: "professional" },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialty: true,
      bio: true,
      photoUrl: true,
    },
  });
  return NextResponse.json({ professionals });
}
