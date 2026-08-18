# Hitster Local

Lokal musikquiz til Spotify med flere gamemodes: Classic, Battle Royale, Timeline Showdown, Push Your Luck, Imposter, Wavelength DJ, Don Domingo mode og flere.

## Sådan starter du

1. Installer Node.js, hvis du ikke allerede har det.
2. Åbn en terminal i denne mappe.
3. Start serveren:

```powershell
node .\spotify-connect-test\server.js
```

4. Åbn siden:

```text
http://127.0.0.1:5187
```

Hvis du bruger skrivebordsgenvejen `Start Hitster.cmd`, kan du bare dobbeltklikke på den.

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

1. Download projektet som ZIP fra GitHub.
2. Pak ZIP-filen ud.
3. Start serveren med kommandoen ovenfor eller `Start Hitster.cmd`.
4. Lav eget Spotify Client ID, eller brug et Client ID fra en Spotify-app hvor brugeren er allowlistet.

Spotify-apps i Development Mode kræver normalt, at hver Spotify-bruger er tilføjet under Users Management i Spotify Developer Dashboard. Ellers kan login eller Spotify-kald give 403.

## Fejlfinding

- `Der kan ikke oprettes forbindelse til dette website`: serveren kører sandsynligvis ikke. Start den igen.
- Spotify `403`: log ind igen, eller sørg for at Spotify-brugeren er allowlistet i Spotify Developer Dashboard.
- Ingen afspilningsenhed: åbn Spotify på computeren eller telefonen, start en sang kort, og tryk derefter `Hent enheder`.
- Redirect-fejl: Redirect URI skal være præcis `http://127.0.0.1:5187/callback`.
