import { z } from "zod";

// Letras (con acentos/ñ), espacios, apóstrofes y guiones únicamente — sin
// dígitos ni etiquetas/caracteres HTML (`<`, `>`, etc.). Cada palabra debe
// empezar con una letra.
export const NAME_REGEX = /^\p{L}[\p{L}\p{M}'-]*(?:\s[\p{L}\p{M}'-]+)*$/u;
export const NAME_MESSAGE = "Solo se permiten letras";

// Teléfono dominicano: código de área 809, 829 u 849, con o sin +1 y con o
// sin formato (espacios, guiones, paréntesis) — p. ej. "(809) 555-4477",
// "+1 809 555 4477" u "8095554477".
export const DR_PHONE_REGEX = /^(?:\+?1[\s.-]?)?\(?(?:809|829|849)\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
export const PHONE_MESSAGE = "Ingresa un teléfono dominicano válido (809, 829 u 849)";

// Note: fields that back a react-hook-form + zodResolver form deliberately
// avoid `.optional().default(...)` — with zod v4 that makes the resolver's
// input type diverge from its output type, which @hookform/resolvers can't
// reconcile against useForm<T>() where T is the (defaulted) output type.
// Instead these are required in the schema and the calling form/route
// supplies the default explicitly (defaultValues on the form, `?? fallback`
// in the API handler).

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Ingresa tu nombre").regex(NAME_REGEX, NAME_MESSAGE),
    lastName: z.string().trim().min(2, "Ingresa tu apellido").regex(NAME_REGEX, NAME_MESSAGE),
    email: z.string().trim().email("Ingresa un email válido"),
    phone: z.string().trim().regex(DR_PHONE_REGEX, PHONE_MESSAGE),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
    marketingOptIn: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const customerInfoSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tu nombre").regex(NAME_REGEX, NAME_MESSAGE),
  lastName: z.string().trim().min(2, "Ingresa tu apellido").regex(NAME_REGEX, NAME_MESSAGE),
  email: z.string().trim().email("Ingresa un email válido"),
  phone: z.string().trim().regex(DR_PHONE_REGEX, PHONE_MESSAGE),
  birthDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  wantsReminders: z.boolean(),
});

export type CustomerInfoInput = z.infer<typeof customerInfoSchema>;

export const createAppointmentSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "Selecciona al menos un tratamiento"),
  professionalId: z.string().min(1, "Selecciona una profesional"),
  date: z.string().min(1, "Selecciona una fecha"),
  startTime: z.string().min(1, "Selecciona un horario"),
  customer: customerInfoSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const serviceFormSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().min(5).max(480),
  price: z.number().min(0),
  imageUrl: z.string().min(1),
  active: z.boolean(),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export const professionalFormSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  specialty: z.string().min(2),
  bio: z.string(),
  photoUrl: z.string().min(1),
  active: z.boolean(),
});

export type ProfessionalFormInput = z.infer<typeof professionalFormSchema>;

