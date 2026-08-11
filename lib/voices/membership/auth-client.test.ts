import { beforeEach, describe, expect, it, vi } from "vitest";
import { backendLogin, backendRegister } from "./auth-client";

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
