"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shows a one-time email/password pair with a copy button — used after creating an employee or resetting their password. */
export function CredentialsReveal({
  email,
  password,
  onDone,
}: {
  email: string;
  password: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const credentialsText = `Email: ${email}\nContraseña: ${password}`;

  return (
    <>
      <div className="rounded-xl bg-beige p-4 font-mono text-sm text-ink">
        <p>Email: {email}</p>
        <p>Contraseña: {password}</p>
      </div>
      <div className="mt-4 flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            navigator.clipboard.writeText(credentialsText).catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button className="flex-1" onClick={onDone}>
          Listo
        </Button>
      </div>
    </>
  );
}