// Unified "Empleados" form — covers every staff role. `specialty`/`bio` are
// only meaningful (and only shown in the UI) when role === "professional".
export const employeeFormSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa el nombre").regex(NAME_REGEX, NAME_MESSAGE),
  lastName: z.string().trim().min(2, "Ingresa el apellido").regex(NAME_REGEX, NAME_MESSAGE),
  email: z.string().trim().email("Ingresa un email válido"),
  phone: z.string().trim().refine((v) => v === "" || DR_PHONE_REGEX.test(v), PHONE_MESSAGE),
  cedula: z.string(),
  salary: z.number().min(0),
  role: z.enum(["admin", "manager", "receptionist", "professional"]),
  specialty: z.string(),
  bio: z.string(),
  photoUrl: z.string().min(1),
  active: z.boolean(),
});

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tu nombre").regex(NAME_REGEX, NAME_MESSAGE),
  lastName: z.string().trim().min(2, "Ingresa tu apellido").regex(NAME_REGEX, NAME_MESSAGE),
  phone: z.string().trim().regex(DR_PHONE_REGEX, PHONE_MESSAGE),
  birthDate: z.string().optional().or(z.literal("")),
  marketingOptIn: z.boolean(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const adminCreateAppointmentSchema = z.object({
  customerId: z.string().optional(),
  newCustomer: z
    .object({
      firstName: z.string().trim().min(2, "Ingresa el nombre").regex(NAME_REGEX, NAME_MESSAGE),
      lastName: z.string().trim().min(2, "Ingresa el apellido").regex(NAME_REGEX, NAME_MESSAGE),
      email: z.string().trim().email("Ingresa un email válido"),
      phone: z.string().trim().regex(DR_PHONE_REGEX, PHONE_MESSAGE),
    })
    .optional(),
  professionalId: z.string().min(1),
  serviceIds: z.array(z.string()).min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  notes: z.string(),
  status: z.enum(["pending", "confirmed"]),
});

export type AdminCreateAppointmentInput = z.infer<typeof adminCreateAppointmentSchema>;

export const adminUpdateAppointmentSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]).optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  professionalId: z.string().optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "cancelled"]).optional(),
});

export type AdminUpdateAppointmentInput = z.infer<typeof adminUpdateAppointmentSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const productFormSchema = z.object({
  name: z.string().min(2, "Ingresa el nombre"),
  sku: z.string().min(1, "Ingresa un SKU"),
  category: z.string(),
  description: z.string(),
  price: z.number().min(0),
  cost: z.number().min(0),
  stock: z.number().int().min(0),
  imageUrl: z.string(),
  active: z.boolean(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const saleItemInputSchema = z.object({
  itemType: z.enum(["product", "service"]),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  name: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional().default(""),
  customerRnc: z.string().optional(),
  appointmentId: z.string().optional(),
  ncfType: z.enum(["B01", "B02"]),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  discount: z.number().min(0).optional().default(0),
  notes: z.string().optional().default(""),
  items: z.array(saleItemInputSchema).min(1, "Agrega al menos un producto o servicio"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export const ncfSequenceUpdateSchema = z.object({
  ncfType: z.enum(["B01", "B02"]),
  nextNumber: z.number().int().min(1),
  endNumber: z.number().int().min(1),
});

export type NcfSequenceUpdateInput = z.infer<typeof ncfSequenceUpdateSchema>;

export const createPaymentSchema = z
  .object({
    employeeId: z.string().min(1, "Selecciona un empleado"),
    concept: z.enum(["salario", "bono", "adelanto", "otro"]),
    periodStart: z.string().min(1, "Selecciona el inicio del período"),
    periodEnd: z.string().min(1, "Selecciona el fin del período"),
    grossAmount: z.number().min(0),
    deductions: z.number().min(0),
    paymentMethod: z.enum(["cash", "card", "transfer"]),
    notes: z.string().optional().default(""),
  })
  .refine((data) => data.deductions <= data.grossAmount, {
    message: "Las deducciones no pueden superar el monto bruto",
    path: ["deductions"],
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const openCashSessionSchema = z.object({
  openingAmount: z.number().min(0),
  notes: z.string().optional().default(""),
});

export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>;

export const closeCashSessionSchema = z.object({
  countedCash: z.number().min(0),
  notes: z.string().optional().default(""),
});

export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>;

export const signConsentSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingresa tu nombre completo").regex(NAME_REGEX, NAME_MESSAGE),
    cedula: z.string().optional().default(""),
    acceptedTreatment: z.boolean(),
    acceptedPhotos: z.boolean(),
  })
  .refine((data) => data.acceptedTreatment === true, {
    message: "Debes leer y aceptar el consentimiento para continuar",
    path: ["acceptedTreatment"],
  });

export type SignConsentInput = z.infer<typeof signConsentSchema>;
