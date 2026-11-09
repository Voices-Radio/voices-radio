"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const MAX_NAME_LENGTH = 60;

/**
 * Title bar for the playlist being viewed on /account/favourites: its name
 * and size, plus Rename and Delete. Only rendered for custom lists — "My
 * Favourites" can be neither renamed nor deleted (enforced server-side).
 * This is also the only place a list can be deleted.
 */
export default function PlaylistHeader({
  list,
}: {
  list: { id: string; name: string; showCount: number };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endpoint = `/api/favourites/lists/${encodeURIComponent(list.id)}`;

  async function request(init: RequestInit, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(endpoint, init);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message || fallback);
        return false;
      }
      return true;
    } catch {
      setError(fallback);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    const ok = await request(
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      },
      "Couldn't rename that playlist. Please try again.",
    );
    if (ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${list.name}"? The shows in it stay saved to My Favourites.`,
      )
    ) {
      return;
    }
    const ok = await request(
      { method: "DELETE" },
      "Couldn't delete that playlist. Please try again.",
    );
    if (ok) router.push("/account/favourites");
  }

  const linkButton =
    "font-gabarito text-sm text-voicesNext-cream/70 underline-offset-2 transition-colors hover:text-voicesNext-orange hover:underline disabled:opacity-40";

  return (
    <div className="flex flex-col gap-2">
      {editing ? (
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <label htmlFor="rename-playlist" className="sr-only">
            Playlist name
          </label>
          <input
            id="rename-playlist"
            type="text"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className="h-11 w-full max-w-xs border border-voicesNext-border bg-transparent px-3 font-gabarito text-sm text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange"
          />
          <button
            type="submit"
            disabled={!name.trim() || busy}
            className="h-11 shrink-0 bg-voicesNext-orange px-5 font-gabarito text-sm font-bold text-voicesNext-background disabled:opacity-60"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setName(list.name);
              setError(null);
            }}
            className={linkButton}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-gabarito text-xl font-bold text-voicesNext-cream">
            {list.name}
          </h2>
          <span className="font-gabarito text-sm text-voicesNext-cream/60">
            {list.showCount} {list.showCount === 1 ? "show" : "shows"}
          </span>
          <button type="button" onClick={() => setEditing(true)} className={linkButton}>
            Rename
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={linkButton}
          >
            Delete
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}
    </div>
  );
}
