import type { Metadata } from "next";
import { Barlow_Condensed, Fraunces, Source_Sans_3 } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Charoof — measure the claim after the outcome",
    template: "%s · Charoof",
  },
  description:
    "Charoof is a public record with four branches: Analysts, FinTwit, Sports, and Charoof Bot. Claims are graded after the outcome. Accountability in an age of market FOMO, prediction craze, and loud anonymous voices.",
  applicationName: "Charoof",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${fraunces.variable} ${barlow.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="absolute left-4 top-4 z-50 -translate-y-24 bg-pine px-3 py-2 text-sm text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
