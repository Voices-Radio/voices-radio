import { UserRound } from "lucide-react";
import { contactPerson } from "../content";

// Gated behind SHOW_CONTACT_BLOCK in page.tsx until a real name, role and
// photo are supplied - do not render this unconditionally.
export function ContactBlock() {
  return (
    <section className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-voices-purple md:text-sm">
          Who you&rsquo;ll deal with
        </p>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-voices-purple/10 text-voices-purple">
          <UserRound className="h-8 w-8" />
        </div>
        <p className="text-lg font-black text-slate-900">
          {contactPerson.name}, {contactPerson.role}
        </p>
        <p className="text-sm font-semibold leading-relaxed text-slate-600">
          {contactPerson.line}
        </p>
      </div>
    </section>
  );
}
