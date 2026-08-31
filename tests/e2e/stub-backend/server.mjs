// Minimal in-memory stand-in for api.voicesradio.co.uk's auth + membership
// endpoints, used ONLY by Playwright's webServer during E2E runs (see
// playwright.config.ts). It is never imported by application code and
// cannot ship — this is deliberately separate from the "mock adapter"
// approach the plan rejected for production code; it exists purely so E2E
// tests can exercise checkout/dashboard/benefits flows deterministically
// without hitting the real backend, real Stripe, or real user data.
//
// Zero new dependencies: built on Node's http module only.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.STUB_BACKEND_PORT ?? 4100);
const APP_ORIGIN = process.env.STUB_BACKEND_APP_ORIGIN ?? "http://localhost:3100";

const TIERS = [
  { id: "supporter", name: "Supporter", monthlyPriceMinor: 400, annualPriceMinor: 4000, currency: "gbp", mostPopular: false, sortOrder: 1 },
  { id: "member", name: "Member", monthlyPriceMinor: 800, annualPriceMinor: 8000, currency: "gbp", mostPopular: true, sortOrder: 2 },
  { id: "insider", name: "Insider", monthlyPriceMinor: 1500, annualPriceMinor: 15000, currency: "gbp", mostPopular: false, sortOrder: 3 },
  { id: "patron", name: "Patron", monthlyPriceMinor: 3000, annualPriceMinor: 30000, currency: "gbp", mostPopular: false, sortOrder: 4 },
];

// Public supporter-wall fixture (GET /api/membership/supporters). Kept
// empty by default — e2e/staging specs that exercise the homepage don't
// assert on wall content, only that the strip itself still renders.
const SUPPORTERS = [];

const PENDING_RECONCILIATION_MS = 1500;

/** @type {Map<string, {_id: string, email: string, password: string, firstName: string, lastName: string}>} */
const usersByEmail = new Map();
/** @type {Map<string, string>} accessToken -> userId */
const accessTokens = new Map();
/** @type {Map<string, string>} refreshToken -> userId */
const refreshTokens = new Map();
/** @type {Map<string, any>} userId -> membership state */
const memberships = new Map();
/** @type {Map<string, any>} userId -> profile */
const profiles = new Map();
/** @type {Map<string, any[]>} userId -> redemptions */
const redemptionsByUser = new Map();
/** @type {Map<string, {redeemed: boolean, idempotencyKey: string | null}>} userId:benefitId -> redemption record */
const benefitRedemptions = new Map();
/** @type {Map<string, any>} userId -> artist profile */
const artistsByUserId = new Map();
/** @type {Map<string, any>} invitation token -> invitation */
const invitationsByToken = new Map();

/**
 * The self-editable whitelist, copied from routes/artists.js. `name` and
 * `programmingEmail` are absent on purpose (see plan §D6 and Phase 0) — the
 * stub drops them so a spec can prove the form cannot move them.
 */
const ARTIST_EDITABLE_FIELDS = [
  "bio",
  "imageUrl",
  "bannerUrl",
  "genres",
  "mixcloudUsername",
  "soundcloudUsername",
  "socialLinks",
];

function tierById(id) {
  return TIERS.find((tier) => tier.id === id) ?? null;
}

function userById(userId) {
  for (const user of usersByEmail.values()) {
    if (user._id === userId) return user;
  }
  return null;
}

function userFromAuth(req) {
  const header = req.headers["authorization"];
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);
  const userId = accessTokens.get(token);
  if (!userId) return null;
  return userId;
}

function currentMembership(userId) {
  const state = memberships.get(userId);
  if (!state) {
    return {
      status: null,
      tierId: null,
      cadence: null,
      priceMinor: null,
      currency: null,
      renewsAt: null,
      paidThroughAt: null,
      scheduledChange: null,
      isFoundingMember: false,
      paymentIssue: null,
    };
  }

  if (state.status === "pending_reconciliation" && Date.now() >= state.pendingUntil) {
    state.status = "active";
  }

  const { pendingUntil, ...publicState } = state;
  return publicState;
}

