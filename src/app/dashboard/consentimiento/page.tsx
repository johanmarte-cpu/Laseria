import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConsentForm } from "@/components/dashboard/consent-form";
import { CONSENT_FORM_SECTIONS } from "@/lib/constants";

export const metadata: Metadata = { title: "Consentimiento informado" };

export default async function ConsentPage() {
  const session = await auth();
  const customerId = session!.user.customerId!;

  const [customer, consent] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId } }),
    prisma.consentForm.findUnique({ where: { customerId } }),
  ]);
  if (!customer) return null;

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Consentimiento informado</h1>
      <p className="mt-2 text-ink-muted">
        Antes de tu primera sesión de depilación láser, lee y firma este consentimiento.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8 print:hidden">
        <h2 className="font-display text-xl text-ink">Consentimiento para depilación láser</h2>
        <div className="mt-6 space-y-5">
          {CONSENT_FORM_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-base text-ink">{section.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{section.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink print:hidden">Tu firma</h2>
        <div className="mt-6">
          <ConsentForm
            defaultName={`${customer.firstName} ${customer.lastName}`}
            consent={
              consent
                ? {
                    fullName: consent.fullName,
                    cedula: consent.cedula,
                    acceptedPhotos: consent.acceptedPhotos,
                    signedAt: consent.signedAt.toISOString(),
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
