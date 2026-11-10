import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange focus-visible:ring-offset-2 focus-visible:ring-offset-voicesNext-background";

export type MenuItem = {
  href: string;
  label: string;
  /** Opens in a new tab with an arrow, e.g. the shop. */
  external?: boolean;
  active?: boolean;
};

type MenuLinkProps = {
  item: MenuItem;
  className: string;
  onNavigate?: () => void;
  children: ReactNode;
};

/** Link for in-app routes, a plain anchor for external and mailto links. */
function MenuAnchor({ item, className, onNavigate, children }: MenuLinkProps) {
  const isInternal = item.href.startsWith("/") && !item.external;
  const shared = {
    className: cn(className, FOCUS_RING),
    "aria-current": item.active ? ("page" as const) : undefined,
    onClick: onNavigate,
  };

  if (isInternal) {
    return (
      <Link href={item.href} {...shared}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      {...shared}
    >
      {children}
    </a>
  );
}

const PRIMARY_SIZE = {
  phone: "py-4 text-[34px]",
  tablet: "py-4 text-4xl lg:text-5xl",
} as const;

/** Large uppercase row with a divider, as on the artist name headings. */
export function PrimaryMenuLink({
  item,
  size,
  onNavigate,
}: {
  item: MenuItem;
  size: keyof typeof PRIMARY_SIZE;
  onNavigate?: () => void;
}) {
  return (
    <MenuAnchor
      item={item}
      onNavigate={onNavigate}
      className={cn(
        "group flex items-center justify-between gap-4 border-b border-voicesNext-border font-outfit font-black uppercase leading-none transition-colors hover:text-voicesNext-orange",
        PRIMARY_SIZE[size],
        item.active ? "text-voicesNext-orange" : "text-voicesNext-cream",
      )}
    >
      <span className="flex items-center gap-3">
        {item.active && (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 bg-voicesNext-orange"
          />
        )}
        {item.label}
      </span>
      {item.external && (
        <ArrowUpRight
          aria-hidden="true"
          size={size === "phone" ? 24 : 36}
          strokeWidth={2.5}
          className="shrink-0 text-voicesNext-secondary transition-colors group-hover:text-voicesNext-orange"
        />
      )}
    </MenuAnchor>
  );
}

/** Smaller link inside a labelled group (Work with Us, Voices). */
export function SecondaryMenuLink({
  item,
  onNavigate,
}: {
  item: MenuItem;
  onNavigate?: () => void;
}) {
  return (
    <MenuAnchor
      item={item}
      onNavigate={onNavigate}
      className={cn(
        "inline-flex items-center gap-1.5 font-gabarito text-[20px] font-bold leading-none transition-colors hover:text-voicesNext-orange",
        item.active ? "text-voicesNext-orange" : "text-voicesNext-cream",
      )}
    >
      {item.label}
      {item.external && (
        <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.5} />
      )}
    </MenuAnchor>
  );
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-asap text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-voicesNext-orangeText">
      {children}
    </p>
  );
}

/** The station's own socials, from the CMS. Renders nothing when unset. */
export function MenuSocialLinks({
  instagramLink,
  mixcloudLink,
}: {
  instagramLink?: string;
  mixcloudLink?: string;
}) {
  const socials = [
    { label: "Instagram", href: instagramLink },
    { label: "Mixcloud", href: mixcloudLink },
  ].filter((social): social is { label: string; href: string } =>
    Boolean(social.href),
  );

  if (!socials.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <MenuSectionLabel>Follow</MenuSectionLabel>
      <div className="flex flex-wrap gap-2">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full border border-voicesNext-border px-4 font-asap text-xs font-bold uppercase text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange",
              FOCUS_RING,
            )}
          >
            {social.label}
            <ArrowUpRight aria-hidden="true" size={14} strokeWidth={2.5} />
          </a>
        ))}
      </div>
    </div>
  );
}
