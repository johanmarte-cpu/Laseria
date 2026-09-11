import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso de Lasería.",
};

export default function TerminosPage() {
  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-3xl">
        <h1 className="font-display text-4xl text-ink">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-ink-muted">Última actualización: septiembre 2026</p>

        <div className="prose mt-10 space-y-6 text-sm leading-relaxed text-ink-soft">
          <p>
            Al reservar una cita en Lasería aceptas nuestras políticas de reserva, cancelación y
            reprogramación descritas a continuación.
          </p>
          <p>
            <strong className="text-ink">Cancelaciones:</strong> puedes cancelar o reprogramar tu
            cita sin costo desde tu panel de cliente con al menos algunas horas de anticipación.
          </p>
          <p>
            <strong className="text-ink">Puntualidad:</strong> te recomendamos llegar 10 minutos
            antes de tu cita. Las llegadas tardías pueden implicar reducción del tiempo de
            tratamiento.
          </p>
          <p>
            <strong className="text-ink">Resultados:</strong> los resultados de la depilación
            láser varían según cada persona y requieren de un protocolo de sesiones completo para
            ser evaluados correctamente.
          </p>
          <p>
            <strong className="text-ink">Pagos:</strong> el pago se realiza en el centro al
            finalizar la sesión, salvo que se indique lo contrario al momento de reservar.
          </p>
        </div>
      </Container>
    </div>
  );
}
