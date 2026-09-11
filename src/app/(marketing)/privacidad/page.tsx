import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SALON_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de Lasería.",
};

export default function PrivacidadPage() {
  return (
    <div className="py-16 lg:py-24">
      <Container className="max-w-3xl">
        <h1 className="font-display text-4xl text-ink">Política de privacidad</h1>
        <p className="mt-2 text-sm text-ink-muted">Última actualización: septiembre 2026</p>

        <div className="prose mt-10 space-y-6 text-sm leading-relaxed text-ink-soft">
          <p>
            En Lasería recopilamos únicamente los datos necesarios para gestionar tus reservas y
            brindarte un mejor servicio: nombre, apellido, email, teléfono y, opcionalmente, fecha
            de nacimiento.
          </p>
          <p>
            Tu información nunca se comparte con terceros con fines comerciales. Utilizamos tu
            email y teléfono exclusivamente para confirmaciones de cita, recordatorios y, si lo
            autorizas, promociones de Lasería.
          </p>
          <p>
            Puedes solicitar la actualización o eliminación de tus datos en cualquier momento
            desde tu perfil, o escribiéndonos a {SALON_INFO.email}.
          </p>
          <p>
            Las contraseñas se almacenan de forma cifrada y nunca son visibles para nuestro
            equipo.
          </p>
        </div>
      </Container>
    </div>
  );
}
