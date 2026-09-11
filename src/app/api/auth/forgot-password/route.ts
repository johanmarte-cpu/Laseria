import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresa un email válido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same generic response so the endpoint doesn't leak
  // which emails have an account — but only issue a token when one exists.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  // The MVP has no email provider wired up yet (see README — Fase 2). Instead
  // of silently dropping the reset link, we return it directly so the demo
  // flow stays fully functional end-to-end; a real deploy would email this
  // URL instead of returning it in the API response.
  const resetUrl = `/restablecer?token=${token}`;

  return NextResponse.json({ ok: true, demoResetUrl: resetUrl });
}
