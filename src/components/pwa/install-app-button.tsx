"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Chrome/Android fire `beforeinstallprompt` and expose a native install
 * flow — we just replay it on click. iOS Safari has no such API (installing
 * there is Share → "Agregar a inicio"), so we show instructions instead of
 * a dead button. Renders nothing once already installed or when neither
 * path is available (e.g. desktop Safari/Firefox).
 */
export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) return null;
  if (!deferredPrompt && !isIOS) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setShowIOSHint((v) => !v);
    }
  }

  return (
    <div className="relative inline-block">
      <Button type="button" variant="secondary" size="lg" onClick={handleClick} className="w-full sm:w-auto">
        <Download className="h-4 w-4" strokeWidth={1.75} />
        Descargar app
      </Button>

      {showIOSHint && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-line bg-white p-4 text-xs text-ink-soft shadow-xl">
          Toca <strong className="text-ink">Compartir</strong> en el navegador y luego{" "}
          <strong className="text-ink">&ldquo;Agregar a inicio&rdquo;</strong> para instalar Lasería en tu teléfono.
          <button
            type="button"
            onClick={() => setShowIOSHint(false)}
            className="mt-2 block font-semibold text-ink underline underline-offset-2"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}
