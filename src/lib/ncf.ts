import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const NCF_TYPES = [
  { value: "B01", label: "Crédito Fiscal", requiresRnc: true },
  { value: "B02", label: "Consumo", requiresRnc: false },
] as const;

export type NcfType = (typeof NCF_TYPES)[number]["value"];

export function ncfTypeMeta(value: string) {
  return NCF_TYPES.find((t) => t.value === value) ?? NCF_TYPES[1];
}

function formatNcf(ncfType: string, number: number) {
  return `${ncfType}${String(number).padStart(8, "0")}`;
}

export type NcfResult =
  | { ok: true; ncf: string }
  | { ok: false; error: string };

/**
 * Atomically claims the next NCF number for a given type. Must run inside
 * the same Prisma transaction as the Sale creation so a failed sale never
 * burns a number, and two concurrent sales never get the same one.
 */
export async function claimNextNcf(
  tx: Prisma.TransactionClient,
  ncfType: string
): Promise<NcfResult> {
  const sequence = await tx.ncfSequence.findUnique({ where: { ncfType } });
  if (!sequence) {
    return { ok: false, error: `No hay una secuencia NCF configurada para ${ncfType}.` };
  }
  if (sequence.nextNumber > sequence.endNumber) {
    return {
      ok: false,
      error: `La secuencia de NCF ${ncfType} se agotó. Configura un nuevo rango en Ventas > Secuencias NCF.`,
    };
  }

  const ncf = formatNcf(ncfType, sequence.nextNumber);
  await tx.ncfSequence.update({
    where: { ncfType },
    data: { nextNumber: sequence.nextNumber + 1 },
  });

  return { ok: true, ncf };
}

export async function getNcfSequences() {
  return prisma.ncfSequence.findMany({ orderBy: { ncfType: "asc" } });
}
