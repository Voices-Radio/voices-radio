"use client";

import { useEffect, useRef } from "react";
import { env } from "@/env";
import { TURNSTILE_RESPONSE_FIELD, type TurnstileAction } from "@/lib/voices/turnstile";

/**
 * Cloudflare Turnstile widget for a form. Put it inside the <form>: it adds a
 * hidden `cf-turnstile-response` field that the server action forwards to the
 * backend (see lib/voices/turnstile.ts).
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset (local dev,
 * tests); the backend then decides, by its TURNSTILE_MODE, what a missing
 * token means.
 *
 * A token works once. Pass the form's result as `resetSignal` so a failed
 * submit gets a fresh token for the next try.
 */

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile script loaded without an API"));
    };
    script.onerror = () => {
      // Let a later mount try again (e.g. after a network blip).
      scriptPromise = undefined;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function TurnstileWidget({
  action,
  resetSignal,
}: {
  action: TurnstileAction;
  resetSignal?: unknown;
}) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    if (!siteKey || !container) return;

    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled) return;
        widgetIdRef.current = api.render(container, {
          sitekey: siteKey,
          action,
          theme: "dark",
          size: "flexible",
          "response-field-name": TURNSTILE_RESPONSE_FIELD,
        });
      })
      .catch((error) => {
        console.error("Turnstile widget could not start:", error);
      });

    return () => {
      cancelled = true;
      const widgetId = widgetIdRef.current;
      widgetIdRef.current = undefined;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (resetSignal === undefined) return;
    const widgetId = widgetIdRef.current;
    if (widgetId) window.turnstile?.reset(widgetId);
  }, [resetSignal]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="min-h-[65px]" />;
}
