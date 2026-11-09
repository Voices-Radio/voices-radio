"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  accountFieldClassName,
  accountSecondaryButtonClassName,
} from "../account/components/account-surface";

type Outcome = { status: "sent" | "error"; message: string } | null;

/**
 * "Send me a new link". With `email` known (just signed up, or a failed
 * sign-in) it is one button; without (an expired link, where the address
 * isn't in the URL) it asks for it.
 */
export default function ResendVerification({
  email,
  next,
}: {
  email?: string;
  next?: string;
}) {
  const [typedEmail, setTypedEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const target = email ?? typedEmail;

  async function resend(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target, next }),
      });
      const body = (await response.json().catch(() => null)) as Outcome;
      setOutcome(
        body?.message
          ? body
          : {
              status: "error",
              message:
                response.status === 429
                  ? "Too many attempts. Please wait a while and try again."
                  : "We couldn't send the email just now. Please try again shortly.",
            },
      );
    } catch {
      setOutcome({
        status: "error",
        message: "We couldn't send the email just now. Please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={resend} className="flex flex-col items-center gap-3">
      {!email && (
        <>
          <label
            htmlFor="resend-email"
            className="font-gabarito text-sm font-bold text-voicesNext-cream"
          >
            Email
          </label>
          <input
            id="resend-email"
            type="email"
            autoComplete="email"
            required
            value={typedEmail}
            onChange={(e) => setTypedEmail(e.target.value)}
            className={cn(accountFieldClassName, "max-w-[320px]")}
          />
        </>
      )}
      <button
        type="submit"
        disabled={pending || !target}
        aria-busy={pending}
        className={cn(accountSecondaryButtonClassName, "h-11 px-5 text-sm")}
      >
        {pending ? "Sending…" : "Send me a new link"}
      </button>
      {outcome && (
        <p
          role={outcome.status === "error" ? "alert" : "status"}
          className="max-w-[420px] font-gabarito text-sm text-voicesNext-cream/90"
        >
          {outcome.message}
        </p>
      )}
    </form>
  );
}
