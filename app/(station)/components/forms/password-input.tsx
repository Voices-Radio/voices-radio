"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
};

/**
 * A password field with a show/hide toggle.
 *
 * The toggle is a real button — reachable by keyboard, announced as "Show
 * password" with its pressed state — rather than an icon on the label. The
 * label keeps pointing at the input, so `getByLabel(/^password$/i)` still
 * finds the field and not the button.
 *
 * `type="button"` matters: every call site sits inside a form, and a default
 * button would submit it the moment someone checked what they had typed.
 */
export default function PasswordInput({
  id,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={cn(className, "w-full pr-12")}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label="Show password"
        aria-pressed={visible}
        aria-controls={id}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-voices-sm text-voicesNext-cream/70 transition-colors hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
