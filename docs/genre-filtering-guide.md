# Genre Filtering Guide — Shows & Artists

How the website should use the NTS-style genre hierarchy
([docs/genre-taxonomy.json](./genre-taxonomy.json)) to filter **shows** and **artists**.

---

## 1. The core problem

The hierarchy is clean (12 primaries → ~55 sub-genres). The **database is not** — it still
holds the raw, messy values:

| Collection | Field | Shape | Example raw values |
|---|---|---|---|
| `Show` | `metadata.genre` | **single string** | `"House"`, `"r&b & soul"`, `"Deep House"` |
| `Artist` | `genres` | **array of strings** | `["Techno", "Electronic"]` |

~820 distinct raw values, mixed case, some combined (`"hip-hop & rap"`). A user clicking
**"House & Techno"** in the UI has no idea those map to dozens of raw strings. **The taxonomy is
the translation layer between the clean UI and the messy data.**

There are two ways to bridge that gap. Ship Strategy A now; move to B when you run the migration.

---

## 2. Strategy A — Query-time expansion (recommended now, no DB migration)

Keep the raw values in the DB. Translate the user's clean selection into the list of raw values
at query time, then feed that list into the `$in` filters you already have.

### 2.1 Build the expansion map once

From the taxonomy, produce a reverse index: **primary/sub-genre → [exact raw DB values]**.
Generate it from the audit (`docs/genre-audit.json`) so it only ever contains values that
actually exist in your data. Ship it as `docs/genre-expansion.json`:

```json
{
  "House & Techno":        ["House", "Deep House", "Techno", "Disco", "Trance", "Electro", ...],
  "House & Techno > House": ["House", "Deep House", "Soulful House", "Tech House", ...],
  "Bass, Breaks & Jungle": ["Drum & Bass", "Jungle", "Garage", "UKG", "Dubstep", ...]
}
```

- Selecting a **primary** expands to the union of all its sub-genres' raw values.
- Selecting a **sub-genre** expands to just that leaf's raw values.
- Load it once at boot (`require`), not per-request.

### 2.2 Filtering SHOWS (single-string field)

Mirror the existing pattern in [routes/shows.js:461](../routes/shows.js#L461):

```js
const expansion = require('../docs/genre-expansion.json');

// req.query.genre = "House & Techno"  (a primary or a "Primary > Sub" key)
const rawValues = expansion[req.query.genre] || [];
if (rawValues.length) {
  // exact, anchored, case-insensitive — avoids "dance" matching "dancehall"
  filter['metadata.genre'] = {
    $in: rawValues.map(v => new RegExp(`^${escapeRegex(v)}$`, 'i')),
  };
}
```

### 2.3 Filtering ARTISTS (array field)

Same list, same `$in` — Mongo matches if **any** array element is in the list. Mirror
[routes/artists.js:230](../routes/artists.js#L230):

```js
const rawValues = expansion[req.query.genre] || [];
if (rawValues.length) {
  filter.genres = { $in: rawValues.map(v => new RegExp(`^${escapeRegex(v)}$`, 'i')) };
}
```

### 2.4 Multiple selections (union)

If the user picks several genres, concat their raw-value lists and pass one combined `$in`:

```js
const selected = [].concat(req.query.genre || []);        // ["House & Techno", "Jazz & Blues"]
const rawValues = [...new Set(selected.flatMap(g => expansion[g] || []))];
```

---

## 3. Strategy B — Denormalized fields (after the re-tag migration)

Once you run the deferred migration, store the resolved hierarchy **on each document** and query
it directly. This is faster (indexed equality vs. big regex `$in`) and unlocks facet counts.

### 3.1 Schema additions

```js
// Show.js  → metadata sub-doc
primaryGenre: { type: String, index: true },   // "House & Techno"
subGenres:    { type: [String], index: true }, // ["House", "Deep House"]

// Artist.js
primaryGenres: { type: [String], index: true },
subGenres:     { type: [String], index: true },
```

### 3.2 Querying becomes trivial

```js
// Shows in a primary:
Show.find({ 'metadata.primaryGenre': 'House & Techno' });
// Shows in a specific sub-genre:
Show.find({ 'metadata.subGenres': 'Deep House' });
// Artists (array fields use the same equality — Mongo matches any element):
Artist.find({ primaryGenres: 'Jazz & Blues' });
```

### 3.3 Keep it in sync on ingest

The genre pollers ([scripts/fetchShowGenres.js](../scripts/fetchShowGenres.js),
[scripts/fetchGenresOvernight.js](../scripts/fetchGenresOvernight.js)) must run every newly
fetched raw genre through the **same normalizer + map** and set `primaryGenre`/`subGenres`.
The map stays the single source of truth; the denormalized fields are a cache of it.

---

## 4. Filter UX flow (frontend)

1. Show the **12 primaries** as the top-level filter (chips or a dropdown). This is the whole
   point — a short, non-silly list.
2. Selecting a primary **drills into its sub-genres** (accordion / second row of chips) and, by
   default, filters to *all* shows/artists in that primary (primary = OR of its subs).
3. Selecting a specific sub-genre narrows to that leaf.
4. Multiple selections **union** (see §2.4).
5. Send the selected primary/sub **keys** (e.g. `"House & Techno"`, `"House & Techno > House"`),
   never raw DB values — the backend owns the raw expansion.

---

## 5. Facet counts ("House & Techno (312)")

Users trust filters more when each genre shows how many results it has.

- **Strategy A:** precompute counts in a nightly job (run the expansion over the audit, or a
  `$facet` aggregation) and cache them. Don't compute per-request across regex `$in`.
- **Strategy B:** one aggregation gives live counts:

```js
Show.aggregate([
  { $match: { 'metadata.primaryGenre': { $exists: true } } },
  { $group: { _id: '$metadata.primaryGenre', count: { $sum: 1 } } },
]);
```

---

## 6. Gotchas (learned from the audit)

- **Do NOT use loose substring regex.** `/dance/i` matches `dancehall` (reggae, not EDM);
  `/soul/i` matches `r&b & soul` *and* `neo soul`. Always expand to **exact** raw values and
  anchor with `^…$`. This is why §2 uses the expansion map, not free-text matching.
- **Combined raw strings** (`"hip-hop & rap"`, `"r&b & soul"`) are real DB values — the
  expansion map must list them explicitly under the right leaf. The audit already surfaces them.
- **The ~9% long tail** (508 single-use values like `"music in may"`) has **no mapping** — it
  simply won't match any filter. That's intended: those genres disappear from the UI. Optionally
  add an "Other / Uncategorised" bucket if you want them reachable.
- **Escape user input.** Wrap raw values in `escapeRegex()` before building the `RegExp`
  (values like `r&b` and `d&b` contain regex-significant characters).
- **Index coverage:** Strategy A leans on the existing `metadata.genre` and `genres` indexes
  ([Show.js:80](../models/Show.js#L80), [Artist.js:98](../models/Artist.js#L98)). Regex `$in`
  can't fully use them, so Strategy B's dedicated indexes are the real performance win at scale.

---

## 7. Recommended rollout

1. **Now:** generate `docs/genre-expansion.json` from the finalised taxonomy + audit, wire
   Strategy A into the existing show/artist `$in` filters, ship the 12-primary UI.
2. **Next:** run the re-tag migration → add `primaryGenre`/`subGenres`, switch queries to
   Strategy B, add live facet counts, update the pollers to tag on ingest.

> `escapeRegex` = `s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
