"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { backendLogin } from "@/lib/voices/membership/auth-client";
import {
  parseAccountIntent,
  resolvePostLoginPath,
} from "@/lib/voices/membership/capabilities";
import {
  getCapabilities,
  setSessionCookies,
} from "@/lib/voices/membership/session";

const schema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
  as: z.string().optional(),
});

export type SignInState =
  | {
      formError?: string;
      fieldErrors?: Partial<Record<"email" | "password", string>>;
    }
  | undefined;

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
    as: formData.get("as") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: NonNullable<SignInState>["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "email" || key === "password") {
        // A field can fail multiple chained checks (e.g. both .min() and
        // .email() on an empty string) — keep the first, most fundamental
        // one ("enter your email") rather than the last ("enter a valid
        // email"), which reads oddly for a field that was left blank.
        fieldErrors[key] ??= issue.message;
      }
    }
    return { fieldErrors, formError: "Please fix the errors below." };
  }

  const { ok, status, payload } = await backendLogin({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!ok || !payload?.token || !payload?.refreshToken) {
    return {
      formError:
        status === 401
          ? "Incorrect email or password."
          : payload?.message || "We couldn't sign you in. Please try again.",
    };
  }

  await setSessionCookies({
    token: payload.token,
    refreshToken: payload.refreshToken,
  });

  const capabilities = await getCapabilities();
  redirect(
    resolvePostLoginPath({
      next: parsed.data.next,
      intent: parseAccountIntent(parsed.data.as),
      capabilities,
    }),
  );
}
