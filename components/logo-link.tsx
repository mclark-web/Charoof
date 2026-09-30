import Image from "next/image";
import Link from "next/link";

const markStyle = {
  width: 44,
  height: 44,
  display: "block",
  flex: "0 0 44px",
  backgroundColor: "transparent",
} as const;

export function LogoLink() {
  return (
    <Link className="brand" href="/" aria-label="GradedCalls" style={{ minWidth: 44, minHeight: 44 }}>
      <Image
        className="brand-mark"
        src="/gradedcalls-mark.png"
        alt="GradedCalls"
        width={44}
        height={44}
        unoptimized
        loading="eager"
        style={markStyle}
      />
      <span className="brand-name">
        Graded<span>Calls</span>
      </span>
    </Link>
  );
}
