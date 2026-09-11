import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { SalesTable } from "@/components/admin/sales/sales-table";

export const metadata: Metadata = { title: "Ventas" };

export default async function AdminSalesPage() {
  const [sales, session] = await Promise.all([
    prisma.sale.findMany({
      include: { customer: true, employee: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
    auth(),
  ]);

  return (
    <SalesTable
      isAdmin={session?.user?.role === "admin"}
      sales={sales.map((s) => ({
        id: s.id,
        saleNumber: s.saleNumber,
        ncf: s.ncf,
        ncfType: s.ncfType,
        customerName: s.customerName,
        customerRnc: s.customerRnc,
        subtotal: s.subtotal,
        taxAmount: s.taxAmount,
        discount: s.discount,
        total: s.total,
        status: s.status,
        paymentMethod: s.paymentMethod,
        notes: s.notes,
        createdAt: s.createdAt.toISOString(),
        customer: s.customer,
        employee: s.employee,
        appointmentId: s.appointmentId,
        items: s.items,
      }))}
    />
  );
}
