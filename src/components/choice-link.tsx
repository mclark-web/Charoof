import Link from "next/link";

export function ChoiceLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`rounded-sm px-3 py-1.5 text-sm ${
        current ? "bg-pine text-paper" : "border border-line bg-card text-ink hover:border-pine"
      }`}
    >
      {children}
    </Link>
  );
}
