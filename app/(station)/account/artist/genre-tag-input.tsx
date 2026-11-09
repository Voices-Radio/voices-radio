"use client";

import { useId, useState, type KeyboardEvent } from "react";

const MAX_GENRES = 15;
const MAX_GENRE_LENGTH = 40;

/**
 * Replaces the old single free-text field (`profile.genres.join(", ")`,
 * split back apart on comma by the server action) with chips a DJ builds one
 * genre at a time. The comma-splitting always worked; what was missing was
 * any indication that commas were the delimiter, which read to a DJ as one
 * plain text box.
 *
 * Serialises to a single hidden JSON-array field on blur/commit, which
 * actions.ts's parseGenres() reads directly — no delimiter-guessing left on
 * the server side. Genres reach RadioCult as-is via the existing
 * ArtistSync.buildUpdatePayload() `genres` field; nothing about the RadioCult
 * side of the pipe changes here.
 */
export default function GenreTagInput({
  name,
  initialGenres,
}: {
  name: string;
  initialGenres: string[];
}) {
  const [genres, setGenres] = useState<string[]>(initialGenres);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const inputId = useId();
  const hintId = useId();

  function commitDraft() {
    const value = draft.trim();
    setDraft("");
    if (!value) return;

    if (genres.some((genre) => genre.toLowerCase() === value.toLowerCase())) {
      setAnnouncement(`${value} is already added.`);
      return;
    }
    if (genres.length >= MAX_GENRES) {
      setAnnouncement(`You can add up to ${MAX_GENRES} genres.`);
      return;
    }

    const next = [...genres, value.slice(0, MAX_GENRE_LENGTH)];
    setGenres(next);
    setAnnouncement(
      `Added ${value}. ${next.length} genre${next.length === 1 ? "" : "s"}.`,
    );
  }

  function removeGenre(genre: string) {
    setGenres((current) => current.filter((existing) => existing !== genre));
    setAnnouncement(`Removed ${genre}.`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
      return;
    }
    // Backspacing on an empty draft edits the last chip rather than doing
    // nothing — the fastest way to fix a typo without reaching for the mouse.
    if (event.key === "Backspace" && draft === "" && genres.length > 0) {
      event.preventDefault();
      const last = genres[genres.length - 1];
      setGenres((current) => current.slice(0, -1));
      setDraft(last);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="font-gabarito text-sm font-bold text-voicesNext-cream"
      >
        Genres
      </label>
      <p id={hintId} className="font-gabarito text-xs text-voicesNext-cream/60">
        Type a genre and press Enter (or comma) to add it. Add as many as you
        like — these show as tags on RadioCult and Voices.
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-voices-sm border border-voicesNext-border bg-voicesNext-background px-3 py-2 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-voicesNext-orange focus-within:ring-2 focus-within:ring-voicesNext-orange focus-within:ring-offset-2 focus-within:ring-offset-voicesNext-background motion-reduce:transition-none">
        {genres.map((genre) => (
          <span
            key={genre}
            className="inline-flex items-center gap-1.5 rounded-full bg-voicesNext-surface px-3 py-1 font-gabarito text-sm text-voicesNext-cream transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-voicesNext-orangeButton motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {genre}
            <button
              type="button"
              onClick={() => removeGenre(genre)}
              aria-label={`Remove ${genre}`}
              className="text-voicesNext-cream/60 transition-colors hover:text-voicesNext-cream focus:outline-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          aria-describedby={hintId}
          placeholder={genres.length === 0 ? "e.g. drum & bass" : ""}
          className="min-w-[8rem] flex-1 bg-transparent font-gabarito text-base text-voicesNext-cream outline-none placeholder:text-voicesNext-cream/40"
        />
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(genres)} />
    </div>
  );
}
