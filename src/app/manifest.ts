import type { MetadataRoute } from "next";

// Next.js serves this at /manifest.webmanifest and auto-injects the
// <link rel="manifest"> tag on every page — no manual <head> wiring needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lasería — Depilación Láser",
    short_name: "Lasería",
    description: "Reserva y gestiona tus citas de depilación láser en Lasería.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0ea",
    theme_color: "#171717",
    lang: "es-DO",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
