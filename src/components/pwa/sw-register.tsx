"use client";

import { useEffect } from "react";

/** Registers the service worker — required for the app to be installable as a PWA. Renders nothing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
