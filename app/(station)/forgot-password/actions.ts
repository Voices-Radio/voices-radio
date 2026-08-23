"use server";

import { z } from "zod";
import {
  backendCheckEmail,
  backendForgotPassword,
} from "@/lib/voices/membership/auth-client";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  next: z.string().optional(),
});

export type ForgotPasswordState =
  | {
      status: "success";
      email: string;
      next?: string;
      message: string;
    }
  | {
      status: "error";
      formError?: string;
      accountMissingEmail?: string;
      fieldErrors?: Partial<Record<"email", string>>;
    }
  | undefined;

function safeInternalPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return undefined;
  return value;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<Record<"email", string>> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "email") fieldErrors.email ??= issue.message;
    }
    return {
      status: "error",
      fieldErrors,
      formError: "Please fix the errors below.",
    };
  }

  const account = await backendCheckEmail({ email: parsed.data.email });
  if (account.ok && account.payload?.exists === false) {
    return {
      status: "error",
      accountMissingEmail: parsed.data.email,
      formError: "You don't have an account for this email. Create one here.",
    };
  }

  const result = await backendForgotPassword({ email: parsed.data.email });

  if (!result.ok) {
    return {
      status: "error",
      formError:
        result.payload?.message ||
        "We couldn't send a password reset email. Please try again.",
    };
  }

  const next = safeInternalPath(parsed.data.next);

  return {
    status: "success",
    email: parsed.data.email,
    ...(next ? { next } : {}),
    message:
      result.payload?.message ||
      "Password reset email sent. Check your inbox for the reset link.",
  };
}
