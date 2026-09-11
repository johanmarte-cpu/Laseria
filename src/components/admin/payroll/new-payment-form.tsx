"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FormField, Input, Label, Textarea } from "@/components/ui/form";
import { PAYMENT_CONCEPTS, PAYMENT_METHODS } from "@/lib/constants";
import { STAFF_ROLE_LABELS, type StaffRole } from "@/lib/roles";
import { formatMoney } from "@/lib/utils";

type EmployeeOption = { id: string; firstName: string; lastName: string; role: string; salary: number };

function startOfMonthStr() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function NewPaymentForm({ employees }: { employees: EmployeeOption[] }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [concept, setConcept] = useState<"salario" | "bono" | "adelanto" | "otro">("salario");
  const [periodStart, setPeriodStart] = useState(startOfMonthStr());
  const [periodEnd, setPeriodEnd] = useState(todayStr());
  const [grossAmount, setGrossAmount] = useState(employees[0]?.salary ?? 0);
  const [deductions, setDeductions] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("transfer");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEmployee = useMemo(() => employees.find((e) => e.id === employeeId), [employees, employeeId]);
  const netAmount = Math.max(0, grossAmount - deductions);
  const canSubmit = employeeId && grossAmount >= 0 && deductions <= grossAmount;

  function handleEmployeeChange(id: string) {
    setEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) setGrossAmount(emp.salary);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId,
        concept,
        periodStart,
        periodEnd,
        grossAmount,
        deductions,
        paymentMethod,
        notes,
      }),
    });

    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos registrar el pago.");
      return;
    }

    router.push(`/admin/pagos/${body.paymentId}`);
  }

  if (employees.length === 0) {
    return <Alert tone="info">No hay empleados activos para registrar un pago.</Alert>;
  }

  return (
    <div className="max-w-xl space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="rounded-2xl border border-line bg-white p-6">
        <Label htmlFor="employee">Empleado</Label>
        <select
          id="employee"
          value={employeeId}
          onChange={(e) => handleEmployeeChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} — {STAFF_ROLE_LABELS[e.role as StaffRole] ?? e.role}
            </option>
          ))}
        </select>
        {selectedEmployee && (
          <p className="mt-2 text-xs text-ink-muted">Sueldo base: {formatMoney(selectedEmployee.salary)}/mes</p>
        )}

        <div className="mt-4">
          <Label htmlFor="concept">Concepto</Label>
          <select
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value as typeof concept)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {PAYMENT_CONCEPTS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Período desde" htmlFor="period-start">
            <Input id="period-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </FormField>
          <FormField label="Período hasta" htmlFor="period-end">
            <Input id="period-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </FormField>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Monto bruto (RD$)" htmlFor="gross">
            <Input
              id="gross"
              type="number"
              min={0}
              step="0.01"
              value={grossAmount}
              onChange={(e) => setGrossAmount(Number(e.target.value) || 0)}
            />
          </FormField>
          <FormField label="Deducciones (RD$)" htmlFor="deductions" optional>
            <Input
              id="deductions"
              type="number"
              min={0}
              step="0.01"
              value={deductions}
              onChange={(e) => setDeductions(Number(e.target.value) || 0)}
            />
          </FormField>
        </div>

        <div className="mt-4">
          <Label htmlFor="payment-method">Método de pago</Label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <Label htmlFor="payment-notes">Notas</Label>
          <Textarea id="payment-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 text-sm">
        <div className="flex justify-between text-ink-soft">
          <span>Monto bruto</span>
          <span>{formatMoney(grossAmount)}</span>
        </div>
        <div className="mt-1 flex justify-between text-ink-soft">
          <span>Deducciones</span>
          <span>-{formatMoney(deductions)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-3 font-display text-xl text-ink">
          <span>Neto a pagar</span>
          <span>{formatMoney(netAmount)}</span>
        </div>
      </div>

      <Button size="lg" className="w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Registrar pago
      </Button>
    </div>
  );
}
