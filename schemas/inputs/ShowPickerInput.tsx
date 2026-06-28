"use client";

import { useEffect, useMemo, useState } from "react";
import type { ObjectInputProps } from "sanity";
import { PatchEvent, set, unset } from "sanity";

type ShowPickerValue = {
  showId?: string;
  title?: string;
  date?: string;
  artistName?: string;
  imageUrl?: string;
  matchingStatus?: string;
};

type ShowSearchItem = {
  _id: string;
  title: string;
  date?: string;
  show_date?: string;
  upload_date?: string;
  imageUrl?: string | null;
  platform?: string;
  artistId?: string | null;
  artist?: {
    _id?: string;
    name?: string;
  } | null;
  matching_status?: string;
  matching_confidence?: number;
};

type ShowSearchResponse = {
  items?: ShowSearchItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

type ShowSearchPayload = ShowSearchResponse & {
  error?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

function getShowDate(show: ShowSearchItem) {
  return show.show_date ?? show.date ?? show.upload_date;
}

function getArtistName(show: ShowSearchItem) {
  return show.artist?.name ?? "";
}

function getCurationStatus(show: ShowSearchItem) {
  if (show.matching_status === "matched") {
    return "Matched / editable upstream";
  }

  return "Selectable for home curation / upstream data read-only";
}

async function readShowSearchResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as ShowSearchPayload;
  }

  const body = await response.text();
  const fallbackMessage = response.ok
    ? "Show search returned an invalid response."
    : `Show search failed with ${response.status}.`;
  const error =
    body.trim().startsWith("<!DOCTYPE") || body.trim().startsWith("<html")
      ? fallbackMessage
      : body.trim() || fallbackMessage;

  return { error };
}

export default function ShowPickerInput(
  props: ObjectInputProps<ShowPickerValue>,
) {
  const { value, onChange } = props;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ShowSearchItem[]>([]);
  const [pagination, setPagination] =
    useState<ShowSearchResponse["pagination"]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });

    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    }

    async function searchShows() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/voices/admin-show-search?${params.toString()}`,
          { headers: { Accept: "application/json" } },
        );
        const payload = await readShowSearchResponse(response);

        if (!response.ok) {
          throw new Error(payload.error ?? "Show search failed");
        }

        if (!cancelled) {
          setItems(payload.items ?? []);
          setPagination(payload.pagination);
        }
      } catch (searchError) {
        if (!cancelled) {
          setItems([]);
          setPagination(undefined);
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Show search failed",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void searchShows();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page]);

  const selectedLabel = useMemo(() => {
    if (!value?.showId) return "No show selected";
    return [value.title, value.artistName, formatDate(value.date)]
      .filter(Boolean)
      .join(" / ");
  }, [value]);

  function selectShow(show: ShowSearchItem) {
    const nextValue: ShowPickerValue = {
      showId: show._id,
      title: show.title,
      date: getShowDate(show),
      artistName: getArtistName(show),
      imageUrl: show.imageUrl ?? undefined,
      matchingStatus: show.matching_status,
    };

    onChange(PatchEvent.from(set(nextValue)));
  }

  function clearShow() {
    onChange(PatchEvent.from(unset()));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          border: "1px solid var(--card-border-color)",
          borderRadius: 6,
          display: "grid",
          gap: 8,
          padding: 12,
        }}
      >
        <strong>Selected show</strong>
        <span>{selectedLabel}</span>
        {value?.showId ? (
          <button type="button" onClick={clearShow}>
            Clear selected show
          </button>
        ) : null}
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Search shows</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search by title, artist, tags, or description"
          style={{
            border: "1px solid var(--card-border-color)",
            borderRadius: 6,
            padding: "10px 12px",
          }}
        />
      </label>

      {error ? (
        <p style={{ color: "var(--card-critical-fg-color)", margin: 0 }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        {loading ? <p style={{ margin: 0 }}>Searching shows...</p> : null}
        {!loading && !items.length ? (
          <p style={{ margin: 0 }}>No shows found.</p>
        ) : null}
        {items.map((show) => {
          const artistName = getArtistName(show);
          const date = formatDate(getShowDate(show));

          return (
            <button
              key={show._id}
              type="button"
              onClick={() => selectShow(show)}
              style={{
                alignItems: "center",
                background: "transparent",
                border: "1px solid var(--card-border-color)",
                borderRadius: 6,
                cursor: "pointer",
                display: "grid",
                gap: 10,
                gridTemplateColumns: "56px minmax(0, 1fr)",
                padding: 8,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  background: "var(--card-skeleton-color-from)",
                  borderRadius: 4,
                  display: "block",
                  height: 56,
                  overflow: "hidden",
                  width: 56,
                }}
              >
                {show.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={show.imageUrl}
                    alt=""
                    style={{
                      height: "100%",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                ) : null}
              </span>
              <span style={{ display: "grid", gap: 4, minWidth: 0 }}>
                <strong>{show.title}</strong>
                <span>
                  {[artistName, date, show.platform]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
                <span>
                  {getCurationStatus(show)}
                  {" / "}
                  {show.matching_status ?? "unknown"}
                  {typeof show.matching_confidence === "number"
                    ? ` / ${show.matching_confidence}%`
                    : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {pagination ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            disabled={!pagination.hasPreviousPage || loading}
            onClick={() =>
              setPage((currentPage) => Math.max(1, currentPage - 1))
            }
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages || 1}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNextPage || loading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
