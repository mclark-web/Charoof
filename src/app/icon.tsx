import { ImageResponse } from "next/og";
import { MARK } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#143028",
          color: "#e4f07a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        {MARK}
      </div>
    ),
    { ...size },
  );
}
