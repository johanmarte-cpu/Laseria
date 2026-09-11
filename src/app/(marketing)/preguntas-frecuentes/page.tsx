import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Resolvemos las dudas más comunes sobre la depilación láser en Lasería.",
};

const FAQS = [
  {
    question: "¿Cuántas sesiones necesito para ver resultados?",
    answer:
      "La mayoría de nuestras clientas ve una reducción notable del vello entre la 3ra y 4ta sesión, con un protocolo completo de 6 a 8 sesiones espaciadas cada 4-6 semanas.",
  },
  {
    question: "¿Puedo cancelar o reprogramar mi cita?",
    answer:
      "Sí, puedes cancelar o reprogramar tu cita desde tu panel de cliente hasta con algunas horas de anticipación, sin ningún cargo adicional.",
  },
  {
    question: "¿Qué debo hacer antes de mi sesión?",
    answer:
      "Te recomendamos rasurar la zona 24 horas antes (no depilar con cera ni pinza), evitar exposición solar directa y llegar con la piel limpia, sin cremas ni perfumes.",
  },
  {
    question: "¿La depilación láser duele?",
    answer:
      "La mayoría de las clientas describe una sensación de calor leve o un ligero cosquilleo, muy tolerable gracias a nuestra tecnología de última generación con sistema de enfriamiento.",
  },
  {
    question: "¿Es apta para todo tipo de piel?",
    answer:
      "Nuestros equipos están certificados para tratar distintos fototipos de piel. En tu primera cita evaluamos tu piel y vello para personalizar el protocolo.",
  },
  {
    question: "¿Cómo reservo mi primera cita?",
    answer:
      'Puedes reservar directamente desde el botón "Reservar cita": elige tu tratamiento, profesional, fecha y hora, y confirma tus datos. Recibirás una confirmación inmediata por email.',
  },
  {
    question: "¿Ofrecen pagos en línea?",
    answer:
      "Actualmente puedes reservar sin pago por adelantado y abonar en el centro. Muy pronto habilitaremos pagos en línea para mayor comodidad.",
  },
];

export default function FaqPage() {
  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            Ayuda
          </span>
          <h1 className="mt-3 font-display text-5xl text-ink">Preguntas frecuentes</h1>
          <p className="mt-4 text-ink-muted">
            Todo lo que necesitas saber antes de reservar tu tratamiento.
          </p>
        </div>

        <div className="mt-14">
          <FaqAccordion items={FAQS} />
        </div>
      </Container>
    </div>
  );
}
