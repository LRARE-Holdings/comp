"use client";

import { FormEvent, useState } from "react";

type WaitlistFormProps = {
  source?: string;
  entryPoint?: string;
  buttonLabel?: string;
  helperText?: string;
  successMessage?: string;
  className?: string;
};

export function WaitlistForm({
  source = "landing_page",
  entryPoint = "hero",
  buttonLabel = "Get early access",
  helperText = "14-day free trial. No credit card required.",
  successMessage = "Thanks. You're on the early-access list.",
  className,
}: WaitlistFormProps) {
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
          source,
          entryPoint,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setEmail("");
      setMessage(successMessage);
    } catch {
      setIsError(true);
      setMessage("Could not save your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={["w-full max-w-md", className].filter(Boolean).join(" ")}
    >
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
          {isSubmitting ? "Submitting..." : buttonLabel}
        </button>
      </div>
      <p className="text-vara-slate text-sm mt-4">
        {helperText}
      </p>
      {message ? (
        <p className={`text-sm mt-2 ${isError ? "text-vara-danger" : "text-vara-success"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
