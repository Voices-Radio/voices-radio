/**
 * A real, disposable inbox (mail.tm) for the staging E2E run.
 *
 * The staging site talks to the live backend, which sends real email through
 * Resend. Reading that email is the only way to follow a verification, set-up
 * or reset link end to end — and it also proves delivery works. Each run makes
 * new addresses, so runs never read each other's mail.
 */

const API = "https://api.mail.tm";
const POLL_MS = 3_000;

export type ReceivedEmail = {
  subject: string;
  from: string;
  html: string;
  text: string;
};

export type Mailbox = {
  address: string;
  /** Waits for the first message whose subject matches, newer than `since`. */
  waitForEmail: (
    subject: RegExp,
    options?: { timeoutMs?: number; since?: Date },
  ) => Promise<ReceivedEmail>;
};

const MAX_ATTEMPTS = 8;

async function api<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  let response: Response | undefined;
  // mail.tm rate-limits account creation (429); back off and retry.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (response.status !== 429) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
  }
  if (!response) throw new Error(`mail.tm ${path}: no response`);
  if (!response.ok) {
    throw new Error(
      `mail.tm ${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

export async function createMailbox(label: string): Promise<Mailbox> {
  const domains = await api<{
    "hydra:member": { domain: string; isActive: boolean }[];
  }>("/domains");
  const domain = domains["hydra:member"].find((d) => d.isActive)?.domain;
  if (!domain) throw new Error("mail.tm has no active domain");

  const address = `voices-e2e-${label}-${Date.now()}@${domain}`;
  const password = `Pw-${crypto.randomUUID()}`;
  await api("/accounts", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  const { token } = await api<{ token: string }>("/token", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });

  async function waitForEmail(
    subject: RegExp,
    { timeoutMs = 120_000, since }: { timeoutMs?: number; since?: Date } = {},
  ) {
    const deadline = Date.now() + timeoutMs;
    const seen: string[] = [];
    while (Date.now() < deadline) {
      const list = await api<{
        "hydra:member": { id: string; subject: string; createdAt: string }[];
      }>("/messages", {}, token);
      const hit = list["hydra:member"].find(
        (m) =>
          subject.test(m.subject) && (!since || new Date(m.createdAt) >= since),
      );
      list["hydra:member"].forEach((m) => {
        if (!seen.includes(m.subject)) seen.push(m.subject);
      });
      if (hit) {
        const full = await api<{
          subject: string;
          from: { address: string };
          html?: string[];
          text?: string;
        }>(`/messages/${hit.id}`, {}, token);
        return {
          subject: full.subject,
          from: full.from.address,
          html: (full.html ?? []).join("\n"),
          text: full.text ?? "",
        };
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
    throw new Error(
      `No email matching ${subject} reached ${address} in ${timeoutMs / 1000}s. Seen: ${JSON.stringify(seen)}`,
    );
  }

  return { address, waitForEmail };
}

/** The first link in an email whose URL contains `fragment`, entity-decoded. */
export function linkFrom(email: ReceivedEmail, fragment: string): string {
  const hrefs = [...email.html.matchAll(/href="([^"]+)"/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
  const link = hrefs.find((href) => href.includes(fragment));
  if (!link)
    throw new Error(
      `No link containing "${fragment}" in "${email.subject}". Links: ${hrefs.join(" ")}`,
    );
  return link;
}
