const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const cachePath = path.join(root, ".year-audit-cache.json");
const reportPath = path.join(root, "year-audit-report.json");
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

const songs = (libraries[libraryName] || []).slice(offset, limit ? offset + limit : undefined);
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

function tokens(value) {
  return new Set(normalizeText(value).split(" ").filter((token) => token.length > 1));
}

function overlapScore(expected, actual) {
  const expectedTokens = tokens(expected);
  const actualTokens = tokens(actual);
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

function yearFromDate(value) {
  const match = String(value || "").match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

function earliestReleaseYear(recording) {
  const years = (recording.releases || [])
    .map((release) => yearFromDate(release.date))
    .filter((year) => Number.isInteger(year));
  return years.length ? Math.min(...years) : null;
}

function scoreRecording(song, recording) {
  const titleScore = overlapScore(song.title, recording.title);
  const artistCredit = (recording["artist-credit"] || [])
    .map((credit) => credit.artist?.name || credit.name || "")
    .join(" ");
  const artistScore = overlapScore(song.artist, artistCredit);
  return (titleScore * 0.62) + (artistScore * 0.38);
}

function pickBest(song, recordings) {
  const scored = recordings
    .map((recording) => ({
      recording,
      score: scoreRecording(song, recording),
      year: earliestReleaseYear(recording),
    }))
    .filter((item) => item.year)
    .sort((a, b) => b.score - a.score || a.year - b.year);
  return scored[0] || null;
}

async function fetchMusicBrainz(song) {
  const query = `recording:"${song.title}" AND artist:"${song.artist}"`;
  const url = new URL("https://musicbrainz.org/ws/2/recording/");
  url.searchParams.set("query", query);
  url.searchParams.set("fmt", "json");
  url.searchParams.set("limit", "10");
  url.searchParams.set("inc", "releases+artist-credits");
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "HitsterLocalYearAudit/1.0 (local personal library audit)",
          "Accept": "application/json",
        },
      });
      if (response.ok) return response.json();
      lastError = new Error(`MusicBrainz ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(1500 * attempt);
  }
  throw lastError;
}

async function auditSong(song, absoluteIndex) {
  const key = cacheKey(song);
  if (!cache[key]) {
    const data = await fetchMusicBrainz(song);
    const best = pickBest(song, data.recordings || []);
    cache[key] = best ? {
      matchedTitle: best.recording.title,
      matchedArtist: (best.recording["artist-credit"] || []).map((credit) => credit.artist?.name || credit.name || "").join(", "),
      musicBrainzYear: best.year,
      confidence: Number(best.score.toFixed(3)),
      recordingId: best.recording.id,
    } : {
      musicBrainzYear: null,
      confidence: 0,
    };
    writeJson(cachePath, cache);
    await sleep(1100);
  }

  const result = cache[key];
  report[libraryName][absoluteIndex] = {
    title: song.title,
    artist: song.artist,
    localYear: song.year,
    source: song.source || "",
    ...result,
    status: result.musicBrainzYear === null
      ? "unmatched"
      : result.musicBrainzYear === Number(song.year)
      ? "match"
      : result.confidence >= 0.86
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
    console.log(`${absoluteIndex + 1}/${(libraries[libraryName] || []).length} ${result.status}: ${result.title} - ${result.artist} (${result.localYear} -> ${result.musicBrainzYear || "?"}, c=${result.confidence})`);
  }
})();
