import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/products/products-table";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return <ProductsTable products={products} />;
}
