import type { Metadata } from "next";
import { SHARE_IMAGE_URL } from "@/lib/site-urls";

export const HUB_DESCRIPTION =
  "The GradedCalls hub links the Sports, Analysts, FinTwit, and GCBot boards. Grade Calibration, shown as a liquid gauge: STRONG, WEAK, PROVISIONAL, or EXIT LIQUIDITY.";

const shareImage = {
  url: SHARE_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: "GradedCalls",
};

/** Absolute share tags. Child routes replace openGraph, so every field travels with the call.
 *  Omit `url` on the 404 so that page does not emit og:url. */
export function shareMeta(url?: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title: "GradedCalls",
      description: HUB_DESCRIPTION,
      ...(url ? { url } : {}),
      siteName: "GradedCalls",
      type: "website",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "GradedCalls",
      description: HUB_DESCRIPTION,
      images: [shareImage],
    },
  };
}
