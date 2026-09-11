export const SERVICE_CATEGORIES = [
  { value: "rostro", label: "Rostro" },
  { value: "axilas", label: "Axilas" },
  { value: "brazos", label: "Brazos" },
  { value: "piernas", label: "Piernas" },
  { value: "bikini", label: "Bikini" },
  { value: "cuerpo-completo", label: "Cuerpo completo" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export function categoryLabel(value: string) {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const APPOINTMENT_STATUSES = [
  { value: "pending", label: "Pendiente", color: "status-pending" },
  { value: "confirmed", label: "Confirmada", color: "status-confirmed" },
  { value: "completed", label: "Completada", color: "status-completed" },
  { value: "cancelled", label: "Cancelada", color: "status-cancelled" },
  { value: "no_show", label: "No asistió", color: "status-noshow" },
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]["value"];

export function statusMeta(value: string) {
  return (
    APPOINTMENT_STATUSES.find((s) => s.value === value) ?? {
      value,
      label: value,
      color: "status-pending",
    }
  );
}

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "refunded", label: "Reembolsado" },
  { value: "cancelled", label: "Cancelado" },
] as const;

export const FIRST_AVAILABLE_ID = "any";

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
] as const;

export function paymentMethodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export const PRODUCT_CATEGORIES = [
  "Cuidado de la piel",
  "Post-tratamiento",
  "Protección solar",
  "Accesorios",
  "Otro",
] as const;

export const PAYMENT_CONCEPTS = [
  { value: "salario", label: "Salario" },
  { value: "bono", label: "Bono" },
  { value: "adelanto", label: "Adelanto" },
  { value: "otro", label: "Otro" },
] as const;

export function paymentConceptLabel(value: string) {
  return PAYMENT_CONCEPTS.find((c) => c.value === value)?.label ?? value;
}

export const LOW_STOCK_THRESHOLD = 5;

export const BUSINESS_HOURS = {
  openTime: "09:00",
  closeTime: "18:00",
  slotIntervalMinutes: 30,
};

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/tratamientos", label: "Tratamientos" },
  { href: "/precios", label: "Precios" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const SALON_INFO = {
  name: "Lasería",
  address: "Av. Winston Churchill 95, Piantini, Santo Domingo",
  phone: "+1 (809) 555-0142",
  whatsapp: "18095550142",
  instagram: "https://instagram.com/laseria",
  email: "hola@laseria.com",
  hours: [
    { days: "Lunes a viernes", time: "9:00 AM – 6:00 PM" },
    { days: "Sábados", time: "9:00 AM – 3:00 PM" },
    { days: "Domingos", time: "Cerrado" },
  ],
};
