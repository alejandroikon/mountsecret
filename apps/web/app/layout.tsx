import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { ProveedorPaneles } from "@/components/Paneles";
import { ProveedorEstado } from "@/lib/store";
import "./globals.css";

const cifra = Lexend({ subsets: ["latin"], weight: ["300", "600", "700"], variable: "--fuente-cifra", display: "swap" });
const ui = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], variable: "--fuente-ui", display: "swap" });
const cita = Source_Serif_4({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--fuente-cita", display: "swap" });

export const metadata: Metadata = {
  title: "LiveContracts · Contratista",
  description: "Sube tu contrato. Nosotros nos encargamos de que lo cumplas y lo cobres.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icono.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#140a20" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={`${cifra.variable} ${ui.variable} ${cita.variable}`} suppressHydrationWarning>
      <body>
        <ProveedorEstado>
          <ProveedorPaneles>{children}</ProveedorPaneles>
        </ProveedorEstado>
      </body>
    </html>
  );
}
