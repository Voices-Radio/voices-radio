import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

/**
 * Phase 7 E2E for the Artist/Member split (docs/artist-member-auth-plan.md).
 *
 * The five journeys the plan names — member-only, artist-only, dual-identity,
 * claim-new, claim-existing — plus two regression pins that unit tests cannot
 * reach because they are about what the *page* says:
 *
 *   1. A failed capabilities lookup must not be reported to a paying member
 *      as "nothing active yet". See lookupCapabilities().
 *   2. The claim form must refuse to proceed for an existing account with no
 *      proof of control (S1), rather than silently creating or attaching.
 */

const STUB = `http://localhost:${process.env.STUB_BACKEND_PORT ?? "4100"}`;

const PASSWORD = "correct horse battery";

async function seed(request: APIRequestContext, body: unknown) {
  const response = await request.post(`${STUB}/__test__/seed`, { data: body });
  expect(
    response.ok(),
    `stub seed failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
}

/** Unique per test so the stub's in-memory state cannot leak between them. */
function uniqueEmail(prefix = "dj") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/sign-in");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for the post-login landing before returning. Without this a
  // following page.goto() can outrun the sign-in POST, cancelling it before
  // the session cookies are set — which then looks exactly like a broken
  // auth guard rather than a racing test.
  await page.waitForURL(/\/account(\/|\?|$)/);
}

const nav = (page: Page) => page.getByRole("navigation", { name: /account/i });

// ── the capability matrix ────────────────────────────────────────────────────

test.describe("account area reflects what the account actually holds", () => {
  test("member-only sees membership navigation and no artist link", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("member");
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
    });

    await signIn(page, email);
    await expect(page).toHaveURL(/\/account$/);

    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toBeVisible();
    await expect(nav(page).getByRole("link", { name: "Artist" })).toHaveCount(
      0,
    );
  });

  test("artist-only lands on the artist area, with no membership links", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("artist");
    await seed(request, {
      user: { email, password: PASSWORD },
      artist: { name: "Aeron Darka" },
    });

    await signIn(page, email);
    await expect(page).toHaveURL(/\/account\/artist$/);

    await expect(nav(page).getByRole("link", { name: "Artist" })).toBeVisible();
    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toHaveCount(0);
  });

  test("one email holding both identities gets both, not one or an error", async ({
    page,
    request,
  }) => {
    // Requirement 3 of the plan, and the case the whole D1/D2 design exists
    // to make possible. A person who DJs and also pays for membership.
    const email = uniqueEmail("both");
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
      artist: { name: "Dual Identity" },
    });

    await signIn(page, email);

    await expect(nav(page).getByRole("link", { name: "Artist" })).toBeVisible();
    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toBeVisible();

    // And the artist area is genuinely reachable, not just linked.
    await nav(page).getByRole("link", { name: "Artist" }).click();
    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("an account holding neither still gets a coherent page", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("bare");
    await seed(request, { user: { email, password: PASSWORD } });

    await signIn(page, email);
    await expect(page.getByText(/nothing active yet/i)).toBeVisible();
  });
});

// ── regression pin 1: absence vs. ignorance ──────────────────────────────────

test.describe("a failed capabilities lookup is not reported as an empty account", () => {
  test("shows an error state, never 'nothing active yet', to a paying member", async ({
    page,
    request,
  }) => {
    // The `capfail-` prefix makes the stub's capabilities endpoint 500.
    // Before lookupCapabilities() distinguished the two cases, this rendered
    // the empty state — telling a member with a live subscription that they
    // had nothing.
    const email = uniqueEmail("capfail");
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
    });

    await signIn(page, email);

    await expect(page.getByTestId("capabilities-unavailable")).toBeVisible();
    await expect(page.getByText(/nothing active yet/i)).toHaveCount(0);
  });
});

// ── the claim flow ───────────────────────────────────────────────────────────

test.describe("claiming an artist profile", () => {
  test("create_new: an invited DJ with no account gets one, and lands in the artist area", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("newdj");
    const token = `tok-${Math.random().toString(36).slice(2, 10)}`;
    await seed(request, { invitation: { token, email } });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(email)).toBeVisible();

    await page
      .getByRole("button", { name: /create account for this invitation/i })
      .click();
    await page.getByLabel(/first name/i).fill("Ada");
    await page.getByLabel(/last name/i).fill("Lovelace");
    await page.getByLabel(/artist name/i).fill(`Ada FM ${Date.now()}`);
    await page.getByLabel(/^password$/i).fill(PASSWORD);
    await page.getByRole("button", { name: /claim artist profile/i }).click();

    await expect(page).toHaveURL(/\/account\/artist$/);
  });

  test("claim_existing (S1): an existing account cannot be claimed without proof of control", async ({
    page,
    request,
  }) => {
    // The privilege-escalation case. Bearing the invitation token is enough
    // to CREATE an account, never to attach an artist to someone else's.
    const email = uniqueEmail("existing");
    const token = `tok-${Math.random().toString(36).slice(2, 10)}`;
    await seed(request, {
      user: { email, password: PASSWORD },
      invitation: {
        // `imageUrl` and `bio` omitted on purpose. The backend builds this
        // block from the Artist document and JSON.stringify drops undefined
        // keys, so an artist with no image sends no `imageUrl` at all — true
        // of 1 of the 137 artists in production today. A schema requiring the
        // key present renders "invitation unavailable" for a valid
        // invitation, which is how this was originally found.
        token,
        email,
        artist: { id: "artist-existing", name: "Pre-existing Artist" },
      },
    });

    await page.goto(`/artists/claim/${token}`);
    await page
      .getByRole("button", { name: /use existing account password/i })
      .click();

    // Wrong password: the claim must not go through.
    await page
      .getByLabel(/existing account password/i)
      .fill("not-the-password");
    await page.getByRole("button", { name: /claim artist profile/i }).click();

    await expect(page.getByTestId("form-error")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/artists/claim/${token}`));
  });

  test("claim_existing: the right password links the artist to the existing account", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("existing-ok");
    const token = `tok-${Math.random().toString(36).slice(2, 10)}`;
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
      invitation: {
        token,
        email,
        artist: { id: "artist-ok", name: "Claimable Artist" },
      },
    });

    await page.goto(`/artists/claim/${token}`);
    await page
      .getByRole("button", { name: /use existing account password/i })
      .click();
    await page.getByLabel(/existing account password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /claim artist profile/i }).click();

    await expect(page).toHaveURL(/\/account\/artist$/);

    // D2: elevating to presenter must not cost them their membership.
    await page.goto("/account");
    await expect(
      nav(page).getByRole("link", { name: "Membership" }),
    ).toBeVisible();
  });

  test("an already-claimed invitation says so, rather than failing generically", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("claimed");
    const token = `tok-${Math.random().toString(36).slice(2, 10)}`;
    await seed(request, {
      user: { email, password: PASSWORD },
      invitation: { token, email, status: "accepted" },
    });

    await page.goto(`/artists/claim/${token}`);
    await expect(page.getByText(/invitation unavailable/i)).toBeVisible();
  });

  test("an invalid token is a clear message, not a crash", async ({ page }) => {
    await page.goto("/artists/claim/definitely-not-a-real-token");
    await expect(page.getByText(/invitation unavailable/i)).toBeVisible();
  });
});

// ── artist profile editing ───────────────────────────────────────────────────

test.describe("artist profile management", () => {
  test("a non-artist is redirected away from /account/artist", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("notartist");
    await seed(request, {
      user: { email, password: PASSWORD },
      membership: {},
    });

    await signIn(page, email);
    await page.goto("/account/artist");

    await expect(page).toHaveURL(/\/account\?artist=missing/);
  });

  test("the edit form exposes no field for name or programmingEmail", async ({
    page,
    request,
  }) => {
    // Both are excluded by the backend whitelist: `name` is the RadioCult
    // artist name (editing it desyncs the systems) and `programmingEmail` is
    // the calendar join key, admin-only by decision D6. A form field for
    // either would be a dead control at best.
    const email = uniqueEmail("editor");
    await seed(request, {
      user: { email, password: PASSWORD },
      artist: { name: "Whitelist Test" },
    });

    await signIn(page, email);
    await page.goto("/account/artist");

    await expect(page.getByLabel(/^artist name$/i)).toHaveCount(0);
    await expect(page.getByLabel(/programming email/i)).toHaveCount(0);
  });
});
