import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  backendCheckEmail,
  backendForgotPassword,
  backendLogin,
  backendRegister,
  backendResetPassword,
  backendValidatePasswordResetToken,
} from "./auth-client";

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("backendLogin", () => {
  it("returns a structured failure when the upstream request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(
      backendLogin({ email: "member@example.com", password: "password123" }),
    ).resolves.toEqual({
      ok: false,
      status: 503,
      payload: {
        message: "Authentication service is unavailable. Please try again.",
      },
    });
  });
});

describe("backendRegister", () => {
  it("returns a structured failure when the upstream request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    await expect(
      backendRegister({
        email: "member@example.com",
        password: "password123",
        firstName: "Member",
        lastName: "Person",
      }),
    ).resolves.toEqual({
      ok: false,
      status: 503,
      payload: {
        message: "Authentication service is unavailable. Please try again.",
      },
    });
  });

  it("passes through a successful response's status and parsed payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ user: { _id: "u1" } }), {
            status: 201,
          }),
      ),
    );

    await expect(
      backendRegister({
        email: "member@example.com",
        password: "password123",
        firstName: "Member",
        lastName: "Person",
      }),
    ).resolves.toEqual({
      ok: true,
      status: 201,
      payload: { user: { _id: "u1" } },
    });
  });

  it("passes through a non-ok response's status and payload rather than throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              message: "An account with this email already exists.",
            }),
            { status: 409 },
          ),
      ),
    );

    await expect(
      backendRegister({
        email: "member@example.com",
        password: "password123",
        firstName: "Member",
        lastName: "Person",
      }),
    ).resolves.toEqual({
      ok: false,
      status: 409,
      payload: { message: "An account with this email already exists." },
    });
  });

  it("rethrows a Next.js control-flow error instead of swallowing it", async () => {
    const controlFlowError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;/somewhere",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw controlFlowError;
      }),
    );

    await expect(
      backendRegister({
        email: "member@example.com",
        password: "password123",
        firstName: "Member",
        lastName: "Person",
      }),
    ).rejects.toBe(controlFlowError);
  });
});

describe("password reset helpers", () => {
  it("checks whether an email has an account before requesting reset", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ exists: false, email: "new@example.com" }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      backendCheckEmail({ email: "new@example.com" }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      payload: { exists: false, email: "new@example.com" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/check-email"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "new@example.com" }),
      }),
    );
  });

  it("requests a password reset email", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Password reset email sent" }), {
          status: 200,
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      backendForgotPassword({ email: "artist@example.com" }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      payload: { message: "Password reset email sent" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/forgot-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "artist@example.com" }),
      }),
    );
  });

  it("validates a password reset token with the documented query type", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            valid: true,
            type: "password_reset",
            user: { _id: "u1", email: "artist@example.com" },
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      backendValidatePasswordResetToken("token with spaces"),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      payload: {
        valid: true,
        type: "password_reset",
        user: { _id: "u1", email: "artist@example.com" },
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/auth/validate-token/token%20with%20spaces?type=password_reset",
      ),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("submits the new password with the reset token", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ message: "Password reset successfully" }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      backendResetPassword({ token: "reset-token", password: "new-password" }),
    ).resolves.toEqual({
      ok: true,
      status: 200,
      payload: { message: "Password reset successfully" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/reset-password"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          token: "reset-token",
          password: "new-password",
        }),
      }),
    );
  });
});
