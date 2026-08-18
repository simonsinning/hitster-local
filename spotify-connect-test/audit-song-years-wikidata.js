const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const cachePath = path.join(root, ".wikidata-year-audit-cache.json");
const reportPath = path.join(root, "wikidata-year-audit-report.json");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));

const libraryName = args.get("library") || "main";
const limit = Number(args.get("limit") || 0);
const offset = Number(args.get("offset") || 0);

global.window = global;
require(path.join(root, "song-library.js"));
require(path.join(root, "imposter-library.js"));
require(path.join(root, "don-domingo-library.js"));

const libraries = {
  main: window.HITSTER_SONG_LIBRARY || [],
  imposter: window.IMPOSTER_SONG_LIBRARY || [],
  donDomingo: window.DON_DOMINGO_SONG_LIBRARY || [],
};

const allSongs = libraries[libraryName] || [];
const songs = allSongs.slice(offset, limit ? offset + limit : undefined);
const cache = readJson(cachePath, {});
const report = readJson(reportPath, {});
report[libraryName] ||= {};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bfeat\.?\b|\bfeaturing\b|\bft\.?\b/g, " ")
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenSet(value) {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length > 1));
}

function overlapScore(expected, actual) {
  const expectedTokens = tokenSet(expected);
  const actualTokens = tokenSet(actual);
  if (!expectedTokens.size || !actualTokens.size) return 0;
  let matches = 0;
  expectedTokens.forEach((token) => {
    if (actualTokens.has(token)) matches += 1;
  });
  return matches / expectedTokens.size;
}

function cacheKey(song) {
  return `${normalizeText(song.title)}|||${normalizeText(song.artist)}`;
}

function yearFromWikidataTime(value) {
  const match = String(value || "").match(/^[+-]?(\d{4})-/);
  return match ? Number(match[1]) : null;
}

function claimValues(entity, property) {
  return (entity.claims?.[property] || [])
    .map((claim) => claim.mainsnak?.datavalue?.value)
    .filter(Boolean);
}

function entityLabel(entity) {
  return entity.labels?.en?.value || entity.labels?.da?.value || Object.values(entity.labels || {})[0]?.value || "";
}

function entityAliases(entity) {
  return Object.values(entity.aliases || {}).flatMap((items) => items.map((item) => item.value));
}

function publicationYears(entity) {
  return claimValues(entity, "P577")
    .map((value) => yearFromWikidataTime(value.time))
    .filter((year) => Number.isInteger(year));
}

function performerIds(entity) {
  return claimValues(entity, "P175")
    .map((value) => value.id)
    .filter(Boolean);
}

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "HitsterLocalYearAudit/1.0",
          "Accept": "application/json",
        },
      });
      if (response.ok) return response.json();
      lastError = new Error(`Wikidata ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(1800 * attempt);
  }
  throw lastError;
}

async function searchEntities(song, language) {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbsearchentities");
  url.searchParams.set("format", "json");
  url.searchParams.set("language", language);
  url.searchParams.set("uselang", language);
  url.searchParams.set("limit", "10");
  url.searchParams.set("search", song.title);
  return fetchJson(url);
}

async function getEntities(ids) {
  if (!ids.length) return {};
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("format", "json");
  url.searchParams.set("languages", "en|da");
  url.searchParams.set("props", "labels|aliases|claims|descriptions");
  url.searchParams.set("ids", ids.join("|"));
  const data = await fetchJson(url);
  return data.entities || {};
}

async function auditSong(song, absoluteIndex) {
  const key = cacheKey(song);
  if (!cache[key]) {
    const searches = [];
    for (const language of ["en", "da"]) {
      searches.push(await searchEntities(song, language));
      await sleep(1200);
    }
    const candidateIds = [...new Set(searches.flatMap((search) => (search.search || []).map((item) => item.id).filter(Boolean)))];
    const entities = await getEntities(candidateIds);
    const performerIdsToFetch = [...new Set(Object.values(entities).flatMap(performerIds))];
    const performers = await getEntities(performerIdsToFetch);
    const candidates = Object.values(entities)
      .map((entity) => {
        const labels = [entityLabel(entity), ...entityAliases(entity)].filter(Boolean);
        const titleScore = Math.max(0, ...labels.map((label) => overlapScore(song.title, label)));
        const performerLabels = performerIds(entity).map((id) => entityLabel(performers[id])).filter(Boolean);
        const performerScore = performerLabels.length
          ? Math.max(0, ...performerLabels.map((label) => overlapScore(song.artist, label)))
          : overlapScore(song.artist, entity.descriptions?.en?.value || "");
        const years = publicationYears(entity);
        return {
          id: entity.id,
          label: entityLabel(entity),
          description: entity.descriptions?.en?.value || entity.descriptions?.da?.value || "",
          performer: performerLabels.join(", "),
          year: years.length ? Math.min(...years) : null,
          confidence: Number(((titleScore * 0.62) + (performerScore * 0.38)).toFixed(3)),
        };
      })
      .filter((candidate) => candidate.year)
      .sort((a, b) => b.confidence - a.confidence);

    cache[key] = candidates[0] || { year: null, confidence: 0 };
    writeJson(cachePath, cache);
    await sleep(1200);
  }

  const result = cache[key];
  report[libraryName][absoluteIndex] = {
    title: song.title,
    artist: song.artist,
    localYear: song.year,
    source: song.source || "",
    wikidataYear: result.year || null,
    confidence: result.confidence || 0,
    wikidataId: result.id || null,
    wikidataLabel: result.label || "",
    wikidataPerformer: result.performer || "",
    status: !result.year
      ? "unmatched"
      : Number(result.year) === Number(song.year)
      ? "match"
      : result.confidence >= 0.84
      ? "mismatch-high-confidence"
      : "mismatch-needs-review",
  };
  writeJson(reportPath, report);
  return report[libraryName][absoluteIndex];
}

(async () => {
  console.log(`Auditing ${songs.length} songs from ${libraryName}, offset ${offset}`);
  for (let index = 0; index < songs.length; index += 1) {
    const absoluteIndex = offset + index;
    const result = await auditSong(songs[index], absoluteIndex);
    console.log(`${absoluteIndex + 1}/${allSongs.length} ${result.status}: ${result.title} - ${result.artist} (${result.localYear} -> ${result.wikidataYear || "?"}, c=${result.confidence})`);
  }
})();
