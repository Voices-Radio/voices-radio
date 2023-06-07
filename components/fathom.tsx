"use client";

import { env } from "@/env";
import { load, trackPageview } from "fathom-client";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    load(env.NEXT_PUBLIC_FATHOM_SITE_ID, {
      includedDomains: [env.NEXT_PUBLIC_FATHOM_URL],
      auto: false,
    });
  }, []);

  useEffect(() => {
    trackPageview();
  }, [pathname, searchParams]);

  return null;
}

export default function Fathom() {
  return (
    <Suspense fallback={null}>
      <TrackPageView />
    </Suspense>
  );
}
