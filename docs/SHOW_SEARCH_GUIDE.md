# Searching Shows on MongoDB — Performance & Efficiency Guide

How the `voices_backend` searches the `shows` collection, and how to build a fast, efficient CMS search on top of it.

All code lives in [models/Show.js](../models/Show.js), [routes/shows.js](../routes/shows.js), and [scripts/optimizeDatabase.js](../scripts/optimizeDatabase.js).

---

## 1. The two search paths

We deliberately run **two different search strategies** depending on the use case. Choosing the right one is the single biggest performance lever.

### A. Typeahead / autocomplete — `$text` index (FAST)
[routes/shows.js:186](../routes/shows.js#L186) — `GET /api/shows/search?q=...`

```js
const query = { $text: { $search: q.trim() } };
const suggestions = await Show.find(query, { score: { $meta: "textScore" } })
  .select('title description platform discovered_date matching_confidence')
  .sort({ score: { $meta: "textScore" } })
  .limit(parseInt(limit))
  .lean();
```

Why it is fast:
- Uses the **text index** on `title / description / metadata.tags` ([models/Show.js:85](../models/Show.js#L85)) — index-backed, not a collection scan.
- Relevance-ranked by `textScore` (title weighted highest, see §3).
- `.select(...)` projects only the fields the UI needs → smaller payload.
- `.lean()` returns plain JS objects (skips Mongoose hydration) → less CPU/memory.
- `.limit(...)` caps work; rejects queries `< 2` chars to avoid useless scans.

**Use this for CMS search-as-you-type.**

### B. Filtered listing / advanced search — aggregation + `$regex` (FLEXIBLE)
[routes/shows.js:410](../routes/shows.js#L410) — `GET /api/shows/optimized`

Supports `search`, `genres[]`, `artistId`, `featured`, `platform`, `sort`, `page`/`limit`. Key efficiency features:
- **`$facet`** computes the page of data **and** the total count in a *single* round-trip ([routes/shows.js:529](../routes/shows.js#L529)) — no second `countDocuments()` query.
- `$lookup` joins artist info server-side; limit is capped at 100 to bound payload size.
- Returns rich pagination metadata (`hasNextPage`, `totalPages`, `startIndex`...).

**Trade-off to know:** the free-text part here uses case-insensitive `$regex` ([routes/shows.js:449](../routes/shows.js#L449)):
```js
filter.$or = [
  { title:            { $regex: search.trim(), $options: 'i' } },
  { description:      { $regex: search.trim(), $options: 'i' } },
  { 'metadata.tags':  { $regex: search.trim(), $options: 'i' } }
];
```
Unanchored, case-insensitive `$regex` **cannot use a B-tree index** → it scans. Fine for filtered admin browsing on a bounded set; **not** for high-frequency typeahead. For the CMS, prefer path A for text and use path B's filters (`platform`, `genres`, `artistId`, `featured`) which *are* index-backed.

---

## 2. Indexes that make search efficient

Defined in [models/Show.js:69-85](../models/Show.js#L69) and provisioned by [scripts/optimizeDatabase.js](../scripts/optimizeDatabase.js):

| Index | Purpose |
|-------|---------|
| `{ title:'text', description:'text', 'metadata.tags':'text' }` | Text search (path A) |
| `{ matching_status:1, artistId:1, discovered_date:-1 }` | Pending-show search/scope |
| `{ 'metadata.genre':1 }`, `{ 'metadata.tags':1 }` | Genre/tag filtering |
| `{ platform:1, upload_date:-1 }` | Platform-scoped listings |
| `{ featured:1, date:-1 }`, `{ show_date:-1 }`, `{ playCount:-1 }` | Sort-backed listings |

Run `node scripts/optimizeDatabase.js` to (re)create them; it builds with `background:true` and prints an `explain("executionStats")` so you can confirm an `IXSCAN` (index scan) rather than a `COLLSCAN`.

---

## 3. Relevance weighting

The weighted text index ranks title matches 10× above description ([scripts/optimizeDatabase.js:51](../scripts/optimizeDatabase.js#L51)):
```js
weights: { title: 10, description: 1 }
```
So a query matching a show *title* surfaces above one matching only the description — exactly what a CMS search box wants.

---

## ⚠️ 4. Known gotcha before you build on this

MongoDB allows **only one text index per collection**, but two are declared:
- schema: `{ title, description, metadata.tags }` ([models/Show.js:85](../models/Show.js#L85))
- script: `{ title, description }` with weights ([scripts/optimizeDatabase.js:43](../scripts/optimizeDatabase.js#L43))

Whichever is created first wins; the second throws `IndexOptionsConflict` (code 85). **Confirm which text index is live** (`db.shows.getIndexes()`) so you know whether `metadata.tags` is searchable and whether weighting is active. Reconcile these to one definition before relying on tag search.

---

## 5. CMS admin search endpoint

`GET /api/shows/admin/search` — requires `auth` + `isAdmin` middleware.

### What it does differently from the public endpoints

| | Public `/search` | Public `/optimized` | **Admin `/admin/search`** |
|---|---|---|---|
| Auth | None | None | `auth + isAdmin` |
| Scope | `pending` only (default) | All, but no editorial filters | **All shows, no restriction** |
| Artist match | No | No | **Yes — by name and alias** |
| Fields returned | Thin public set | Public + genre filters | Admin fields incl. `matching_status`, `matching_confidence`, `platform_id` |
| Sort | `textScore` | Configurable | **`date` desc (most recent first)** |
| Free-text strategy | `$text` index | `$regex` scan | `$regex` scan + two-step artist resolve |

### Query parameters

| Param | Default | Notes |
|-------|---------|-------|
| `q` | (none) | Search string; omit for browse-all mode |
| `page` | `1` | 1-based page number |
| `limit` | `50` | Capped at `100` |

### How the two-step artist match works

Because artist `name` is not stored on the Show document (only `artistId`), matching by artist name requires a join. The endpoint avoids a full collection join by doing it in two steps:

1. `Artist.find({ $or: [{ name: rx }, { aliases: rx }] }).select('_id').lean()` — resolves the search string to a small set of `artistId`s. This is index-backed (`name` and `aliases` both have dedicated indexes on the Artist collection).
2. The show `$match` uses `$or` across title/description/`metadata.tags` **plus** `{ artistId: { $in: resolvedIds } }` — so artist-matched shows are found without a full `$lookup` before filtering.

The final `$lookup` that follows is for display only — joining the artist's name into the response payload.

### Response shape

```json
{
  "items": [
    {
      "title": "...",
      "description": "...",
      "date": "...",
      "platform": "mixcloud",
      "platform_id": "...",
      "matching_status": "matched",
      "matching_confidence": 95,
      "discovered_date": "...",
      "imageUrl": null,
      "artistId": "...",
      "artist": { "_id": "...", "name": "Jamie Jones" }
    }
  ],
  "pagination": {
    "page": 1, "limit": 50, "total": 142, "pages": 3,
    "hasNextPage": true, "hasPreviousPage": false
  },
  "performance": {
    "searchScope": "all",
    "artistLookupPerformed": true,
    "queryTime": "..."
  }
}
```

`matching_status` and `matching_confidence` are returned explicitly so the CMS can flag shows without an artist (`artistId: null`, `matching_status: "pending"`) as ineligible for featuring or curation — enforcing the data-quality rule that only matched shows may be curated.

### Performance characteristics

The free-text match uses `$regex` (not `$text`), which is a collection scan on the show side. This is intentional:
- The endpoint is authenticated and low-QPS (admin-only).
- `$regex` gives partial/substring matching that editors expect ("pri" → "Pride Radio").
- `$facet` keeps the data + count in a single round-trip.
- The artist-side lookup is index-backed and cheap.

If the collection grows to 100k+ shows and latency becomes a concern, the upgrade path is Atlas Search (full-text with facets), which can be dropped in without changing the response contract.

---

## 6. Recommended pattern for the CMS

1. **Admin search box:** call `GET /api/shows/admin/search?q=...` — single endpoint handles title, description, tags, and artist name.
2. **Browse / no query:** call the same endpoint without `q` — returns all shows, most recent first, paginated.
3. **Data quality triage:** shows returned with `artistId: null` or `matching_status: "pending"` are unmatched and cannot be featured — surface these visually in the CMS.
4. Ensure the text index exists and matches your intended searchable fields (§4) before relying on the public `/search` typeahead.
