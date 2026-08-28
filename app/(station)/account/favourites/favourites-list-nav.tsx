"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FavouriteListApi } from "@/lib/voices/favourites/schemas";

/**
 * The list filter chips on /account/favourites. Doubles as the only place
 * in the UI a custom list can be deleted — the save-to-list sheet lets a
 * member create lists but never delete them, so without this a stray list
 * created by mistake would be permanent.
 */
export default function FavouritesListNav({
  lists,
  activeListId,
}: {
  lists: FavouriteListApi[];
  activeListId?: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(list: FavouriteListApi) {
    if (
      !window.confirm(
        `Delete "${list.name}"? The shows in it stay saved to My Favourites.`,
      )
    ) {
      return;
    }

    setDeletingId(list.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/favourites/lists/${encodeURIComponent(list.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message || "Couldn't delete that list. Please try again.");
        return;
      }
      if (activeListId === list.id) {
        router.push("/account/favourites");
      } else {
        router.refresh();
      }
    } catch {
      setError("Couldn't delete that list. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <nav aria-label="Favourite lists" className="flex flex-wrap gap-2">
        <Link
          href="/account/favourites"
          className={cn(
            "rounded-full border px-4 py-2 font-gabarito text-sm font-bold transition-colors",
            !activeListId
              ? "border-voicesNext-orange bg-voicesNext-orange text-voicesNext-background"
              : "border-voicesNext-border text-voicesNext-cream hover:border-voicesNext-orange",
          )}
        >
          All
        </Link>
        {lists.map((list) => {
          const active = activeListId === list.id;
          return (
            <span
              key={list.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border pl-4 pr-1.5 py-1.5 font-gabarito text-sm font-bold transition-colors",
                active
                  ? "border-voicesNext-orange bg-voicesNext-orange text-voicesNext-background"
                  : "border-voicesNext-border text-voicesNext-cream hover:border-voicesNext-orange",
              )}
            >
              <Link
                href={`/account/favourites?list=${encodeURIComponent(list.id)}`}
                className="py-0.5"
              >
                {list.name} <span className="opacity-60">({list.showCount})</span>
              </Link>
              {!list.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDelete(list)}
                  disabled={deletingId === list.id}
                  aria-label={`Delete list ${list.name}`}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-colors disabled:opacity-40",
                    active
                      ? "hover:bg-voicesNext-background/20"
                      : "hover:bg-voicesNext-cream/10",
                  )}
                >
                  <X aria-hidden="true" size={13} />
                </button>
              )}
            </span>
          );
        })}
      </nav>
      {error && (
        <p role="alert" className="mt-2 font-gabarito text-sm text-voicesNext-orange">
          {error}
        </p>
      )}
    </div>
  );
}
