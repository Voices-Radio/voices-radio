# Genre filtering with the current API (no backend changes)

**Short answer:** the endpoint you spec'd, `GET /api/shows`, ignores `genre`
entirely — you're right that it doesn't work there. But the backend already has
server-side genre filtering on **`GET /api/shows/optimized`**, and you can get
the behaviour described in `genre_filtering_requirements.md` today by doing the
taxonomy expansion client-side. This doc explains how, and lists the gaps that
still need a backend change.

## What exists today

`GET /api/shows/optimized` accepts:

| Param | Notes |
|---|---|
| `genres` | Comma-separated string **or** repeated params. Note the plural — not `genre`. |
| `page`, `limit` | 1-based page; `limit` capped at **100**. (Not `skip`.) |
| `search`, `artistId`, `featured`, `platform`, `sort` | Other filters. |

Each `genres` value is compiled directly into a **case-insensitive regex** and
matched with `$in` against `metadata.genre` **and** `metadata.tags` (OR'd).
There is no server-side taxonomy, validation, or anchoring.

## How to get exact-match filtering now

Because the backend treats each value as a raw regex pattern, the client can
supply anchored patterns itself:

1. Load `genre-taxonomy.json` in the frontend and build the expansion map there
   (primary → union of leaf aliases; leaf → its own aliases), exactly as the
   requirements doc describes.
2. Validate the user's selection against canonical keys client-side (the
   backend will not 400 on junk — an unknown value just matches nothing or,
   worse, substring-matches something).
3. For each expanded alias, regex-escape it and anchor it:

```js
const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = [...new Set(aliases)].map((a) => `^${escapeRegex(a)}$`);
```

4. Send them as repeated params (avoid the comma-joined form — aliases may
   contain commas):

```text
GET /api/shows/optimized?genres=%5Ehouse%24&genres=%5Edeep%20house%24&page=1&limit=100
```

5. Read results from the response envelope — this endpoint does **not** return
   a bare array:

```json
{ "items": [...], "pagination": { "page": 1, "limit": 100, "total": 0, "totalPages": 0, ... }, "performance": { ... } }
```

Multiple selections are OR'd (spec §7 ✓), and `artistId` / `platform` /
`featured` combine with AND (✓). Filtering happens before sort/pagination (✓).

## Caveats / remaining gaps (need backend work)

1. **`metadata.tags` is also matched.** An anchored alias hitting a tag can
   return shows whose `metadata.genre` differs. Usually benign, but it's not
   the exact contract in the requirements.
2. **No server-side validation** — no `400 Invalid genre filter`. Client must
   guarantee keys are canonical.
3. **Don't combine `search` with `genres`.** The backend merges both into one
   `$or`, so they combine as OR, not AND (this is a bug on our side).
4. **Contract coupling.** Exactness only works because the backend passes your
   value through as a regex. If we later escape input server-side, `^…$` would
   be matched literally. Treat this as a stopgap.
5. `verify-genre-filtering.mjs` targets `GET /api/shows?genre=…`, so it will
   fail against the current backend even with this workaround in place.

If you need the strict contract (validation, genre-only matching, `genre`
param on `/api/shows`), that's a small backend change — the requirements doc's
illustrative implementation is accurate; we'd load the expansion map at boot
and drop it into the existing filter builder.
