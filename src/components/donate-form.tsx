"use client";

import { useState } from "react";

const AMOUNTS = ["5", "15", "40"];

export function DonateForm() {
  const [amount, setAmount] = useState("15");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-8 border border-line bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(
          `Nothing was charged. Charoof does not process payments in this demo, and a $${amount} selection is not a donation. There is no sportsbook balance and no paid pick.`,
        );
      }}
    >
      <fieldset>
        <legend className="text-sm font-medium text-ink">Support the ledger</legend>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Donations only. This form is not connected to a processor.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {AMOUNTS.map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-sm border px-4 py-2 text-sm ${
                amount === value ? "border-pine bg-pine text-paper" : "border-line bg-paper text-ink"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="amount"
                value={value}
                checked={amount === value}
                onChange={() => {
                  setAmount(value);
                  setMessage(null);
                }}
              />
              ${value}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" className="mt-5 bg-pine px-4 py-2 text-sm text-paper hover:bg-pine/90">
        Review donation
      </button>
      {message ? (
        <p role="status" className="mt-4 border border-brass/40 bg-listed-soft px-4 py-3 text-sm leading-6 text-ink">
          {message}
        </p>
      ) : null}
    </form>
  );
}
