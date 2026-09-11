import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveServices, getActiveProfessionals } from "@/lib/data";
import { BookingWizard } from "@/components/booking/booking-wizard";
import type { CustomerPrefill } from "@/components/booking/types";

export const metadata: Metadata = {
  title: "Reservar cita",
  description: "Reserva tu cita de depilación láser en Lasería en pocos pasos.",
};

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const [services, professionals, session] = await Promise.all([
    getActiveServices(),
    getActiveProfessionals(),
    auth(),
  ]);

  let prefillCustomer: CustomerPrefill | null = null;
  const isLoggedIn = session?.user?.role === "customer" && Boolean(session.user.customerId);

  if (isLoggedIn && session?.user?.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.customerId },
      include: { user: { select: { email: true } } },
    });
    if (customer) {
      prefillCustomer = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.user.email,
        phone: customer.phone,
        birthDate: customer.birthDate ? customer.birthDate.toISOString().slice(0, 10) : "",
        marketingOptIn: customer.marketingOptIn,
      };
    }
  }

  return (
    <BookingWizard
      services={services}
      professionals={professionals}
      prefillCustomer={prefillCustomer}
      isLoggedIn={Boolean(isLoggedIn)}
      initialServiceId={params.serviceId}
      initialCategory={params.categoria}
    />
  );
}
