import "server-only";
import { VOICES_MEMBERSHIP_API_BASE_URL } from "@/lib/voices/config";
import { isNextControlFlowError } from "@/lib/voices/next-control-flow";

/**
 * Thin wrappers around the existing (mobile-oriented) backend auth
 * endpoints. Kept separate from lib/voices/membership/session.ts so the
 * outbound-call shape is defined once and reused by both the app/api/auth/*
 * route handlers and the sign-in / create-account Server Actions.
 */

export type BackendAuthResult<T = any> = {
  ok: boolean;
  status: number;
  payload: T | null;
};

const AUTH_SERVICE_UNAVAILABLE = {
  message: "Authentication service is unavailable. Please try again.",
};

async function authRequest<T>(
  path: "/api/auth/register" | "/api/auth/login",
  input: unknown,
): Promise<BackendAuthResult<T>> {
  try {
    const response = await fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, payload };
  } catch (error) {
    if (isNextControlFlowError(error)) throw error;
    console.error("Voices auth request failed:", error);
    return {
      ok: false,
      status: 503,
      payload: AUTH_SERVICE_UNAVAILABLE as T,
    };
  }
}

export async function backendRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  newsletters?: boolean;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/register", input);
}

export async function backendLogin(input: {
  email: string;
  password: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/login", input);
}
