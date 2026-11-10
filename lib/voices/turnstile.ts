/**
 * Cloudflare Turnstile bot check, shared by the widget and the server actions.
 *
 * The widget writes its token into a hidden form field; the server action
 * reads it and forwards it to voices_backend as `turnstileToken`, which checks
 * it with Cloudflare (middleware/requireHuman.js). The website never verifies
 * a token itself, so the backend check also covers direct API callers.
 *
 * Action names must match the backend's `requireHuman({ action })` values.
 */

export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

export type TurnstileAction = "register" | "forgot_password" | "guest_checkout";

export function turnstileTokenFrom(formData: FormData): string | undefined {
  const value = formData.get(TURNSTILE_RESPONSE_FIELD);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
