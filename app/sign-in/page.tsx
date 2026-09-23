import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Public GradedCalls boards are open without an account.",
};

export default function SignInPage() {
  return (
    <section className="prose-panel panel">
      <div className="chip">Account</div>
      <h1>Boards are public</h1>
      <p>
        GradedCalls does not ask you to create an account to read a grade. Sign-in is not open on this surface. Browse
        the boards, the GC Scale, and the method instead.
      </p>
      <div className="hero-actions">
        <Link className="btn btn-primary" href="/#sectors">
          Browse grades
        </Link>
        <Link className="btn" href="/method">
          Read the method
        </Link>
      </div>
    </section>
  );
}
