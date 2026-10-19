"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const MAX_NAME_LENGTH = 60;
const CREATE_ERROR = "Couldn't create that playlist. Please try again.";

/**
 * "New playlist" on /account/favourites — members can create a playlist here
 * without first having to save a show. Collapsed to one button until wanted;
 * on success it opens the new (empty) playlist.
 */
export default function NewPlaylistForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || creating) return;

    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/favourites/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.list) {
        setError(payload?.message || CREATE_ERROR);
        return;
      }
      router.push(
        `/account/favourites?list=${encodeURIComponent(payload.list.id)}`,
      );
    } catch {
      setError(CREATE_ERROR);
    } finally {
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 border border-voicesNext-border px-4 font-gabarito text-sm font-bold text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
      >
        <Plus aria-hidden="true" size={16} />
        New playlist
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="new-playlist-name" className="sr-only">
          Playlist name
        </label>
        <input
          id="new-playlist-name"
          type="text"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
          maxLength={MAX_NAME_LENGTH}
          className="h-11 w-full max-w-xs border border-voicesNext-border bg-transparent px-3 font-gabarito text-sm text-voicesNext-cream placeholder:text-voicesNext-cream/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
        />
        <button
          type="submit"
          disabled={!name.trim() || creating}
          aria-busy={creating}
          className="h-11 shrink-0 bg-voicesNext-orange px-5 font-gabarito text-sm font-bold text-voicesNext-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setName("");
            setError(null);
          }}
          className="h-11 shrink-0 px-2 font-gabarito text-sm text-voicesNext-cream/70 hover:text-voicesNext-cream"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}
    </form>
  );
}
