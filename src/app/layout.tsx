import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Lasería | Depilación Láser",
    template: "%s | Lasería",
  },
  description:
    "Descubre Lasería, tu centro de depilación láser. Reserva tu cita online de forma rápida y sencilla.",
  keywords: [
    "depilación láser",
    "lasería",
    "centro de estética",
    "depilación láser precios",
    "reservar cita depilación láser",
  ],
  openGraph: {
    title: "Lasería | Depilación Láser",
    description:
      "Depilación láser avanzada para una piel suave, segura y libre de preocupaciones.",
    siteName: "Lasería",
    locale: "es_DO",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "Lasería",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        <ServiceWorkerRegister />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
