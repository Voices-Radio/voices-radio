"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { accountSecondaryButtonClassName } from "../components/account-surface";
import { withdrawProfileReviewAction } from "./actions";

const CONFIRM_TEXT =
  "Withdraw this request? Your live profile stays as it is. You can then edit your changes and submit them again.";

/**
 * Lets a DJ cancel their pending profile request, so the form unlocks. It is
 * a plain button that calls the server action directly, not a submit button:
 * it sits inside the profile form, and a submit would post the whole form.
 * On success the action revalidates the page, which re-renders the form
 * with the request marked withdrawn.
 */
export default function WithdrawRequest() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function withdraw() {
    if (!window.confirm(CONFIRM_TEXT)) return;
    setError(null);
    startTransition(async () => {
      const result = await withdrawProfileReviewAction();
      if (result?.status === "error") setError(result.message);
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <button
        type="button"
        onClick={withdraw}
        disabled={isPending}
        aria-busy={isPending}
        className={cn(accountSecondaryButtonClassName, "h-10 self-start px-4 text-sm")}
      >
        {isPending ? "Withdrawing…" : "Withdraw request"}
      </button>
      {error && (
        <p role="alert" className="font-asap text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
