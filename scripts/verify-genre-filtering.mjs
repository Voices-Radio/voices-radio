#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const DEFAULT_API_URL = "https://api.voicesradio.co.uk";
const LIMIT = 100;
const taxonomyUrl = new URL(
  "../docs/plans/genre-taxonomy.json",
  import.meta.url,
);
const { taxonomy } = JSON.parse(await readFile(taxonomyUrl, "utf8"));

const apiUrl = (process.argv[2] ?? DEFAULT_API_URL).replace(/\/$/, "");
const runAll = process.argv.includes("--all");

function genreKey(primary, subgenre) {
  return subgenre ? `${primary} > ${subgenre}` : primary;
}

function aliasesFor(key) {
  if (taxonomy[key]) return Object.values(taxonomy[key]).flat();

  const [primary, subgenre] = key.split(" > ");
  return taxonomy[primary]?.[subgenre] ?? [];
}

function normalize(value) {
  return value.trim().toLocaleLowerCase("en-GB");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchShows(selectedGenres) {
  const url = new URL("/api/shows/optimized", apiUrl);
  const aliases = new Set(selectedGenres.flatMap(aliasesFor));
  url.searchParams.set("limit", String(LIMIT));
  url.searchParams.set("page", "1");
  aliases.forEach((alias) =>
    url.searchParams.append("genres", `^${escapeRegex(alias)}$`),
  );

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  const payload = await response.json();
  const shows = Array.isArray(payload)
    ? payload
    : payload.items ?? payload.shows ?? [];

  if (!Array.isArray(shows)) {
    throw new Error(`Unexpected response shape from ${url}`);
  }

  return shows;
}

async function verifySelection(selectedGenres) {
  const allowed = new Set(selectedGenres.flatMap(aliasesFor).map(normalize));
  const shows = await fetchShows(selectedGenres);

  if (shows.length === 0) {
    throw new Error(
      `${selectedGenres.join(
        " OR ",
      )}: returned no records; verify against known seeded genres`,
    );
  }

  const mismatches = shows.filter((show) => {
    const rawValues = [show.metadata?.genre, ...(show.metadata?.tags ?? [])];
    return !rawValues.some(
      (value) => typeof value === "string" && allowed.has(normalize(value)),
    );
  });

  if (mismatches.length > 0) {
    const sample = mismatches.slice(0, 5).map((show) => ({
      id: show._id,
      genre: show.metadata?.genre ?? null,
      tags: show.metadata?.tags ?? [],
    }));
    throw new Error(
      `${selectedGenres.join(" OR ")}: ${mismatches.length}/${
        shows.length
      } records do not exactly match the taxonomy: ${JSON.stringify(sample)}`,
    );
  }

  console.log(`PASS  ${selectedGenres.join(" OR ")} (${shows.length} records)`);
}

const allKeys = Object.entries(taxonomy).flatMap(([primary, subgenres]) => [
  primary,
  ...Object.keys(subgenres).map((subgenre) => genreKey(primary, subgenre)),
]);
const representativeSelections = [
  ["House & Techno"],
  ["House & Techno > House"],
  ["Pop & Dance > Dance / EDM"],
  ["Reggae, Dub & Dancehall > Dancehall"],
  ["House & Techno > House", "Jazz & Blues"],
];
const selections = runAll
  ? allKeys.map((key) => [key])
  : representativeSelections;

console.log(`Verifying ${apiUrl}/api/shows/optimized`);
let failures = 0;
for (const selection of selections) {
  try {
    await verifySelection(selection);
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures}/${selections.length} checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`\nAll ${selections.length} checks passed.`);
}
