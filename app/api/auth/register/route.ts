import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backendRegister } from "@/lib/voices/membership/auth-client";
import {
  AUTH_RATE_LIMITS,
  enforceRateLimit,
} from "@/lib/voices/rate-limit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  newsletters: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, AUTH_RATE_LIMITS.register);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "Please check the form and try again.",
        },
      },
      { status: 400 },
    );
  }

  const { ok, status, payload } = await backendRegister(parsed.data);

  if (!ok) {
    return NextResponse.json(
      {
        error: {
          code: "REGISTER_FAILED",
          message:
            payload?.message ||
            "We couldn't create your account. Please try again.",
        },
      },
      { status },
    );
  }

  // Registration alone doesn't establish a session — the backend requires
  // email verification, so no tokens are returned here.
  return NextResponse.json({ user: payload?.user ?? null }, { status: 201 });
}
