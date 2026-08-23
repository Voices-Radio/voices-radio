import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backendCheckEmail } from "@/lib/voices/membership/auth-client";

const checkEmailSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = checkEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "Enter a valid email address.",
        },
      },
      { status: 400 },
    );
  }

  const result = await backendCheckEmail({ email: parsed.data.email });

  if (!result.ok || typeof result.payload?.exists !== "boolean") {
    return NextResponse.json(
      {
        error: {
          code: "CHECK_FAILED",
          message: "We couldn't check this email address. Please try again.",
        },
      },
      { status: result.status >= 400 ? result.status : 503 },
    );
  }

  return NextResponse.json({
    exists: result.payload.exists,
    email: result.payload.email ?? parsed.data.email,
  });
}
