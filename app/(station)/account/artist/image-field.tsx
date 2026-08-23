"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { uploadArtistImageAction } from "./actions";
import type { ArtistImageKind } from "@/lib/voices/membership/artist-profile-client";
import {
  accountFieldClassName,
  accountSecondaryButtonClassName,
} from "../components/account-surface";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // matches the backend's multer limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Profile/banner image field.
 *
 * Two mutually exclusive modes, exactly one of which ever names an input on
 * the surrounding <form>:
 *
 *   'upload' (default) — a file input that saves immediately on selection,
 *   via its own server action, independent of the rest of the form. No named
 *   input is rendered in this mode, so submitting the main "Save artist
 *   profile" button can't clobber the just-uploaded image with a stale or
 *   empty URL value.
 *
 *   'url' — the original free-text URL input, named so it rides the main
 *   form's save exactly as it always did. Reached only through "Use a URL
 *   instead", collapsed by default per the request to keep raw URL entry as
 *   a secondary option rather than the primary one.
 */
export default function ImageField({
  kind,
  label,
  fieldName,
  initialUrl,
}: {
  kind: ArtistImageKind;
  label: string;
  fieldName: "imageUrl" | "bannerUrl";
  initialUrl: string | null;
}) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const labelId = `${fieldName}-label`;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage({
        tone: "error",
        text: "Please choose a JPEG, PNG, or WebP image.",
      });
      input.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setMessage({
        tone: "error",
        text: "That image is over 8MB. Please choose a smaller file.",
      });
      input.value = "";
      return;
    }

    const body = new FormData();
    body.append("image", file);

    setPending(true);
    setMessage(null);
    const result = await uploadArtistImageAction(kind, body);
    setPending(false);
    input.value = "";

    if (result.status === "success") {
      setPreviewUrl(result.profile[fieldName]);
      setMessage({ tone: "success", text: "Image updated." });
    } else {
      setMessage({ tone: "error", text: result.message });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span
        id={labelId}
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        {label}
      </span>

      {mode === "upload" ? (
        <div className="group/image flex flex-col gap-3 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background p-4 transition-[border-color,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-voicesNext-orange/70 hover:bg-voicesNext-surface motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          <div className="flex items-center gap-4">
            {previewUrl ? (
              // Externally hosted (Vercel Blob, or whatever URL a DJ entered
              // previously) — next/image would need every such host
              // allow-listed in next.config, so a plain <img> avoids that.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-voices-sm border border-voicesNext-border object-cover transition-transform duration-200 group-hover/image:scale-[1.03] motion-reduce:transition-none"
              />
            ) : (
              <div
                aria-hidden="true"
                className="h-16 w-16 shrink-0 rounded-voices-sm border border-dashed border-voicesNext-border"
              />
            )}

            <label
              className={cn(
                accountSecondaryButtonClassName,
                "h-9 w-fit cursor-pointer px-4 text-xs",
              )}
            >
              {pending
                ? "Uploading…"
                : previewUrl
                ? "Replace image"
                : "Upload image"}
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                aria-labelledby={labelId}
                className="sr-only"
                disabled={pending}
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setMode("url")}
            className="w-fit font-gabarito text-xs font-bold text-voicesNext-cream/70 underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
          >
            Use a URL instead
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            id={fieldName}
            name={fieldName}
            type="url"
            aria-labelledby={labelId}
            defaultValue={previewUrl ?? ""}
            className={accountFieldClassName}
          />
          <button
            type="button"
            onClick={() => setMode("upload")}
            className="w-fit font-gabarito text-xs font-bold text-voicesNext-cream/70 underline underline-offset-2 transition-colors hover:text-voicesNext-orange"
          >
            Upload a file instead
          </button>
        </div>
      )}

      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            message.tone === "error"
              ? "font-gabarito text-xs text-voicesNext-orange"
              : "font-gabarito text-xs text-voicesNext-cream/70"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
