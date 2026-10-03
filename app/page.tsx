import Link from "next/link";
import { GcTube, GradePill } from "@/components/gc-tube";
import { SectorCard } from "@/components/sector-board";
import { sectorBooks, type SectorBook } from "@/lib/books";
import { GRADE_BANDS } from "@/lib/grade";

export const revalidate = 300;

/** Card stat only. The sports page still reads the tube hero from the book. */
function sportsBoardCard(book: SectorBook): SectorBook {
  if (book.hero.kind !== "tube") return book;
  const headline = book.hero.card.replace(/^\d+ public picks · /, "");
  return {
    ...book,
    hero: {
      kind: "count",
      value: headline,
      card: "",
      hint: book.hero.hint,
    },
  };
}

export default function HubPage() {
  const books = sectorBooks();
  return (
    <>
      <h1 className="section-label" id="sectors">
        Boards
      </h1>
      <div className="sector-grid">
        {books.map((book) => (
          <SectorCard key={book.sector.key} book={book.sector.key === "sports" ? sportsBoardCard(book) : book} />
        ))}
      </div>

      <section className="panel method-gc" aria-labelledby="hub-gc-scale">
        <div>
          <h2 id="hub-gc-scale">GC Scale</h2>
          <p>
            <GradePill grade="strong" name="STRONG" /> is {GRADE_BANDS.strongAt}% and above.{" "}
            <GradePill grade="provisional" name="PROVISIONAL" /> is from {GRADE_BANDS.weakAt}% up to{" "}
            {GRADE_BANDS.strongAt}%. <GradePill grade="weak" name="WEAK" /> is under {GRADE_BANDS.weakAt}%. A graded 0%
            is <GradePill grade="exit" name="EXIT LIQUIDITY" />.
          </p>
          <p>Under 10 graded picks in 90 days, the grade stays PROVISIONAL.</p>
          <p className="method-link">
            <Link className="hit-44" href="/method#gc-scale">
              Method
            </Link>
          </p>
        </div>
        <div className="method-example">
          <GcTube fill={72} rich centered label="GC Scale" className="method-tube" />
          <p className="tube-example">Example: 72% with 10+ graded picks in 90 days</p>
        </div>
      </section>
    </>
  );
}
