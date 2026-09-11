// Minimal Resend client using plain fetch — no SDK dependency needed for a
// single "send this HTML email" call. Requires RESEND_API_KEY in .env; see
// README for setup steps. Without it, sendEmail no-ops with a clear error
// instead of throwing, so callers (e.g. cash session closing) can still
// complete their primary action and just report the email as failed.

const RESEND_API_URL = "https://api.resend.com/emails";

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY no está configurada en .env." };
  }
  const from = process.env.EMAIL_FROM || "Lasería <onboarding@resend.dev>";

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend respondió ${res.status}: ${body.slice(0, 300)}` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error de red al enviar el correo." };
  }
}
