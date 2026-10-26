import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_URL } from "@/lib/site-urls";
import { HUB_DESCRIPTION, shareMeta } from "@/lib/share-meta";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "GradedCalls",
  title: {
    default: "GradedCalls",
    template: "%s · GradedCalls",
  },
  description: HUB_DESCRIPTION,
  ...shareMeta(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
        <main id="content" className="wrap" tabIndex={-1}>
          {children}
          <SiteFooter />
        </main>
      </body>
    </html>
  );
}
