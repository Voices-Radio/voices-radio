"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { backendCompleteSetup } from "@/lib/voices/membership/auth-client";
import { setSessionCookies } from "@/lib/voices/membership/session";

// Mirrors the backend rule (services/membership/accountSetup.js): 8+ characters
// with an upper-case letter, a lower-case letter and a number.
const PASSWORD_HELP =
  "Use at least 8 characters, with an upper-case letter, a lower-case letter and a number.";

const schema = z
  .object({
    token: z.string().min(1),
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

export type CreatePasswordState =
  | {
      status: "error";
      formError?: string;
      fieldErrors?: Partial<Record<"password" | "confirmPassword", string>>;
      /** The link itself is the problem (expired, used): offer a new one. */
      linkProblem?: boolean;
    }
  | undefined;

/**
 * Second half of the payment-first join. The emailed link proves the inbox;
 * this chooses the password, confirms the email and signs the member in. Only
 * returns on failure; success redirects to the account home.
 */
export async function createPasswordAction(
  _prevState: CreatePasswordState,
  formData: FormData,
): Promise<CreatePasswordState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: NonNullable<
      Extract<CreatePasswordState, { status: "error" }>["fieldErrors"]
    > = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "password" || key === "confirmPassword") {
        fieldErrors[key] ??= issue.message;
      }
    }
    // A missing token isn't a field the visitor can fix.
    if (parsed.error.issues.some((issue) => issue.path[0] === "token")) {
      return {
        status: "error",
        formError: "This link is missing its code. Open it again from your email.",
        linkProblem: true,
      };
    }
    return { status: "error", fieldErrors, formError: "Please fix the errors below." };
  }

  const { ok, status, payload } = await backendCompleteSetup({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!ok || !payload?.token || !payload?.refreshToken) {
    const message: string | undefined = payload?.message;
    // 400 = bad token or weak password; the schema above already screened the
    // password, so a 400 here is the link.
    const linkProblem = status === 400;
    return {
      status: "error",
      linkProblem,
      formError: linkProblem
        ? "This link has expired or has already been used."
        : message || "We couldn't finish setting up your account. Please try again.",
    };
  }

  await setSessionCookies({
    token: payload.token,
    refreshToken: payload.refreshToken,
  });

  redirect("/account");
}
