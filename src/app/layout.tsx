import type { Metadata, Viewport } from "next";
import { Barlow, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/chrome";
import { PRODUCT, SITE_DESCRIPTION, UMBRELLA } from "@/lib/brand";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: PRODUCT,
    template: `%s · ${PRODUCT}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: PRODUCT,
  openGraph: {
    title: PRODUCT,
    description: SITE_DESCRIPTION,
    siteName: PRODUCT,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PRODUCT,
    description: SITE_DESCRIPTION,
  },
  authors: [{ name: UMBRELLA }],
  creator: UMBRELLA,
};

export const viewport: Viewport = {
  themeColor: "#143028",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${newsreader.variable} ${plex.variable}`}>
      <body className="font-sans antialiased">
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
