import Image from "next/image";
import Link from "next/link";

export function LogoLink() {
  return (
    <Link className="brand" href="/" aria-label="GradedCalls">
      <Image
        className="brand-mark"
        src="/gradedcalls-mark.png"
        alt="GradedCalls"
        width={44}
        height={44}
        loading="eager"
      />
      <span className="brand-name">
        Graded<span>Calls</span>
      </span>
    </Link>
  );
}
