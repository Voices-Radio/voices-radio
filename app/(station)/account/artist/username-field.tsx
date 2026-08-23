"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { lookupUsernameAction, type LookupState } from "./actions";
import type { ProfileLookupPlatform } from "@/lib/voices/membership/artist-profile-client";
import { accountFieldClassName } from "../components/account-surface";

const DEBOUNCE_MS = 600;

type Status = LookupState | { status: "idle" } | { status: "checking" };

/**
 * Mixcloud/SoundCloud username field with a debounced "does this exist?"
 * check. Advisory only — see lookupUsernameAction and
 * services/profileLookup.js for why the field must still be saveable on
 * 'not_found' or 'unavailable': a brand-new account, a private one, or a
 * platform outage are all real, valid states for a DJ's username to be in.
 */
export default function UsernameField({
  id,
  name,
  label,
  platform,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  platform: ProfileLookupPlatform;
  defaultValue?: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [lookup, setLookup] = useState<Status>({ status: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function scheduleCheck(next: string) {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!next.trim()) {
      setLookup({ status: "idle" });
      return;
    }

    setLookup({ status: "checking" });
    const requestId = ++requestIdRef.current;

    timerRef.current = setTimeout(() => {
      lookupUsernameAction(platform, next).then((result) => {
        // A later keystroke already started a newer check — drop this reply.
        if (requestIdRef.current === requestId) setLookup(result);
      });
    }, DEBOUNCE_MS);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    scheduleCheck(event.target.value);
  }

  const platformLabel = platform === "mixcloud" ? "Mixcloud" : "SoundCloud";

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleChange}
        className={accountFieldClassName}
      />
      <p role="status" aria-live="polite" className="font-gabarito text-xs">
        {lookup.status === "checking" && (
          <span className="text-voicesNext-cream/60">
            Checking {platformLabel}…
          </span>
        )}
        {lookup.status === "found" && (
          <span className="text-voicesNext-cream/80">
            ✓ Found: {lookup.displayName}
          </span>
        )}
        {lookup.status === "not_found" && (
          <span className="text-voicesNext-orange">
            We couldn&apos;t find this {platformLabel} account. You can still
            save it.
          </span>
        )}
        {lookup.status === "unavailable" && (
          <span className="text-voicesNext-cream/50">
            Couldn&apos;t check {platformLabel} right now.
          </span>
        )}
      </p>
    </div>
  );
}
