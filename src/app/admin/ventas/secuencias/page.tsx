import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNcfSequences } from "@/lib/ncf";
import { NcfSequencesForm } from "@/components/admin/sales/ncf-sequences-form";

export const metadata: Metadata = { title: "Secuencias NCF" };

export default async function NcfSequencesPage() {
  const session = await auth();
  // Fiscal sequence ranges are the one setting only an admin can touch —
  // a manager can run the sales module day to day but not reconfigure this.
  if (session?.user?.role !== "admin") redirect("/admin/ventas");

  const sequences = await getNcfSequences();

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Secuencias NCF</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Configura los rangos de comprobantes fiscales autorizados por la DGII. Al confirmar una venta, el sistema
        asigna automáticamente el siguiente número disponible del tipo seleccionado.
      </p>

      <div className="mt-8 max-w-xl">
        <NcfSequencesForm sequences={sequences} />
      </div>
    </div>
  );
}
