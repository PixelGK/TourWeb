import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { getAppUrl } from "@/lib/server-env";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "BaliXperience — Private Bali Drivers & Experience Days",
    template: "%s | BaliXperience",
  },
  description: "Private Bali day trips with experienced local drivers, plus clearly bundled attraction and activity experiences.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BaliXperience",
    title: "BaliXperience — Private Bali Drivers & Experience Days",
    description: "Private Bali day trips with experienced local drivers, clear IDR pricing, and direct local support.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <body>{children}<Analytics /><SpeedInsights /></body>
    </html>
  );
}