function defaultBenefits(userId) {
  const welcome = benefitRedemptions.get(`${userId}:welcome-perk`);
  const ballot = benefitRedemptions.get(`${userId}:studio-ballot`);

  return [
    {
      id: "welcome-perk",
      slug: "welcome-perk",
      name: "10% off Voices merch",
      state: welcome?.redeemed ? "claimed" : "available",
      capacityRemaining: null,
      action: welcome?.redeemed ? null : "claim",
      availableFrom: null,
      expiresAt: null,
      requiresAddress: false,
    },
    {
      id: "studio-ballot",
      slug: "studio-ballot",
      name: "Studio session ballot",
      state: ballot?.redeemed ? "ballot_entered" : "requires_action",
      capacityRemaining: null,
      action: ballot?.redeemed ? null : "enter_ballot",
      availableFrom: null,
      expiresAt: null,
      requiresAddress: false,
    },
  ];
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res, status, code, message) {
  sendJson(res, status, { error: { code, message } });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const { pathname } = url;

  try {
    // Health check — Playwright's webServer readiness probe polls "/" and
    // only proceeds to the next webServer once it sees a 2xx/3xx response;
    // everything else in this file 404s on an unmatched GET "/", which
    // would otherwise hang the whole E2E run at startup.
    if (pathname === "/" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    }

    // --- Fake Stripe hosted pages -----------------------------------
    if (pathname === "/fake-checkout" && req.method === "GET") {
      const redirect = url.searchParams.get("redirect") ?? APP_ORIGIN;
      const target = `${redirect}${redirect.includes("?") ? "&" : "?"}session_id=stub_cs_${randomUUID()}`;
      res.writeHead(302, { Location: target });
      return res.end();
    }

    if (pathname === "/fake-portal" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end("<html><body><h1>Stripe customer portal (stub)</h1></body></html>");
    }

    // --- Test-only fixture control -----------------------------------
    // Lets a spec put the stub into a precise state (an existing member who
    // is not yet an artist, a pending invitation of either kind) without
    // driving six UI flows to get there. Namespaced under /__test__ so it is
    // obvious this has no counterpart in the real API.
    if (pathname === "/__test__/seed" && req.method === "POST") {
      const body = await readJsonBody(req);

      if (body.user) {
        const user = {
          _id: randomUUID(),
          email: body.user.email,
          password: body.user.password,
          firstName: body.user.firstName ?? "Test",
          lastName: body.user.lastName ?? "User",
        };
        usersByEmail.set(user.email, user);

        if (body.membership) {
          memberships.set(user._id, {
            status: "active",
            tierId: "member",
            cadence: "monthly",
            priceMinor: 800,
            currency: "gbp",
            renewsAt: null,
            paidThroughAt: null,
            scheduledChange: null,
            isFoundingMember: false,
            paymentIssue: null,
            ...body.membership,
          });
        }

        if (body.artist) {
          artistsByUserId.set(user._id, {
            id: randomUUID(),
            name: "Test Artist",
            programmingEmail: user.email,
            imageUrl: null,
            bio: "",
            radioCultArtistId: "rc_seeded",
            radioCultSyncState: "linked",
            canManageProfile: true,
            ...body.artist,
          });
        }
      }

      if (body.invitation) {
        const token = body.invitation.token ?? randomUUID();
        invitationsByToken.set(token, {
          id: randomUUID(),
          email: body.invitation.email,
          status: body.invitation.status ?? "pending",
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          artist: body.invitation.artist ?? null,
        });
      }

      return sendJson(res, 200, { ok: true });
    }

    // --- Auth (mirrors the existing mobile-app auth endpoints) ------
    if (pathname === "/api/auth/register" && req.method === "POST") {
      const body = await readJsonBody(req);
      if (usersByEmail.has(body.email)) {
        return sendError(res, 409, "EMAIL_TAKEN", "An account with this email already exists.");
      }
      const user = {
        _id: randomUUID(),
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      };
      usersByEmail.set(body.email, user);
      profiles.set(user._id, {
        displayName: `${body.firstName} ${body.lastName}`,
        supporterWallOptIn: false,
        marketingConsent: Boolean(body.newsletters),
        address: null,
      });
      const { password, ...publicUser } = user;
      return sendJson(res, 201, { user: publicUser });
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      const body = await readJsonBody(req);
      const user = usersByEmail.get(body.email);
      if (!user || user.password !== body.password) {
        return sendError(res, 401, "INVALID_CREDENTIALS", "Incorrect email or password.");
      }
      const token = `at_${randomUUID()}`;
      const refreshToken = `rt_${randomUUID()}`;
      accessTokens.set(token, user._id);
      refreshTokens.set(refreshToken, user._id);
      const { password, ...publicUser } = user;
      return sendJson(res, 200, { token, refreshToken, user: publicUser });
    }

    // --- Artist / Member capabilities (docs/artist-member-auth-plan.md §D3) ---
    if (pathname === "/api/auth/capabilities" && req.method === "GET") {
      const userId = userFromAuth(req);
      if (!userId) {
        return sendError(res, 401, "UNAUTHENTICATED", "Sign in required.");
      }

      const user = userById(userId);

      // Deterministic failure hook. The frontend must distinguish "this
      // account holds nothing" from "the lookup failed" — see
      // lookupCapabilities() — and that is only testable if the endpoint can
      // be made to fail on demand.
      if (user?.email?.startsWith("capfail-")) {
        return sendError(res, 500, "STUB_FORCED_FAILURE", "Forced failure for E2E.");
      }

      const artist = artistsByUserId.get(userId) ?? null;
      const membership = memberships.get(userId) ?? null;
      const capabilities = [
        ...(artist ? ["artist"] : []),
        ...(membership ? ["member"] : []),
      ];

      return sendJson(res, 200, {
        user: {
          id: userId,
          email: user?.email ?? null,
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: artist ? "presenter" : "user",
        },
        capabilities,
        artist: artist
          ? {
              id: artist.id,
              name: artist.name,
              imageUrl: artist.imageUrl ?? null,
              programmingEmail: artist.programmingEmail ?? null,
              radioCultArtistId: artist.radioCultArtistId ?? null,
              radioCultSyncState: artist.radioCultSyncState ?? null,
              canManageProfile: artist.canManageProfile !== false,
            }
          : null,
        member: membership
          ? {
              status: membership.status,
              tierId: membership.tierId,
              cadence: membership.cadence,
            }
          : null,
      });
    }

    // --- Artist self-service profile (routes/artists.js presenter endpoints) ---
    if (pathname === "/api/artists/presenter/my-profile") {
      const userId = userFromAuth(req);
      if (!userId) {
        return sendError(res, 401, "UNAUTHENTICATED", "Sign in required.");
      }

      const artist = artistsByUserId.get(userId);
      if (!artist || artist.canManageProfile === false) {
        return sendError(res, 403, "FORBIDDEN", "Not a presenter.");
      }

      if (req.method === "GET") return sendJson(res, 200, { artist });

      if (req.method === "PATCH") {
        const body = await readJsonBody(req);
        // Mirrors the backend whitelist exactly. Anything outside it — most
        // pointedly `name` and `programmingEmail` — is dropped rather than
        // rejected, so a spec can assert it had no effect.
        for (const field of ARTIST_EDITABLE_FIELDS) {
          if (field in body) artist[field] = body[field];
        }
        return sendJson(res, 200, { artist });
      }
    }

    // --- Artist invitations (routes/artistInvitations.js) ---
    const validateMatch = pathname.match(/^\/api\/artist-invitations\/validate\/([^/]+)$/);
    if (validateMatch && req.method === "GET") {
      const invitation = invitationsByToken.get(validateMatch[1]);
      if (!invitation || invitation.status !== "pending") {
        return sendError(res, 404, "NOT_FOUND", "Invalid or expired invitation");
      }
      return sendJson(res, 200, {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
          kind: invitation.artist ? "claim_existing" : "create_new",
          artist: invitation.artist ?? null,
        },
      });
    }

    const claimMatch = pathname.match(/^\/api\/artist-invitations\/claim\/([^/]+)$/);
    if (claimMatch && req.method === "POST") {
      const invitation = invitationsByToken.get(claimMatch[1]);
      if (!invitation) {
        return sendError(res, 404, "NOT_FOUND", "Invalid or expired invitation");
      }
      if (invitation.status !== "pending") {
        return sendError(res, 409, "ALREADY_CLAIMED", "This invitation has already been claimed");
      }

      const body = await readJsonBody(req);
      const existing = usersByEmail.get(invitation.email);
      let user = existing;

      if (existing) {
        // S1: token alone must never modify an existing account. Either a
        // session for THAT user, or that account's password.
        const bearerUserId = userFromAuth(req);
        const bySession = bearerUserId === existing._id;
        const byPassword =
          typeof body.password === "string" && body.password === existing.password;

        if (!bySession && !byPassword) {
          return sendError(
            res,
            401,
            "PROOF_REQUIRED",
            "An account already exists for this email. Sign in, or provide the account password, to link this artist profile.",
          );
        }
      } else {
        if (!body.firstName || !body.lastName || !body.password) {
          return sendError(res, 400, "MISSING_FIELDS", "First name, last name, and password are required");
        }
        user = {
          _id: randomUUID(),
          email: invitation.email,
          password: body.password,
          firstName: body.firstName,
          lastName: body.lastName,
        };
        usersByEmail.set(invitation.email, user);
      }

      const artist = {
        id: invitation.artist?.id ?? randomUUID(),
        name: invitation.artist?.name ?? body.artistName ?? "Untitled artist",
        // D5: set unconditionally, from the invitation, on every claim.
        programmingEmail: invitation.email,
        imageUrl: invitation.artist?.imageUrl ?? null,
        bio: invitation.artist?.bio ?? "",
        radioCultArtistId: `rc_${randomUUID()}`,
        radioCultSyncState: "linked",
        canManageProfile: true,
      };
      artistsByUserId.set(user._id, artist);
      invitation.status = "accepted";

      const token = `at_${randomUUID()}`;
      accessTokens.set(token, user._id);
      const { password, ...publicUser } = user;
      return sendJson(res, 200, {
        message: "Artist profile claimed successfully",
        user: publicUser,
        artist: { id: artist.id, name: artist.name },
        token, // note: no refreshToken, matching the real backend
      });
    }

    if (pathname === "/api/auth/refresh" && req.method === "POST") {
      const header = req.headers["authorization"];
      const refreshToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
      const userId = refreshToken ? refreshTokens.get(refreshToken) : null;
      if (!userId) {
        return sendError(res, 401, "INVALID_REFRESH_TOKEN", "Session expired.");
      }
      refreshTokens.delete(refreshToken); // rotate — old refresh token is dead
      const newToken = `at_${randomUUID()}`;
      const newRefreshToken = `rt_${randomUUID()}`;
      accessTokens.set(newToken, userId);
      refreshTokens.set(newRefreshToken, userId);
      return sendJson(res, 200, { token: newToken, refreshToken: newRefreshToken });
    }

    if (pathname === "/api/auth/validate" && req.method === "GET") {
      const userId = userFromAuth(req);
      if (!userId) return sendError(res, 401, "INVALID_TOKEN", "Invalid or expired token.");
      const user = [...usersByEmail.values()].find((u) => u._id === userId);
      const { password, ...publicUser } = user;
      return sendJson(res, 200, { user: publicUser });
    }

    // --- Membership --------------------------------------------------
    if (pathname === "/api/membership/tiers" && req.method === "GET") {
      return sendJson(res, 200, { tiers: TIERS });
    }

    if (pathname === "/api/membership/supporters" && req.method === "GET") {
      return sendJson(res, 200, { supporters: SUPPORTERS });
    }

    const userId = userFromAuth(req);
    const PUBLIC_MEMBERSHIP_PATHS = ["/api/membership/tiers", "/api/membership/supporters"];
    const requiresAuth = pathname.startsWith("/api/membership") && !PUBLIC_MEMBERSHIP_PATHS.includes(pathname);
    if (requiresAuth && !userId) {
      return sendError(res, 401, "UNAUTHENTICATED", "Sign in required.");
    }

    if (pathname === "/api/membership/me" && req.method === "GET") {
      return sendJson(res, 200, currentMembership(userId));
    }

    if (pathname === "/api/membership/checkout" && req.method === "POST") {
      const body = await readJsonBody(req);
      const tier = tierById(body.tierId);
      if (!tier) return sendError(res, 400, "UNKNOWN_TIER", "Unknown tier.");

      memberships.set(userId, {
        status: "pending_reconciliation",
        tierId: tier.id,
        cadence: body.cadence,
        priceMinor: body.cadence === "annual" ? tier.annualPriceMinor : tier.monthlyPriceMinor,
        currency: "gbp",
        renewsAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        paidThroughAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        scheduledChange: null,
        isFoundingMember: false,
        paymentIssue: null,
        pendingUntil: Date.now() + PENDING_RECONCILIATION_MS,
      });

      const checkoutUrl = `http://localhost:${PORT}/fake-checkout?redirect=${encodeURIComponent(body.successUrl)}`;
      return sendJson(res, 200, { checkoutUrl, sessionId: `cs_${randomUUID()}` });
    }

    if (pathname === "/api/membership/preview-change" && req.method === "POST") {
      const body = await readJsonBody(req);
      const membership = memberships.get(userId);
      if (!membership) return sendError(res, 400, "NO_ACTIVE_MEMBERSHIP", "You don't have an active membership yet.");

      const targetTier = body.toTierId ? tierById(body.toTierId) : tierById(membership.tierId);
      const cadence = body.toCadence ?? membership.cadence;
      const priceMinor = cadence === "annual" ? targetTier.annualPriceMinor : targetTier.monthlyPriceMinor;

      return sendJson(res, 200, {
        effectiveAt: membership.renewsAt,
        priceMinor,
        description:
          body.action === "cancel"
            ? `Your benefits stay active until ${membership.paidThroughAt}.`
            : `This takes effect on ${membership.renewsAt}.`,
      });
    }

    if (pathname === "/api/membership/upgrade" && req.method === "POST") {
      const body = await readJsonBody(req);
      const membership = memberships.get(userId);
      if (!membership) return sendError(res, 400, "NO_ACTIVE_MEMBERSHIP", "You don't have an active membership yet.");
      const tier = tierById(body.toTierId);
      membership.tierId = tier.id;
      membership.priceMinor = membership.cadence === "annual" ? tier.annualPriceMinor : tier.monthlyPriceMinor;
      membership.scheduledChange = null;
      return sendJson(res, 200, {
        applied: "immediate",
        tierId: membership.tierId,
        cadence: membership.cadence,
        scheduledChange: null,
        unlockedBenefits: defaultBenefits(userId),
      });
    }

    if (pathname === "/api/membership/downgrade" && req.method === "POST") {
      const body = await readJsonBody(req);
      const membership = memberships.get(userId);
      if (!membership) return sendError(res, 400, "NO_ACTIVE_MEMBERSHIP", "You don't have an active membership yet.");
      membership.scheduledChange = { type: "downgrade", toTierId: body.toTierId, effectiveAt: membership.renewsAt };
      return sendJson(res, 200, {
        applied: "scheduled",
        tierId: membership.tierId,
        cadence: membership.cadence,
        scheduledChange: membership.scheduledChange,
      });
    }

    if (pathname === "/api/membership/change-cadence" && req.method === "POST") {
      const body = await readJsonBody(req);
      const membership = memberships.get(userId);
      if (!membership) return sendError(res, 400, "NO_ACTIVE_MEMBERSHIP", "You don't have an active membership yet.");
      membership.scheduledChange = { type: "change_cadence", toCadence: body.toCadence, effectiveAt: membership.renewsAt };
      return sendJson(res, 200, {
        applied: "scheduled",
        tierId: membership.tierId,
        cadence: membership.cadence,
        scheduledChange: membership.scheduledChange,
      });
    }

    if (pathname === "/api/membership/cancel" && req.method === "POST") {
      const membership = memberships.get(userId);
      if (!membership) return sendError(res, 400, "NO_ACTIVE_MEMBERSHIP", "You don't have an active membership yet.");
      membership.status = "cancelling";
      return sendJson(res, 200, { status: "cancelling", paidThroughAt: membership.paidThroughAt });
    }

    if (pathname === "/api/membership/resume" && req.method === "POST") {
      const membership = memberships.get(userId);
      if (!membership || membership.status !== "cancelling") {
        return sendError(res, 400, "MEMBERSHIP_LAPSED", "Your membership has already ended, so it can't be resumed.");
      }
      membership.status = "active";
      return sendJson(res, 200, { status: "active" });
    }

    if (pathname === "/api/membership/portal-session" && req.method === "POST") {
      return sendJson(res, 200, { url: `http://localhost:${PORT}/fake-portal` });
    }

    if (pathname === "/api/membership/benefits" && req.method === "GET") {
      return sendJson(res, 200, { benefits: defaultBenefits(userId) });
    }

    const redeemMatch = pathname.match(/^\/api\/membership\/benefits\/([^/]+)\/redeem$/);
    if (redeemMatch && req.method === "POST") {
      const benefitId = decodeURIComponent(redeemMatch[1]);
      const body = await readJsonBody(req);
      const key = `${userId}:${benefitId}`;
      const existing = benefitRedemptions.get(key);

      if (existing?.redeemed) {
        if (existing.idempotencyKey === body.idempotencyKey) {
          // Same key replayed — durable dedup returns the original success.
          return sendJson(res, 200, { ...defaultBenefits(userId).find((b) => b.id === benefitId) });
        }
        return sendError(res, 409, "ALREADY_REDEEMED", "You've already redeemed this benefit.");
      }

      benefitRedemptions.set(key, { redeemed: true, idempotencyKey: body.idempotencyKey });
      const list = redemptionsByUser.get(userId) ?? [];
      list.push({
        benefitName: benefitId === "welcome-perk" ? "10% off Voices merch" : "Studio session ballot",
        status: "claimed",
        claimedAt: new Date().toISOString(),
        usedAt: null,
        expiresAt: null,
        instructions: "Show this code at checkout.",
        code: `VOICES-${randomUUID().slice(0, 6).toUpperCase()}`,
        terms: "One redemption per member.",
      });
      redemptionsByUser.set(userId, list);

      return sendJson(res, 200, defaultBenefits(userId).find((b) => b.id === benefitId));
    }

    if (pathname === "/api/membership/redemptions" && req.method === "GET") {
      return sendJson(res, 200, { redemptions: redemptionsByUser.get(userId) ?? [] });
    }

    if (pathname === "/api/membership/profile" && (req.method === "GET" || req.method === "PATCH")) {
      const existing = profiles.get(userId) ?? {
        displayName: null,
        supporterWallOptIn: false,
        marketingConsent: false,
        address: null,
      };
      if (req.method === "GET") return sendJson(res, 200, existing);

      const body = await readJsonBody(req);
      const updated = { ...existing, ...body };
      profiles.set(userId, updated);
      return sendJson(res, 200, updated);
    }

    sendError(res, 404, "NOT_FOUND", `No stub route for ${req.method} ${pathname}`);
  } catch (error) {
    console.error("Stub backend error:", error);
    sendError(res, 500, "STUB_ERROR", "Stub backend error.");
  }
});

server.listen(PORT, () => {
  console.log(`Stub membership backend listening on http://localhost:${PORT}`);
});
