import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const session = await auth();
  const customerId = session!.user.customerId!;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { user: { select: { email: true } } },
  });
  if (!customer) return null;

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Mi perfil</h1>
      <p className="mt-2 text-ink-muted">Actualiza tu información personal y tus preferencias.</p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Información personal</h2>
        <div className="mt-6">
          <ProfileForm
            email={customer.user.email}
            defaultValues={{
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              birthDate: customer.birthDate ? customer.birthDate.toISOString().slice(0, 10) : "",
              marketingOptIn: customer.marketingOptIn,
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl text-ink">Contraseña</h2>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
