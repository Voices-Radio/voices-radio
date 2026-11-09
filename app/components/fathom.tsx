"use client";

import { env } from "@/env";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

let fathomClient: Promise<typeof import("fathom-client")> | undefined;

function getFathomClient() {
  fathomClient ??= import("fathom-client");
  return fathomClient;
}

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProduction = env.NEXT_PUBLIC_SITE_ENV === "production";

  useEffect(() => {
    if (!isProduction) {
      return;
    }

    void getFathomClient().then(({ load }) => {
      load(env.NEXT_PUBLIC_FATHOM_SITE_ID, { auto: false });
    });
  }, [isProduction]);

  useEffect(() => {
    if (!isProduction || !pathname) {
      return;
    }

    void getFathomClient().then(({ trackPageview }) => {
      trackPageview({
        url: pathname + searchParams.toString(),
        referrer: document.referrer,
      });
    });
  }, [isProduction, pathname, searchParams]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
