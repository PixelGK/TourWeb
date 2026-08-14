import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";

import "./globals.css";

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
  title: {
    default: "BaliXperience — Private Bali Drivers & Experience Days",
    template: "%s | BaliXperience",
  },
  description: "Private Bali day trips with experienced local drivers, plus clearly bundled attraction and activity experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${sourceSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
