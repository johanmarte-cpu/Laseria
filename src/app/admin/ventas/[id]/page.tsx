import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/marketing/logo";
import { InvoiceActions } from "@/components/admin/sales/invoice-actions";
import { formatDate, formatMoney } from "@/lib/utils";
import { SALON_INFO, paymentMethodLabel } from "@/lib/constants";
import { ncfTypeMeta } from "@/lib/ncf";

export const metadata: Metadata = { title: "Detalle de venta" };

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { customer: true, employee: true, items: true, appointment: true },
  });
  if (!sale) notFound();

  return (
    <Container className="max-w-2xl px-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <h1 className="font-display text-4xl text-ink">Factura {sale.saleNumber}</h1>
        {sale.status === "cancelled" ? (
          <span className="rounded-full bg-status-cancelled/10 px-3 py-1 text-xs font-semibold text-status-cancelled">
            Cancelada
          </span>
        ) : (
          <span className="rounded-full bg-status-confirmed/10 px-3 py-1 text-xs font-semibold text-status-confirmed">
            Pagada
          </span>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-8">
        <div className="flex items-start justify-between border-b border-line pb-6">
          <div>
            <Logo className="h-12" />
            <p className="mt-2 text-xs text-ink-muted">{SALON_INFO.address}</p>
            <p className="text-xs text-ink-muted">{SALON_INFO.phone}</p>
          </div>
          <div className="text-right">
            {sale.ncf ? (
              <>
                <p className="text-xs uppercase tracking-widest text-ink-muted">
                  {ncfTypeMeta(sale.ncfType ?? "").label}
                </p>
                <p className="font-display text-xl text-gold-dark">{sale.ncf}</p>
              </>
            ) : (
              <p className="text-xs text-ink-muted">Sin NCF asignado</p>
            )}
            <p className="mt-1 text-xs text-ink-muted">{formatDate(sale.createdAt.toISOString())}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-b border-line pb-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Cliente</p>
            <p className="mt-1 text-ink">
              {sale.customer ? `${sale.customer.firstName} ${sale.customer.lastName}` : sale.customerName || "Cliente al mostrador"}
            </p>
            {sale.customerRnc && <p className="text-xs text-ink-muted">RNC: {sale.customerRnc}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Atendido por</p>
            <p className="mt-1 text-ink">
              {sale.employee.firstName} {sale.employee.lastName}
            </p>
            <p className="text-xs text-ink-muted">{paymentMethodLabel(sale.paymentMethod)}</p>
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2">Concepto</th>
                <th className="pb-2 text-center">Cant.</th>
                <th className="pb-2 text-right">Precio</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-line/60">
                  <td className="py-2 text-ink">{item.name}</td>
                  <td className="py-2 text-center text-ink-soft">{item.quantity}</td>
                  <td className="py-2 text-right text-ink-soft">{formatMoney(item.unitPrice)}</td>
                  <td className="py-2 text-right text-ink">{formatMoney(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>{formatMoney(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-ink-soft">
              <span>Descuento</span>
              <span>-{formatMoney(sale.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink-soft">
            <span>ITBIS ({Math.round(sale.taxRate * 100)}%)</span>
            <span>{formatMoney(sale.taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-display text-lg text-ink">
            <span>Total</span>
            <span>{formatMoney(sale.total)}</span>
          </div>
        </div>

        {sale.notes && (
          <div className="mt-6 rounded-xl bg-beige p-4 text-sm text-ink-soft">{sale.notes}</div>
        )}
      </div>

      <div className="mt-6">
        <InvoiceActions saleId={sale.id} status={sale.status} />
      </div>
    </Container>
  );
}
