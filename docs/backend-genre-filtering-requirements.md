# Backend genre-filtering contract

The new website sends canonical taxonomy keys to `GET /api/shows` as repeated
`genre` query parameters:

```text
GET /api/shows?genre=House%20%26%20Techno&limit=100
GET /api/shows?genre=House%20%26%20Techno%20%3E%20House&limit=100
GET /api/shows?genre=House%20%26%20Techno&genre=Jazz%20%26%20Blues&limit=100
```

## Required API behaviour

1. Accept either one genre string or an array from repeated `genre` parameters.
2. Validate each value against the canonical keys generated from
   `genre-taxonomy.json`: a primary (`House & Techno`) or leaf
   (`House & Techno > House`). Ignore or reject unknown keys consistently; do
   not treat them as raw database values.
3. Expand a primary to the union of all aliases under its leaves. Expand a leaf
   to only that leaf's aliases.
4. Union multiple selections and de-duplicate their aliases.
5. Filter `metadata.genre` with exact, anchored, case-insensitive matches. Escape
   every alias before constructing a regular expression. Do not use substring
   matching (`dance` must not match `dancehall`).
6. Apply the genre filter before sorting, pagination (`skip`/`limit`), and
   returning the response.
7. Preserve the existing response shape and other filters. Genre should combine
   with station/location/artist filters using AND; multiple genre selections use
   OR.

Illustrative Express/Mongoose implementation:

```js
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const selected = Array.isArray(req.query.genre)
  ? req.query.genre
  : req.query.genre
  ? [req.query.genre]
  : [];

const rawValues = [...new Set(selected.flatMap((key) => expansion[key] || []))];

if (selected.length && !rawValues.length) {
  return res.status(400).json({ error: "Invalid genre filter" });
}

if (rawValues.length) {
  filter["metadata.genre"] = {
    $in: rawValues.map((value) => new RegExp(`^${escapeRegex(value)}$`, "i")),
  };
}
```

Load the taxonomy/expansion map once when the application starts, not on every
request. The production expansion should contain exact raw values present in the
database, as described in `genre-filtering-guide.md`.

## Verification

From Node 18+:

```bash
node scripts/verify-genre-filtering.mjs https://api.voicesradio.co.uk
node scripts/verify-genre-filtering.mjs https://api.voicesradio.co.uk --all
```

The default run checks representative primaries, leaves, exact-match isolation,
and repeated parameters. `--all` checks every primary and leaf; it deliberately
fails empty results so missing seed data cannot silently appear as a pass.

The current website integration uses the existing `/api/shows/optimized`
workaround documented in `genre-filtering-current-api.md`. The strict contract
above remains the preferred eventual backend implementation.
