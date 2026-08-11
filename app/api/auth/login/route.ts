import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { backendLogin } from "@/lib/voices/membership/auth-client";
import { setSessionCookies } from "@/lib/voices/membership/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: "Enter a valid email and password.",
        },
      },
      { status: 400 },
    );
  }

  const { ok, status, payload } = await backendLogin(parsed.data);

  if (!ok || !payload?.token || !payload?.refreshToken) {
    return NextResponse.json(
      {
        error: {
          code: "LOGIN_FAILED",
          message: payload?.message || "Incorrect email or password.",
        },
      },
      { status: status >= 400 ? status : 401 },
    );
  }

  await setSessionCookies({
    token: payload.token,
    refreshToken: payload.refreshToken,
  });

  return NextResponse.json({ user: payload.user ?? null });
}
