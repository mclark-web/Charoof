import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const description =
  "The GradedCalls hub links the Sports, Analysts, FinTwit, and GCBot boards. Grade Calibration, shown as a liquid gauge: STRONG, WEAK, PROVISIONAL, or EXIT LIQUIDITY.";

export const metadata: Metadata = {
  applicationName: "GradedCalls",
  title: {
    default: "GradedCalls",
    template: "%s · GradedCalls",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "GradedCalls",
    description,
    siteName: "GradedCalls",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GradedCalls",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GradedCalls",
    description,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GradedCalls",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="wrap">
          {children}
          <SiteFooter />
        </main>
      </body>
    </html>
  );
}
