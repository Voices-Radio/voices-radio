"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { accountTextAreaClassName } from "../components/account-surface";
import { BIO_MAX_LENGTH, formatCount } from "./profile-limits";

const COUNT_ID = "bio-count";

/**
 * The bio textarea with a live character count. No `maxLength`: a browser
 * cut silently drops the end of a pasted bio. The count turns red instead,
 * and the server action names the problem if the DJ submits anyway.
 */
export default function BioField({
  defaultValue,
  reasonId,
}: {
  defaultValue: string;
  reasonId?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);
  const over = length - BIO_MAX_LENGTH;
  const describedBy = [reasonId, COUNT_ID].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="bio"
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        Bio
      </label>
      <textarea
        id="bio"
        name="bio"
        defaultValue={defaultValue}
        onChange={(event) => setLength(event.target.value.length)}
        aria-describedby={describedBy}
        aria-invalid={over > 0 || undefined}
        rows={6}
        className={accountTextAreaClassName}
      />
      <p
        id={COUNT_ID}
        className={cn(
          "font-asap text-xs",
          over > 0 ? "text-red-400" : "text-voicesNext-cream/60",
        )}
      >
        {over > 0
          ? `${formatCount(length)} / ${formatCount(BIO_MAX_LENGTH)} characters. Remove ${formatCount(over)} characters to submit.`
          : `${formatCount(length)} / ${formatCount(BIO_MAX_LENGTH)} characters`}
      </p>
    </div>
  );
}
