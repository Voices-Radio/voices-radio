import { requireSession } from "@/lib/voices/membership/session";
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

  return (
    <div className="mx-auto max-w-[960px] px-4 py-10 md:px-8 md:py-16">
      <AccountNav />
      {children}
    </div>
  );
}
