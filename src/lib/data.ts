import { prisma } from "@/lib/prisma";
import { SERVICE_CATEGORIES } from "@/lib/constants";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  rostro: "Precisión facial para labio superior, mentón y mejillas.",
  axilas: "Sesión rápida, prácticamente indolora, resultados visibles.",
  brazos: "De hombro a muñeca, piel suave sin irritación.",
  piernas: "Desde media pierna hasta piernas completas.",
  bikini: "Protocolo de máxima suavidad y privacidad.",
  "cuerpo-completo": "Tratamiento integral para resultados parejos y progresivos.",
};

export async function getFeaturedTreatments() {
  const services = await prisma.service.findMany({ where: { active: true } });

  return SERVICE_CATEGORIES.map((cat) => {
    const inCategory = services.filter((s) => s.category === cat.value);
    const priceFrom = inCategory.length
      ? Math.min(...inCategory.map((s) => s.price))
      : null;
    return {
      category: cat.value,
      label: cat.label,
      description: CATEGORY_DESCRIPTIONS[cat.value] ?? "",
      priceFrom,
      serviceCount: inCategory.length,
    };
  }).filter((c) => c.serviceCount > 0);
}

export async function getActiveServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { price: "asc" }] });
}

export async function getActiveProfessionals() {
  return prisma.professional.findMany({
    where: { active: true, role: "professional" },
    orderBy: { firstName: "asc" },
  });
}
