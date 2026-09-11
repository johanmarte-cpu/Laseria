import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServicesTable } from "@/components/admin/services/services-table";

export const metadata: Metadata = { title: "Servicios" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });

  return <ServicesTable services={services} />;
}
