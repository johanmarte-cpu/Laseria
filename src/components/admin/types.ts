export type AdminAppointment = {
  id: string;
  bookingNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  totalDuration: number;
  notes: string;
  customer: { id: string; firstName: string; lastName: string; phone: string };
  professional: { id: string; firstName: string; lastName: string; photoUrl: string };
  services: { service: { id: string; name: string } }[];
  payment: { status: string } | null;
};

export type AdminService = {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  description: string;
  imageUrl: string;
};

export type AdminProfessional = {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  active: boolean;
  schedules: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart: string | null;
    breakEnd: string | null;
  }[];
};

export type AdminEmployee = AdminProfessional & {
  email: string | null;
  phone: string;
  cedula: string | null;
  salary: number;
  role: "admin" | "manager" | "receptionist" | "professional";
};

export type AdminPayment = {
  id: string;
  paymentNumber: string;
  concept: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  paymentMethod: string;
  status: string;
  notes: string;
  createdAt: string;
  employee: { id: string; firstName: string; lastName: string; role: string; cedula: string | null; photoUrl: string };
  processedBy: { id: string; firstName: string; lastName: string };
};

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
  active: boolean;
};

export type AdminSaleItem = {
  id: string;
  itemType: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminSale = {
  id: string;
  saleNumber: string;
  ncf: string | null;
  ncfType: string | null;
  customerName: string;
  customerRnc: string | null;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  customer: { id: string; firstName: string; lastName: string } | null;
  employee: { id: string; firstName: string; lastName: string };
  appointmentId: string | null;
  items: AdminSaleItem[];
};

export type AdminCashSession = {
  id: string;
  sessionNumber: string;
  openingAmount: number;
  openingNotes: string;
  openedAt: string;
  closedAt: string | null;
  countedCash: number | null;
  expectedCash: number | null;
  difference: number | null;
  closingNotes: string;
  status: string;
  reportEmailStatus: string;
  reportEmailTo: string;
  employee: { id: string; firstName: string; lastName: string; role: string };
  _count?: { sales: number };
};

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  appointmentsCount: number;
  lastVisit: string | null;
  nextAppointment: string | null;
  consentSignedAt: string | null;
};
