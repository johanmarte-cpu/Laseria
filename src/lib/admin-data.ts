import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getAdminStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthStart = startOfMonth(now);

  const [todayCount, weekCount, newCustomersThisWeek, monthAppointments, activeServicesCount] =
    await Promise.all([
      prisma.appointment.count({
        where: { date: { gte: todayStart, lt: todayEnd }, status: { not: "cancelled" } },
      }),
      prisma.appointment.count({
        where: { date: { gte: weekStart, lt: weekEnd }, status: { not: "cancelled" } },
      }),
      prisma.customer.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.appointment.findMany({
        where: { date: { gte: monthStart }, status: { in: ["confirmed", "completed"] } },
        include: { services: { include: { service: true } } },
      }),
      prisma.service.count({ where: { active: true } }),
    ]);

  const estimatedRevenue = monthAppointments.reduce((sum, a) => sum + a.totalPrice, 0);

  const serviceCounts = new Map<string, { name: string; count: number }>();
  for (const appointment of monthAppointments) {
    for (const s of appointment.services) {
      const existing = serviceCounts.get(s.serviceId);
      if (existing) existing.count += 1;
      else serviceCounts.set(s.serviceId, { name: s.service.name, count: 1 });
    }
  }
  const topServices = Array.from(serviceCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { todayCount, weekCount, newCustomersThisWeek, estimatedRevenue, activeServicesCount, topServices };
}

export async function getAdminCustomers(query?: string) {
  const q = query?.trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { phone: { contains: q } },
            { user: { email: { contains: q } } },
          ],
        }
      : undefined,
    include: {
      user: { select: { email: true } },
      appointments: { orderBy: { date: "desc" }, select: { date: true, status: true } },
      consentForm: { select: { signedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  return customers.map((c) => {
    const past = c.appointments.filter((a) => a.date <= now && a.status === "completed");
    const upcoming = c.appointments.filter((a) => a.date >= now && a.status !== "cancelled");
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.user.email,
      phone: c.phone,
      appointmentsCount: c.appointments.length,
      lastVisit: past[0]?.date.toISOString() ?? null,
      nextAppointment:
        upcoming.sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date.toISOString() ?? null,
      consentSignedAt: c.consentForm?.signedAt.toISOString() ?? null,
    };
  });
}

function endOfDayInclusive(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Ventas por período: totals + payment-method breakdown for Reportería. */
export async function getSalesReport(from: Date, to: Date) {
  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: from, lte: endOfDayInclusive(to) }, status: "paid" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const transactionCount = sales.length;
  const averageTicket = transactionCount ? totalRevenue / transactionCount : 0;

  const byMethod = new Map<string, number>();
  for (const s of sales) {
    byMethod.set(s.paymentMethod, (byMethod.get(s.paymentMethod) ?? 0) + s.total);
  }

  const productCounts = new Map<string, { name: string; quantity: number; revenue: number }>();
  const serviceCounts = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const s of sales) {
    for (const item of s.items) {
      const map = item.itemType === "product" ? productCounts : serviceCounts;
      const key = item.productId ?? item.serviceId ?? item.name;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        map.set(key, { name: item.name, quantity: item.quantity, revenue: item.lineTotal });
      }
    }
  }

  return {
    totalRevenue,
    transactionCount,
    averageTicket,
    byMethod: Array.from(byMethod.entries()).map(([method, amount]) => ({ method, amount })),
    topProducts: Array.from(productCounts.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    topServices: Array.from(serviceCounts.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    sales,
  };
}

/** Desempeño por empleado: citas completadas + ventas procesadas en el período. */
export async function getEmployeePerformanceReport(from: Date, to: Date) {
  const employees = await prisma.professional.findMany({
    where: { active: true },
    orderBy: [{ role: "asc" }, { firstName: "asc" }],
  });

  const [appointments, sales] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: from, lte: endOfDayInclusive(to) } },
      select: { professionalId: true, status: true, totalPrice: true },
    }),
    prisma.sale.findMany({
      where: { createdAt: { gte: from, lte: endOfDayInclusive(to) }, status: "paid" },
      select: { employeeId: true, total: true },
    }),
  ]);

  return employees.map((e) => {
    const own = appointments.filter((a) => a.professionalId === e.id);
    const completed = own.filter((a) => a.status === "completed");
    const noShows = own.filter((a) => a.status === "no_show");
    const ownSales = sales.filter((s) => s.employeeId === e.id);
    return {
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      role: e.role,
      appointmentsCompleted: completed.length,
      appointmentsNoShow: noShows.length,
      serviceRevenue: completed.reduce((sum, a) => sum + a.totalPrice, 0),
      salesCount: ownSales.length,
      salesRevenue: ownSales.reduce((sum, s) => sum + s.total, 0),
    };
  });
}

/** Pagos a empleados en el período: filtra por solape del período de pago (no por fecha de creación). */
export async function getEmployeePaymentsReport(from: Date, to: Date) {
  const payments = await prisma.employeePayment.findMany({
    where: {
      status: { not: "cancelled" },
      periodStart: { lte: endOfDayInclusive(to) },
      periodEnd: { gte: from },
    },
    include: { employee: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { periodStart: "desc" },
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.netAmount, 0);

  const byEmployee = new Map<string, { id: string; name: string; role: string; total: number; count: number }>();
  for (const p of payments) {
    const existing = byEmployee.get(p.employee.id);
    if (existing) {
      existing.total += p.netAmount;
      existing.count += 1;
    } else {
      byEmployee.set(p.employee.id, {
        id: p.employee.id,
        name: `${p.employee.firstName} ${p.employee.lastName}`,
        role: p.employee.role,
        total: p.netAmount,
        count: 1,
      });
    }
  }

  return {
    totalPaid,
    paymentCount: payments.length,
    byEmployee: Array.from(byEmployee.values()).sort((a, b) => b.total - a.total),
    payments,
  };
}

export async function getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
  return prisma.product.findMany({
    where: { active: true, stock: { lte: threshold } },
    orderBy: { stock: "asc" },
  });
}

export async function getTodayAgenda() {
  const todayStart = startOfDay(new Date());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return prisma.appointment.findMany({
    where: { date: { gte: todayStart, lt: todayEnd } },
    include: { customer: true, professional: true, services: { include: { service: true } } },
    orderBy: { startTime: "asc" },
  });
}
