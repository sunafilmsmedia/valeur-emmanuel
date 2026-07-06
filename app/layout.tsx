import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import Clarity from "@/components/Clarity";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif d'affichage lourd et contrasté — look éditorial « The Agency ».
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Emmanuel Bouchard — Calculateur Net Vendeur (Rive-Sud)",
  description:
    "Découvre combien il te resterait vraiment après la vente de ta propriété : hypothèque, pénalité, commission, taxes et frais. Une estimation claire et chiffrée avec Emmanuel Bouchard, courtier immobilier sur la Rive-Sud et ancien comptable.",
  openGraph: {
    title: "Combien te resterait-il vraiment après la vente ?",
    description:
      "Calculateur Net Vendeur — Emmanuel Bouchard, courtier immobilier sur la Rive-Sud et ancien comptable.",
    locale: "fr_CA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <body className="min-h-screen antialiased">
        <MetaPixel />
        <Clarity />
        {children}
      </body>
    </html>
  );
}
