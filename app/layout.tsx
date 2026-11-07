import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Susanna Ziesmer",
    template: "%s · Susanna Ziesmer",
  },
  description:
    "Portfolio of Susanna Ziesmer, psychology and music student at Southern Adventist University.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${baskerville.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
