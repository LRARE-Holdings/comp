"use client";

import { FormEvent, useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setIsError(false);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "landing_page",
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setEmail("");
      setMessage("Thanks. You're on the early-access list.");
    } catch {
      setIsError(true);
      setMessage("Could not save your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your work email"
          className="vara-input flex-1"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button
          type="submit"
          className="vara-btn-primary whitespace-nowrap disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Get early access"}
        </button>
      </div>
      <p className="text-vara-slate text-sm mt-4">
        14-day free trial. No credit card required.
      </p>
      {message ? (
        <p className={`text-sm mt-2 ${isError ? "text-vara-danger" : "text-vara-success"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
