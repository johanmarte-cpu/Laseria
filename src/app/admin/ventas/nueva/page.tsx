import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAdminCustomers } from "@/lib/admin-data";
import { Pos } from "@/components/admin/sales/pos";

export const metadata: Metadata = { title: "Nueva venta" };

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string }>;
}) {
  const { appointmentId } = await searchParams;

  const [products, services, customers, appointment] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getAdminCustomers(),
    appointmentId
      ? prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: { customer: true, services: { include: { service: true } } },
        })
      : null,
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Nueva venta</h1>
      <p className="mt-2 text-ink-muted">
        {appointment
          ? `Facturando la cita de ${appointment.customer.firstName} ${appointment.customer.lastName}.`
          : "Vende productos o servicios y emite el comprobante fiscal."}
      </p>

      <div className="mt-8">
        <Pos
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price, stock: p.stock }))}
          services={services.map((s) => ({ id: s.id, name: s.name, price: s.price }))}
          customers={customers}
          initialAppointment={
            appointment
              ? {
                  id: appointment.id,
                  customerId: appointment.customerId,
                  customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
                  services: appointment.services.map((s) => ({
                    id: s.service.id,
                    name: s.service.name,
                    price: s.priceAtBooking,
                  })),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
