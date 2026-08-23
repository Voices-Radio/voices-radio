import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const accountSurfaceClassName =
  "group relative overflow-hidden rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 shadow-[0_18px_44px_rgba(0,0,0,0.16)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out before:absolute before:inset-x-5 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-voicesNext-orange before:content-[''] before:transition-transform before:duration-300 hover:-translate-y-0.5 hover:border-voicesNext-orange/70 hover:shadow-[0_22px_52px_rgba(0,0,0,0.28)] hover:before:scale-x-100 focus-within:border-voicesNext-orange/70 focus-within:before:scale-x-100 motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:hover:translate-y-0";

export const accountSurfaceStaticClassName =
  "relative overflow-hidden rounded-voices-md border border-voicesNext-border bg-voicesNext-surface p-6 before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-voicesNext-orange/80 before:content-['']";

export const accountFieldClassName =
  "h-12 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 font-gabarito text-base text-voicesNext-cream outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-voicesNext-cream/40 focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background motion-reduce:transition-none";

export const accountTextAreaClassName =
  "rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-4 py-3 font-gabarito text-base text-voicesNext-cream outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-voicesNext-cream/40 focus:border-voicesNext-orange focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background motion-reduce:transition-none";

export const accountPrimaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-voicesNext-orangeButton font-gabarito font-bold text-white transition-[background-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-voicesNext-cream hover:text-voicesNext-background hover:shadow-[0_10px_26px_rgba(211,78,36,0.28)] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const accountSecondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-voicesNext-border font-gabarito font-bold text-voicesNext-cream transition-[border-color,color,transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-voicesNext-orange hover:bg-voicesNext-background hover:text-voicesNext-orange focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export function AccountPageIntro({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="font-gabarito text-xs font-bold uppercase tracking-[1.6px] text-voicesNext-orangeText">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 font-outfit text-3xl font-black uppercase text-voicesNext-cream md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 font-asap text-sm leading-relaxed text-voicesNext-cream/75 md:text-base">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function AccountSurface({
  children,
  className,
  interactive = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
} & ComponentPropsWithoutRef<"section">) {
  return (
    <section
      {...props}
      className={cn(
        interactive ? accountSurfaceClassName : accountSurfaceStaticClassName,
        className,
      )}
    >
      {children}
    </section>
  );
}
