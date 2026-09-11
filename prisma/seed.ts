import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Simple booking-number generator mirroring src/lib/utils.ts (kept local so
// this script has zero dependency on the Next.js path aliases).
function generateBookingNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  return `LSR-${timePart}${rand}`;
}

function generateSaleNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `VTA-${timePart}${rand}`;
}

function generatePaymentNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timePart = Date.now().toString(36).toUpperCase().slice(-5);
  return `COMP-${timePart}${rand}`;
}

function daysFromNow(days: number, hour = 0, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function dateOnly(days: number) {
  const d = daysFromNow(days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding Lasería demo data...");

  // ---------------------------------------------------------------------
  // Clean slate
  // ---------------------------------------------------------------------
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cashSession.deleteMany();
  await prisma.employeePayment.deleteMany();
  await prisma.ncfSequence.deleteMany();
  await prisma.product.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.professionalTimeOff.deleteMany();
  await prisma.professionalSchedule.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------
  // Services — imageUrl stores a visual key (matches category) consumed by
  // <TreatmentArt /> to render on-brand placeholder art instead of a hot-
  // linked external photo.
  // ---------------------------------------------------------------------
  const services = await prisma.$transaction([
    prisma.service.create({
      data: {
        name: "Axilas",
        slug: "axilas",
        category: "axilas",
        description: "Depilación láser de axilas, sesión rápida y prácticamente indolora.",
        durationMinutes: 30,
        price: 1800,
        imageUrl: "axilas",
      },
    }),
    prisma.service.create({
      data: {
        name: "Bikini",
        slug: "bikini",
        category: "bikini",
        description: "Zona bikini clásica con protocolo de máxima suavidad y privacidad.",
        durationMinutes: 30,
        price: 2500,
        imageUrl: "bikini",
      },
    }),
    prisma.service.create({
      data: {
        name: "Piernas completas",
        slug: "piernas-completas",
        category: "piernas",
        description: "Tratamiento de piernas completas para una piel uniforme y suave.",
        durationMinutes: 60,
        price: 4800,
        imageUrl: "piernas",
      },
    }),
    prisma.service.create({
      data: {
        name: "Media pierna",
        slug: "media-pierna",
        category: "piernas",
        description: "Ideal para quienes buscan un tratamiento rápido en pantorrillas o muslos.",
        durationMinutes: 40,
        price: 3000,
        imageUrl: "piernas",
      },
    }),
    prisma.service.create({
      data: {
        name: "Brazos completos",
        slug: "brazos-completos",
        category: "brazos",
        description: "Depilación láser de brazos completos, de hombro a muñeca.",
        durationMinutes: 45,
        price: 3500,
        imageUrl: "brazos",
      },
    }),
    prisma.service.create({
      data: {
        name: "Rostro",
        slug: "rostro",
        category: "rostro",
        description: "Tratamiento facial de precisión para labio superior, mentón y mejillas.",
        durationMinutes: 20,
        price: 1500,
        imageUrl: "rostro",
      },
    }),
    prisma.service.create({
      data: {
        name: "Cuerpo completo",
        slug: "cuerpo-completo",
        category: "cuerpo-completo",
        description: "Protocolo integral de cuerpo completo para resultados progresivos y parejos.",
        durationMinutes: 120,
        price: 9500,
        imageUrl: "cuerpo-completo",
      },
    }),
  ]);

  const [axilas, bikini, , mediaPierna, brazos, rostro, cuerpoCompleto] = services;

  // ---------------------------------------------------------------------
  // Employees — every login-bearing staff member lives in one table
  // (`Professional`), distinguished by `role`. Helper below creates the
  // User + employee row together and returns both.
  // ---------------------------------------------------------------------
  async function createEmployee(opts: {
    email: string;
    password: string;
    role: "admin" | "manager" | "receptionist" | "professional";
    firstName: string;
    lastName: string;
    phone: string;
    cedula: string;
    salary: number;
    specialty?: string;
    bio?: string;
    photoUrl: string;
    schedule?: { days: number[]; start: string; end: string; breakStart?: string; breakEnd?: string };
  }) {
    const passwordHash = await bcrypt.hash(opts.password, 10);
    const user = await prisma.user.create({
      data: {
        email: opts.email,
        passwordHash,
        role: opts.role,
        employee: {
          create: {
            firstName: opts.firstName,
            lastName: opts.lastName,
            email: opts.email,
            phone: opts.phone,
            cedula: opts.cedula,
            salary: opts.salary,
            role: opts.role,
            specialty: opts.specialty ?? "",
            bio: opts.bio ?? "",
            photoUrl: opts.photoUrl,
            ...(opts.schedule
              ? {
                  schedules: {
                    create: opts.schedule.days.map((dayOfWeek) => ({
                      dayOfWeek,
                      startTime: opts.schedule!.start,
                      endTime: opts.schedule!.end,
                      breakStart: opts.schedule!.breakStart ?? null,
                      breakEnd: opts.schedule!.breakEnd ?? null,
                    })),
                  },
                }
              : {}),
          },
        },
      },
      include: { employee: true },
    });
    return user.employee!;
  }

  const admin = await createEmployee({
    email: "admin@laseria.com",
    password: "Admin1234!",
    role: "admin",
    firstName: "Admin",
    lastName: "Lasería",
    phone: "+1 (809) 555-0100",
    cedula: "001-0000001-1",
    salary: 65000,
    photoUrl: "0",
  });

  const gerente = await createEmployee({
    email: "gerente@laseria.com",
    password: "Gerente1234!",
    role: "manager",
    firstName: "Rosa",
    lastName: "Ventura",
    phone: "+1 (809) 555-0111",
    cedula: "001-0000002-2",
    salary: 50000,
    photoUrl: "1",
  });

  const recepcion = await createEmployee({
    email: "recepcion@laseria.com",
    password: "Recepcion1234!",
    role: "receptionist",
    firstName: "Yolanda",
    lastName: "Núñez",
    phone: "+1 (809) 555-0122",
    cedula: "001-0000003-3",
    salary: 22000,
    photoUrl: "2",
  });

  const camila = await createEmployee({
    email: "camila@laseria.com",
    password: "Profesional1234!",
    role: "professional",
    firstName: "Camila",
    lastName: "Reyes",
    phone: "+1 (809) 555-0133",
    cedula: "001-0000004-4",
    salary: 28000,
    specialty: "Depilación láser facial y corporal",
    bio: "8 años de experiencia en tecnología láser de diodo.",
    photoUrl: "1",
    schedule: { days: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", breakStart: "13:00", breakEnd: "14:00" },
  });

  const valentina = await createEmployee({
    email: "valentina@laseria.com",
    password: "Profesional1234!",
    role: "professional",
    firstName: "Valentina",
    lastName: "Cruz",
    phone: "+1 (809) 555-0144",
    cedula: "001-0000005-5",
    salary: 28000,
    specialty: "Tratamientos corporales avanzados",
    bio: "Especialista certificada en depilación láser y cuidado de la piel.",
    photoUrl: "2",
    schedule: { days: [2, 3, 4, 5, 6], start: "09:00", end: "17:00", breakStart: "13:00", breakEnd: "13:30" },
  });

  const isabel = await createEmployee({
    email: "isabel@laseria.com",
    password: "Profesional1234!",
    role: "professional",
    firstName: "Isabel",
    lastName: "Fernández",
    phone: "+1 (809) 555-0155",
    cedula: "001-0000006-6",
    salary: 30000,
    specialty: "Técnica senior — casos de piel sensible",
    bio: "Formación internacional en tecnologías láser de última generación.",
    photoUrl: "3",
    schedule: { days: [1, 3, 5, 6], start: "10:00", end: "19:00", breakStart: "14:00", breakEnd: "15:00" },
  });

  // ---------------------------------------------------------------------
  // Demo customers with appointments in several states
  // ---------------------------------------------------------------------
  const customerPasswordHash = await bcrypt.hash("Cliente1234!", 10);
  const customerUser = await prisma.user.create({
    data: {
      email: "maria@example.com",
      passwordHash: customerPasswordHash,
      role: "customer",
      customer: {
        create: {
          firstName: "María",
          lastName: "Pérez",
          phone: "+1 (809) 555-8821",
          birthDate: new Date("1996-04-12"),
          marketingOptIn: true,
        },
      },
    },
    include: { customer: true },
  });
  const maria = customerUser.customer!;

  const secondCustomerHash = await bcrypt.hash("Cliente1234!", 10);
  const secondCustomerUser = await prisma.user.create({
    data: {
      email: "ana@example.com",
      passwordHash: secondCustomerHash,
      role: "customer",
      customer: {
        create: {
          firstName: "Ana",
          lastName: "Gómez",
          phone: "+1 (809) 555-4477",
          marketingOptIn: false,
        },
      },
    },
    include: { customer: true },
  });
  const ana = secondCustomerUser.customer!;

  async function createAppointment(opts: {
    customerId: string;
    professionalId: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
    serviceList: { id: string; price: number; durationMinutes: number }[];
    notes?: string;
    paymentStatus?: string;
  }) {
    const totalPrice = opts.serviceList.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = opts.serviceList.reduce((sum, s) => sum + s.durationMinutes, 0);

    return prisma.appointment.create({
      data: {
        bookingNumber: generateBookingNumber(),
        customerId: opts.customerId,
        professionalId: opts.professionalId,
        date: opts.date,
        startTime: opts.startTime,
        endTime: opts.endTime,
        status: opts.status,
        totalPrice,
        totalDuration,
        notes: opts.notes ?? "",
        wantsReminders: true,
        services: {
          create: opts.serviceList.map((s) => ({
            serviceId: s.id,
            priceAtBooking: s.price,
            durationAtBooking: s.durationMinutes,
          })),
        },
        payment: {
          create: {
            amount: totalPrice,
            depositAmount: 0,
            status: opts.paymentStatus ?? "pending",
            method: "pay_at_location",
          },
        },
        notifications: {
          create: {
            customerId: opts.customerId,
            type: "booking_confirmation",
            channel: "email",
            status: "sent",
            sentAt: new Date(),
          },
        },
      },
    });
  }

  // Upcoming confirmed appointment (María, in 3 days)
  await createAppointment({
    customerId: maria.id,
    professionalId: camila.id,
    date: dateOnly(3),
    startTime: "10:00",
    endTime: "10:30",
    status: "confirmed",
    serviceList: [{ id: axilas.id, price: axilas.price, durationMinutes: axilas.durationMinutes }],
    paymentStatus: "pending",
  });

  // Upcoming pending appointment (María, in 6 days, two services)
  await createAppointment({
    customerId: maria.id,
    professionalId: valentina.id,
    date: dateOnly(6),
    startTime: "11:00",
    endTime: "12:10",
    status: "pending",
    serviceList: [
      { id: mediaPierna.id, price: mediaPierna.price, durationMinutes: mediaPierna.durationMinutes },
      { id: rostro.id, price: rostro.price, durationMinutes: rostro.durationMinutes },
    ],
    notes: "Primera vez con tratamiento facial.",
  });

  // Completed past appointment (María, 20 days ago)
  const mariaCompletedAppt = await createAppointment({
    customerId: maria.id,
    professionalId: camila.id,
    date: dateOnly(-20),
    startTime: "09:30",
    endTime: "10:00",
    status: "completed",
    serviceList: [{ id: axilas.id, price: axilas.price, durationMinutes: axilas.durationMinutes }],
    paymentStatus: "paid",
  });

  // Completed past appointment (María, 50 days ago, bikini + axilas)
  await createAppointment({
    customerId: maria.id,
    professionalId: isabel.id,
    date: dateOnly(-50),
    startTime: "10:00",
    endTime: "11:00",
    status: "completed",
    serviceList: [
      { id: bikini.id, price: bikini.price, durationMinutes: bikini.durationMinutes },
      { id: axilas.id, price: axilas.price, durationMinutes: axilas.durationMinutes },
    ],
    paymentStatus: "paid",
  });

  // Cancelled appointment (María, 10 days ago)
  await createAppointment({
    customerId: maria.id,
    professionalId: valentina.id,
    date: dateOnly(-10),
    startTime: "14:00",
    endTime: "16:00",
    status: "cancelled",
    serviceList: [{ id: cuerpoCompleto.id, price: cuerpoCompleto.price, durationMinutes: cuerpoCompleto.durationMinutes }],
    paymentStatus: "cancelled",
  });

  // A few appointments for Ana + today's agenda so the admin panel has data
  await createAppointment({
    customerId: ana.id,
    professionalId: camila.id,
    date: dateOnly(0),
    startTime: "15:00",
    endTime: "15:45",
    status: "confirmed",
    serviceList: [{ id: brazos.id, price: brazos.price, durationMinutes: brazos.durationMinutes }],
    paymentStatus: "paid",
  });

  await createAppointment({
    customerId: ana.id,
    professionalId: isabel.id,
    date: dateOnly(1),
    startTime: "12:00",
    endTime: "12:30",
    status: "confirmed",
    serviceList: [{ id: rostro.id, price: rostro.price, durationMinutes: rostro.durationMinutes }],
    paymentStatus: "pending",
  });

  await createAppointment({
    customerId: ana.id,
    professionalId: camila.id,
    date: dateOnly(-5),
    startTime: "09:00",
    endTime: "09:30",
    status: "no_show",
    serviceList: [{ id: axilas.id, price: axilas.price, durationMinutes: axilas.durationMinutes }],
    paymentStatus: "cancelled",
  });

  // ---------------------------------------------------------------------
  // Products (retail)
  // ---------------------------------------------------------------------
  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        name: "Crema calmante post-láser",
        sku: "LSR-CR-001",
        category: "Post-tratamiento",
        description: "Hidratante calmante para después de cada sesión.",
        price: 850,
        cost: 350,
        stock: 34,
        imageUrl: "cuerpo-completo",
      },
    }),
    prisma.product.create({
      data: {
        name: "Protector solar SPF 50",
        sku: "LSR-SP-002",
        category: "Protección solar",
        description: "Indispensable durante el tratamiento láser.",
        price: 950,
        cost: 400,
        stock: 21,
        imageUrl: "rostro",
      },
    }),
    prisma.product.create({
      data: {
        name: "Gel exfoliante corporal",
        sku: "LSR-EX-003",
        category: "Cuidado de la piel",
        description: "Exfoliación suave que prepara la piel entre sesiones.",
        price: 750,
        cost: 300,
        stock: 18,
        imageUrl: "piernas",
      },
    }),
    prisma.product.create({
      data: {
        name: "Sérum reductor de vello",
        sku: "LSR-SE-004",
        category: "Cuidado de la piel",
        description: "Complementa los resultados entre sesiones de láser.",
        price: 1400,
        cost: 600,
        stock: 4,
        imageUrl: "brazos",
      },
    }),
    prisma.product.create({
      data: {
        name: "Set de cuchillas de preparación",
        sku: "LSR-AC-005",
        category: "Accesorios",
        description: "Para rasurar la zona 24h antes de tu cita.",
        price: 350,
        cost: 150,
        stock: 50,
        imageUrl: "axilas",
      },
    }),
    prisma.product.create({
      data: {
        name: "Loción hidratante corporal",
        sku: "LSR-LO-006",
        category: "Cuidado de la piel",
        description: "Hidratación diaria de larga duración.",
        price: 800,
        cost: 350,
        stock: 3,
        imageUrl: "bikini",
      },
    }),
  ]);
  const [cremaCalmante, protectorSolar, , serumReductor] = products;

  // ---------------------------------------------------------------------
  // NCF sequences (DGII fiscal receipt number ranges)
  // ---------------------------------------------------------------------
  await prisma.ncfSequence.createMany({
    data: [
      { ncfType: "B01", label: "Crédito Fiscal", nextNumber: 1, endNumber: 200 },
      { ncfType: "B02", label: "Consumo", nextNumber: 1, endNumber: 1000 },
    ],
  });

  // ---------------------------------------------------------------------
  // Demo sales (retail + one invoiced appointment) so Reportería has data
  // ---------------------------------------------------------------------
  async function createSale(opts: {
    customerId?: string;
    customerName?: string;
    employeeId: string;
    appointmentId?: string;
    ncfType: "B01" | "B02";
    items: { itemType: "product" | "service"; productId?: string; serviceId?: string; name: string; quantity: number; unitPrice: number }[];
    paymentMethod: string;
    daysAgo: number;
  }) {
    const subtotal = opts.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + taxAmount;
    const sequence = await prisma.ncfSequence.findUniqueOrThrow({ where: { ncfType: opts.ncfType } });
    const ncf = `${opts.ncfType}${String(sequence.nextNumber).padStart(8, "0")}`;
    await prisma.ncfSequence.update({ where: { ncfType: opts.ncfType }, data: { nextNumber: sequence.nextNumber + 1 } });

    return prisma.sale.create({
      data: {
        saleNumber: generateSaleNumber(),
        ncf,
        ncfType: opts.ncfType,
        customerId: opts.customerId,
        customerName: opts.customerName ?? "",
        employeeId: opts.employeeId,
        appointmentId: opts.appointmentId,
        subtotal,
        taxAmount,
        total,
        paymentMethod: opts.paymentMethod,
        createdAt: dateOnly(-opts.daysAgo),
        items: {
          create: opts.items.map((i) => ({
            itemType: i.itemType,
            productId: i.productId,
            serviceId: i.serviceId,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.unitPrice * i.quantity,
          })),
        },
      },
    });
  }

  await createSale({
    customerId: maria.id,
    employeeId: recepcion.id,
    appointmentId: mariaCompletedAppt.id,
    ncfType: "B02",
    paymentMethod: "card",
    daysAgo: 20,
    items: [
      { itemType: "service", serviceId: axilas.id, name: axilas.name, quantity: 1, unitPrice: axilas.price },
      { itemType: "product", productId: cremaCalmante.id, name: cremaCalmante.name, quantity: 1, unitPrice: cremaCalmante.price },
    ],
  });

  await createSale({
    customerId: ana.id,
    employeeId: recepcion.id,
    ncfType: "B02",
    paymentMethod: "cash",
    daysAgo: 5,
    items: [
      { itemType: "product", productId: protectorSolar.id, name: protectorSolar.name, quantity: 2, unitPrice: protectorSolar.price },
    ],
  });

  await createSale({
    customerName: "Cliente al mostrador",
    employeeId: admin.id,
    ncfType: "B02",
    paymentMethod: "cash",
    daysAgo: 1,
    items: [
      { itemType: "product", productId: serumReductor.id, name: serumReductor.name, quantity: 1, unitPrice: serumReductor.price },
    ],
  });

  // ---------------------------------------------------------------------
  // Payroll — a completed prior-month salary run plus a bonus, so Empleados
  // → Mi perfil and Pagos both have data to show from the first run.
  // ---------------------------------------------------------------------
  async function createPayment(opts: {
    employeeId: string;
    processedById: string;
    concept: "salario" | "bono" | "adelanto" | "otro";
    grossAmount: number;
    deductions?: number;
    paymentMethod: string;
    periodStartDaysAgo: number;
    periodEndDaysAgo: number;
    createdDaysAgo: number;
    notes?: string;
  }) {
    const deductions = opts.deductions ?? 0;
    return prisma.employeePayment.create({
      data: {
        paymentNumber: generatePaymentNumber(),
        employeeId: opts.employeeId,
        processedById: opts.processedById,
        concept: opts.concept,
        periodStart: dateOnly(-opts.periodStartDaysAgo),
        periodEnd: dateOnly(-opts.periodEndDaysAgo),
        grossAmount: opts.grossAmount,
        deductions,
        netAmount: opts.grossAmount - deductions,
        paymentMethod: opts.paymentMethod,
        notes: opts.notes ?? "",
        createdAt: dateOnly(-opts.createdDaysAgo),
      },
    });
  }

  await createPayment({
    employeeId: camila.id,
    processedById: admin.id,
    concept: "salario",
    grossAmount: 28000,
    deductions: 1400,
    paymentMethod: "transfer",
    periodStartDaysAgo: 60,
    periodEndDaysAgo: 31,
    createdDaysAgo: 30,
    notes: "Salario del mes anterior.",
  });

  await createPayment({
    employeeId: valentina.id,
    processedById: admin.id,
    concept: "salario",
    grossAmount: 28000,
    deductions: 1400,
    paymentMethod: "transfer",
    periodStartDaysAgo: 60,
    periodEndDaysAgo: 31,
    createdDaysAgo: 30,
  });

  await createPayment({
    employeeId: recepcion.id,
    processedById: gerente.id,
    concept: "bono",
    grossAmount: 3000,
    paymentMethod: "cash",
    periodStartDaysAgo: 10,
    periodEndDaysAgo: 10,
    createdDaysAgo: 10,
    notes: "Bono por desempeño.",
  });

  console.log("Seed complete.");
  console.log("Admin login:         admin@laseria.com / Admin1234!");
  console.log("Manager login:       gerente@laseria.com / Gerente1234!");
  console.log("Receptionist login:  recepcion@laseria.com / Recepcion1234!");
  console.log("Professional login:  camila@laseria.com / Profesional1234!");
  console.log("Customer login:      maria@example.com / Cliente1234!");
  console.log("Customer login:      ana@example.com / Cliente1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
