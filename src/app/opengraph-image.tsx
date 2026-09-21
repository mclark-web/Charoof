import { ImageResponse } from "next/og";
import { CHAD, CHUD, FAMILY, MARK, PRODUCT, UMBRELLA } from "@/lib/brand";

export const alt = `${PRODUCT} — ${UMBRELLA}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#143028",
          color: "#f4efe4",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#e4f07a", fontSize: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#0d221c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {MARK}
          </div>
          {UMBRELLA}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, lineHeight: 1 }}>{PRODUCT}</div>
          <div style={{ fontSize: 28, color: "#e4f07a" }}>{FAMILY.map((item) => item.label).join("  ·  ")}</div>
          <div style={{ fontSize: 26, color: "#f4efe4" }}>
            {`${CHAD.name}: ${CHAD.means}. ${CHUD.name}: ${CHUD.means}.`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
