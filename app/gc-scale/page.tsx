import type { Metadata } from "next";
import { GcScaleView } from "@/components/gc-scale-view";

export const metadata: Metadata = {
  title: "GC Scale",
  description: "Grade Calibration, shown as a liquid gauge. STRONG, WEAK, PROVISIONAL, and EXIT LIQUIDITY at 0% fill.",
};

export default function GcScalePage() {
  return <GcScaleView />;
}
