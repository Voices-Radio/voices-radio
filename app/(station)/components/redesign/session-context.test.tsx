import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSessionUser } from "./session-context";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const USER = { _id: "u1", email: "a@b.co", firstName: "Jack" };

function Probe() {
  const { user, status, signOut } = useSessionUser();
  return (
    <div>
      <span data-testid="state">
        {status}:{user ? user.firstName : "anon"}
      </span>
      <button type="button" onClick={signOut}>
        sign out
      </button>
    </div>
  );
}

function sessionCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url]) => url === "/api/auth/session");
}

describe("SessionProvider", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    pathname = "/";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("makes one request however many components read the session", async () => {
    fetchMock.mockResolvedValue(Response.json({ user: USER }));

    render(
      <SessionProvider>
        <Probe />
        <Probe />
        <Probe />
      </SessionProvider>,
    );

    await waitFor(() =>
      expect(screen.getAllByTestId("state")[0]).toHaveTextContent("ready:Jack"),
    );
    expect(sessionCalls(fetchMock)).toHaveLength(1);
  });

  it("does not re-ask the backend on navigation while a signed-in result is fresh", async () => {
    fetchMock.mockResolvedValue(Response.json({ user: USER }));
    const { rerender } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("Jack"),
    );

    pathname = "/explore";
    rerender(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    expect(sessionCalls(fetchMock)).toHaveLength(1);
  });

  it("re-checks on navigation while signed out, so a fresh sign-in is picked up", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ user: null }));
    fetchMock.mockResolvedValueOnce(Response.json({ user: USER }));
    const { rerender } = render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("ready:anon"),
    );

    pathname = "/account";
    rerender(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("Jack"),
    );
    expect(sessionCalls(fetchMock)).toHaveLength(2);
  });

  it("clears the user immediately on sign out", async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === "/api/auth/session"
        ? Response.json({ user: USER })
        : new Response(null),
    );
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("Jack"),
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "sign out" }));

    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("ready:anon"),
    );
  });

  it("degrades to signed out when the session route fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("state")).toHaveTextContent("ready:anon"),
    );
  });
});
