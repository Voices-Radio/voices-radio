"use server";

import { z } from "zod";
import { actionRateLimited } from "@/lib/voices/action-rate-limit";
import { AUTH_RATE_LIMITS } from "@/lib/voices/rate-limit";
import { backendRegister } from "@/lib/voices/membership/auth-client";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import { verificationReturnUrl } from "@/lib/voices/membership/verification-return";

// Same rule as choosing a password after paying (create-password/actions.ts).
const PASSWORD_HELP =
  "Use at least 8 characters, with an upper-case letter, a lower-case letter and a number.";

const DEFAULT_NEXT = "/account";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name."),
    lastName: z.string().trim().min(1, "Enter your last name."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, PASSWORD_HELP)
      .max(128, "Use no more than 128 characters.")
      .regex(/[a-z]/, PASSWORD_HELP)
      .regex(/[A-Z]/, PASSWORD_HELP)
      .regex(/\d/, PASSWORD_HELP),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";
type FieldErrors = Partial<Record<FieldKey, string>>;

/** What the visitor typed, echoed back so an error doesn't cost them the form. Never includes passwords. */
export type FreeAccountValues = {
  firstName: string;
  lastName: string;
  email: string;
  newsletters: boolean;
};

export type FreeAccountState =
  | {
      status: "error";
      formError?: string;
      fieldErrors?: FieldErrors;
      values: FreeAccountValues;
    }
  // Account created; the verification link is on its way.
  | { status: "check_email"; email: string; next: string }
  // A normal account already uses this address.
  | { status: "account_exists"; email: string; next: string }
  | undefined;

/**
 * Free (non-member) sign-up: name, email and password, plus the newsletter
 * opt-in. The backend sends the verification email; /verify-email then signs
 * them in and carries on to `next`. Deliberately sends no `role` and no
 * member-updates flag: a free account is a plain user, and member-only
 * updates are a member benefit.
 */
export async function registerFreeAccountAction(
  _prevState: FreeAccountState,
  formData: FormData,
): Promise<FreeAccountState> {
  const values: FreeAccountValues = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    newsletters: formData.get("newsletters") === "on",
  };
  const next =
    safeInternalPathOrUndefined(String(formData.get("next") ?? "")) ??
    DEFAULT_NEXT;

  const limited = await actionRateLimited(AUTH_RATE_LIMITS.register);
  if (limited) return { status: "error", formError: limited, values };

  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as FieldKey;
      // Keep the first (most fundamental) issue per field.
      fieldErrors[key] ??= issue.message;
    }
    return {
      status: "error",
      fieldErrors,
      formError: "Please fix the errors below.",
      values,
    };
  }

  const { email, firstName, lastName, password } = parsed.data;

  const result = await backendRegister({
    email,
    password,
    firstName,
    lastName,
    newsletters: values.newsletters,
    verificationReturnUrl: await verificationReturnUrl(next),
  });

  if (result.ok) return { status: "check_email", email, next };

  if (result.payload?.code === "ACCOUNT_EXISTS") {
    return { status: "account_exists", email, next };
  }
  if (result.status === 400 && result.payload?.message) {
    return { status: "error", formError: result.payload.message, values };
  }
  return {
    status: "error",
    formError: "We couldn't create your account. Please try again.",
    values,
  };
}
