import {
  getCapabilities,
  requireSession,
} from "@/lib/voices/membership/session";
import AccountNav from "./components/account-nav";

/**
 * Server-side guard for the whole /account area. requireSession() (unlike
 * the old getSession()-only check) survives past the 1-hour access-token
 * lifetime by transparently refreshing through /api/auth/refresh — without
 * it, a member with a perfectly valid 30-day session would be bounced to
 * /sign-in every hour. See lib/voices/membership/session.ts for why that
 * refresh can't happen directly in this Server Component.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession("/account");
  const capabilities = await getCapabilities();

  return (
    // <main>, not <div>: every other page on the site exposes a main landmark
    // (app/(station)/page.tsx, explore, about, collaborate…), and without one
    // screen-reader users have no skip-to-content target anywhere under
    // /account.
    <main className="mx-auto max-w-[960px] px-4 py-10 md:px-8 md:py-16">
      <AccountNav capabilities={capabilities?.capabilities ?? []} />
      {children}
    </main>
  );
}
