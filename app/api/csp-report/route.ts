import { NextResponse } from "next/server";

/**
 * Collection point for Content-Security-Policy violation reports.
 *
 * next.config.mjs ships the policy as Report-Only so it can be tightened
 * without breaking /studio or the embedded players. That plan only works if
 * something actually receives the reports — without a `report-uri`/`report-to`
 * target the browser discards them, the policy collects nothing, and it can
 * never be promoted to enforcing on evidence.
 *
 * Deliberately minimal: logs to Vercel's function logs, no storage, no
 * dependency. Enough to answer "what would break if we enforced this today?"
 * When that question is answered, promote the header and this route can go.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** Reports are unauthenticated and fire-and-forget, so cap what we'll read. */
const MAX_REPORT_BYTES = 64 * 1024;

/** The fields worth logging. Anything else is noise at this volume. */
type CspReportBody = {
  "document-uri"?: string;
  "violated-directive"?: string;
  "effective-directive"?: string;
  "blocked-uri"?: string;
  disposition?: string;
};

function summarise(report: CspReportBody) {
  return {
    directive: report["effective-directive"] ?? report["violated-directive"],
    blocked: report["blocked-uri"],
    onPage: report["document-uri"],
    disposition: report.disposition,
  };
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  try {
    const payload = await request.json();

    // Browsers send two shapes: the legacy `report-uri` wrapper
    // ({"csp-report": {...}}) and the newer Reporting API batch
    // ([{type, body}, ...]). Handle both so the data doesn't depend on which
    // directive a given browser honoured.
    const reports: CspReportBody[] = Array.isArray(payload)
      ? payload
          .filter((entry) => entry?.type === "csp-violation")
          .map((entry) => entry.body)
      : payload?.["csp-report"]
        ? [payload["csp-report"]]
        : [];

    for (const report of reports) {
      if (report) console.warn("CSP violation:", summarise(report));
    }
  } catch {
    // A malformed report is not worth a log line, let alone an error response.
  }

  // Always 204. The browser has nothing useful to do with a failure, and a
  // non-2xx would just make it retry noise at us.
  return new NextResponse(null, { status: 204 });
}
