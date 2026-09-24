import { clampFill, displayFill, gradeForFill, type Grade, type GradeKey } from "@/lib/grade";

type Variant = "default" | "hero" | "mini" | "inline" | "sidebar" | "card";

type GcTubeProps = {
  fill: number;
  orientation?: "horizontal" | "vertical";
  variant?: Variant;
  label?: string;
  rich?: boolean;
  centered?: boolean;
  metaInline?: boolean;
  live?: boolean;
  className?: string;
  /** Overrides the fill cutoff. A short capper sample stays PROVISIONAL while the tube still shows the percentage. */
  grade?: Grade;
};

function join(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Liquid({ rich }: { rich: boolean }) {
  return (
    <div className="gc-liquid">
      <div className="gc-liquid-core" />
      <div className="gc-swirl" aria-hidden="true">
        {rich ? (
          <>
            <div className="vortex" />
            <div className="vortex vortex-b" />
            <div className="tex" />
            <div className="tex-b" />
            <div className="tex-c" />
            <div className="caustic" />
            <div className="caustic caustic-b" />
            <div className="orb orb-a" />
            <div className="orb orb-b" />
            <div className="orb orb-c" />
          </>
        ) : (
          <div className="tex" />
        )}
      </div>
      <div className="gc-liquid-sheen" />
      {rich ? <div className="gc-wave" /> : null}
      <div className="gc-meniscus" />
    </div>
  );
}

export function GcTube({
  fill,
  orientation = "horizontal",
  variant = "default",
  label = "GC Scale",
  rich = false,
  centered = false,
  metaInline = false,
  live = false,
  className,
  grade: gradeOverride,
}: GcTubeProps) {
  const caption = label === "GC" || label === "GC · Grade Calibration" ? "GC Scale" : label;
  const n = clampFill(fill);
  const shown = displayFill(n);
  const grade = gradeOverride ?? gradeForFill(n);
  const empty = n === 0 && grade.key === "exit";

  return (
    <div
      className={join(
        "gc-scale",
        orientation === "vertical" && "is-vertical",
        variant === "hero" && "is-hero",
        variant === "mini" && "is-mini",
        variant === "inline" && "is-inline",
        variant === "sidebar" && "is-sidebar",
        variant === "card" && "is-card",
        centered && "is-centered",
        empty && "is-empty",
        n === 100 && "is-full",
        live && "is-live",
        className,
      )}
      style={{ ["--gc-fill" as string]: `${n}%` }}
      role="img"
      aria-label={`${caption} ${shown}%, ${grade.name}${empty ? ", empty glass" : ""}`}
    >
      <div className="gc-glass">
        <div className="gc-bloom" aria-hidden="true" />
        <div className="gc-tube">
          <Liquid rich={rich} />
        </div>
      </div>
      <div className={join("gc-meta", metaInline && "is-row")}>
        <div className="gc-label">{caption}</div>
        <div className="gc-pct">{shown}%</div>
        <GradePill grade={grade.key} name={grade.name} />
      </div>
    </div>
  );
}

export function GradePill({ grade, name }: { grade: GradeKey; name: string }) {
  return <span className={`gc-grade-tag ${grade}`}>{name}</span>;
}
