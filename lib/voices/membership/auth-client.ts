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
  path:
    | "/api/auth/register"
    | "/api/auth/login"
    | "/api/auth/check-email"
    | "/api/auth/resend-verification"
    | "/api/auth/forgot-password"
    | "/api/auth/reset-password"
    | `/api/auth/verify-email/${string}`,
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

async function authGetRequest<T>(path: string): Promise<BackendAuthResult<T>> {
  try {
    const response = await fetch(`${VOICES_MEMBERSHIP_API_BASE_URL}${path}`, {
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
  /** Member-only updates opt-in — separate from the general newsletter. */
  memberUpdates?: boolean;
  /**
   * This site's /verify-email page, so the emailed link brings the member
   * back here rather than to the auth site. The backend drops it unless the
   * origin is on its allowlist.
   */
  verificationReturnUrl?: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/register", input);
}

/**
 * Spends an emailed verification token. On success the backend returns the
 * same `token` / `refreshToken` pair /login does, so the member can be signed
 * straight in.
 */
export async function backendVerifyEmail(
  token: string,
): Promise<BackendAuthResult> {
  return authRequest(`/api/auth/verify-email/${encodeURIComponent(token)}`, {});
}

/**
 * Sends a fresh verification email. The backend answers 404 for an address it
 * doesn't know and 400 for one that is already verified; callers must not
 * pass that distinction on to the visitor (it would reveal which addresses
 * have accounts).
 */
export async function backendResendVerification(input: {
  email: string;
  verificationReturnUrl?: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/resend-verification", input);
}

export async function backendLogin(input: {
  email: string;
  password: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/login", input);
}

export async function backendCheckEmail(input: {
  email: string;
}): Promise<BackendAuthResult<{ exists: boolean; email?: string }>> {
  return authRequest("/api/auth/check-email", input);
}

export async function backendForgotPassword(input: {
  email: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/forgot-password", input);
}

export async function backendValidatePasswordResetToken(
  token: string,
): Promise<BackendAuthResult> {
  return authGetRequest(
    `/api/auth/validate-token/${encodeURIComponent(token)}?type=password_reset`,
  );
}

export async function backendResetPassword(input: {
  token: string;
  password: string;
}): Promise<BackendAuthResult> {
  return authRequest("/api/auth/reset-password", input);
}
