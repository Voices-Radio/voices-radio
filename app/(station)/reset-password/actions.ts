"use server";

import { z } from "zod";
import { safeInternalPathOrUndefined } from "@/lib/voices/membership/paths";
import { backendResetPassword } from "@/lib/voices/membership/auth-client";

const schema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
    next: z.string().optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export type ResetPasswordState =
  | {
      status: "success";
      next?: string;
      message: string;
    }
  | {
      status: "error";
      formError?: string;
      fieldErrors?: Partial<Record<"password" | "confirmPassword", string>>;
    }
  | undefined;

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Partial<
      Record<"password" | "confirmPassword", string>
    > = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "password" || key === "confirmPassword") {
        fieldErrors[key] ??= issue.message;
      }
    }
    return {
      status: "error",
      fieldErrors,
      formError: "Please fix the errors below.",
    };
  }

  const result = await backendResetPassword({
    token: parsed.data.token,
    password: parsed.data.password,
  });

  if (!result.ok) {
    return {
      status: "error",
      formError:
        result.payload?.message ||
        "We couldn't reset your password. Please request a new reset link.",
    };
  }

  const next = safeInternalPathOrUndefined(parsed.data.next);

  return {
    status: "success",
    ...(next ? { next } : {}),
    message:
      result.payload?.message ||
      "Password reset successfully. You can now sign in with your new password.",
  };
}
