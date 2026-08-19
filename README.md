# Hitster Local

Lokal musikquiz til Spotify med flere gamemodes: Classic, Battle Royale, Timeline Showdown, Push Your Luck, Imposter, Wavelength DJ, Don Domingo mode og flere.

## Start her

Download projektet som ZIP fra GitHub og pak ZIP-filen ud først.

### Windows

Dobbeltklik på:

```text
Start Hitster - Windows.cmd
```

eller:

```text
Start Hitster.cmd
```

Hvis Node.js mangler, åbner startfilen automatisk Node.js-hjemmesiden. Installer Node.js, og dobbeltklik derefter på startfilen igen.

### Mac

Første gang kan Mac blokere filen, fordi den er downloadet fra GitHub og ikke Apple-signeret.

Gør sådan:

1. Højreklik eller Ctrl-klik på:

```text
Start Hitster - Mac.command
```

2. Vælg `Åbn`.
3. Tryk `Åbn` igen i advarslen.

Efter første gang kan den normalt åbnes med dobbeltklik.

Hvis Mac ikke viser `Åbn`-knappen:

1. Tryk `OK` i advarslen.
2. Åbn `Systemindstillinger`.
3. Gå til `Anonymitet & sikkerhed`.
4. Find beskeden om `Start Hitster - Mac.command`.
5. Tryk `Åbn alligevel`.

Sidste udvej, hvis Mac stadig blokerer: åbn Terminal, træk hele Hitster-mappen ind i Terminal-vinduet efter denne kommando, og tryk Enter:

```bash
xattr -dr com.apple.quarantine 
```

Hvis Node.js mangler, åbner startfilen automatisk Node.js-hjemmesiden. Installer Node.js, og åbn derefter startfilen igen.

Der ligger også en fil der hedder `MAC - Første gang.txt` med samme guide.

## Når appen er startet

Siden åbner automatisk i browseren:

```text
http://127.0.0.1:5187
```

Luk ikke terminal-/kommandovinduet mens I spiller. Det er den lokale server.

## Spotify-opsætning

Appen bruger Spotify-login til at styre afspilning.

1. Gå til Spotify Developer Dashboard:
   https://developer.spotify.com/dashboard
2. Opret en app.
3. Tilføj denne Redirect URI:

```text
http://127.0.0.1:5187/callback
```

4. Kopiér dit Client ID.
5. Indsæt Client ID i Hitster Local og tryk `Gem ID`.
6. Tryk `Log ind`.

Du skal ikke bruge Client Secret.

## Hvis venner skal prøve

Den nemmeste metode er:

1. Send dem GitHub-linket.
2. De trykker `Code` og derefter `Download ZIP`.
3. De pakker ZIP-filen ud.
4. De dobbeltklikker på den startfil, der passer til deres computer.

Spotify-apps i Development Mode kræver normalt, at hver Spotify-bruger er tilføjet under Users Management i Spotify Developer Dashboard. Ellers kan login eller Spotify-kald give 403.

## Fejlfinding

- `Der kan ikke oprettes forbindelse til dette website`: serveren kører sandsynligvis ikke. Dobbeltklik på startfilen igen.
- Spotify `403`: log ind igen, eller sørg for at Spotify-brugeren er allowlistet i Spotify Developer Dashboard.
- Ingen afspilningsenhed: åbn Spotify på computeren eller telefonen, start en sang kort, og tryk derefter `Hent enheder`.
- Redirect-fejl: Redirect URI skal være præcis `http://127.0.0.1:5187/callback`.
- Mac advarer om malware/ukendt udvikler: det er Apples sikkerhedssystem, fordi startfilen ikke er Apple-signeret. Højreklik på `Start Hitster - Mac.command`, vælg `Åbn`, og godkend den første gang.
