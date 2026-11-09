import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Seeds the real local backend's database by shelling out to
 * scripts/e2e/seedOnboarding.js in the sibling voices_backend checkout — the
 * same script playwright.real-backend.config.ts starts the backend against,
 * so this and the running server always agree on which database is in play.
 *
 * Not an HTTP fixture endpoint like the stub's /__test__/seed, because this
 * suite is deliberately exercising the real routes with nothing standing in
 * for them — a fixture endpoint would be exactly the kind of backend-only
 * shortcut this suite exists to not have.
 */

const BACKEND_DIR = path.resolve(
  process.env.VOICES_BACKEND_DIR ?? path.join(__dirname, "..", "..", "..", "voices_backend"),
);

export type SeedUser = {
  email: string;
  password?: string;
  authProvider?: "local" | "apple";
  role?: string;
  membership?: boolean;
};

export type SeedInvitation = {
  token: string;
  email: string;
  artist?: string; // name of a seeded artist, for a claim_existing invitation
  artistName?: string; // for a create_new invitation
  status?: "pending" | "accepted" | "expired";
  expired?: boolean;
  acceptedByEmail?: string;
};

export type SeedSpec = {
  users?: SeedUser[];
  artists?: Array<{ name: string; ownerEmail?: string }>;
  invitations?: SeedInvitation[];
};

export function seed(spec: SeedSpec) {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) {
    throw new Error("E2E_MONGODB_URI must be set — see playwright.real-backend.config.ts.");
  }

  execFileSync("node", ["scripts/e2e/seedOnboarding.js", JSON.stringify(spec)], {
    cwd: BACKEND_DIR,
    env: { ...process.env, MONGODB_URI: uri },
    stdio: ["ignore", "pipe", "inherit"],
  });
}

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export function uniqueToken() {
  return `real-e2e-${Math.random().toString(36).slice(2, 12)}`;
}
