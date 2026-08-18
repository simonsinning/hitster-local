#!/bin/bash

cd "$(dirname "$0")"

APP_DIR="$PWD/spotify-connect-test"
URL="http://127.0.0.1:5187"

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js er ikke installeret. Hitster Local skal bruge Node.js for at starte serveren. Tryk OK, installer Node.js fra siden der åbner, og dobbeltklik derefter på Start Hitster - Mac igen." buttons {"OK"} default button "OK" with title "Hitster Local"'
  open "https://nodejs.org"
  exit 1
fi

if [ ! -f "$APP_DIR/server.js" ]; then
  osascript -e 'display dialog "Kunne ikke finde appens server-fil. Sørg for at hele Hitster-mappen er pakket ud fra ZIP-filen." buttons {"OK"} default button "OK" with title "Hitster Local"'
  exit 1
fi

if curl -fsS "$URL" >/dev/null 2>&1; then
  open "$URL"
  exit 0
fi

echo "Starter Hitster Local..."
echo "Luk ikke dette Terminal-vindue mens I spiller."
echo

node "$APP_DIR/server.js" &
SERVER_PID=$!

sleep 1
open "$URL"

wait "$SERVER_PID"
