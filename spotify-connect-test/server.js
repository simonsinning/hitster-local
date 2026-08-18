const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5187);
const spotifyPagePlaylistCache = new Map();

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === "/favicon.ico") {
    res.writeHead(204, { "cache-control": "no-store" });
    res.end();
    return;
  }

  if (url.pathname === "/bopster-playlist") {
    try {
      const id = url.searchParams.get("id");
      if (!/^\d+$/.test(id || "")) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Invalid playlist id" }));
        return;
      }

      const html = await fetchText(`https://bopster.app/en/playlist?id=${id}`);
      const songs = parseBopsterSongs(html);
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify({ id, songs }));
    } catch (error) {
      res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  if (url.pathname === "/spotify-page-playlist") {
    try {
      const id = url.searchParams.get("id");
      if (!/^[a-zA-Z0-9]+$/.test(id || "")) {
        res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Invalid playlist id" }));
        return;
      }

      if (spotifyPagePlaylistCache.has(id)) {
        res.writeHead(200, {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(spotifyPagePlaylistCache.get(id)));
        return;
      }

      const html = await fetchText(`https://open.spotify.com/playlist/${id}`);
      const songs = await hydrateSpotifyPageSongYears(parseSpotifyPageSongs(html));
      const payload = { id, songs, trackIds: songs.map((song) => song.id) };
      spotifyPagePlaylistCache.set(id, payload);
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(payload));
    } catch (error) {
      res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  const pathname = url.pathname === "/" || url.pathname === "/callback" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "cache-control": "no-store",
      "content-type": types[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
});

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "accept-encoding": "identity", "user-agent": "Hitster Local" } }, (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Bopster svarede ${response.statusCode}`));
          response.resume();
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

function parseBopsterSongs(html) {
  const text = decodeHtmlEntities(html)
    .replace(/\r/g, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<(?:br|\/p|\/div|\/li|\/h\d|\/tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "\n");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const songs = [];

  for (let index = 0; index < lines.length - 2; index++) {
    if (!/^\d+$/.test(lines[index])) continue;
    const title = lines[index + 1];
    let artistLine = lines[index + 2];
    if (/^\(\d{4}\)$/.test(lines[index + 3] || "")) {
      artistLine = `${artistLine} ${lines[index + 3]}`;
    }
    const match = artistLine.match(/^(.+?)\s*(?:\[([^\]]+)\])?\s*\((\d{4})\)$/);
    if (!match || !title || /^\d+$/.test(title)) continue;
    songs.push({
      title,
      artist: match[1].trim(),
      year: Number(match[3]),
      genre: "soundtrack",
      context: match[2] ? match[2].trim() : "",
      source: "Bopster Movies & TV",
    });
  }

  return dedupeSongs(songs);
}

function parseSpotifyPageSongs(html) {
  const seen = new Set();
  const songs = [];
  const rows = html.split('data-testid="track-row"').slice(1);

  for (const row of rows) {
    const id = row.match(/href="\/track\/([a-zA-Z0-9]{22})"/)?.[1]
      || row.match(/spotify:track:([a-zA-Z0-9]{22})/)?.[1];
    if (!id || seen.has(id)) continue;

    const titleHtml = row.match(/data-encore-id="listRowTitle"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)?.[1];
    const title = cleanHtmlText(titleHtml || row.match(/aria-label="([^"]+)"/)?.[1] || "");
    const artists = [];
    const artistPattern = /data-testid="internal-artist-link"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/g;
    let artistMatch = artistPattern.exec(row);
    while (artistMatch) {
      const artist = cleanHtmlText(artistMatch[1]);
      if (artist) artists.push(artist);
      artistMatch = artistPattern.exec(row);
    }

    if (title && artists.length) {
      seen.add(id);
      songs.push({
        id,
        title,
        artist: artists.join(", "),
        year: 0,
        uri: `spotify:track:${id}`,
        genre: "playlist",
      });
    }
  }

  return songs;
}

async function hydrateSpotifyPageSongYears(songs) {
  const hydrated = [];
  const batchSize = 8;
  for (let index = 0; index < songs.length; index += batchSize) {
    const batch = songs.slice(index, index + batchSize);
    const years = await Promise.all(batch.map((song) => fetchSpotifyTrackYear(song.id)));
    batch.forEach((song, offset) => {
      if (years[offset]) hydrated.push({ ...song, year: years[offset] });
    });
  }
  return hydrated;
}

async function fetchSpotifyTrackYear(id) {
  try {
    const html = await fetchText(`https://open.spotify.com/track/${id}`);
    return Number(
      html.match(/"release_date"\s*:\s*"(\d{4})/)?.[1]
      || html.match(/Song\s*·\s*(\d{4})/)?.[1]
      || html.match(/music:release_date" content="(\d{4})/)?.[1]
    ) || 0;
  } catch {
    return 0;
  }
}

function cleanHtmlText(value) {
  return decodeHtmlEntities(String(value || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function dedupeSongs(songs) {
  const seen = new Set();
  return songs.filter((song) => {
    const key = `${song.title.toLowerCase()}::${song.artist.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Spotify Connect test: http://127.0.0.1:${port}`);
});
