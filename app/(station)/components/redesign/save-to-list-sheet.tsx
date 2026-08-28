"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type RefObject } from "react";
import { useFavourites } from "./favourites-context";

const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * The list picker a save button opens once a show is already saved
 * somewhere — lets a member choose which of their lists it sits in, or
 * remove it entirely. Modelled on confirm-change-dialog.tsx, the existing
 * Radix dialog pattern in this repo (real Dialog.Title, onCloseAutoFocus
 * returning focus to the button that opened it).
 *
 * Unchecking every list and pressing Done calls DELETE, not a PUT with an
 * empty listIds — a PUT with `listIds: []` means "save to the default
 * list" server-side (see routes/favourites.js), so treating an
 * all-unchecked save the same way would silently re-add the show the
 * member just tried to remove.
 */
export default function SaveToListSheet({
  open,
  onOpenChange,
  showId,
  title,
  listIds,
  onListIdsChange,
  triggerRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showId: string;
  title: string;
  listIds: string[];
  onListIdsChange: (listIds: string[]) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const { lists, listsLoading, ensureListsLoaded, addListToCache } =
    useFavourites();
  const [pendingListIds, setPendingListIds] = useState<string[]>(listIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [creating, setCreating] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const duration = shouldReduceMotion ? 0.01 : 0.2;

  // Radix's onOpenChange only fires when RADIX itself requests a close
  // (Escape, overlay click, Dialog.Close) — never merely because the
  // parent flipped the controlled `open` prop from outside, which is how
  // save-show-button.tsx actually opens this sheet. So the "just opened"
  // side effects (reset the pending selection, kick off the lists fetch)
  // have to watch the `open` prop directly, not that callback.
  useEffect(() => {
    if (open) {
      setPendingListIds(listIds);
      setError(null);
      ensureListsLoaded();
    }
    // listIds is intentionally excluded: it can change while the sheet is
    // open (an optimistic update elsewhere) and re-syncing pendingListIds
    // from it mid-edit would clobber whatever the member is choosing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ensureListsLoaded]);

  function toggleList(listId: string) {
    setPendingListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId],
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const response =
        pendingListIds.length === 0
          ? await fetch(`/api/favourites/${encodeURIComponent(showId)}`, {
              method: "DELETE",
            })
          : await fetch(`/api/favourites/${encodeURIComponent(showId)}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ listIds: pendingListIds }),
            });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.message || GENERIC_ERROR);
        return;
      }

      onListIdsChange(
        pendingListIds.length === 0 ? [] : (payload?.listIds ?? pendingListIds),
      );
      onOpenChange(false);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/favourites/${encodeURIComponent(showId)}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message || GENERIC_ERROR);
        return;
      }
      onListIdsChange([]);
      onOpenChange(false);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateList(event: FormEvent) {
    event.preventDefault();
    const name = newListName.trim();
    if (!name || creating) return;

    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/favourites/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.list) {
        setError(
          payload?.message || "Couldn't create that list. Please try again.",
        );
        return;
      }
      addListToCache(payload.list);
      setPendingListIds((prev) => [...prev, payload.list.id]);
      setNewListName("");
    } catch {
      setError("Couldn't create that list. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                forceMount
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  triggerRef.current?.focus();
                }}
              >
                <motion.div
                  className="fixed inset-0 z-[51] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration }}
                >
                  <motion.div
                    className="flex w-full max-w-[400px] flex-col gap-4 border border-voicesNext-border bg-voicesNext-background p-6 focus:outline-none"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
                    transition={{ duration }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Dialog.Title className="font-gabarito text-lg font-bold text-voicesNext-cream">
                        Save to…
                      </Dialog.Title>
                      <Dialog.Close className="shrink-0 rounded-full p-1 text-voicesNext-cream/70 transition-colors hover:text-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange">
                        <X aria-hidden="true" size={18} />
                        <span className="sr-only">Close</span>
                      </Dialog.Close>
                    </div>

                    <Dialog.Description className="sr-only">
                      Choose which of your lists {title} should be saved to.
                    </Dialog.Description>

                    {listsLoading && !lists && (
                      <div className="flex items-center gap-2 font-gabarito text-sm text-voicesNext-cream/70">
                        <Loader2
                          aria-hidden="true"
                          size={16}
                          className="animate-spin"
                        />
                        Loading your lists…
                      </div>
                    )}

                    {lists && lists.length > 0 && (
                      <fieldset className="flex max-h-[240px] flex-col gap-1 overflow-y-auto">
                        <legend className="sr-only">Your lists</legend>
                        {lists.map((list) => (
                          <label
                            key={list.id}
                            className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 font-gabarito text-sm text-voicesNext-cream hover:bg-voicesNext-cream/5"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-voicesNext-orange"
                              checked={pendingListIds.includes(list.id)}
                              onChange={() => toggleList(list.id)}
                            />
                            <span className="flex-1">{list.name}</span>
                            <span className="text-xs text-voicesNext-cream/50">
                              {list.showCount}
                            </span>
                          </label>
                        ))}
                      </fieldset>
                    )}

                    <form
                      onSubmit={handleCreateList}
                      className="flex items-center gap-2"
                    >
                      <label htmlFor={`new-list-${showId}`} className="sr-only">
                        New list name
                      </label>
                      <input
                        id={`new-list-${showId}`}
                        type="text"
                        value={newListName}
                        onChange={(event) => setNewListName(event.target.value)}
                        placeholder="New list name"
                        maxLength={60}
                        className="h-10 flex-1 border border-voicesNext-border bg-transparent px-3 font-gabarito text-sm text-voicesNext-cream placeholder:text-voicesNext-cream/40 focus:outline-none focus:ring-2 focus:ring-voicesNext-orange"
                      />
                      <button
                        type="submit"
                        disabled={!newListName.trim() || creating}
                        aria-label="Create list"
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-voicesNext-border text-voicesNext-cream transition-colors hover:border-voicesNext-orange hover:text-voicesNext-orange disabled:opacity-40"
                      >
                        {creating ? (
                          <Loader2
                            aria-hidden="true"
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Plus aria-hidden="true" size={16} />
                        )}
                      </button>
                    </form>

                    {error && (
                      <p
                        role="alert"
                        className="font-gabarito text-sm text-voicesNext-orange"
                      >
                        {error}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      {listIds.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleRemove}
                          disabled={saving}
                          className="font-gabarito text-sm text-voicesNext-cream/60 underline-offset-2 hover:text-voicesNext-orange hover:underline disabled:opacity-40"
                        >
                          Remove from favourites
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        aria-busy={saving}
                        className="h-11 shrink-0 bg-voicesNext-orange px-5 font-gabarito text-sm font-bold text-voicesNext-background transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Done"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
