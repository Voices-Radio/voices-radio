import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

/**
 * The onboarding permutation matrix — docs/plans/onboarding-e2e-matrix.md.
 *
 * §4a: every (what the account holds × how they arrived at sign-in) pair.
 * §4b: every state a claim link can be in, against every state the invited
 *      address can be in.
 *
 * One invariant is asserted on every test rather than in one (I1): no page,
 * and no URL visited on the way, ever carries a `?missing=` / `?artist=`
 * notice. That notice — "You signed in successfully, but this account is not
 * linked to an artist profile" — is the reason this file exists.
 *
 * Runs against the stub backend (tests/e2e/stub-backend/server.mjs), which
 * mirrors routes/artistInvitations.js; the backend's own suite pins the same
 * cases against the real route.
 */

const STUB = `http://localhost:${process.env.STUB_BACKEND_PORT ?? "4100"}`;
const PASSWORD = "correct horse battery";
const NOTICE_URL = /[?&](missing|artist)=/;
const NOTICE_TEXT =
  /not linked to an artist profile|does not currently have a membership/i;

async function seed(request: APIRequestContext, body: unknown) {
  const response = await request.post(`${STUB}/__test__/seed`, { data: body });
  expect(response.ok(), `stub seed failed: ${response.status()}`).toBeTruthy();
}

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

function uniqueToken() {
  return `tok-${Math.random().toString(36).slice(2, 12)}`;
}

async function signIn(
  page: Page,
  email: string,
  entry = "/sign-in",
  password = PASSWORD,
) {
  await page.goto(entry);
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/account(\/|\?|$)/);
}

const claimButton = (page: Page) =>
  page.getByRole("button", { name: /claim artist profile/i });

const nav = (page: Page) => page.getByRole("navigation", { name: /account/i });

// ── I1, on every test ────────────────────────────────────────────────────────

let visited: string[] = [];

test.beforeEach(({ page }) => {
  visited = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) visited.push(frame.url());
  });
});

test.afterEach(async ({ page }) => {
  expect(
    visited.filter((url) => NOTICE_URL.test(url)),
    "a notice URL was visited",
  ).toEqual([]);
  await expect(page.getByText(NOTICE_TEXT)).toHaveCount(0);
});

// ── §4a: the sign-in matrix ──────────────────────────────────────────────────

type Holding = "neither" | "member" | "artist" | "both";

const HOLDINGS: Record<Holding, object> = {
  neither: {},
  member: { membership: {} },
  artist: { artist: { name: "Matrix Artist" } },
  both: { membership: {}, artist: { name: "Matrix Both" } },
};

// Where each holding lands, per entry. `?as=` comes from links made before
// the picker was removed and must be ignored; `?next=/account/artist` is
// honoured for an artist and quietly sends anyone else home.
const LANDINGS: Record<string, Record<Holding, RegExp>> = {
  "/sign-in": {
    neither: /\/account$/,
    member: /\/account\/profile$/,
    artist: /\/account\/artist$/,
    both: /\/account\/profile$/,
  },
  "/sign-in?as=artist": {
    neither: /\/account$/,
    member: /\/account\/profile$/,
    artist: /\/account\/artist$/,
    both: /\/account\/profile$/,
  },
  "/sign-in?as=member": {
    neither: /\/account$/,
    member: /\/account\/profile$/,
    artist: /\/account\/artist$/,
    both: /\/account\/profile$/,
  },
  "/sign-in?next=%2Faccount%2Fartist": {
    neither: /\/account$/,
    member: /\/account$/,
    artist: /\/account\/artist$/,
    both: /\/account\/artist$/,
  },
};

test.describe("§4a sign-in: one door, landing decided by what the account holds", () => {
  for (const [entry, byHolding] of Object.entries(LANDINGS)) {
    for (const holding of Object.keys(byHolding) as Holding[]) {
      test(`${holding} via ${decodeURIComponent(entry)}`, async ({
        page,
        request,
      }) => {
        const email = uniqueEmail(`si-${holding}`);
        await seed(request, {
          user: { email, password: PASSWORD },
          ...HOLDINGS[holding],
        });

        await signIn(page, email, entry);

        await expect(page).toHaveURL(byHolding[holding]);
      });
    }
  }

  test("the sign-in page offers no artist/member picker", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText(/manage your dj profile/i)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /^sign in$/i }),
    ).toBeVisible();
  });
});

// ── I6: every password field can be revealed ─────────────────────────────────

