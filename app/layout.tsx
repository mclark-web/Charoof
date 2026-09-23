import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const description =
  "Public claims, graded after the outcome. Analysts, FinTwit, Sports, and GCBot. The GC Scale is a neon tube: STRONG, WEAK, PROVISIONAL, or EXIT LIQUIDITY.";

export const metadata: Metadata = {
  applicationName: "GradedCalls",
  title: {
    default: "GradedCalls",
    template: "%s · GradedCalls",
  },
  description,
  openGraph: {
    title: "GradedCalls",
    description,
    siteName: "GradedCalls",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "GradedCalls",
    description,
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
