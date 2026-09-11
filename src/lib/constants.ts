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

export const CONSENT_FORM_VERSION = "v1";

export const CONSENT_FORM_SECTIONS = [
  {
    title: "Descripción del procedimiento",
    body: "La depilación láser utiliza pulsos de luz concentrada que son absorbidos por la melanina del folículo piloso, generando calor que inhibe el crecimiento del vello. Se requieren varias sesiones para obtener resultados óptimos, ya que el tratamiento solo es efectivo en folículos en fase de crecimiento activo.",
  },
  {
    title: "Riesgos y efectos secundarios posibles",
    body: "Enrojecimiento, sensibilidad o hinchazón leve alrededor del folículo (normalmente desaparece en horas); cambios temporales en la pigmentación de la piel tratada; en casos poco frecuentes, ampollas, foliculitis o alteraciones permanentes de pigmentación, especialmente en pieles bronceadas o con exposición solar reciente.",
  },
  {
    title: "Contraindicaciones — declaro que he informado al personal si tengo",
    body: "Embarazo o lactancia; uso de medicamentos fotosensibilizantes (retinoides, antibióticos, etc.); exposición solar o bronceado artificial en las últimas 2 semanas; infecciones activas, heridas abiertas o afecciones de la piel en la zona a tratar; antecedentes de queloides o cicatrización anormal; epilepsia u otras condiciones médicas relevantes.",
  },
  {
    title: "Recomendaciones antes y después de cada sesión",
    body: "Rasurar (no depilar con cera ni pinza) la zona 24 horas antes de la cita; evitar exposición solar directa y usar protector solar SPF 50+ durante las semanas posteriores; no aplicar cremas, perfumes o desodorantes en la zona el día del tratamiento; evitar duchas muy calientes y ejercicio intenso el mismo día de la sesión.",
  },
  {
    title: "Declaración de conformidad",
    body: `He leído y comprendido la información anterior. Entiendo que los resultados varían según cada persona y tipo de vello/piel, que ${SALON_INFO.name} no garantiza la eliminación total y permanente del vello, y que es mi responsabilidad informar cualquier condición médica relevante antes de cada sesión. Autorizo al personal de ${SALON_INFO.name} a realizar el tratamiento de depilación láser en las zonas acordadas.`,
  },
  {
    title: "Protección de datos personales",
    body: "Los datos suministrados en este formulario serán tratados de forma confidencial conforme a la Ley No. 172-13 sobre Protección de Datos de Carácter Personal de la República Dominicana, y usados únicamente para fines clínicos y administrativos de tu tratamiento.",
  },
] as const;
