import type { Metadata } from "next";
import { GcScaleView } from "@/components/gc-scale-view";

export const metadata: Metadata = {
  title: "GC Scale",
  description: "Grade Calibration as a neon tube. Strong, Weak, Provisional, and exit liquidity at 0% fill.",
};

export default function GcScalePage() {
  return <GcScaleView />;
}
