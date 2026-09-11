import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CONSENT_FORM_SECTIONS } from "@/lib/constants";
import { AdminConsentForm } from "@/components/admin/consent/admin-consent-form";
import { BackLink } from "@/components/admin/consent/back-link";

export const metadata: Metadata = { title: "Consentimiento del cliente" };

export default async function AdminCustomerConsentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [customer, consent] = await Promise.all([
    prisma.customer.findUnique({ where: { id } }),
    prisma.consentForm.findUnique({ where: { customerId: id }, include: { filledBy: true } }),
  ]);
  if (!customer) notFound();

  return (
    <div>
      <BackLink />
      <h1 className="mt-3 font-display text-4xl text-ink">Consentimiento informado</h1>
      <p className="mt-2 text-ink-muted">
        Cliente: {customer.firstName} {customer.lastName}
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
        <h2 className="font-display text-xl text-ink print:hidden">Firma</h2>
        <div className="mt-6">
          <AdminConsentForm
            customerId={customer.id}
            defaultName={`${customer.firstName} ${customer.lastName}`}
            consent={
              consent
                ? {
                    fullName: consent.fullName,
                    cedula: consent.cedula,
                    acceptedPhotos: consent.acceptedPhotos,
                    signedAt: consent.signedAt.toISOString(),
                    filledBy: consent.filledBy
                      ? { firstName: consent.filledBy.firstName, lastName: consent.filledBy.lastName }
                      : null,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
