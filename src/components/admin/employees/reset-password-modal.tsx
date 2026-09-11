"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CredentialsReveal } from "@/components/admin/employees/credentials-reveal";
import type { AdminEmployee } from "@/components/admin/types";

export function ResetPasswordModal({ employee, onClose }: { employee: AdminEmployee; onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/employees/${employee.id}/reset-password`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "No pudimos restablecer la contraseña.");
      return;
    }

    setNewPassword(body.tempPassword);
    router.refresh();
  }

  if (newPassword) {
    return (
      <Modal title="Contraseña restablecida" onClose={onClose}>
        <Alert tone="success" className="mb-4">
          Comparte esta contraseña temporal con {employee.firstName} — puede cambiarla luego desde su perfil.
        </Alert>
        <CredentialsReveal email={employee.email ?? ""} password={newPassword} onDone={onClose} />
      </Modal>
    );
  }

  return (
    <Modal title="Restablecer contraseña" onClose={onClose}>
      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      <p className="text-sm text-ink-soft">
        Se generará una nueva contraseña temporal para{" "}
        <span className="font-medium text-ink">
          {employee.firstName} {employee.lastName}
        </span>
        , reemplazando la actual. Deberás compartírsela para que pueda iniciar sesión de nuevo.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleConfirm} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Restablecer
        </Button>
      </div>
    </Modal>
  );
}
