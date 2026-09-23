import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GradedCalls",
    template: "%s · GradedCalls",
  },
  description:
    "Public claims, graded after the outcome. Grade Calibration is a neon tube: Strong, Weak, Provisional, or exit liquidity.",
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
