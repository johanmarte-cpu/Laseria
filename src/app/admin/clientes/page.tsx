import type { Metadata } from "next";
import { getAdminCustomers } from "@/lib/admin-data";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata: Metadata = { title: "Clientes" };

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Clientes</h1>
      <p className="mt-2 text-ink-muted">{customers.length} clientes registrados.</p>

      <div className="mt-6">
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