test.describe("I6 show-password toggle", () => {
  test("reveals and re-hides the sign-in password, keeping what was typed", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    const input = page.getByLabel(/^password$/i);
    await input.fill("hunter22");
    const toggle = page.getByRole("button", { name: /show password/i });

    await toggle.click();
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("hunter22");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(input).toHaveAttribute("type", "password");
  });

  for (const [label, path, count] of [
    ["create account", "/join/create-account", 1],
    ["reset password", "/reset-password?token=e2e-token", 2],
  ] as const) {
    test(`is on every password field: ${label}`, async ({ page }) => {
      await page.goto(path);
      await expect(
        page.getByRole("button", { name: /show password/i }),
      ).toHaveCount(count);
    });
  }

  test("is on the claim form's password field", async ({ page, request }) => {
    const token = uniqueToken();
    await seed(request, {
      invitation: { token, email: uniqueEmail("toggle") },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(
      page.getByRole("button", { name: /show password/i }),
    ).toHaveCount(1);
  });
});

// ── §4b: the claim matrix ────────────────────────────────────────────────────

test.describe("§4b claim: every live link has exactly one path, and it works", () => {
  test("C1 existing artist, no account: straight to account creation", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c1");
    const token = uniqueToken();
    await seed(request, {
      invitation: { token, email, artist: { id: "a-c1", name: "C1 Artist" } },
    });

    await page.goto(`/artists/claim/${token}`);
    // F3: never asked for the password of an account that does not exist.
    await expect(page.getByLabel(/existing account password/i)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /use existing account password/i }),
    ).toHaveCount(0);

    await page.getByLabel(/first name/i).fill("Ada");
    await page.getByLabel(/last name/i).fill("Lovelace");
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C2 net-new artist, no account: no artist-name field while the invited name is free", async ({
    page,
    request,
  }) => {
    const token = uniqueToken();
    await seed(request, {
      invitation: {
        token,
        email: uniqueEmail("c2"),
        artistName: `C2 Artist ${token}`,
      },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(`C2 Artist ${token}`)).toBeVisible();
    await expect(page.getByLabel(/^artist name$/i)).toHaveCount(0);

    await page.getByLabel(/first name/i).fill("Grace");
    await page.getByLabel(/last name/i).fill("Hopper");
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C3 account with a password: asked for it, links, and keeps the membership", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c3");
    const token = uniqueToken();
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
      invitation: { token, email, artist: { id: "a-c3", name: "C3 Artist" } },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByLabel(/first name/i)).toHaveCount(0);
    await page.getByLabel(/existing account password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
    await page.goto("/account");
    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toBeVisible();
  });

  test("C4 already signed in as the invited address: one click", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c4");
    const token = uniqueToken();
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
      invitation: { token, email, artist: { id: "a-c4", name: "C4 Artist" } },
    });

    await signIn(page, email);
    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(/you are already signed in as/i)).toBeVisible();
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C5 signed in as someone else: told so, and the claim goes to the invited address", async ({
    page,
    request,
  }) => {
    const other = uniqueEmail("c5-other");
    const invited = uniqueEmail("c5-invited");
    const token = uniqueToken();
    await seed(request, {
      user: { email: other, password: PASSWORD },
      membership: {},
    });
    await seed(request, {
      invitation: {
        token,
        email: invited,
        artist: { id: "a-c5", name: "C5 Artist" },
      },
    });

    await signIn(page, other);
    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByTestId("claim-session-mismatch")).toContainText(
      other,
    );

    await page.getByLabel(/first name/i).fill("Ada");
    await page.getByLabel(/last name/i).fill("Lovelace");
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
    // Now the invited address — an artist with no membership.
    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toHaveCount(0);
  });

  test("C6 wrong password: stays put with an error and a reset link back to this claim", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c6");
    const token = uniqueToken();
    await seed(request, {
      user: { email, password: PASSWORD },
      invitation: { token, email, artist: { id: "a-c6", name: "C6 Artist" } },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(
      page.getByRole("link", { name: /reset it first/i }),
    ).toHaveAttribute(
      "href",
      `/forgot-password?email=${encodeURIComponent(email)}&next=${encodeURIComponent(
        `/artists/claim/${token}`,
      )}`,
    );
    await page
      .getByLabel(/existing account password/i)
      .fill("not-the-password");
    await claimButton(page).click();

    await expect(page.getByTestId("form-error")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/artists/claim/${token}$`));
  });

  test("C7 Apple-only account: sets a web password through the claim, then signs in with it", async ({
    page,
    request,
    browser,
  }) => {
    const email = uniqueEmail("c7");
    const token = uniqueToken();
    await seed(request, {
      user: { email, authProvider: "apple" },
      invitation: { token, email, artist: { id: "a-c7", name: "C7 Artist" } },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(/uses sign in with apple/i)).toBeVisible();
    await expect(page.getByLabel(/existing account password/i)).toHaveCount(0);

    await page.getByLabel(/choose a password/i).fill("short");
    await claimButton(page).click();
    await expect(page.getByTestId("form-error")).toBeVisible();

    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();
    await expect(page).toHaveURL(/\/account\/artist$/);

    // The password is real: a fresh browser can sign in with it.
    const fresh = await browser.newContext();
    const freshPage = await fresh.newPage();
    await signIn(freshPage, email);
    await expect(freshPage).toHaveURL(/\/account\/artist$/);
    await fresh.close();
  });

  test("C10 the DJ who claimed it, back on the old link while signed in: straight in", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c10");
    const token = uniqueToken();
    await seed(request, {
      user: { email, password: PASSWORD },
      artist: { name: `C10 Artist ${token}` },
      invitation: { token, email, status: "accepted", acceptedByEmail: email },
    });

    await signIn(page, email);
    await page.goto(`/artists/claim/${token}`);

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("C11 claimed, not by this visitor: says so, with a sign-in link", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c11");
    const token = uniqueToken();
    await seed(request, {
      user: { email, password: PASSWORD },
      invitation: { token, email, status: "accepted", acceptedByEmail: email },
    });

    await page.goto(`/artists/claim/${token}`);

    await expect(
      page.getByRole("heading", { name: /already claimed/i }),
    ).toBeVisible();
    // Case-sensitive and exact: the header nav also has a "Sign in" link
    // (capitalised), and a case-insensitive match can resolve to both.
    await expect(
      page.getByRole("link", { name: "sign in", exact: true }),
    ).toHaveAttribute("href", "/sign-in?next=/account/artist");
  });

  test("C12 expired: a new link can be requested, the new one works, the old one stays dead", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("c12");
    const token = uniqueToken();
    await seed(request, {
      invitation: {
        token,
        email,
        expired: true,
        artist: { id: "a-c12", name: "C12 Artist" },
      },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByRole("heading", { name: /expired/i })).toBeVisible();
    await page.getByRole("button", { name: /email me a new link/i }).click();
    await expect(page.getByTestId("renew-sent")).toBeVisible();

    // "Open the email".
    const renewal = await (
      await request.get(`${STUB}/__test__/renewals/${token}`)
    ).json();
    expect(renewal.token).toBeTruthy();

    await page.goto(`/artists/claim/${renewal.token}`);
    await expect(claimButton(page)).toBeVisible();

    await page.goto(`/artists/claim/${token}`);
    await expect(
      page.getByRole("heading", { name: /invitation unavailable/i }),
    ).toBeVisible();
  });

  test("C14 an unknown token: a clear message with a way to reach Voices", async ({
    page,
  }) => {
    await page.goto("/artists/claim/definitely-not-a-real-token");

    await expect(
      page.getByRole("heading", { name: /invitation unavailable/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /info@voicesradio\.co\.uk/i }),
    ).toBeVisible();
  });

  test("C16 net-new name taken since the invite: asked for a variant, form kept on a clash, variant accepted", async ({
    page,
    request,
  }) => {
    const token = uniqueToken();
    const taken = `osBrain ${token}`;
    await seed(request, {
      takenArtistNames: [taken],
      invitation: { token, email: uniqueEmail("c16"), artistName: taken },
    });

    await page.goto(`/artists/claim/${token}`);
    const artistName = page.getByLabel(/^artist name$/i);
    await expect(artistName).toBeVisible();

    await page.getByLabel(/first name/i).fill("Rav");
    await page.getByLabel(/last name/i).fill("Dehele");
    await artistName.fill(taken.toUpperCase());
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page.getByTestId("form-error")).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toHaveValue("Rav");

    await page.getByLabel(/^artist name$/i).fill(`${taken} Live`);
    await page.getByLabel(/choose a password/i).fill(PASSWORD);
    await claimButton(page).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });
});

// ── the artist area after onboarding ─────────────────────────────────────────

test.describe("the artist area", () => {
  test("a member following an artist link is sent home quietly", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("member-to-artist");
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
    });

    await signIn(page, email);
    await page.goto("/account/artist");

    await expect(page).toHaveURL(/\/account$/);
  });

  test("a staff account holding an artist sees it read-only, with no redirect loop", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("staff-artist");
    await seed(request, {
      user: { email, password: PASSWORD },
      artist: { name: "Staff DJ", canManageProfile: false },
    });

    await signIn(page, email);

    await expect(page).toHaveURL(/\/account\/artist$/);
    await expect(page.getByTestId("artist-profile-read-only")).toContainText(
      "Staff DJ",
    );
  });
});
