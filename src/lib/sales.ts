import { prisma } from "@/lib/prisma";
import { claimNextNcf, ncfTypeMeta } from "@/lib/ncf";
import type { CreateSaleInput } from "@/lib/validations";

export type SaleResult =
  | { ok: true; saleId: string; saleNumber: string; ncf: string | null }
  | { ok: false; status: number; error: string };

function generateSaleNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `VTA-${timePart}${rand}`;
}

export async function createSale(input: CreateSaleInput, employeeId: string): Promise<SaleResult> {
  // Every sale must belong to an open caja session — this is what makes the
  // "cierre de caja" report (and its cash arqueo) trustworthy. Fetched once
  // here and reused below instead of re-querying inside the transaction, so
  // a sale can never be created with cashSessionId unset once this check
  // has passed.
  const openCashSession = await prisma.cashSession.findFirst({
    where: { employeeId, status: "open" },
    select: { id: true },
  });
  if (!openCashSession) {
    return {
      ok: false,
      status: 409,
      error: "Debes abrir tu caja antes de registrar una venta. Ve a Caja → Abrir caja.",
    };
  }

  const ncfMeta = ncfTypeMeta(input.ncfType);
  if (ncfMeta.requiresRnc && !input.customerRnc?.trim()) {
    return { ok: false, status: 400, error: "El comprobante de Crédito Fiscal (B01) requiere el RNC del cliente." };
  }

  const productIds = input.items.filter((i) => i.itemType === "product" && i.productId).map((i) => i.productId!);
  const serviceIds = input.items.filter((i) => i.itemType === "service" && i.serviceId).map((i) => i.serviceId!);

  const [products, services] = await Promise.all([
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } } }) : Promise.resolve([]),
    serviceIds.length ? prisma.service.findMany({ where: { id: { in: serviceIds } } }) : Promise.resolve([]),
  ]);

  if (products.length !== new Set(productIds).size) {
    return { ok: false, status: 400, error: "Uno o más productos ya no existen." };
  }
  if (services.length !== new Set(serviceIds).size) {
    return { ok: false, status: 400, error: "Uno o más servicios ya no existen." };
  }

  // Server-trusted prices/names — never take these from the client, same
  // principle as service snapshots on Appointment.
  const lineItems = input.items.map((item) => {
    if (item.itemType === "product") {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        itemType: "product" as const,
        productId: product.id,
        serviceId: null,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
        stockAvailable: product.stock,
      };
    }
    const service = services.find((s) => s.id === item.serviceId)!;
    return {
      itemType: "service" as const,
      productId: null,
      serviceId: service.id,
      name: service.name,
      quantity: item.quantity,
      unitPrice: service.price,
      lineTotal: service.price * item.quantity,
      stockAvailable: null,
    };
  });

  for (const line of lineItems) {
    if (line.itemType === "product" && line.stockAvailable !== null && line.stockAvailable < line.quantity) {
      return { ok: false, status: 409, error: `No hay suficiente inventario de "${line.name}" (disponible: ${line.stockAvailable}).` };
    }
  }

  if (input.appointmentId) {
    const existingSale = await prisma.sale.findUnique({ where: { appointmentId: input.appointmentId } });
    if (existingSale) {
      return { ok: false, status: 409, error: "Esta cita ya fue facturada." };
    }
  }

  const subtotal = lineItems.reduce((sum, l) => sum + l.lineTotal, 0);
  const discount = Math.min(input.discount ?? 0, subtotal);
  const taxableAmount = subtotal - discount;
  const taxRate = 0.18;
  const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100;

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const ncfResult = await claimNextNcf(tx, input.ncfType);
      if (!ncfResult.ok) {
        throw new Error(ncfResult.error);
      }

      for (const line of lineItems) {
        if (line.itemType === "product" && line.productId) {
          await tx.product.update({
            where: { id: line.productId },
            data: { stock: { decrement: line.quantity } },
          });
        }
      }

      const created = await tx.sale.create({
        data: {
          saleNumber: generateSaleNumber(),
          ncf: ncfResult.ncf,
          ncfType: input.ncfType,
          customerId: input.customerId || null,
          customerName: input.customerName ?? "",
          customerRnc: input.customerRnc || null,
          employeeId,
          appointmentId: input.appointmentId || null,
          subtotal,
          taxRate,
          taxAmount,
          discount,
          total,
          paymentMethod: input.paymentMethod,
          notes: input.notes ?? "",
          cashSessionId: openCashSession.id,
          items: {
            create: lineItems.map((l) => ({
              itemType: l.itemType,
              productId: l.productId,
              serviceId: l.serviceId,
              name: l.name,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });

      if (input.appointmentId) {
        await tx.payment.updateMany({
          where: { appointmentId: input.appointmentId },
          data: { status: "paid", method: input.paymentMethod === "cash" ? "cash" : "card" },
        });
      }

      return created;
    });

    return { ok: true, saleId: sale.id, saleNumber: sale.saleNumber, ncf: sale.ncf };
  } catch (err) {
    const message = err instanceof Error ? err.message : "No pudimos procesar la venta.";
    return { ok: false, status: 409, error: message };
  }
}
