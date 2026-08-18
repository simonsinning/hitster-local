const redirectUri = "http://127.0.0.1:5187/callback";
const authorizeUrl = "https://accounts.spotify.com/authorize";
const tokenUrl = "https://accounts.spotify.com/api/token";
const apiBase = "https://api.spotify.com/v1";
const scopes = "user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative";
const defaultWinScore = 10;
const defaultWavelengthWinScore = 30;
const defaultSharedTimelineWinScore = 10;
const defaultPushLuckWinScore = 10;
const defaultImposterCount = 1;
const defaultHitsterCards = 3;
const defaultBattleRoyaleLives = 3;
const savedGameKey = "hitster_active_game";
const loginReturnStageKey = "hitster_login_return_stage";
const currentYear = new Date().getFullYear();
let allowNavigation = false;

const gameModes = {
  classic: {
    title: "Classic",
    description: "Den klassiske tidslinje: afspil en skjult sang, placer den i den rigtige rækkefølge, og vind ved at bygge den bedste timeline.",
    source: "local",
  },
  generations: {
    title: "Battle of the Generations",
    description: "Hver spiller vælger en musikæra. Du får primært sange fra din egen generation og prøver at slå de andre på hjemmebane.",
    source: "local",
    battle: true,
  },
  guilty: {
    title: "Guilty Pleasures",
    description: "Fuld af sange man enten elsker, hader eller nægter at indrømme man kan teksten til. Spilles med klassisk tidslinje.",
    source: "bopster",
    playlistIds: ["107", "108", "109", "110"],
  },
  movies: {
    title: "Movies & TV Soundtracks",
    description: "Soundtracks fra film og serier. I stedet for kunstner-bonus kan I give bonus for at gætte filmen eller serien.",
    source: "bopster",
    playlistId: "1951",
    minSongs: 300,
    soundtrackBonus: true,
  },
  donDomingo: {
    title: "Don Domingo mode",
    description: "Antons egen musiksmag som fast lokal pulje. En personlig variant med klassiske regler og lidt mere Don Domingo-energi.",
    source: "static",
    libraryName: "DON_DOMINGO_SONG_LIBRARY",
    playlistId: "5yNyrf6T5Op8tzcoKLaszH",
    minSongs: 1,
  },
  wavelength: {
    title: "Wavelength DJ",
    description: "Alle undtagen gætteren ser et hemmeligt tal og finder selv en sang i Spotify, der passer til kategorien og tallet.",
    source: "wavelength",
  },
  battleRoyale: {
    title: "Battle Royale",
    description: "Alle starter med tre liv. Hver forkert placering koster et liv, og sidste spiller tilbage vinder.",
    source: "local",
    battleRoyale: true,
  },
  sharedTimeline: {
    title: "Timeline Showdown",
    description: "Alle får samme sang og placerer den i hver deres tidslinje. Først til pointmålet vinder, med sudden death hvis flere når det samtidig.",
    source: "local",
    sharedTimeline: true,
  },
  pushLuck: {
    title: "Push Your Luck",
    description: "Stop efter en korrekt sang, eller fortsæt for at presse turen. En fejl kan koste hele turens gevinst.",
    source: "local",
    pushLuck: true,
  },
  imposter: {
    title: "Imposter",
    description: "Crewmates får den hemmelige sang at vide og hører den. Impostere ser kun deres rolle og skal bluffe sig gennem samtalen.",
    source: "static",
    libraryName: "IMPOSTER_SONG_LIBRARY",
    minSongs: 50,
    imposter: true,
  },
  puzzleRush: {
    title: "Puzzle Rush",
    description: "Placér så mange sange korrekt som muligt i ét run. Første fejl stopper forsøget, og mode kan spilles alene som træning.",
    source: "local",
    puzzleRush: true,
  },
};

const fallbackWavelengthCategories = [
  "Hvor passende er sangen til en begravelse, hvor ingen rigtig kunne lide den afdøde?",
  "Hvor meget lyder den som noget {player} ville sætte på og kalde undervurderet?",
  "Hvor god er sangen til at score med ved et poolbord?",
  "Hvor meget passer den til at vågne op i en taxa uden at vide hvorfor?",
  "Hvor meget lyder den som soundtracket til {player}s skurke-origin story?",
  "Hvor farlig er sangen at give aux til efter midnat?",
  "Hvor meget ville den få en familiefest til at skifte energi?",
  "Hvor god er den til en første date, der allerede er lidt for intens?",
  "Hvor meget lyder den som noget man hører alene og bagefter sletter fra historikken?",
  "Hvor meget passer den til at gå ind i et rum som om man ejer stedet?",
  "Hvor sandsynligt er det at {player} ville forsvare den i en alt for lang brandert?",
  "Hvor god er sangen til at blive smidt ud af en bar på en værdig måde?",
  "Hvor meget lugter den af gymnasiefest og dårlig parfume?",
  "Hvor meget passer den til et bryllup, hvor brudeparret burde have ventet?",
  "Hvor meget er den en sang man spiller for at virke mystisk, men ender med at virke mærkelig?",
  "Hvor meget ville den fungere som intro-musik til {guesser}s realityprogram?",
  "Hvor god er den til en dramatisk slowmotion-entré i Netto?",
  "Hvor meget passer den til at skrive til sin eks og straks fortryde det?",
  "Hvor meget er den en 'jeg overtager festen nu'-sang?",
  "Hvor god er den til en begravelse for en hamster med et kompliceret liv?",
];
let defaultWavelengthCategories = [...fallbackWavelengthCategories];

const generationEras = {
  vinyl: { label: "Vinyl", description: "til og med 1984", min: 1900, max: 1984 },
  cassette: { label: "Kassette/CD", description: "1985-2004", min: 1985, max: 2004 },
  streaming: { label: "Streaming", description: "2005 og frem", min: 2005, max: currentYear + 1 },
};

const defaultSongs = [
  { title: "Rock Around the Clock", artist: "Bill Haley & His Comets", year: 1954 },
  { title: "Tutti Frutti", artist: "Little Richard", year: 1955 },
  { title: "Hound Dog", artist: "Elvis Presley", year: 1956 },
  { title: "Great Balls of Fire", artist: "Jerry Lee Lewis", year: 1957 },
  { title: "Johnny B. Goode", artist: "Chuck Berry", year: 1958 },
  { title: "Stand by Me", artist: "Ben E. King", year: 1961 },
  { title: "I Want to Hold Your Hand", artist: "The Beatles", year: 1963 },
  { title: "(I Can't Get No) Satisfaction", artist: "The Rolling Stones", year: 1965 },
  { title: "Good Vibrations", artist: "The Beach Boys", year: 1966 },
  { title: "Respect", artist: "Aretha Franklin", year: 1967 },
  { title: "Hey Jude", artist: "The Beatles", year: 1968 },
  { title: "Sweet Caroline", artist: "Neil Diamond", year: 1969 },
  { title: "Let It Be", artist: "The Beatles", year: 1970 },
  { title: "Imagine", artist: "John Lennon", year: 1971 },
  { title: "Superstition", artist: "Stevie Wonder", year: 1972 },
  { title: "Piano Man", artist: "Billy Joel", year: 1973 },
  { title: "Waterloo", artist: "ABBA", year: 1974 },
  { title: "Bohemian Rhapsody", artist: "Queen", year: 1975 },
  { title: "Dancing Queen", artist: "ABBA", year: 1976, uri: "spotify:track:0GjEhVFGZW8afUYGChu3Rr" },
  { title: "Stayin' Alive", artist: "Bee Gees", year: 1977 },
  { title: "September", artist: "Earth, Wind & Fire", year: 1978 },
  { title: "Another Brick in the Wall, Pt. 2", artist: "Pink Floyd", year: 1979 },
  { title: "Another One Bites the Dust", artist: "Queen", year: 1980 },
  { title: "Don't Stop Believin'", artist: "Journey", year: 1981 },
  { title: "Africa", artist: "TOTO", year: 1982 },
  { title: "Sweet Dreams (Are Made of This)", artist: "Eurythmics", year: 1983 },
  { title: "Like a Virgin", artist: "Madonna", year: 1984 },
  { title: "Take On Me", artist: "a-ha", year: 1985 },
  { title: "Everybody Wants To Rule The World", artist: "Tears For Fears", year: 1985 },
  { title: "Livin' on a Prayer", artist: "Bon Jovi", year: 1986 },
  { title: "Never Gonna Give You Up", artist: "Rick Astley", year: 1987 },
  { title: "Fast Car", artist: "Tracy Chapman", year: 1988 },
  { title: "Like a Prayer", artist: "Madonna", year: 1989 },
  { title: "Nothing Compares 2 U", artist: "Sinéad O'Connor", year: 1990 },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", year: 1991 },
  { title: "I Will Always Love You", artist: "Whitney Houston", year: 1992 },
  { title: "What Is Love", artist: "Haddaway", year: 1993 },
  { title: "Basket Case", artist: "Green Day", year: 1994 },
  { title: "Wonderwall", artist: "Oasis", year: 1995 },
  { title: "Wannabe", artist: "Spice Girls", year: 1996 },
  { title: "Barbie Girl", artist: "Aqua", year: 1997 },
  { title: "Bitter Sweet Symphony", artist: "The Verve", year: 1997 },
  { title: "Believe", artist: "Cher", year: 1998 },
  { title: "...Baby One More Time", artist: "Britney Spears", year: 1998 },
  { title: "Smooth", artist: "Santana", year: 1999 },
  { title: "Yellow", artist: "Coldplay", year: 2000 },
  { title: "It Wasn't Me", artist: "Shaggy", year: 2000 },
  { title: "Can't Get You Out of My Head", artist: "Kylie Minogue", year: 2001 },
  { title: "Lose Yourself", artist: "Eminem", year: 2002 },
  { title: "Hey Ya!", artist: "Outkast", year: 2003 },
  { title: "Crazy in Love", artist: "Beyoncé", year: 2003 },
  { title: "Mr. Brightside", artist: "The Killers", year: 2003 },
  { title: "Toxic", artist: "Britney Spears", year: 2004 },
  { title: "You're Beautiful", artist: "James Blunt", year: 2005 },
  { title: "Hung Up", artist: "Madonna", year: 2005 },
  { title: "Crazy", artist: "Gnarls Barkley", year: 2006 },
  { title: "Hips Don't Lie", artist: "Shakira", year: 2006 },
  { title: "Umbrella", artist: "Rihanna", year: 2007 },
  { title: "Viva La Vida", artist: "Coldplay", year: 2008 },
  { title: "I Kissed A Girl", artist: "Katy Perry", year: 2008 },
  { title: "Poker Face", artist: "Lady Gaga", year: 2008 },
  { title: "I Gotta Feeling", artist: "The Black Eyed Peas", year: 2009 },
  { title: "Bad Romance", artist: "Lady Gaga", year: 2009 },
  { title: "Rolling in the Deep", artist: "Adele", year: 2010 },
  { title: "Firework", artist: "Katy Perry", year: 2010 },
  { title: "Waka Waka (This Time for Africa)", artist: "Shakira", year: 2010 },
  { title: "Somebody That I Used To Know", artist: "Gotye", year: 2011 },
  { title: "Party Rock Anthem", artist: "LMFAO", year: 2011 },
  { title: "Call Me Maybe", artist: "Carly Rae Jepsen", year: 2011 },
  { title: "Gangnam Style", artist: "PSY", year: 2012 },
  { title: "Diamonds", artist: "Rihanna", year: 2012 },
  { title: "Get Lucky", artist: "Daft Punk", year: 2013 },
  { title: "Royals", artist: "Lorde", year: 2013 },
  { title: "Wake Me Up", artist: "Avicii", year: 2013 },
  { title: "Uptown Funk", artist: "Mark Ronson", year: 2014 },
  { title: "Shake It Off", artist: "Taylor Swift", year: 2014 },
  { title: "Lean On", artist: "Major Lazer", year: 2015 },
  { title: "Hello", artist: "Adele", year: 2015 },
  { title: "Sorry", artist: "Justin Bieber", year: 2015 },
  { title: "Can't Feel My Face", artist: "The Weeknd", year: 2015 },
  { title: "One Dance", artist: "Drake", year: 2016 },
  { title: "Cheap Thrills", artist: "Sia", year: 2016 },
  { title: "Starboy", artist: "The Weeknd", year: 2016 },
  { title: "Shape of You", artist: "Ed Sheeran", year: 2017 },
  { title: "Despacito", artist: "Luis Fonsi", year: 2017 },
  { title: "Havana", artist: "Camila Cabello", year: 2017 },
  { title: "God's Plan", artist: "Drake", year: 2018 },
  { title: "Shallow", artist: "Lady Gaga", year: 2018 },
  { title: "thank u, next", artist: "Ariana Grande", year: 2018 },
  { title: "Old Town Road", artist: "Lil Nas X", year: 2019 },
  { title: "Blinding Lights", artist: "The Weeknd", year: 2019 },
  { title: "bad guy", artist: "Billie Eilish", year: 2019 },
  { title: "Watermelon Sugar", artist: "Harry Styles", year: 2019 },
  { title: "Levitating", artist: "Dua Lipa", year: 2020 },
  { title: "Save Your Tears", artist: "The Weeknd", year: 2020 },
  { title: "drivers license", artist: "Olivia Rodrigo", year: 2021 },
  { title: "good 4 u", artist: "Olivia Rodrigo", year: 2021 },
  { title: "STAY", artist: "The Kid LAROI", year: 2021 },
  { title: "MONTERO (Call Me By Your Name)", artist: "Lil Nas X", year: 2021 },
  { title: "As It Was", artist: "Harry Styles", year: 2022 },
  { title: "Anti-Hero", artist: "Taylor Swift", year: 2022 },
  { title: "Flowers", artist: "Miley Cyrus", year: 2023 },
  { title: "Dance The Night", artist: "Dua Lipa", year: 2023 },
  { title: "vampire", artist: "Olivia Rodrigo", year: 2023 },
  { title: "Espresso", artist: "Sabrina Carpenter", year: 2024 },
  { title: "Good Luck, Babe!", artist: "Chappell Roan", year: 2024 },
  { title: "Beautiful Things", artist: "Benson Boone", year: 2024 },
];

const el = {
  welcomePanel: document.getElementById("welcome-panel"),
  openSetup: document.getElementById("open-setup"),
  jumpLibrary: document.getElementById("jump-library"),
  welcomeModeGrid: document.getElementById("welcome-mode-grid"),
  setupPanel: document.getElementById("setup-panel"),
  openSettings: document.getElementById("open-settings"),
  resetGame: document.getElementById("reset-game"),
  authStatus: document.getElementById("auth-status"),
  clientId: document.getElementById("client-id"),
  gameMode: document.getElementById("game-mode"),
  deviceSelect: document.getElementById("device-select"),
  playerCount: document.getElementById("player-count"),
  hitsterCardsMode: document.getElementById("hitster-cards-mode"),
  playerNameGrid: document.getElementById("player-name-grid"),
  modePanel: document.getElementById("mode-panel"),
  modeEyebrow: document.getElementById("mode-eyebrow"),
  modeTitle: document.getElementById("mode-title"),
  modeDescription: document.getElementById("mode-description"),
  generationGrid: document.getElementById("generation-grid"),
  advancedSettingsToggle: document.getElementById("advanced-settings-toggle"),
  advancedPanel: document.getElementById("advanced-panel"),
  advancedPlayerGrid: document.getElementById("advanced-player-grid"),
  genreExclusions: document.getElementById("genre-exclusions"),
  decadeExclusions: document.getElementById("decade-exclusions"),
  gamemasterEnabled: document.getElementById("gamemaster-enabled"),
  saveClient: document.getElementById("save-client"),
  login: document.getElementById("login"),
  loadDevices: document.getElementById("load-devices"),
  startGame: document.getElementById("start-game"),
  copyRedirect: document.getElementById("copy-redirect"),
  currentPlayer: document.getElementById("current-player"),
  turnStatus: document.getElementById("turn-status"),
  gamemasterToggle: document.getElementById("gamemaster-toggle"),
  gamemasterPanel: document.getElementById("gamemaster-panel"),
  gamemasterGrid: document.getElementById("gamemaster-grid"),
  playTrack: document.getElementById("play-track"),
  resumeTrack: document.getElementById("resume-track"),
  pauseTrack: document.getElementById("pause-track"),
  revealTrack: document.getElementById("reveal-track"),
  keepCard: document.getElementById("keep-card"),
  discardCard: document.getElementById("discard-card"),
  bonusActions: document.getElementById("bonus-actions"),
  titleCorrect: document.getElementById("title-correct"),
  artistCorrect: document.getElementById("artist-correct"),
  challengePanel: document.getElementById("challenge-panel"),
  challengeStatus: document.getElementById("challenge-status"),
  challengerSelect: document.getElementById("challenger-select"),
  startChallenge: document.getElementById("start-challenge"),
  cancelChallenge: document.getElementById("cancel-challenge"),
  songActions: document.getElementById("song-actions"),
  wavelengthPanel: document.getElementById("wavelength-panel"),
  songsLeft: document.getElementById("songs-left"),
  libraryTotal: document.getElementById("library-total"),
  libraryStats: document.getElementById("library-stats"),
  librarySearch: document.getElementById("library-search"),
  libraryDecadeFilter: document.getElementById("library-decade-filter"),
  libraryCountryFilter: document.getElementById("library-country-filter"),
  libraryGenreFilter: document.getElementById("library-genre-filter"),
  libraryResultNote: document.getElementById("library-result-note"),
  libraryList: document.getElementById("library-list"),
  libraryPanel: document.getElementById("library-panel"),
  playersGrid: document.getElementById("players-grid"),
  toast: document.getElementById("toast"),
};

let toastTimer = 0;

const state = {
  players: [
    { name: "Spiller 1", timeline: [] },
    { name: "Spiller 2", timeline: [] },
  ],
  currentPlayer: 0,
  deck: [],
  currentSong: null,
  pendingIndex: null,
  challenges: [],
  activeChallengeIndex: null,
  gameMode: "classic",
  hitsterCardsEnabled: false,
  gamemasterEnabled: false,
  gamemasterOpen: false,
  excludedGenres: [],
  excludedDecades: [],
  titleCorrect: false,
  artistCorrect: false,
  revealed: false,
  wavelength: null,
  wavelengthUseCategories: true,
  wavelengthWinScore: defaultWavelengthWinScore,
  wavelengthWinnerIndex: null,
  battleRoyaleWinnerIndex: null,
  sharedTimelineRound: null,
  sharedTimelineWinScore: defaultSharedTimelineWinScore,
  sharedTimelineSuddenDeathIndexes: null,
  sharedTimelineWinnerIndex: null,
  pushLuckTurnBank: 0,
  pushLuckTurnStreak: 0,
  pushLuckTurnCards: [],
  pushLuckRiskCards: false,
  pushLuckWinScore: defaultPushLuckWinScore,
  pushLuckWinnerIndex: null,
  imposter: null,
  imposterCountSetting: String(defaultImposterCount),
  puzzleRushFinishedIndexes: [],
  puzzleRushComplete: false,
  setupOpen: false,
  started: false,
};

function savePersistent() {
  localStorage.setItem("hitster_client_id", el.clientId.value.trim());
  localStorage.setItem("hitster_game_mode", el.gameMode.value);
  localStorage.setItem("hitster_player_count", el.playerCount.value);
  localStorage.setItem("hitster_cards_mode", canUseHitsterCards(el.gameMode.value) && el.hitsterCardsMode.checked ? "1" : "0");
  localStorage.setItem("hitster_gamemaster_enabled", el.gamemasterEnabled.checked ? "1" : "0");
  localStorage.setItem("hitster_advanced_enabled", el.advancedSettingsToggle.checked ? "1" : "0");
  localStorage.setItem("hitster_player_names", JSON.stringify(getPlayerNameInputs().map((input) => input.value.trim())));
  localStorage.setItem("hitster_player_settings", JSON.stringify(getSetupPlayerSettings()));
  localStorage.setItem("hitster_excluded_genres", JSON.stringify(getCheckedValues(el.genreExclusions)));
  localStorage.setItem("hitster_excluded_decades", JSON.stringify(getCheckedValues(el.decadeExclusions)));
  localStorage.setItem("hitster_wavelength_use_categories", getWavelengthUseCategoriesSetting() ? "1" : "0");
  localStorage.setItem("hitster_wavelength_win_score", String(getWavelengthWinScoreSetting()));
  localStorage.setItem("hitster_shared_timeline_win_score", String(getSharedTimelineWinScoreSetting()));
  localStorage.setItem("hitster_push_luck_risk_cards", getPushLuckRiskCardsSetting() ? "1" : "0");
  localStorage.setItem("hitster_push_luck_win_score", String(getPushLuckWinScoreSetting()));
  localStorage.setItem("hitster_imposter_count", String(getImposterCountSetting()));
}

function loadPersistent() {
  el.clientId.value = localStorage.getItem("hitster_client_id") || localStorage.getItem("spotify_client_id") || "";
  el.gameMode.value = gameModes[localStorage.getItem("hitster_game_mode")] ? localStorage.getItem("hitster_game_mode") : "classic";
  state.gameMode = el.gameMode.value;
  const savedNames = safeJsonParse(localStorage.getItem("hitster_player_names"), []);
  const savedCount = clampPlayerCount(Number(localStorage.getItem("hitster_player_count")) || Math.max(2, savedNames.length));
  el.playerCount.value = String(savedCount);
  el.hitsterCardsMode.checked = localStorage.getItem("hitster_cards_mode") === "1";
  syncHitsterCardsAvailability();
  el.gamemasterEnabled.checked = localStorage.getItem("hitster_gamemaster_enabled") === "1";
  el.advancedSettingsToggle.checked = localStorage.getItem("hitster_advanced_enabled") === "1";
  el.advancedPanel.classList.toggle("active", el.advancedSettingsToggle.checked);
  state.excludedGenres = safeJsonParse(localStorage.getItem("hitster_excluded_genres"), []).map(String);
  state.excludedDecades = safeJsonParse(localStorage.getItem("hitster_excluded_decades"), []).map(String);
  state.hitsterCardsEnabled = canUseHitsterCards() && el.hitsterCardsMode.checked;
  state.wavelengthUseCategories = getWavelengthUseCategoriesSetting();
  state.wavelengthWinScore = getWavelengthWinScoreSetting();
  state.sharedTimelineWinScore = getSharedTimelineWinScoreSetting();
  state.pushLuckRiskCards = getPushLuckRiskCardsSetting();
  state.pushLuckWinScore = getPushLuckWinScoreSetting();
  state.imposterCountSetting = getImposterCountSetting();
  renderFilterOptions();
  renderPlayerNameFields(savedCount, savedNames);
  renderModePanel();
  syncPlayersFromFields();

  state.deck = shuffle(getPlayableSongLibrary());
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function isGameInProgress() {
  return Boolean(state.started && (state.currentSong || state.wavelength || state.imposter || state.players.some((player) => player.timeline.length)));
}

function saveGameSnapshot() {
  if (!isGameInProgress()) return;
  const snapshot = {
    version: 1,
    savedAt: Date.now(),
    players: state.players,
    currentPlayer: state.currentPlayer,
    deck: state.deck,
    currentSong: state.currentSong,
    pendingIndex: state.pendingIndex,
    challenges: state.challenges,
    activeChallengeIndex: state.activeChallengeIndex,
    gameMode: state.gameMode,
    hitsterCardsEnabled: state.hitsterCardsEnabled,
    gamemasterEnabled: state.gamemasterEnabled,
    gamemasterOpen: state.gamemasterOpen,
    excludedGenres: state.excludedGenres,
    excludedDecades: state.excludedDecades,
    titleCorrect: state.titleCorrect,
    artistCorrect: state.artistCorrect,
    revealed: state.revealed,
    wavelength: state.wavelength,
    wavelengthUseCategories: state.wavelengthUseCategories,
    wavelengthWinScore: state.wavelengthWinScore,
    wavelengthWinnerIndex: state.wavelengthWinnerIndex,
    battleRoyaleWinnerIndex: state.battleRoyaleWinnerIndex,
    sharedTimelineRound: state.sharedTimelineRound,
    sharedTimelineWinScore: state.sharedTimelineWinScore,
    sharedTimelineSuddenDeathIndexes: state.sharedTimelineSuddenDeathIndexes,
    sharedTimelineWinnerIndex: state.sharedTimelineWinnerIndex,
    pushLuckTurnBank: state.pushLuckTurnBank,
    pushLuckTurnStreak: state.pushLuckTurnStreak,
    pushLuckTurnCards: state.pushLuckTurnCards,
    pushLuckRiskCards: state.pushLuckRiskCards,
    pushLuckWinScore: state.pushLuckWinScore,
    pushLuckWinnerIndex: state.pushLuckWinnerIndex,
    imposter: state.imposter,
    imposterCountSetting: state.imposterCountSetting,
    puzzleRushFinishedIndexes: state.puzzleRushFinishedIndexes,
    puzzleRushComplete: state.puzzleRushComplete,
    started: state.started,
  };
  localStorage.setItem(savedGameKey, JSON.stringify(snapshot));
}

function clearGameSnapshot() {
  localStorage.removeItem(savedGameKey);
}

function restoreSavedGame() {
  const snapshot = safeJsonParse(localStorage.getItem(savedGameKey), null);
  if (!snapshot?.started || !Array.isArray(snapshot.players)) return false;

  const players = snapshot.players
    .map((player, index) => ({
      name: String(player?.name || `Spiller ${index + 1}`).trim() || `Spiller ${index + 1}`,
      timeline: Array.isArray(player?.timeline) ? player.timeline.map(normalizeSong).filter(Boolean).sort((a, b) => a.year - b.year) : [],
      hitsterCards: Math.max(0, Number(player?.hitsterCards) || 0),
      infiniteHitsterCards: Boolean(player?.infiniteHitsterCards),
      winScore: clampWinScore(player?.winScore),
      scoreOffset: clampScoreOffset(player?.scoreOffset),
      generationEra: normalizeGenerationEra(player?.generationEra),
      wavelengthScore: Math.max(0, Number(player?.wavelengthScore) || 0),
      battleRoyaleLives: clampBattleRoyaleLives(player?.battleRoyaleLives ?? defaultBattleRoyaleLives),
      sharedTimelineScore: Math.max(0, Number(player?.sharedTimelineScore) || 0),
      pushLuckScore: Math.max(0, Number(player?.pushLuckScore) || 0),
      puzzleRushScore: Math.max(0, Number(player?.puzzleRushScore) || 0),
    }))
    .slice(0, 12);

  if (players.length < 2) return false;

  state.players = players;
  state.currentPlayer = Math.min(Math.max(0, Number(snapshot.currentPlayer) || 0), players.length - 1);
  state.deck = Array.isArray(snapshot.deck) ? snapshot.deck.map(normalizeSong).filter(Boolean) : [];
  state.currentSong = normalizeSong(snapshot.currentSong);
  const timelineLength = state.players[state.currentPlayer].timeline.length;
  state.pendingIndex = isValidSlotIndex(snapshot.pendingIndex, timelineLength) ? snapshot.pendingIndex : null;
  state.challenges = Array.isArray(snapshot.challenges)
    ? snapshot.challenges
        .map((challenge) => ({
          challengerIndex: Number(challenge?.challengerIndex),
          placementIndex: isValidSlotIndex(challenge?.placementIndex, timelineLength) ? challenge.placementIndex : null,
        }))
        .filter((challenge) => state.players[challenge.challengerIndex])
    : [];
  state.activeChallengeIndex = Number.isInteger(snapshot.activeChallengeIndex) ? snapshot.activeChallengeIndex : null;
  if (!state.challenges[state.activeChallengeIndex]) state.activeChallengeIndex = null;
  state.gameMode = gameModes[snapshot.gameMode] ? snapshot.gameMode : "classic";
  state.hitsterCardsEnabled = canUseHitsterCards(state.gameMode) && Boolean(snapshot.hitsterCardsEnabled);
  if (!state.hitsterCardsEnabled) {
    state.challenges = [];
    state.activeChallengeIndex = null;
  }
  state.gamemasterEnabled = Boolean(snapshot.gamemasterEnabled);
  state.gamemasterOpen = Boolean(snapshot.gamemasterOpen);
  state.excludedGenres = Array.isArray(snapshot.excludedGenres) ? snapshot.excludedGenres.map(String) : state.excludedGenres;
  state.excludedDecades = Array.isArray(snapshot.excludedDecades) ? snapshot.excludedDecades.map(String) : state.excludedDecades;
  state.titleCorrect = Boolean(snapshot.titleCorrect);
  state.artistCorrect = Boolean(snapshot.artistCorrect);
  state.revealed = Boolean(snapshot.revealed);
  state.wavelength = normalizeWavelengthState(snapshot.wavelength);
  state.wavelengthUseCategories = snapshot.wavelengthUseCategories !== false;
  state.wavelengthWinScore = clampWavelengthWinScore(snapshot.wavelengthWinScore);
  state.wavelengthWinnerIndex = Number.isInteger(snapshot.wavelengthWinnerIndex) ? snapshot.wavelengthWinnerIndex : null;
  state.battleRoyaleWinnerIndex = Number.isInteger(snapshot.battleRoyaleWinnerIndex) ? snapshot.battleRoyaleWinnerIndex : null;
  state.sharedTimelineRound = normalizeSharedTimelineRound(snapshot.sharedTimelineRound);
  state.sharedTimelineWinScore = clampSharedTimelineWinScore(snapshot.sharedTimelineWinScore);
  state.sharedTimelineSuddenDeathIndexes = normalizeIndexList(snapshot.sharedTimelineSuddenDeathIndexes);
  state.sharedTimelineWinnerIndex = Number.isInteger(snapshot.sharedTimelineWinnerIndex) ? snapshot.sharedTimelineWinnerIndex : null;
  state.pushLuckTurnBank = Math.max(0, Number(snapshot.pushLuckTurnBank) || 0);
  state.pushLuckTurnStreak = Math.max(0, Number(snapshot.pushLuckTurnStreak) || 0);
  state.pushLuckTurnCards = Array.isArray(snapshot.pushLuckTurnCards) ? snapshot.pushLuckTurnCards.map(normalizeSong).filter(Boolean) : [];
  state.pushLuckRiskCards = Boolean(snapshot.pushLuckRiskCards);
  state.pushLuckWinScore = clampPushLuckWinScore(snapshot.pushLuckWinScore);
  state.pushLuckWinnerIndex = Number.isInteger(snapshot.pushLuckWinnerIndex) ? snapshot.pushLuckWinnerIndex : null;
  state.imposter = normalizeImposterState(snapshot.imposter);
  state.imposterCountSetting = normalizeImposterCountSetting(snapshot.imposterCountSetting, players.length);
  state.puzzleRushFinishedIndexes = normalizeIndexList(snapshot.puzzleRushFinishedIndexes) || [];
  state.puzzleRushComplete = Boolean(snapshot.puzzleRushComplete);
  state.setupOpen = false;
  state.started = true;
  if (!state.currentSong && !isImposterMode() && !state.puzzleRushComplete) drawNextMystery();

  el.playerCount.value = String(players.length);
  el.gameMode.value = state.gameMode;
  el.hitsterCardsMode.checked = state.hitsterCardsEnabled;
  syncHitsterCardsAvailability();
  el.gamemasterEnabled.checked = state.gamemasterEnabled;
  renderFilterOptions();
  renderPlayerNameFields(players.length, players.map((player) => player.name));
  renderModePanel();
  renderGamemasterControls();
  return true;
}

function isValidSlotIndex(index, timelineLength) {
  return Number.isInteger(index) && index >= 0 && index <= timelineLength;
}

function armNavigationGuard() {
  window.addEventListener("beforeunload", (event) => {
    if (allowNavigation || !isGameInProgress()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  history.replaceState({ ...(history.state || {}), hitsterPage: true }, "", location.href);
  history.pushState({ hitsterGuard: true }, "", location.href);

  window.addEventListener("popstate", () => {
    if (allowNavigation || !isGameInProgress()) return;
    const leave = confirm("Der er et spil i gang. Er du sikker på, at du vil forlade det?");
    if (leave) {
      allowNavigation = true;
      history.back();
      return;
    }
    history.pushState({ hitsterGuard: true }, "", location.href);
  });
}

function getPlayerNameInputs() {
  return [...el.playerNameGrid.querySelectorAll("input[data-player-name]")];
}

function canPlaySolo(value = el.gameMode?.value || state.gameMode) {
  return isPuzzleRushMode(value);
}

function clampPlayerCount(count, value = el.gameMode?.value || state.gameMode) {
  const minPlayers = canPlaySolo(value) ? 1 : 2;
  return Math.min(12, Math.max(minPlayers, count || minPlayers));
}

function renderPlayerNameFields(count, names = getPlayerNameInputs().map((input) => input.value.trim())) {
  const currentSettings = getPlayerNameInputs().length
    ? getSetupPlayerSettings()
    : safeJsonParse(localStorage.getItem("hitster_player_settings"), []);
  const safeCount = clampPlayerCount(count);
  if (el.playerCount) el.playerCount.value = String(safeCount);
  el.playerNameGrid.innerHTML = "";
  for (let index = 0; index < safeCount; index++) {
    const label = document.createElement("label");
    const name = names[index] || `Spiller ${index + 1}`;
    label.innerHTML = `
      <span>Spiller ${index + 1}</span>
      <input data-player-name value="${escapeHtml(name)}" />
    `;
    el.playerNameGrid.append(label);
  }

  getPlayerNameInputs().forEach((input) => {
    input.addEventListener("input", () => {
      renderAdvancedPlayerSettings(getSetupPlayerSettings());
      renderModePanel();
    });
    input.addEventListener("change", savePersistent);
  });
  renderAdvancedPlayerSettings(currentSettings);
  renderModePanel();
}

function getPlayerNames() {
  return getPlayerNameInputs().map((input, index) => input.value.trim() || `Spiller ${index + 1}`);
}

function syncPlayersFromFields() {
  const settings = getEffectivePlayerSettings(el.advancedSettingsToggle.checked);
  state.players = getPlayerNames().map((name, index) => createPlayer(name, settings[index]));
  state.currentPlayer = Math.min(state.currentPlayer, state.players.length - 1);
}

function getEffectivePlayerSettings(includeAdvanced) {
  return getSetupPlayerSettings().map((settings) => (includeAdvanced ? settings : { generationEra: settings.generationEra }));
}

function createPlayer(name, settings = {}) {
  const infiniteHitsterCards = Boolean(settings.infiniteHitsterCards);
  return {
    name,
    timeline: [],
    hitsterCards: infiniteHitsterCards ? 0 : clampStartingHitsterCards(settings.hitsterCards ?? (el.hitsterCardsMode.checked ? defaultHitsterCards : 0)),
    infiniteHitsterCards,
    winScore: clampWinScore(settings.winScore),
    scoreOffset: clampScoreOffset(settings.scoreOffset),
    generationEra: normalizeGenerationEra(settings.generationEra),
    wavelengthScore: Math.max(0, Number(settings.wavelengthScore) || 0),
    battleRoyaleLives: clampBattleRoyaleLives(settings.battleRoyaleLives ?? defaultBattleRoyaleLives),
    sharedTimelineScore: Math.max(0, Number(settings.sharedTimelineScore) || 0),
    pushLuckScore: Math.max(0, Number(settings.pushLuckScore) || 0),
    puzzleRushScore: Math.max(0, Number(settings.puzzleRushScore) || 0),
  };
}

function getSetupPlayerSettings() {
  const saved = safeJsonParse(localStorage.getItem("hitster_player_settings"), []);
  return getPlayerNames().map((_, index) => {
    const row = el.advancedPlayerGrid?.querySelector(`[data-advanced-player="${index}"]`);
    if (!row) return normalizePlayerSettings(saved[index]);
    return normalizePlayerSettings({
      winScore: row.querySelector('[data-setting="winScore"]')?.value,
      hitsterCards: row.querySelector('[data-setting="hitsterCards"]')?.value,
      infiniteHitsterCards: row.querySelector('[data-setting="infiniteHitsterCards"]')?.checked,
      generationEra: el.generationGrid?.querySelector(`[data-generation-player="${index}"]`)?.value,
    });
  });
}

function normalizePlayerSettings(settings = {}) {
  return {
    winScore: clampWinScore(settings.winScore),
    hitsterCards: clampStartingHitsterCards(settings.hitsterCards ?? defaultHitsterCards),
    infiniteHitsterCards: Boolean(settings.infiniteHitsterCards),
    scoreOffset: clampScoreOffset(settings.scoreOffset),
    generationEra: normalizeGenerationEra(settings.generationEra),
  };
}

function normalizeGenerationEra(value) {
  return generationEras[value] ? value : "vinyl";
}

function clampWinScore(value) {
  return Math.min(50, Math.max(1, Number(value) || defaultWinScore));
}

function clampWavelengthWinScore(value) {
  return Math.min(999, Math.max(1, Math.round(Number(value) || defaultWavelengthWinScore)));
}

function clampSharedTimelineWinScore(value) {
  return Math.min(999, Math.max(1, Math.round(Number(value) || defaultSharedTimelineWinScore)));
}

function clampPushLuckWinScore(value) {
  return Math.min(999, Math.max(1, Math.round(Number(value) || defaultPushLuckWinScore)));
}

function clampBattleRoyaleLives(value) {
  return Math.min(99, Math.max(0, Math.round(Number(value) || 0)));
}

function getWavelengthUseCategoriesSetting() {
  const input = el.generationGrid?.querySelector("#wavelength-use-categories");
  if (input instanceof HTMLInputElement) return input.checked;
  return localStorage.getItem("hitster_wavelength_use_categories") !== "0";
}

function getWavelengthWinScoreSetting() {
  const input = el.generationGrid?.querySelector("#wavelength-win-score");
  if (input instanceof HTMLInputElement) return clampWavelengthWinScore(input.value);
  return clampWavelengthWinScore(localStorage.getItem("hitster_wavelength_win_score"));
}

function getSharedTimelineWinScoreSetting() {
  const input = el.generationGrid?.querySelector("#shared-timeline-win-score");
  if (input instanceof HTMLInputElement) return clampSharedTimelineWinScore(input.value);
  return clampSharedTimelineWinScore(localStorage.getItem("hitster_shared_timeline_win_score"));
}

function getPushLuckWinScoreSetting() {
  const input = el.generationGrid?.querySelector("#push-luck-win-score");
  if (input instanceof HTMLInputElement) return clampPushLuckWinScore(input.value);
  return clampPushLuckWinScore(localStorage.getItem("hitster_push_luck_win_score"));
}

function getPushLuckRiskCardsSetting() {
  const input = el.generationGrid?.querySelector("#push-luck-risk-cards");
  if (input instanceof HTMLInputElement) return input.checked;
  return localStorage.getItem("hitster_push_luck_risk_cards") === "1";
}

function getImposterMaxCount(playerCount = getPlayerNames().length) {
  return Math.max(1, Math.max(2, playerCount) - 1);
}

function normalizeImposterCountSetting(value, playerCount = getPlayerNames().length) {
  if (value === "random") return "random";
  return String(Math.min(getImposterMaxCount(playerCount), Math.max(1, Math.round(Number(value) || defaultImposterCount))));
}

function getImposterCountSetting() {
  const input = el.generationGrid?.querySelector("#imposter-count");
  if (input instanceof HTMLSelectElement) return normalizeImposterCountSetting(input.value);
  return normalizeImposterCountSetting(localStorage.getItem("hitster_imposter_count"));
}

function clampHitsterCards(value) {
  return Math.min(99, Math.max(0, Number(value) || 0));
}

function clampStartingHitsterCards(value) {
  return Math.min(10, Math.max(0, Number(value) || 0));
}

function clampScoreOffset(value) {
  return Math.min(50, Math.max(-50, Number(value) || 0));
}

function getPlayerScore(player) {
  if (isWavelengthMode()) return Math.max(0, (Number(player.wavelengthScore) || 0) + clampScoreOffset(player.scoreOffset));
  if (isSharedTimelineMode()) return Math.max(0, (Number(player.sharedTimelineScore) || 0) + clampScoreOffset(player.scoreOffset));
  if (isPushLuckMode()) {
    const baseScore = state.pushLuckRiskCards ? (Array.isArray(player.timeline) ? player.timeline.length : 0) : (Number(player.pushLuckScore) || 0);
    return Math.max(0, baseScore + clampScoreOffset(player.scoreOffset));
  }
  if (isPuzzleRushMode()) return Math.max(0, (Number(player.puzzleRushScore) || 0) + clampScoreOffset(player.scoreOffset));
  return Math.max(0, player.timeline.length + clampScoreOffset(player.scoreOffset));
}

function getBattleRoyaleLives(player) {
  return clampBattleRoyaleLives(player?.battleRoyaleLives ?? defaultBattleRoyaleLives);
}

function isBattleRoyalePlayerAlive(player) {
  return getBattleRoyaleLives(player) > 0;
}

function getAliveBattleRoyalePlayers() {
  return state.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => isBattleRoyalePlayerAlive(player));
}

function getBattleRoyaleWinner() {
  if (!isBattleRoyaleMode()) return null;
  const alive = getAliveBattleRoyalePlayers();
  return alive.length === 1 ? alive[0] : null;
}

function loseBattleRoyaleLife(player) {
  if (!player || !isBattleRoyalePlayerAlive(player)) return;
  player.battleRoyaleLives = Math.max(0, getBattleRoyaleLives(player) - 1);
}

function getPlayerWinScore(player) {
  if (isWavelengthMode()) return clampWavelengthWinScore(state.wavelengthWinScore);
  if (isSharedTimelineMode()) return clampSharedTimelineWinScore(state.sharedTimelineWinScore);
  if (isPushLuckMode()) return clampPushLuckWinScore(state.pushLuckWinScore);
  return clampWinScore(player.winScore);
}

function getHitsterCardLabel(player) {
  return player.infiniteHitsterCards ? "∞" : String(clampHitsterCards(player.hitsterCards));
}

function hasHitsterCards(player) {
  return Boolean(player?.infiniteHitsterCards || player?.hitsterCards > 0);
}

function spendHitsterCard(player) {
  if (!player || player.infiniteHitsterCards) return;
  player.hitsterCards = Math.max(0, player.hitsterCards - 1);
}

function addHitsterCard(player) {
  if (!player || player.infiniteHitsterCards) return;
  player.hitsterCards += 1;
}

function renderAdvancedPlayerSettings(settings = getSetupPlayerSettings()) {
  if (!el.advancedPlayerGrid) return;
  const names = getPlayerNames();
  el.advancedPlayerGrid.innerHTML = names.map((name, index) => {
    const setting = normalizePlayerSettings(settings[index]);
    const disabled = setting.infiniteHitsterCards ? " disabled" : "";
    return `
      <article class="advanced-player-row" data-advanced-player="${index}">
        <div>
          <h3>${escapeHtml(name)}</h3>
          <p>Startindstillinger</p>
        </div>
        <label>
          <span>Kort for sejr</span>
          <input data-setting="winScore" type="number" min="1" max="50" value="${setting.winScore}" />
        </label>
        <label>
          <span>Startkort</span>
          <input data-setting="hitsterCards" type="number" min="0" max="10" value="${setting.hitsterCards}"${disabled} />
        </label>
        <label class="inline-check">
          <input data-setting="infiniteHitsterCards" type="checkbox"${setting.infiniteHitsterCards ? " checked" : ""} />
          <span>Uendelige</span>
        </label>
      </article>
    `;
  }).join("");
}

function renderModePanel(settings = getSetupPlayerSettings()) {
  const mode = getSelectedGameMode();
  el.modePanel.classList.toggle("active", Boolean(mode));
  el.modeEyebrow.textContent = mode.battle ? "Battle-mode" : "Gamemode";
  el.modeTitle.textContent = mode.title;
  el.modeDescription.textContent = mode.description;

  if (mode.source === "wavelength") {
    const useCategories = getWavelengthUseCategoriesSetting();
    const winScore = getWavelengthWinScoreSetting();
    el.generationGrid.innerHTML = `
      <div class="wavelength-settings">
        <label class="toggle-row">
          <input id="wavelength-use-categories" type="checkbox"${useCategories ? " checked" : ""} />
          <span>
            <strong>Brug kategorilisten</strong>
            <small>Slå fra, hvis I selv finder på kategorier undervejs</small>
          </span>
        </label>
        <label class="wavelength-win-setting">
          <span>Point for sejr</span>
          <input id="wavelength-win-score" type="number" min="1" max="999" value="${winScore}" />
        </label>
      </div>
      <div class="wavelength-category-editor">
        <div>
          <strong>Kategorier</strong>
          <p>En kategori pr. linje. Brug {player} eller {guesser}, hvis appen skal sætte et spillernavn ind.</p>
        </div>
        <textarea id="wavelength-category-list" spellcheck="false">${escapeHtml(getWavelengthCategoryLines().join("\n"))}</textarea>
        <div class="button-row">
          <button id="save-wavelength-categories" class="dark" type="button">Gem kategorier</button>
          <button id="reset-wavelength-categories" class="ghost" type="button">Gendan forslag</button>
        </div>
      </div>
    `;
    return;
  }

  if (mode.sharedTimeline) {
    const winScore = getSharedTimelineWinScoreSetting();
    el.generationGrid.innerHTML = `
      <div class="mode-rule-card shared-timeline-settings">
        <div>
          <strong>Timeline Showdown-regel</strong>
          <p>Alle placerer den samme sang i hver deres tidslinje. Korrekt placering giver 1 point. Hvis flere rammer pointmålet samtidig, fortsætter de i sudden death.</p>
        </div>
        <label>
          <span>Point for sejr</span>
          <input id="shared-timeline-win-score" type="number" min="1" max="999" value="${winScore}" />
        </label>
      </div>
    `;
    return;
  }

  if (mode.pushLuck) {
    const winScore = getPushLuckWinScoreSetting();
    const riskCards = getPushLuckRiskCardsSetting();
    el.generationGrid.innerHTML = `
      <div class="mode-rule-card push-luck-settings">
        <div>
          <strong>Push Your Luck-regel</strong>
          <p>Standardvarianten banker point: første korrekte sang giver 1 kort, og hver ekstra korrekte sang i samme tur giver +2. Den hårde variant scorer efter kortene i tidslinjen.</p>
        </div>
        <label class="toggle-row">
          <input id="push-luck-risk-cards" type="checkbox"${riskCards ? " checked" : ""} />
          <span>
            <strong>Fejl fjerner turens kort</strong>
            <small>Slå til for den hårde variant, hvor hver korrekt sang giver 1 kort, og bust fjerner kortene fra samme tur</small>
          </span>
        </label>
        <label>
          <span>Kort for sejr</span>
          <input id="push-luck-win-score" type="number" min="1" max="999" value="${winScore}" />
        </label>
      </div>
    `;
    return;
  }

  if (mode.imposter) {
    const playerCount = clampPlayerCount(Number(el.playerCount.value) || getPlayerNames().length);
    const maxImposters = getImposterMaxCount(playerCount);
    const selectedCount = getImposterCountSetting();
    el.generationGrid.innerHTML = `
      <div class="mode-rule-card imposter-settings">
        <div>
          <strong>Imposter-regel</strong>
          <p>Programmet vælger en hemmelig kendt sang. Crewmates får sang og kunstner at vide og hører den i høretelefoner. Impostere ser kun deres rolle og skal bluffe, når gruppen bagefter skal finde dem.</p>
        </div>
        <label>
          <span>Antal impostere</span>
          <select id="imposter-count">
            <option value="random"${selectedCount === "random" ? " selected" : ""}>Tilfældigt</option>
            ${Array.from({ length: maxImposters }, (_, index) => {
              const value = String(index + 1);
              return `<option value="${value}"${selectedCount === value ? " selected" : ""}>${value} ${index === 0 ? "imposter" : "impostere"}</option>`;
            }).join("")}
          </select>
        </label>
      </div>
    `;
    return;
  }

  if (mode.puzzleRush) {
    el.generationGrid.innerHTML = `
      <div class="mode-rule-card">
        <strong>Puzzle Rush-regel</strong>
        <p>Placér så mange sange korrekt som muligt i samme run. Hver korrekt placering giver 1 point og en ny sang med det samme. Første fejl stopper run'et. Kan spilles alene som øvelse.</p>
      </div>
    `;
    return;
  }

  if (!mode.battle) {
    el.generationGrid.innerHTML = mode.battleRoyale
      ? `
        <div class="mode-rule-card">
          <strong>Battle Royale-regel</strong>
          <p>Alle starter med ${defaultBattleRoyaleLives} liv. Forkert placering koster 1 liv. Spillere med 0 liv springes over, og sidste spiller med liv vinder.</p>
        </div>
      `
      : "";
    return;
  }

  el.generationGrid.innerHTML = getPlayerNames().map((name, index) => {
    const era = normalizeGenerationEra(settings[index]?.generationEra);
    return `
      <label class="generation-row">
        <strong>${escapeHtml(name)}</strong>
        <select data-generation-player="${index}">
          ${Object.entries(generationEras).map(([value, option]) => `
            <option value="${value}"${era === value ? " selected" : ""}>${option.label} (${option.description})</option>
          `).join("")}
        </select>
      </label>
    `;
  }).join("");
}

function getSelectedGameMode() {
  return gameModes[el.gameMode.value] || gameModes.classic;
}

function getGameModeTitle(value = state.gameMode) {
  return (gameModes[value] || gameModes.classic).title;
}

function isBattleMode() {
  return state.gameMode === "generations";
}

function isSoundtrackMode() {
  return Boolean(gameModes[state.gameMode]?.soundtrackBonus);
}

function isWavelengthMode(value = state.gameMode) {
  return value === "wavelength";
}

function isBattleRoyaleMode(value = state.gameMode) {
  return value === "battleRoyale";
}

function isSharedTimelineMode(value = state.gameMode) {
  return value === "sharedTimeline";
}

function isPushLuckMode(value = state.gameMode) {
  return value === "pushLuck";
}

function isImposterMode(value = state.gameMode) {
  return value === "imposter";
}

function isPuzzleRushMode(value = state.gameMode) {
  return value === "puzzleRush";
}

function canUseHitsterCards(value = el.gameMode?.value || state.gameMode) {
  return !isBattleRoyaleMode(value) && !isSharedTimelineMode(value) && !isPushLuckMode(value) && !isImposterMode(value) && !isPuzzleRushMode(value);
}

function syncHitsterCardsAvailability() {
  const allowed = canUseHitsterCards(el.gameMode.value);
  if (!allowed) {
    el.hitsterCardsMode.checked = false;
    state.hitsterCardsEnabled = false;
    state.challenges = [];
    state.activeChallengeIndex = null;
  }
  el.hitsterCardsMode.disabled = !allowed;
  el.hitsterCardsMode.closest(".checkbox-label")?.classList.toggle("disabled", !allowed);
}

function normalizeWavelengthState(value) {
  if (!value || typeof value !== "object") return null;
  const guesses = {};
  if (value.guesses && typeof value.guesses === "object") {
    Object.entries(value.guesses).forEach(([key, guess]) => {
      guesses[key] = clampWavelengthValue(guess);
    });
  }
  return {
    category: value.category === undefined || value.category === null ? getRandomWavelengthCategory() : String(value.category),
    target: clampWavelengthValue(value.target || getRandomWavelengthTarget()),
    guesses,
    finalGuess: clampWavelengthValue(value.finalGuess || 5),
    showTarget: Boolean(value.showTarget),
    phase: value.phase === "results" ? "results" : "guessing",
    awards: Array.isArray(value.awards) ? value.awards : [],
  };
}

function createWavelengthRound() {
  return {
    category: state.wavelengthUseCategories ? getRandomWavelengthCategory() : "",
    target: getRandomWavelengthTarget(),
    guesses: {},
    finalGuess: 5,
    showTarget: false,
    phase: "guessing",
    awards: [],
  };
}

function normalizeImposterState(value) {
  if (!value || typeof value !== "object") return null;
  const song = normalizeSong(value.song);
  if (!song) return null;
  return {
    song,
    imposterIndexes: normalizeIndexList(value.imposterIndexes) || [],
    seenIndexes: normalizeIndexList(value.seenIndexes) || [],
    activeIndex: Number.isInteger(value.activeIndex) ? value.activeIndex : null,
    solutionRevealed: Boolean(value.solutionRevealed),
    randomCount: Boolean(value.randomCount),
  };
}

function createImposterRound(song) {
  const setting = getImposterCountSetting();
  const maxCount = getImposterMaxCount(state.players.length);
  const count = setting === "random" ? Math.floor(Math.random() * maxCount) + 1 : Number(normalizeImposterCountSetting(setting, state.players.length));
  return {
    song,
    imposterIndexes: pickRandomIndexes(state.players.length, count),
    seenIndexes: [],
    activeIndex: null,
    solutionRevealed: false,
    randomCount: setting === "random",
  };
}

function pickRandomIndexes(total, count) {
  const indexes = Array.from({ length: Math.max(0, total) }, (_, index) => index);
  for (let index = indexes.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes.slice(0, Math.min(Math.max(0, count), indexes.length)).sort((a, b) => a - b);
}

function isImposterPlayer(index) {
  return Boolean(state.imposter?.imposterIndexes.includes(index));
}

function hasSeenImposterRole(index) {
  return Boolean(state.imposter?.seenIndexes.includes(index));
}

function getImposterCountLabel() {
  if (!state.imposter) return "";
  return state.imposter.randomCount ? "ukendt antal impostere" : `${state.imposter.imposterIndexes.length} ${state.imposter.imposterIndexes.length === 1 ? "imposter" : "impostere"}`;
}

function isPuzzleRushPlayerFinished(index) {
  return state.puzzleRushFinishedIndexes.includes(index);
}

function getPuzzleRushLeaders() {
  const bestScore = Math.max(...state.players.map((player) => getPlayerScore(player)));
  return state.players
    .map((player, index) => ({ player, index, score: getPlayerScore(player) }))
    .filter((entry) => entry.score === bestScore);
}

function getNextPuzzleRushPlayerIndex() {
  for (let offset = 1; offset <= state.players.length; offset++) {
    const index = (state.currentPlayer + offset) % state.players.length;
    if (!isPuzzleRushPlayerFinished(index)) return index;
  }
  return null;
}

function finishPuzzleRushGame(message = "") {
  state.puzzleRushComplete = true;
  state.currentSong = null;
  state.pendingIndex = null;
  state.revealed = false;
  state.challenges = [];
  state.activeChallengeIndex = null;
  render();
  const leaders = getPuzzleRushLeaders();
  const leaderNames = leaders.map(({ player }) => player.name).join(", ");
  toast(message || `${leaderNames} slutter med ${leaders[0]?.score || 0} point.`);
}

function finishPuzzleRushDecision() {
  if (!state.revealed || state.pendingIndex === null || state.puzzleRushComplete) return;
  const activePlayer = state.players[state.currentPlayer];
  if (!activePlayer) return;

  if (isPlacementCorrect()) {
    activePlayer.timeline.splice(state.pendingIndex, 0, state.currentSong);
    activePlayer.timeline.sort((a, b) => a.year - b.year);
    activePlayer.puzzleRushScore = Math.max(0, (Number(activePlayer.puzzleRushScore) || 0) + 1);
    drawNextMystery();
    if (!state.currentSong) {
      if (!isPuzzleRushPlayerFinished(state.currentPlayer)) state.puzzleRushFinishedIndexes.push(state.currentPlayer);
      finishPuzzleRushGame("Sangpuljen er tom. Rush afsluttet.");
      return;
    }
    render();
    return;
  }

  if (!isPuzzleRushPlayerFinished(state.currentPlayer)) {
    state.puzzleRushFinishedIndexes.push(state.currentPlayer);
    state.puzzleRushFinishedIndexes.sort((a, b) => a - b);
  }

  const nextPlayer = getNextPuzzleRushPlayerIndex();
  if (nextPlayer === null) {
    finishPuzzleRushGame();
    return;
  }

  state.currentPlayer = nextPlayer;
  drawNextMystery();
  if (!state.currentSong) {
    finishPuzzleRushGame("Sangpuljen er tom. Rush afsluttet.");
    return;
  }
  render();
  toast(`${activePlayer.name}s run slutter på ${getPlayerScore(activePlayer)} point. ${state.players[nextPlayer].name} er næste.`);
}

function getRandomWavelengthCategory() {
  const categories = getWavelengthCategoryLines();
  const template = categories[Math.floor(Math.random() * categories.length)];
  return hydrateWavelengthCategory(template);
}

function getRandomWavelengthTarget() {
  return Math.floor(Math.random() * 10) + 1;
}

function clampWavelengthValue(value) {
  return Math.min(10, Math.max(1, Math.round(Number(value) || 1)));
}

function getWavelengthDjs() {
  return state.players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== state.currentPlayer);
}

function getWavelengthGuessValues() {
  return getWavelengthDjs().map(({ index }) => clampWavelengthValue(state.wavelength?.guesses[index] || 5));
}

function getWavelengthFinalRange() {
  const values = getWavelengthGuessValues();
  if (!values.length) return { min: 1, max: 10 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

function clampWavelengthFinalGuess(value) {
  const range = getWavelengthFinalRange();
  return Math.min(range.max, Math.max(range.min, clampWavelengthValue(value)));
}

function getWavelengthPoints(distance) {
  if (distance === 0) return 5;
  if (distance === 1) return 3;
  if (distance === 2) return 2;
  if (distance === 3) return 1;
  return 0;
}

function getWavelengthWinnerIndex() {
  const winScore = clampWavelengthWinScore(state.wavelengthWinScore);
  const scores = state.players.map((player, index) => ({ index, score: getPlayerScore(player) }));
  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best && best.score >= winScore ? best.index : null;
}

function getPushLuckNextBankPoints() {
  if (state.pushLuckRiskCards) return 1;
  return state.pushLuckTurnStreak > 0 ? 2 : 1;
}

function addPushLuckCorrectSongToBank() {
  const activePlayer = state.players[state.currentPlayer];
  if (!isPlacementCorrect()) return;
  const bankedSong = { ...state.currentSong };
  activePlayer.timeline.splice(state.pendingIndex, 0, bankedSong);
  activePlayer.timeline.sort((a, b) => a.year - b.year);
  state.pushLuckTurnCards.push(bankedSong);
  state.pushLuckTurnBank += getPushLuckNextBankPoints();
  state.pushLuckTurnStreak += 1;
}

function resetPushLuckTurnBank() {
  state.pushLuckTurnBank = 0;
  state.pushLuckTurnStreak = 0;
  state.pushLuckTurnCards = [];
}

function removePushLuckTurnCards() {
  const activePlayer = state.players[state.currentPlayer];
  for (const song of state.pushLuckTurnCards) {
    const index = activePlayer.timeline.findIndex((candidate) => isSameSongCard(candidate, song));
    if (index !== -1) activePlayer.timeline.splice(index, 1);
  }
}

function isSameSongCard(left, right) {
  return left?.year === right?.year
    && normalizeIdentityText(left?.title || "") === normalizeIdentityText(right?.title || "")
    && normalizeIdentityText(left?.artist || "") === normalizeIdentityText(right?.artist || "");
}

function bankPushLuckTurn() {
  const activePlayer = state.players[state.currentPlayer];
  const banked = state.pushLuckTurnBank;
  if (!state.pushLuckRiskCards) {
    activePlayer.pushLuckScore = Math.max(0, (Number(activePlayer.pushLuckScore) || 0) + banked);
  }
  resetPushLuckTurnBank();
  if (checkWinner(activePlayer)) return;
  toast(state.pushLuckRiskCards ? `${activePlayer.name} stopper og beholder ${banked} kort.` : `${activePlayer.name} banker ${banked} kort.`);
  nextTurn();
}

function continuePushLuckTurn() {
  drawNextMystery();
  render();
}

function bustPushLuckTurn() {
  const activePlayer = state.players[state.currentPlayer];
  const lost = state.pushLuckTurnBank;
  const removedCards = state.pushLuckRiskCards ? state.pushLuckTurnCards.length : 0;
  if (state.pushLuckRiskCards) removePushLuckTurnCards();
  resetPushLuckTurnBank();
  toast(state.pushLuckRiskCards
    ? `${activePlayer.name} buster og mister ${removedCards} kort fra tidslinjen.`
    : `${activePlayer.name} buster og mister ${lost} kort fra turen.`);
  nextTurn();
}

function createSharedTimelineRound() {
  return {
    placements: {},
    results: [],
    phase: "placing",
  };
}

function normalizeSharedTimelineRound(value) {
  if (!value || typeof value !== "object") return null;
  const placements = {};
  if (value.placements && typeof value.placements === "object") {
    Object.entries(value.placements).forEach(([key, placement]) => {
      const index = Number(placement);
      if (Number.isInteger(index) && index >= 0) placements[key] = index;
    });
  }
  return {
    placements,
    results: Array.isArray(value.results) ? value.results : [],
    phase: value.phase === "results" ? "results" : "placing",
  };
}

function normalizeIndexList(value) {
  return Array.isArray(value)
    ? value.map((index) => Number(index)).filter((index) => Number.isInteger(index) && state.players[index])
    : null;
}

function getSharedTimelineActiveIndexes() {
  return state.sharedTimelineSuddenDeathIndexes?.length
    ? state.sharedTimelineSuddenDeathIndexes.filter((index) => state.players[index])
    : state.players.map((_, index) => index);
}

function isSharedTimelinePlayerActive(index) {
  return getSharedTimelineActiveIndexes().includes(index);
}

function isSharedTimelinePlacementCorrect(playerIndex, placementIndex) {
  if (!state.currentSong || !Number.isInteger(placementIndex)) return false;
  return isSlotChronologicallyCorrectForTimeline(state.players[playerIndex]?.timeline || [], placementIndex);
}

function getSharedTimelineResult(playerIndex) {
  return state.sharedTimelineRound?.results.find((result) => result.playerIndex === playerIndex) || null;
}

function getSharedTimelineWinnerIndex() {
  const winScore = clampSharedTimelineWinScore(state.sharedTimelineWinScore);
  const scores = state.players.map((player, index) => ({ index, score: getPlayerScore(player) }));
  const topScore = Math.max(...scores.map((item) => item.score));
  if (topScore < winScore) return null;
  const leaders = scores.filter((item) => item.score === topScore);
  return leaders.length === 1 ? leaders[0].index : null;
}

function updateSharedTimelineSuddenDeath() {
  const winScore = clampSharedTimelineWinScore(state.sharedTimelineWinScore);
  const scores = state.players.map((player, index) => ({ index, score: getPlayerScore(player) }));
  const topScore = Math.max(...scores.map((item) => item.score));
  const leaders = scores.filter((item) => item.score === topScore && item.score >= winScore).map((item) => item.index);
  state.sharedTimelineSuddenDeathIndexes = leaders.length > 1 ? leaders : null;
  return leaders;
}

function getWavelengthCategoryLines() {
  const saved = safeJsonParse(localStorage.getItem("hitster_wavelength_categories"), null);
  const categories = Array.isArray(saved) ? saved : defaultWavelengthCategories;
  return categories.map((category) => String(category).trim()).filter(Boolean);
}

function saveWavelengthCategoryLines(value) {
  const categories = parseWavelengthCategoryText(value);
  localStorage.setItem("hitster_wavelength_categories", JSON.stringify(categories.length ? categories : defaultWavelengthCategories));
}

function resetWavelengthCategoryLines() {
  localStorage.removeItem("hitster_wavelength_categories");
}

function parseWavelengthCategoryText(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function loadWavelengthCategoryFile() {
  try {
    const response = await fetch("wavelength-categories.txt", { cache: "no-store" });
    if (!response.ok) return;
    const categories = parseWavelengthCategoryText(await response.text());
    if (categories.length) defaultWavelengthCategories = categories;
  } catch {
    defaultWavelengthCategories = [...fallbackWavelengthCategories];
  }
}

function hydrateWavelengthCategory(template) {
  const names = getPlayerNames();
  const guesser = names[state.currentPlayer] || names[0] || "gætteren";
  const playerPool = names.length ? names : ["en spiller"];
  const player = playerPool[Math.floor(Math.random() * playerPool.length)];
  return String(template)
    .replaceAll("{guesser}", guesser)
    .replaceAll("{player}", player);
}

function getGenerationEraLabel(value) {
  const era = generationEras[normalizeGenerationEra(value)];
  return `${era.label} · ${era.description}`;
}

function renderFilterOptions() {
  if (!el.genreExclusions || !el.decadeExclusions) return;
  const songs = loadSongLibrary();
  const selectedGenres = new Set(state.excludedGenres);
  const selectedDecades = new Set(state.excludedDecades);
  const genres = [...new Set(songs.map((song) => song.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const decades = [...new Set(songs.map((song) => String(Math.floor(song.year / 10) * 10)))].sort((a, b) => Number(a) - Number(b));
  el.genreExclusions.innerHTML = renderGenreFilterGroups(genres, selectedGenres);
  el.decadeExclusions.innerHTML = renderFilterChips(decades, selectedDecades, "decade", (decade) => `${decade}'erne`);
  syncGenreGroupStates();
}

function renderFilterChips(values, selected, type, format = (value) => value) {
  return values.map((value) => `
    <label class="filter-chip">
      <input data-filter-type="${type}" value="${escapeHtml(value)}" type="checkbox"${selected.has(String(value)) ? " checked" : ""} />
      <span>${escapeHtml(format(value))}</span>
    </label>
  `).join("") || `<p class="tiny-note">Ingen valgmuligheder fundet.</p>`;
}

function getCheckedValues(container) {
  return [...container.querySelectorAll("input[data-filter-type]:checked")].map((input) => input.value);
}

function renderGenreFilterGroups(genres, selected) {
  const groups = groupGenres(genres);
  return groups.map(([group, values], index) => {
    const checkedCount = values.filter((value) => selected.has(value)).length;
    return `
      <details class="filter-group">
        <summary>
          <input data-filter-group-index="${index}" type="checkbox"${checkedCount === values.length ? " checked" : ""} />
          <span>${escapeHtml(group)}</span>
          <small>${checkedCount}/${values.length}</small>
        </summary>
        <div class="filter-suboptions">
          ${renderFilterChips(values, selected, "genre")}
        </div>
      </details>
    `.replaceAll('data-filter-type="genre"', `data-filter-type="genre" data-filter-group-index="${index}"`);
  }).join("");
}

function groupGenres(genres) {
  const groups = new Map();
  for (const genre of genres) {
    const group = getGenreGroup(genre);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(genre);
  }
  return [...groups.entries()].sort((a, b) => genreGroupOrder(a[0]) - genreGroupOrder(b[0]) || a[0].localeCompare(b[0]));
}

function getGenreGroup(genre) {
  const value = genre.toLowerCase();
  if (/(rock|metal|grunge|punk|new-wave|britpop)/.test(value)) return "Rock";
  if (/(hiphop|rap|rnb)/.test(value)) return "Hip-hop & R&B";
  if (/(dance|edm|electronic|house|techno|trance|big-beat|eurodance|synth)/.test(value)) return "Elektronisk & dance";
  if (/(latin|reggae|reggaeton|dancehall|ska|bossa)/.test(value)) return "Latin, reggae & world";
  if (/(country|folk|singer-songwriter)/.test(value)) return "Country & folk";
  if (/(soul|funk|disco|jazz)/.test(value)) return "Soul, funk & jazz";
  if (/(film|musical|chanson|schlager|novelty)/.test(value)) return "Scene, film & novelty";
  if (/pop/.test(value)) return "Pop";
  return "Andet";
}

function genreGroupOrder(group) {
  const index = ["Pop", "Rock", "Hip-hop & R&B", "Elektronisk & dance", "Soul, funk & jazz", "Country & folk", "Latin, reggae & world", "Scene, film & novelty", "Andet"].indexOf(group);
  return index === -1 ? 99 : index;
}

function syncGenreGroupStates() {
  el.genreExclusions.querySelectorAll("input[data-filter-group-index]:not([data-filter-type])").forEach((groupInput) => {
    const inputs = [...el.genreExclusions.querySelectorAll(`input[data-filter-type="genre"][data-filter-group-index="${groupInput.dataset.filterGroupIndex}"]`)];
    const checked = inputs.filter((input) => input.checked).length;
    groupInput.checked = inputs.length > 0 && checked === inputs.length;
    groupInput.indeterminate = checked > 0 && checked < inputs.length;
    const count = groupInput.closest("summary")?.querySelector("small");
    if (count) count.textContent = `${checked}/${inputs.length}`;
  });
}

function toast(message) {
  clearTimeout(toastTimer);
  el.toast.textContent = message;
  el.toast.classList.add("show");
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 3600);
}

async function copyRedirectUri() {
  try {
    await navigator.clipboard.writeText(redirectUri);
    toast("Redirect URI kopieret.");
  } catch {
    window.prompt("Kopier redirect URI:", redirectUri);
  }
}

function randomString(length) {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return [...values].map((value) => ("0" + (value % 36).toString(36)).slice(-1)).join("");
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function startLogin() {
  const clientId = el.clientId.value.trim();
  if (!clientId) {
    toast("Indsæt Client ID først.");
    return;
  }

  savePersistent();
  if (state.started) saveGameSnapshot();
  localStorage.setItem(loginReturnStageKey, state.started ? "game-settings" : "setup");
  const verifier = randomString(96);
  const challenge = base64UrlEncode(await sha256(verifier));
  localStorage.setItem("spotify_client_id", clientId);
  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  allowNavigation = true;
  location.href = `${authorizeUrl}?${params}`;
}

async function finishLoginIfNeeded() {
  const code = new URLSearchParams(location.search).get("code");
  if (!code) {
    updateAuthStatus();
    return;
  }

  const clientId = localStorage.getItem("spotify_client_id");
  const verifier = localStorage.getItem("spotify_code_verifier");
  if (!clientId || !verifier) {
    toast("Login mangler Client ID. Prøv at logge ind igen.");
    return;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    toast(`Spotify-login fejlede: ${response.status}`);
    return;
  }

  const token = await response.json();
  localStorage.setItem("spotify_access_token", token.access_token);
  localStorage.setItem("spotify_expires_at", String(Date.now() + token.expires_in * 1000));
  localStorage.setItem("spotify_scopes", scopes);
  const returnStage = localStorage.getItem(loginReturnStageKey);
  localStorage.removeItem(loginReturnStageKey);
  if (returnStage === "setup" || returnStage === "game-settings") state.setupOpen = true;
  history.replaceState({}, "", "/");
  updateAuthStatus();
  render();
  toast("Spotify-login er klar.");
}

function getToken() {
  const token = localStorage.getItem("spotify_access_token");
  const expiresAt = Number(localStorage.getItem("spotify_expires_at") || 0);
  const savedScopes = localStorage.getItem("spotify_scopes");
  if (!token || savedScopes !== scopes || Date.now() > expiresAt - 30000) {
    throw new Error("Log ind med Spotify igen.");
  }
  return token;
}

async function spotifyFetch(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${getToken()}`,
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 403) {
    throw new Error("Spotify gav 403. Log ind igen, eller brug en gamemode der ikke kraever Spotify playlist-adgang.");
  }

  if (!response.ok && response.status !== 204) {
    const message = await response.text();
    if (response.status === 403) {
      throw new Error("Spotify gav 403. Log ind igen, eller brug en gamemode der ikke kraever Spotify playlist-adgang.");
    }
    throw new Error(`${response.status}: ${message}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function updateAuthStatus() {
  const expiresAt = Number(localStorage.getItem("spotify_expires_at") || 0);
  const savedScopes = localStorage.getItem("spotify_scopes");
  el.authStatus.textContent = expiresAt > Date.now() && savedScopes === scopes ? "Spotify-login aktivt." : "Ikke logget ind.";
}

async function loadDevices() {
  try {
    const data = await spotifyFetch("/me/player/devices");
    el.deviceSelect.innerHTML = "";

    for (const device of data.devices || []) {
      const option = document.createElement("option");
      option.value = device.id;
      option.textContent = `${device.name}${device.is_active ? " (aktiv)" : ""} - ${device.type}`;
      el.deviceSelect.append(option);
    }

    toast(el.deviceSelect.options.length ? "Enheder hentet." : "Ingen enheder fundet. Åbn Spotify og prøv igen.");
  } catch (error) {
    toast(error.message);
  }
}

async function resolveTrack(song) {
  if (song.uri) return song.uri;

  const candidates = [];
  for (const query of buildTrackSearchQueries(song)) {
    const params = new URLSearchParams({ q: query, type: "track", limit: "8", market: "DK" });
    const data = await spotifyFetch(`/search?${params}`);
    candidates.push(...(data?.tracks?.items || []));
  }

  const found = pickBestSpotifyTrack(song, candidates);

  if (!found) {
    throw new Error(`Kunne ikke finde ${song.title} på Spotify.`);
  }

  song.uri = found.uri;
  return song.uri;
}

function buildTrackSearchQueries(song) {
  const terms = [
    ...(song.searchTerms || []),
    `${song.title} ${song.artist}`,
    `${stripParentheses(song.title)} ${song.artist}`,
    `${song.title}`,
    `track:${song.title} artist:${song.artist}`,
  ];

  return [...new Set(terms.map((term) => term.trim()).filter(Boolean))];
}

function pickBestSpotifyTrack(song, tracks) {
  const uniqueTracks = dedupeSpotifyTracks(tracks);
  const scored = uniqueTracks
    .map((track) => ({ track, score: scoreSpotifyTrack(song, track) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score >= 8 ? scored[0].track : null;
}

function scoreSpotifyTrack(song, track) {
  const expectedTitle = normalizeSearchText(song.title);
  const expectedArtist = normalizeSearchText(song.artist);
  const actualTitle = normalizeSearchText(track.name || "");
  const actualArtists = normalizeSearchText((track.artists || []).map((artist) => artist.name).join(" "));
  let titleScore = 0;
  let artistScore = 0;
  let yearScore = 0;

  if (actualTitle === expectedTitle) titleScore = 6;
  else if (actualTitle.includes(expectedTitle) || expectedTitle.includes(actualTitle)) titleScore = 5;
  else titleScore = tokenOverlapScore(expectedTitle, actualTitle, 4);

  if (actualArtists.includes(expectedArtist) || expectedArtist.includes(actualArtists)) artistScore = 5;
  else artistScore = tokenOverlapScore(expectedArtist, actualArtists, 4);

  const releaseYear = Number((track.album?.release_date || "").slice(0, 4));
  if (releaseYear && Math.abs(releaseYear - song.year) <= 1) yearScore = 1;

  const score = titleScore + artistScore + yearScore;
  if (titleScore < 5 || artistScore < 4) return 0;
  return score;
}

function dedupeSpotifyTracks(tracks) {
  const seen = new Set();
  return tracks.filter((track) => {
    if (!track?.id || seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}

function stripParentheses(value) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeSearchText(value) {
  return stripParentheses(String(value))
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\u00e6/g, "ae")
    .replace(/\u00f8/g, "o")
    .replace(/\u00e5/g, "a")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenOverlapScore(expected, actual, maxScore) {
  const expectedTokens = expected.split(" ").filter(Boolean);
  if (!expectedTokens.length) return 0;
  const actualTokens = new Set(actual.split(" ").filter(Boolean));
  const matches = expectedTokens.filter((token) => actualTokens.has(token)).length;
  return Math.round((matches / expectedTokens.length) * maxScore);
}

async function playCurrentTrack() {
  try {
    ensureGameReady();
    const deviceId = el.deviceSelect.value;
    if (!deviceId) throw new Error("Vælg afspilningsenhed først.");

    const uri = await resolveTrack(state.currentSong);
    await playSpotifyUri(deviceId, uri);
    toast("Afspiller skjult.");
  } catch (error) {
    if (shouldSkipPlaybackError(error)) {
      skipUnplayableCurrentSong(error.message);
      return;
    }
    toast(error.message);
  }
}

async function playImposterTrack() {
  try {
    if (!state.started || !state.imposter?.song) throw new Error("Start Imposter først.");
    const deviceId = el.deviceSelect.value;
    if (!deviceId) throw new Error("Vælg afspilningsenhed først.");

    const uri = await resolveTrack(state.imposter.song);
    await playSpotifyUri(deviceId, uri);
    toast("Afspiller for crewmate.");
  } catch (error) {
    toast(error.message);
  }
}

function revealImposterRole(index) {
  if (!state.imposter || !state.players[index]) return;
  state.imposter.activeIndex = index;
  if (!state.imposter.seenIndexes.includes(index)) {
    state.imposter.seenIndexes.push(index);
    state.imposter.seenIndexes.sort((a, b) => a - b);
  }
  render();
  if (!isImposterPlayer(index)) playImposterTrack();
}

function hideImposterRole() {
  if (!state.imposter) return;
  const shouldPause = Number.isInteger(state.imposter.activeIndex) && !isImposterPlayer(state.imposter.activeIndex);
  state.imposter.activeIndex = null;
  render();
  if (shouldPause) pausePlayback();
}

function revealImposterSolution() {
  if (!state.imposter) return;
  state.imposter.solutionRevealed = true;
  render();
}

async function playSpotifyUri(deviceId, uri) {
  const path = `/me/player/play?device_id=${encodeURIComponent(deviceId)}`;
  const options = {
    method: "PUT",
    body: JSON.stringify({ uris: [uri] }),
  };

  try {
    await spotifyFetch(path, options);
  } catch (error) {
    if (!isRetryableSpotifyError(error)) throw error;
    await delay(650);
    await spotifyFetch(path, options);
  }
}

function shouldSkipPlaybackError(error) {
  const message = String(error.message || "");
  return (
    message.startsWith("Kunne ikke finde") ||
    message.startsWith("404:") ||
    message.startsWith("502:") ||
    message.startsWith("503:") ||
    message.startsWith("504:")
  );
}

function isRetryableSpotifyError(error) {
  const message = String(error.message || "");
  return message.startsWith("502:") || message.startsWith("503:") || message.startsWith("504:");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function skipUnplayableCurrentSong(message) {
  toast(`${message} Sangen er sprunget over.`);
  drawNextMystery();
  render();
}

async function pausePlayback() {
  try {
    const deviceId = el.deviceSelect.value;
    await spotifyFetch(`/me/player/pause${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ""}`, {
      method: "PUT",
    });
    toast("Pause sendt.");
  } catch (error) {
    if (isBenignPauseError(error)) {
      toast("Spotify er allerede pauset eller enheden er ikke aktiv.");
      return;
    }
    toast(error.message);
  }
}

async function resumePlayback() {
  try {
    const deviceId = el.deviceSelect.value;
    if (!deviceId) throw new Error("Vælg afspilningsenhed først.");

    await spotifyFetch(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: "PUT",
    });
    toast("Fortsætter sangen.");
  } catch (error) {
    toast(error.message);
  }
}

function isBenignPauseError(error) {
  const message = String(error.message || "");
  return message.startsWith("403:") || message.startsWith("404:");
}

async function startGame() {
  syncHitsterCardsAvailability();
  savePersistent();
  const names = getPlayerNames();
  const advancedEnabled = el.advancedSettingsToggle.checked;
  const settings = getEffectivePlayerSettings(advancedEnabled);
  state.gameMode = el.gameMode.value;
  state.hitsterCardsEnabled = canUseHitsterCards(state.gameMode) && el.hitsterCardsMode.checked;
  state.gamemasterEnabled = el.gamemasterEnabled.checked;
  state.gamemasterOpen = false;
  state.wavelengthUseCategories = getWavelengthUseCategoriesSetting();
  state.wavelengthWinScore = getWavelengthWinScoreSetting();
  state.wavelengthWinnerIndex = null;
  state.battleRoyaleWinnerIndex = null;
  state.sharedTimelineRound = null;
  state.sharedTimelineWinScore = getSharedTimelineWinScoreSetting();
  state.sharedTimelineSuddenDeathIndexes = null;
  state.sharedTimelineWinnerIndex = null;
  state.pushLuckTurnBank = 0;
  state.pushLuckTurnStreak = 0;
  state.pushLuckTurnCards = [];
  state.pushLuckRiskCards = getPushLuckRiskCardsSetting();
  state.pushLuckWinScore = getPushLuckWinScoreSetting();
  state.pushLuckWinnerIndex = null;
  state.imposter = null;
  state.imposterCountSetting = getImposterCountSetting();
  state.puzzleRushFinishedIndexes = [];
  state.puzzleRushComplete = false;
  state.excludedGenres = advancedEnabled ? getCheckedValues(el.genreExclusions) : [];
  state.excludedDecades = advancedEnabled ? getCheckedValues(el.decadeExclusions) : [];
  state.players = names.map((name, index) => createPlayer(name, settings[index]));
  state.currentPlayer = 0;
  state.pendingIndex = null;
  state.challenges = [];
  state.activeChallengeIndex = null;
  state.titleCorrect = false;
  state.artistCorrect = false;
  state.revealed = false;
  state.started = true;

  if (isWavelengthMode(state.gameMode)) {
    state.deck = [];
    state.currentSong = null;
    state.imposter = null;
    state.wavelength = createWavelengthRound();
    state.setupOpen = false;
    render();
    toast("Wavelength DJ er startet.");
    return;
  }

  state.wavelength = null;
  el.startGame.disabled = true;
  toast(`Henter ${getGameModeTitle(state.gameMode)}-pulje...`);

  try {
    state.deck = await buildGameDeck();
  } catch (error) {
    state.started = false;
    el.startGame.disabled = false;
    render();
    toast(error.message);
    return;
  }

  el.startGame.disabled = false;

  if (isImposterMode(state.gameMode)) {
    state.currentSong = drawAnySong();
    if (!state.currentSong) {
      state.started = false;
      toast("Der mangler en kendt sang til Imposter.");
      return;
    }
    state.imposter = createImposterRound(state.currentSong);
    state.setupOpen = false;
    render();
    toast("Imposter er startet. Send spillerne op én ad gangen.");
    return;
  }

  const minimumSongs = isSharedTimelineMode(state.gameMode) ? 2 : state.players.length + 1;
  if (state.deck.length < minimumSongs) {
    state.started = false;
    toast(`${getGameModeTitle()} efterlader for få sange til at starte spillet.`);
    return;
  }

  if (isSharedTimelineMode(state.gameMode)) {
    const starter = drawAnySong();
    if (starter) state.players.forEach((player) => player.timeline.push({ ...starter }));
  } else {
    for (let index = 0; index < state.players.length; index++) {
      const player = state.players[index];
      const starter = drawSong(index);
      if (starter) player.timeline.push(starter);
    }
  }

  if (state.players.some((player) => !player.timeline.length)) {
    state.started = false;
    toast("Der mangler sange i en af de valgte generationer.");
    return;
  }

  drawNextMystery();
  if (!state.currentSong) {
    state.started = false;
    toast("Der mangler en sang til første tur i den valgte generation.");
    return;
  }

  state.setupOpen = false;
  render();
  toast(`${getGameModeTitle()} er startet.`);
}

function resetGame() {
  state.started = false;
  state.currentSong = null;
  state.pendingIndex = null;
  state.challenges = [];
  state.activeChallengeIndex = null;
  state.gameMode = el.gameMode.value;
  syncHitsterCardsAvailability();
  state.hitsterCardsEnabled = canUseHitsterCards(state.gameMode) && el.hitsterCardsMode.checked;
  state.gamemasterEnabled = el.gamemasterEnabled.checked;
  state.gamemasterOpen = false;
  state.wavelengthUseCategories = getWavelengthUseCategoriesSetting();
  state.wavelengthWinScore = getWavelengthWinScoreSetting();
  state.wavelengthWinnerIndex = null;
  state.battleRoyaleWinnerIndex = null;
  state.sharedTimelineRound = null;
  state.sharedTimelineWinScore = getSharedTimelineWinScoreSetting();
  state.sharedTimelineSuddenDeathIndexes = null;
  state.sharedTimelineWinnerIndex = null;
  state.pushLuckTurnBank = 0;
  state.pushLuckTurnStreak = 0;
  state.pushLuckTurnCards = [];
  state.pushLuckRiskCards = getPushLuckRiskCardsSetting();
  state.pushLuckWinScore = getPushLuckWinScoreSetting();
  state.pushLuckWinnerIndex = null;
  state.imposter = null;
  state.imposterCountSetting = getImposterCountSetting();
  state.puzzleRushFinishedIndexes = [];
  state.puzzleRushComplete = false;
  state.excludedGenres = el.advancedSettingsToggle.checked ? getCheckedValues(el.genreExclusions) : [];
  state.excludedDecades = el.advancedSettingsToggle.checked ? getCheckedValues(el.decadeExclusions) : [];
  state.titleCorrect = false;
  state.artistCorrect = false;
  state.revealed = false;
  state.wavelength = null;
  syncPlayersFromFields();
  state.deck = shuffle(getPlayableSongLibrary());
  clearGameSnapshot();
  el.gamemasterToggle.classList.remove("active");
  el.gamemasterToggle.setAttribute("aria-pressed", "false");
  el.gamemasterPanel.classList.remove("active");
  state.setupOpen = false;
  render();
}

function drawSong(playerIndex = state.currentPlayer) {
  const player = state.players[playerIndex];
  const songIndex = state.deck.findIndex((candidate) => isSongAllowedForPlayer(candidate, player));
  if (songIndex === -1) return null;
  const [song] = state.deck.splice(songIndex, 1);
  return normalizeSong(song);
}

function isSongAllowedForPlayer(song, player) {
  if (!isBattleMode()) return true;
  const era = generationEras[normalizeGenerationEra(player?.generationEra)];
  return Boolean(song && song.year >= era.min && song.year <= era.max);
}

function drawAnySong() {
  while (state.deck.length) {
    const song = normalizeSong(state.deck.shift());
    if (song) return song;
  }
  return null;
}

function drawNextMystery() {
  state.currentSong = isSharedTimelineMode() ? drawAnySong() : drawSong();
  state.pendingIndex = null;
  state.sharedTimelineRound = isSharedTimelineMode() ? createSharedTimelineRound() : null;
  state.challenges = [];
  state.activeChallengeIndex = null;
  state.titleCorrect = false;
  state.artistCorrect = false;
  state.revealed = false;
  if (!state.currentSong) toast("Sangpuljen er tom.");
}

function choosePlacement(index) {
  ensureGameReady();
  if (isSharedTimelineMode()) {
    chooseSharedTimelinePlacement(state.currentPlayer, index);
    return;
  }
  if (state.activeChallengeIndex !== null) {
    chooseChallengePlacement(index);
    return;
  }
  if (state.challenges.length) {
    toast("Placeringen er låst, fordi der allerede er lagt Hitster-kort.");
    return;
  }
  state.pendingIndex = index;
  render();
}

function chooseSharedTimelinePlacement(playerIndex, placementIndex) {
  if (!state.sharedTimelineRound || state.sharedTimelineRound.phase === "results") return;
  if (!isSharedTimelinePlayerActive(playerIndex)) return;
  state.sharedTimelineRound.placements[playerIndex] = placementIndex;
  render();
}

function startChallenge() {
  try {
    ensureGameReady();
    if (!state.hitsterCardsEnabled) throw new Error("Hitster-kort er ikke slået til.");
    if (state.revealed) throw new Error("Der kan kun udfordres før afsløring.");
    if (state.pendingIndex === null) throw new Error("Den aktive spiller skal placere sangen først.");
    if (state.activeChallengeIndex !== null) throw new Error("Placer den igangværende udfordring først.");

    const challengerIndex = Number(el.challengerSelect.value);
    const challenger = state.players[challengerIndex];
    if (!challenger || challengerIndex === state.currentPlayer) throw new Error("Vælg en anden spiller.");
    if (isBattleRoyaleMode() && !isBattleRoyalePlayerAlive(challenger)) throw new Error(`${challenger.name} er elimineret.`);
    if (!hasHitsterCards(challenger)) throw new Error(`${challenger.name} har ingen Hitster-kort.`);
    if (state.challenges.some((challenge) => challenge.challengerIndex === challengerIndex)) {
      throw new Error(`${challenger.name} har allerede udfordret denne sang.`);
    }

    state.challenges.push({ challengerIndex, placementIndex: null });
    state.activeChallengeIndex = state.challenges.length - 1;
    render();
    toast(`${challenger.name} udfordrer. Vælg et plus i ${state.players[state.currentPlayer].name}s tidslinje.`);
  } catch (error) {
    toast(error.message);
  }
}

function cancelChallenge() {
  if (state.activeChallengeIndex !== null) {
    state.challenges.splice(state.activeChallengeIndex, 1);
    state.activeChallengeIndex = null;
  } else {
    state.challenges = [];
  }
  render();
}

function chooseChallengePlacement(index) {
  const challenge = state.challenges[state.activeChallengeIndex];
  if (!challenge) return;
  if (index === state.pendingIndex) {
    toast("Udfordringen skal ligge et andet sted end det oprindelige svar.");
    return;
  }
  if (state.challenges.some((other) => other !== challenge && other.placementIndex === index)) {
    toast("Der ligger allerede et Hitster-kort der.");
    return;
  }

  challenge.placementIndex = index;
  state.activeChallengeIndex = null;
  render();
}

function revealTrack() {
  ensureGameReady();
  if (isSharedTimelineMode()) {
    revealSharedTimelineRound();
    return;
  }
  if (state.pendingIndex === null) {
    toast("Vælg en placering først.");
    return;
  }

  if (state.activeChallengeIndex !== null || state.challenges.some((challenge) => challenge.placementIndex === null)) {
    toast("Udfordreren skal placere sit Hitster-kort først.");
    return;
  }

  state.revealed = true;
  render();
}

function keepCard() {
  if (isSharedTimelineMode()) {
    finishSharedTimelineRound();
    return;
  }
  if (isPuzzleRushMode()) {
    finishPuzzleRushDecision();
    return;
  }
  if (isPushLuckMode()) {
    finishPushLuckDecision("continue");
    return;
  }
  if (!state.revealed || state.pendingIndex === null) return;
  finishRevealedTurn();
}

function discardCard() {
  if (isSharedTimelineMode()) {
    finishSharedTimelineRound();
    return;
  }
  if (isPuzzleRushMode()) {
    finishPuzzleRushDecision();
    return;
  }
  if (isPushLuckMode()) {
    finishPushLuckDecision("bank");
    return;
  }
  if (!state.revealed) return;
  finishRevealedTurn();
}

function finishPushLuckDecision(action) {
  if (!state.revealed || state.pendingIndex === null) return;
  if (!isPlacementCorrect()) {
    bustPushLuckTurn();
    return;
  }
  addPushLuckCorrectSongToBank();
  if (action === "bank") {
    bankPushLuckTurn();
    return;
  }
  continuePushLuckTurn();
}

function revealSharedTimelineRound() {
  if (!state.sharedTimelineRound || state.sharedTimelineRound.phase === "results") return;
  const missing = getSharedTimelineActiveIndexes().filter((index) => !Number.isInteger(state.sharedTimelineRound.placements[index]));
  if (missing.length) {
    toast(`${missing.map((index) => state.players[index].name).join(", ")} mangler at placere.`);
    return;
  }

  const results = getSharedTimelineActiveIndexes().map((playerIndex) => {
    const placementIndex = state.sharedTimelineRound.placements[playerIndex];
    const correct = isSharedTimelinePlacementCorrect(playerIndex, placementIndex);
    if (correct) {
      state.players[playerIndex].sharedTimelineScore = Math.max(0, (Number(state.players[playerIndex].sharedTimelineScore) || 0) + 1);
      state.players[playerIndex].timeline.splice(placementIndex, 0, state.currentSong);
      state.players[playerIndex].timeline.sort((a, b) => a.year - b.year);
    }
    return { playerIndex, placementIndex, correct };
  });

  state.sharedTimelineRound.results = results;
  state.sharedTimelineRound.phase = "results";
  state.revealed = true;
  const winnerIndex = getSharedTimelineWinnerIndex();
  if (winnerIndex !== null) {
    state.sharedTimelineWinnerIndex = winnerIndex;
    state.started = false;
    clearGameSnapshot();
    render();
    toast(`${state.players[winnerIndex].name} vinder Timeline Showdown!`);
    return;
  }
  const suddenDeathIndexes = updateSharedTimelineSuddenDeath();
  render();
  if (suddenDeathIndexes.length > 1) {
    toast(`Sudden death: ${suddenDeathIndexes.map((index) => state.players[index].name).join(", ")} fortsætter.`);
    return;
  }
  toast(`${results.filter((result) => result.correct).length} korrekte placeringer.`);
}

function finishSharedTimelineRound() {
  if (!state.sharedTimelineRound || state.sharedTimelineRound.phase !== "results" || state.sharedTimelineWinnerIndex !== null) return;
  drawNextMystery();
  render();
}

function finishRevealedTurn() {
  if (isPuzzleRushMode()) {
    finishPuzzleRushDecision();
    return;
  }

  const activePlayer = state.players[state.currentPlayer];
  const winningChallenge = getWinningChallenge();

  awardTurnBonus();

  for (const challenge of state.challenges) {
    const challenger = state.players[challenge.challengerIndex];
    spendHitsterCard(challenger);
  }

  if (applyBattleRoyalePenalties()) return;

  if (winningChallenge) {
    const challenger = state.players[winningChallenge.challengerIndex];
    addSongToTimeline(challenger, state.currentSong);
    if (checkWinner(challenger)) return;
    nextTurn();
    return;
  }

  if (isPlacementCorrect()) {
    activePlayer.timeline.splice(state.pendingIndex, 0, state.currentSong);
    activePlayer.timeline.sort((a, b) => a.year - b.year);
    if (checkWinner(activePlayer)) return;
  }

  nextTurn();
}

function applyBattleRoyalePenalties() {
  if (!isBattleRoyaleMode()) return false;
  const activePlayer = state.players[state.currentPlayer];
  const lostLives = [];

  if (!isPlacementCorrect()) {
    loseBattleRoyaleLife(activePlayer);
    lostLives.push(activePlayer.name);
  }

  if (finishBattleRoyaleIfWinner()) return true;

  for (const challenge of state.challenges) {
    if (isChallengeCorrect(challenge)) continue;
    const challenger = state.players[challenge.challengerIndex];
    loseBattleRoyaleLife(challenger);
    lostLives.push(challenger.name);
    if (finishBattleRoyaleIfWinner()) return true;
  }

  if (lostLives.length) toast(`${lostLives.join(", ")} mister 1 liv.`);
  return false;
}

function finishBattleRoyaleIfWinner() {
  const winner = getBattleRoyaleWinner();
  if (!winner) return false;
  state.battleRoyaleWinnerIndex = winner.index;
  state.started = false;
  clearGameSnapshot();
  render();
  toast(`${winner.player.name} vinder Battle Royale!`);
  return true;
}

function addSongToTimeline(player, song) {
  player.timeline.push(song);
  player.timeline.sort((a, b) => a.year - b.year);
}

function awardTurnBonus() {
  if (!state.hitsterCardsEnabled) return;
  if (isSoundtrackMode()) {
    if (state.titleCorrect) addHitsterCard(state.players[state.currentPlayer]);
    return;
  }
  if (!state.titleCorrect || !state.artistCorrect) return;
  addHitsterCard(state.players[state.currentPlayer]);
}

function checkWinner(player) {
  if (isBattleRoyaleMode()) return finishBattleRoyaleIfWinner();
  if (isPushLuckMode() && getPlayerScore(player) >= getPlayerWinScore(player)) {
    state.pushLuckWinnerIndex = state.players.indexOf(player);
    state.started = false;
    clearGameSnapshot();
    render();
    toast(`${player.name} vinder Push Your Luck!`);
    return true;
  }
  if (getPlayerScore(player) < getPlayerWinScore(player)) return false;
  state.started = false;
  clearGameSnapshot();
  render();
  toast(`${player.name} vinder!`);
  return true;
}

function nextTurn() {
  if (isBattleRoyaleMode()) {
    const nextPlayer = getNextAliveBattleRoyalePlayerIndex();
    if (nextPlayer === null) {
      finishBattleRoyaleIfWinner();
      return;
    }
    state.currentPlayer = nextPlayer;
  } else {
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  }
  drawNextMystery();
  render();
}

function getNextAliveBattleRoyalePlayerIndex() {
  const alive = getAliveBattleRoyalePlayers();
  if (!alive.length) return null;
  for (let offset = 1; offset <= state.players.length; offset++) {
    const index = (state.currentPlayer + offset) % state.players.length;
    if (isBattleRoyalePlayerAlive(state.players[index])) return index;
  }
  return alive[0].index;
}

function finishWavelengthRound() {
  if (!state.started || !isWavelengthMode() || !state.wavelength || state.wavelength.phase === "results") return;
  const round = state.wavelength;
  const target = clampWavelengthValue(round.target);
  const awards = [];
  const guesser = state.players[state.currentPlayer];
  const finalGuess = clampWavelengthFinalGuess(round.finalGuess);
  round.finalGuess = finalGuess;
  const finalDistance = Math.abs(finalGuess - target);
  const finalPoints = getWavelengthPoints(finalDistance);
  guesser.wavelengthScore = Math.max(0, (Number(guesser.wavelengthScore) || 0) + finalPoints);
  awards.push({ role: "guesser", playerIndex: state.currentPlayer, guess: finalGuess, distance: finalDistance, points: finalPoints });

  for (const { player, index } of getWavelengthDjs()) {
    const guess = clampWavelengthValue(round.guesses[index] || 5);
    const distance = Math.abs(guess - target);
    const points = getWavelengthPoints(distance);
    player.wavelengthScore = Math.max(0, (Number(player.wavelengthScore) || 0) + points);
    awards.push({ role: "dj", playerIndex: index, guess, distance, points });
  }

  round.showTarget = true;
  round.phase = "results";
  round.awards = awards;
  state.wavelengthWinnerIndex = getWavelengthWinnerIndex();
  render();
  if (state.wavelengthWinnerIndex !== null) {
    const winner = state.players[state.wavelengthWinnerIndex];
    toast(`${winner.name} vinder med ${getPlayerScore(winner)}/${getPlayerWinScore(winner)} point!`);
    return;
  }
  toast(`Tallet var ${target}.`);
}

function startNextWavelengthRound() {
  if (!state.started || !isWavelengthMode()) return;
  if (state.wavelengthWinnerIndex !== null) return;
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  state.wavelength = createWavelengthRound();
  render();
}

function ensureGameReady() {
  if (!state.started || !state.currentSong) throw new Error("Start spillet først.");
}

function openSetupPanel() {
  state.setupOpen = true;
  if (el.setupPanel) {
    el.setupPanel.classList.remove("collapsed");
    el.setupPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  renderAppStage();
}

function openWelcomePanel() {
  state.setupOpen = false;
  if (el.setupPanel) el.setupPanel.classList.add("collapsed");
  renderAppStage();
  if (el.welcomePanel) el.welcomePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAppStage() {
  const setupVisible = state.setupOpen;
  document.body.classList.toggle("stage-welcome", !state.started && !setupVisible);
  document.body.classList.toggle("stage-setup", setupVisible);
  document.body.classList.toggle("stage-game", state.started);
  if (el.welcomePanel) el.welcomePanel.classList.toggle("hidden", state.started || setupVisible);
  if (el.setupPanel) el.setupPanel.classList.toggle("collapsed", !setupVisible);
  const gameBoard = document.querySelector(".game-board");
  if (gameBoard) gameBoard.classList.toggle("hidden", !state.started);
  if (el.libraryPanel) el.libraryPanel.classList.toggle("hidden", state.started);
}

function renderWelcomeModes() {
  if (!el.welcomeModeGrid) return;
  const featuredModes = ["classic", "battleRoyale", "sharedTimeline", "pushLuck", "imposter", "wavelength"];
  el.welcomeModeGrid.innerHTML = featuredModes.map((key) => {
    const mode = gameModes[key];
    const active = el.gameMode?.value === key;
    return `
      <button class="welcome-mode-card${active ? " active" : ""}" data-welcome-mode="${key}" type="button">
        <strong>${escapeHtml(mode.title)}</strong>
        <span>${escapeHtml(mode.description)}</span>
      </button>
    `;
  }).join("");
}

function render() {
  renderAppStage();
  renderWelcomeModes();
  renderPlayers();
  renderTurnStatus();
  renderControls();
  renderGamemasterControls();
  renderWavelengthPanel();
  renderLibrary();
  if (el.songsLeft) el.songsLeft.textContent = isWavelengthMode() ? "0" : String(state.deck.length);
  saveGameSnapshot();
}

function renderPlayers() {
  if (isWavelengthMode()) {
    renderWavelengthPlayers();
    return;
  }
  if (isImposterMode()) {
    renderImposterPlayers();
    return;
  }

  el.playersGrid.innerHTML = "";
  state.players.forEach((player, index) => {
    const panel = document.createElement("section");
    const eliminated = isBattleRoyaleMode() && !isBattleRoyalePlayerAlive(player);
    const rushFinished = isPuzzleRushMode() && isPuzzleRushPlayerFinished(index);
    const sharedActive = isSharedTimelineMode() && state.started && isSharedTimelinePlayerActive(index);
    panel.className = `player-panel${state.started && !state.puzzleRushComplete && (state.currentPlayer === index || sharedActive) ? " active" : ""}${eliminated || rushFinished ? " eliminated" : ""}`;
    panel.innerHTML = `
      <div class="player-header">
        <div>
          <p class="eyebrow">${state.sharedTimelineWinnerIndex === index ? "Vinder" : state.battleRoyaleWinnerIndex === index ? "Vinder" : rushFinished ? "Run slut" : eliminated ? "Elimineret" : sharedActive && state.sharedTimelineSuddenDeathIndexes ? "Sudden death" : isPuzzleRushMode() && state.started && state.currentPlayer === index ? "Rush" : `Spiller ${index + 1}`}</p>
          <h2>${escapeHtml(player.name)}</h2>
          ${isBattleMode() ? `<p class="player-era">${escapeHtml(getGenerationEraLabel(player.generationEra))}</p>` : ""}
        </div>
        <div class="player-meta">
          ${state.hitsterCardsEnabled ? `<span class="hitster-count" title="Hitster-kort"><span class="card-stack" aria-hidden="true"></span><span>${getHitsterCardLabel(player)}</span></span>` : ""}
          ${isBattleRoyaleMode()
            ? `<span class="life-count" title="Liv">${getBattleRoyaleLives(player)} liv</span><strong>${getPlayerScore(player)} sange</strong>`
            : isSharedTimelineMode()
            ? `<strong>${getPlayerScore(player)}/${getPlayerWinScore(player)} point</strong>`
            : isPushLuckMode()
            ? `${state.started && state.currentPlayer === index && state.pushLuckTurnBank ? `<span class="life-count" title="Turbank">+${state.pushLuckTurnBank}</span>` : ""}<strong>${getPlayerScore(player)}/${getPlayerWinScore(player)} kort</strong>`
            : isPuzzleRushMode()
            ? `<strong>${getPlayerScore(player)} point</strong>`
            : `<strong>${getPlayerScore(player)}/${getPlayerWinScore(player)}</strong>`}
        </div>
      </div>
      <div class="timeline"></div>
    `;

    const timeline = panel.querySelector(".timeline");
    for (let slotIndex = 0; slotIndex <= player.timeline.length; slotIndex++) {
      if (isSharedTimelineMode()) {
        const round = state.sharedTimelineRound;
        const placement = round ? Number(round.placements[index]) : null;
        const result = getSharedTimelineResult(index);
        if (state.started && sharedActive && round?.phase === "placing") {
          timeline.append(createSlotButton(slotIndex, index));
        }
        if (state.started && sharedActive && round?.phase === "placing" && placement === slotIndex) {
          timeline.append(createSharedTimelinePendingCard(index));
        }
        if (result && !result.correct && result.placementIndex === slotIndex) {
          timeline.append(createSharedTimelinePendingCard(index));
        }
      } else if (state.started && !state.puzzleRushComplete && state.currentPlayer === index) {
        timeline.append(createSlotButton(slotIndex));
      }

      if (!isSharedTimelineMode() && state.started && !state.puzzleRushComplete && state.currentPlayer === index && state.pendingIndex === slotIndex) {
        timeline.append(createPendingCard());
      }

      if (!isSharedTimelineMode() && !isPuzzleRushMode() && state.started && state.currentPlayer === index) {
        const slotChallenges = state.challenges.filter((challenge) => challenge.placementIndex === slotIndex);
        for (const challenge of slotChallenges) {
          timeline.append(createChallengeCard(challenge));
        }
      }

      const song = player.timeline[slotIndex];
      if (song) {
        timeline.append(createSongCard(song));
      }
    }

    el.playersGrid.append(panel);
  });

  if (isSharedTimelineMode()) {
    el.currentPlayer.textContent = state.sharedTimelineWinnerIndex !== null
      ? `${state.players[state.sharedTimelineWinnerIndex].name} vinder`
      : state.started && state.sharedTimelineSuddenDeathIndexes?.length
      ? "Sudden death"
      : state.started
      ? "Alle placerer"
      : "Start spillet";
  } else {
    el.currentPlayer.textContent = state.pushLuckWinnerIndex !== null
      ? `${state.players[state.pushLuckWinnerIndex].name} vinder`
      : isPuzzleRushMode() && state.puzzleRushComplete
      ? "Rush færdig"
      : state.started && state.players[state.currentPlayer]
      ? state.players[state.currentPlayer].name
      : "Start spillet";
  }
}

function renderImposterPlayers() {
  el.playersGrid.innerHTML = "";
  state.players.forEach((player, index) => {
    const panel = document.createElement("section");
    const active = state.imposter?.activeIndex === index;
    const seen = hasSeenImposterRole(index);
    panel.className = `player-panel imposter-player${active ? " active" : ""}${seen ? " seen" : ""}`;
    panel.innerHTML = `
      <div class="player-header">
        <div>
          <p class="eyebrow">${active ? "Ser rolle" : seen ? "Klar" : `Spiller ${index + 1}`}</p>
          <h2>${escapeHtml(player.name)}</h2>
        </div>
        <div class="player-meta">
          <strong>${seen ? "Rolle set" : "Ikke set"}</strong>
        </div>
      </div>
      <div class="imposter-player-body">
        <p>${seen ? "Har været ved computeren." : "Venter på at se sin hemmelige rolle."}</p>
      </div>
    `;
    el.playersGrid.append(panel);
  });
  el.currentPlayer.textContent = state.started ? "Imposter" : "Start spillet";
}

function renderWavelengthPlayers() {
  el.playersGrid.innerHTML = "";
  state.players.forEach((player, index) => {
    const panel = document.createElement("section");
    panel.className = `player-panel${state.started && state.currentPlayer === index ? " active" : ""}`;
    panel.innerHTML = `
      <div class="player-header">
        <div>
          <p class="eyebrow">${state.started && state.currentPlayer === index ? "Gætter" : "DJ"}</p>
          <h2>${escapeHtml(player.name)}</h2>
        </div>
        <div class="player-meta">
          <strong>${getPlayerScore(player)}/${getPlayerWinScore(player)} point</strong>
        </div>
      </div>
      <div class="wavelength-score-note">${state.wavelengthWinnerIndex === index ? "Vinder af spillet." : state.started && state.currentPlayer === index ? "Final guess giver dine point." : "Din sang giver point, hvis gætteren rammer tæt på tallet."}</div>
    `;
    el.playersGrid.append(panel);
  });
  el.currentPlayer.textContent = state.started && state.players[state.currentPlayer] ? `${state.players[state.currentPlayer].name} gætter` : "Start spillet";
}

function renderTurnStatus() {
  if (isImposterMode()) {
    renderImposterTurnStatus();
    return;
  }
  if (isWavelengthMode()) {
    renderWavelengthTurnStatus();
    return;
  }

  if (isSharedTimelineMode()) {
    renderSharedTimelineTurnStatus();
    return;
  }

  if (isPushLuckMode()) {
    renderPushLuckTurnStatus();
    return;
  }

  if (isPuzzleRushMode()) {
    renderPuzzleRushTurnStatus();
    return;
  }

  if (isBattleRoyaleMode() && state.battleRoyaleWinnerIndex !== null) {
    const winner = state.players[state.battleRoyaleWinnerIndex];
    el.turnStatus.textContent = `${winner.name} vinder Battle Royale.`;
    return;
  }

  const song = state.currentSong;

  if (!song) {
    el.turnStatus.textContent = state.started ? "Sangpuljen er tom." : "Start spillet, og afspil en skjult sang.";
    return;
  }

  if (isBattleRoyaleMode() && state.started) {
    const lives = getBattleRoyaleLives(state.players[state.currentPlayer]);
    if (!state.revealed) {
      el.turnStatus.textContent = `${state.players[state.currentPlayer].name} har ${lives} liv. Forkert placering koster 1 liv.`;
      return;
    }
  }

  if (state.revealed) {
    const correct = isPlacementCorrect();
    const winningChallenge = getWinningChallenge();
    const challengeText = state.challenges.length
      ? ` - ${winningChallenge ? `${state.players[winningChallenge.challengerIndex].name}s udfordring vinder` : "ingen udfordringer vinder"}`
      : "";
    const contextText = isSoundtrackMode() && song.context ? ` - fra ${song.context}` : "";
    el.turnStatus.textContent = `${song.title} - ${song.artist}${contextText} - ${song.year} - ${correct ? "korrekt placering" : "forkert placering"}${challengeText}`;
  } else if (state.activeChallengeIndex !== null) {
    const challenge = state.challenges[state.activeChallengeIndex];
    const challenger = state.players[challenge.challengerIndex];
    el.turnStatus.textContent = challenge.placementIndex === null
      ? `${challenger.name} udfordrer. Tryk på et plus i tidslinjen.`
      : `${challenger.name}s udfordring er placeret. Klar til afsløring.`;
  } else if (state.challenges.length) {
    el.turnStatus.textContent = `${state.challenges.length} udfordring${state.challenges.length === 1 ? "" : "er"} placeret. Flere kan udfordre før afsløring.`;
  } else {
    el.turnStatus.textContent = state.pendingIndex === null ? "Tryk på et plus i tidslinjen." : "Placering valgt. Klar til afsløring.";
  }
}

function renderPuzzleRushTurnStatus() {
  if (!state.started) {
    el.turnStatus.textContent = "Start Puzzle Rush.";
    return;
  }

  if (state.puzzleRushComplete) {
    const leaders = getPuzzleRushLeaders();
    const names = leaders.map(({ player }) => player.name).join(", ");
    el.turnStatus.textContent = `${names} topper med ${leaders[0]?.score || 0} point.`;
    return;
  }

  const player = state.players[state.currentPlayer];
  const song = state.currentSong;
  if (!song) {
    el.turnStatus.textContent = "Sangpuljen er tom.";
    return;
  }

  if (state.revealed) {
    const correct = isPlacementCorrect();
    el.turnStatus.textContent = correct
      ? `${song.title} - ${song.artist} - ${song.year}. Korrekt: ${player.name} går videre til ${getPlayerScore(player) + 1} point.`
      : `${song.title} - ${song.artist} - ${song.year}. Forkert: ${player.name}s run slutter på ${getPlayerScore(player)} point.`;
    return;
  }

  el.turnStatus.textContent = `${player.name}s Puzzle Rush. Score: ${getPlayerScore(player)}. Første fejl stopper run'et.`;
}

function renderImposterTurnStatus() {
  if (!state.started || !state.imposter) {
    el.turnStatus.textContent = "Start Imposter.";
    return;
  }
  const active = state.imposter.activeIndex;
  if (Number.isInteger(active) && state.players[active]) {
    el.turnStatus.textContent = `${state.players[active].name} ser sin rolle. De andre kigger væk.`;
    return;
  }
  const seenCount = state.imposter.seenIndexes.length;
  el.turnStatus.textContent = seenCount >= state.players.length
    ? `Alle har set deres rolle. Diskuter hints og find ${getImposterCountLabel()}.`
    : `${seenCount}/${state.players.length} har set deres rolle. Næste spiller tager høretelefoner på og trykker sit navn.`;
}

function renderSharedTimelineTurnStatus() {
  if (state.sharedTimelineWinnerIndex !== null) {
    const winner = state.players[state.sharedTimelineWinnerIndex];
    el.turnStatus.textContent = `${winner.name} vinder Timeline Showdown.`;
    return;
  }

  if (!state.started || !state.currentSong || !state.sharedTimelineRound) {
    el.turnStatus.textContent = "Start Timeline Showdown.";
    return;
  }

  if (state.sharedTimelineRound.phase === "results") {
    const correct = state.sharedTimelineRound.results.filter((result) => result.correct).length;
    const suddenDeath = state.sharedTimelineSuddenDeathIndexes?.length
      ? ` Sudden death: ${state.sharedTimelineSuddenDeathIndexes.map((index) => state.players[index].name).join(", ")}.`
      : "";
    el.turnStatus.textContent = `${state.currentSong.title} - ${state.currentSong.artist} - ${state.currentSong.year}. ${correct} korrekte.${suddenDeath}`;
    return;
  }

  const missing = getSharedTimelineActiveIndexes().filter((index) => !Number.isInteger(state.sharedTimelineRound.placements[index]));
  el.turnStatus.textContent = missing.length
    ? `${missing.map((index) => state.players[index].name).join(", ")} mangler at placere sangen.`
    : "Alle har placeret. Klar til afsløring.";
}

function renderPushLuckTurnStatus() {
  if (state.pushLuckWinnerIndex !== null) {
    const winner = state.players[state.pushLuckWinnerIndex];
    el.turnStatus.textContent = `${winner.name} vinder Push Your Luck.`;
    return;
  }

  if (!state.started || !state.currentSong) {
    el.turnStatus.textContent = "Start Push Your Luck.";
    return;
  }

  const player = state.players[state.currentPlayer];
  if (state.revealed) {
    const correct = isPlacementCorrect();
    const nextBank = state.pushLuckTurnBank + getPushLuckNextBankPoints();
    if (state.pushLuckRiskCards) {
      el.turnStatus.textContent = correct
        ? `${state.currentSong.title} - ${state.currentSong.artist} - ${state.currentSong.year}. Korrekt: turen har nu ${nextBank} kort på spil. Stop og behold dem eller fortsæt.`
        : `${state.currentSong.title} - ${state.currentSong.artist} - ${state.currentSong.year}. Forkert: ${player.name} mister turens kort.`;
      return;
    }
    el.turnStatus.textContent = correct
      ? `${state.currentSong.title} - ${state.currentSong.artist} - ${state.currentSong.year}. Korrekt: turbanken bliver ${nextBank} kort. Stop eller fortsæt.`
      : `${state.currentSong.title} - ${state.currentSong.artist} - ${state.currentSong.year}. Forkert: ${player.name} mister turbanken.`;
    return;
  }

  if (state.pushLuckRiskCards) {
    el.turnStatus.textContent = `${player.name}s tur. Turen har ${state.pushLuckTurnBank} kort på spil. Hver korrekt sang giver 1 kort. Fejl fjerner turens kort.`;
    return;
  }

  el.turnStatus.textContent = `${player.name}s tur. Turbank: ${state.pushLuckTurnBank} kort. ${state.pushLuckTurnStreak ? "Fortsæt for +2, eller stop efter næste korrekte." : "Første korrekte sang giver 1 kort."}`;
}

function renderWavelengthTurnStatus() {
  if (!state.started || !state.wavelength) {
    el.turnStatus.textContent = "Start Wavelength DJ.";
    return;
  }
  if (state.wavelengthWinnerIndex !== null) {
    const winner = state.players[state.wavelengthWinnerIndex];
    el.turnStatus.textContent = `${winner.name} vinder med ${getPlayerScore(winner)}/${getPlayerWinScore(winner)} point.`;
    return;
  }
  const guesser = state.players[state.currentPlayer];
  const djCount = getWavelengthDjs().length;
  el.turnStatus.textContent = state.wavelength.phase === "results"
    ? `Runden er afgjort. ${guesser.name} var gætter.`
    : `${guesser.name} gætter. ${djCount} DJ'er finder hver en sang i Spotify.`;
}

function renderControls() {
  if (!state.started) {
    el.songActions.classList.remove("hidden");
    el.bonusActions.classList.remove("active");
    el.challengePanel.classList.remove("active");
    el.gamemasterToggle.classList.add("hidden");
    el.gamemasterPanel.classList.remove("active");
    return;
  }

  if (isImposterMode()) {
    renderImposterControls();
    return;
  }
  if (isWavelengthMode()) {
    renderWavelengthControls();
    return;
  }

  const hasSong = state.started && Boolean(state.currentSong);
  el.songActions.classList.remove("hidden");
  if (isPushLuckMode()) {
    renderPushLuckControls(hasSong);
    return;
  }
  if (isPuzzleRushMode()) {
    renderPuzzleRushControls(hasSong);
    return;
  }
  if (isSharedTimelineMode()) {
    renderSharedTimelineControls(hasSong);
    return;
  }
  const showGamemaster = state.started && state.gamemasterEnabled;
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.gamemasterToggle.setAttribute("aria-pressed", showGamemaster && state.gamemasterOpen ? "true" : "false");
  el.gamemasterPanel.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.playTrack.disabled = !hasSong;
  el.resumeTrack.disabled = !hasSong;
  el.revealTrack.disabled = !hasSong || state.pendingIndex === null || state.revealed || state.activeChallengeIndex !== null;
  setActionLabel(el.keepCard, "Behold");
  el.keepCard.title = "Korrekt - behold";
  el.keepCard.setAttribute("aria-label", "Korrekt - behold");
  setActionLabel(el.discardCard, "Kassér");
  el.discardCard.title = "Forkert - kassér";
  el.discardCard.setAttribute("aria-label", "Forkert - kassér");
  el.keepCard.disabled = true;
  el.discardCard.disabled = true;

  if (state.revealed) {
    const winningChallenge = getWinningChallenge();
    if (winningChallenge) {
      setActionLabel(el.discardCard, `${state.players[winningChallenge.challengerIndex].name} vinder`);
      el.discardCard.title = `${state.players[winningChallenge.challengerIndex].name} vinder sangen`;
      el.discardCard.setAttribute("aria-label", `${state.players[winningChallenge.challengerIndex].name} vinder sangen`);
      el.discardCard.disabled = false;
    } else if (isPlacementCorrect()) {
      el.keepCard.disabled = false;
    } else {
      el.discardCard.disabled = false;
    }
  }

  const soundtrackBonus = isSoundtrackMode();
  el.bonusActions.classList.toggle("active", state.hitsterCardsEnabled && state.revealed);
  el.bonusActions.classList.toggle("soundtrack-bonus", soundtrackBonus);
  el.titleCorrect.textContent = soundtrackBonus ? "Film/serie rigtig" : "Titel rigtig";
  el.titleCorrect.title = soundtrackBonus ? "Giv Hitster-kort for korrekt film eller serie" : "Giv Hitster-kort for korrekt titel";
  el.artistCorrect.textContent = "Kunstner rigtig";
  el.artistCorrect.classList.toggle("hidden", soundtrackBonus);
  el.titleCorrect.classList.toggle("active", state.titleCorrect);
  el.artistCorrect.classList.toggle("active", !soundtrackBonus && state.artistCorrect);
  renderChallengeControls(hasSong);
}

function renderPuzzleRushControls(hasSong) {
  const showGamemaster = state.started && state.gamemasterEnabled;
  const revealedCorrect = state.revealed && isPlacementCorrect();
  const revealedWrong = state.revealed && !isPlacementCorrect();
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.gamemasterToggle.setAttribute("aria-pressed", showGamemaster && state.gamemasterOpen ? "true" : "false");
  el.gamemasterPanel.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.playTrack.disabled = !hasSong || state.puzzleRushComplete;
  el.resumeTrack.disabled = !hasSong || state.puzzleRushComplete;
  el.revealTrack.disabled = !hasSong || state.pendingIndex === null || state.revealed || state.puzzleRushComplete;
  setActionLabel(el.keepCard, revealedCorrect ? "Næste sang" : "Næste");
  el.keepCard.title = "Korrekt - fortsæt rush";
  el.keepCard.setAttribute("aria-label", "Korrekt - fortsæt rush");
  setActionLabel(el.discardCard, revealedWrong ? "Afslut run" : "Fejl");
  el.discardCard.title = "Forkert - afslut run";
  el.discardCard.setAttribute("aria-label", "Forkert - afslut run");
  el.keepCard.disabled = !revealedCorrect || state.puzzleRushComplete;
  el.discardCard.disabled = !revealedWrong || state.puzzleRushComplete;
  el.bonusActions.classList.remove("active");
  el.challengePanel.classList.remove("active");
}

function renderImposterControls() {
  const showGamemaster = false;
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.remove("active");
  el.gamemasterToggle.setAttribute("aria-pressed", "false");
  el.gamemasterPanel.classList.remove("active");
  el.songActions.classList.add("hidden");
  el.bonusActions.classList.remove("active");
  el.challengePanel.classList.remove("active");
  if (el.libraryPanel) el.libraryPanel.classList.add("hidden");
}

function renderPushLuckControls(hasSong) {
  const showGamemaster = state.started && state.gamemasterEnabled;
  const revealedCorrect = state.revealed && isPlacementCorrect();
  const revealedWrong = state.revealed && !isPlacementCorrect();
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.gamemasterToggle.setAttribute("aria-pressed", showGamemaster && state.gamemasterOpen ? "true" : "false");
  el.gamemasterPanel.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.playTrack.disabled = !hasSong;
  el.resumeTrack.disabled = !hasSong;
  el.revealTrack.disabled = !hasSong || state.pendingIndex === null || state.revealed;
  const nextBank = state.pushLuckTurnBank + getPushLuckNextBankPoints();
  const stopLabel = state.pushLuckRiskCards ? `Stop og behold ${nextBank}` : `Stop og bank ${nextBank}`;
  setActionLabel(el.keepCard, "Fortsæt");
  el.keepCard.title = state.pushLuckRiskCards ? "Fortsæt og risikér turens kort" : "Fortsæt og risikér turbanken";
  el.keepCard.setAttribute("aria-label", el.keepCard.title);
  setActionLabel(el.discardCard, revealedWrong ? "Næste spiller" : (revealedCorrect ? stopLabel : "Stop"));
  el.discardCard.title = revealedWrong
    ? (state.pushLuckRiskCards ? "Mistet turens kort - næste spiller" : "Mistet turbank - næste spiller")
    : (state.pushLuckRiskCards ? "Stop og behold turens kort" : "Stop og bank turens kort");
  el.discardCard.setAttribute("aria-label", el.discardCard.title);
  el.keepCard.disabled = !revealedCorrect;
  el.discardCard.disabled = !state.revealed;
  el.bonusActions.classList.remove("active");
  el.challengePanel.classList.remove("active");
}

function renderSharedTimelineControls(hasSong) {
  const showGamemaster = state.started && state.gamemasterEnabled;
  const round = state.sharedTimelineRound;
  const missing = round ? getSharedTimelineActiveIndexes().some((index) => !Number.isInteger(round.placements[index])) : true;
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.gamemasterToggle.setAttribute("aria-pressed", showGamemaster && state.gamemasterOpen ? "true" : "false");
  el.gamemasterPanel.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.playTrack.disabled = !hasSong;
  el.resumeTrack.disabled = !hasSong;
  el.revealTrack.disabled = !hasSong || !round || round.phase === "results" || missing;
  setActionLabel(el.keepCard, "Næste sang");
  el.keepCard.title = "Næste sang";
  el.keepCard.setAttribute("aria-label", "Næste sang");
  setActionLabel(el.discardCard, "Afventer");
  el.discardCard.title = "Afventer";
  el.discardCard.setAttribute("aria-label", "Afventer");
  el.keepCard.disabled = !hasSong || !round || round.phase !== "results" || state.sharedTimelineWinnerIndex !== null;
  el.discardCard.disabled = true;
  el.bonusActions.classList.remove("active");
  el.challengePanel.classList.remove("active");
}

function renderWavelengthControls() {
  const showGamemaster = state.started && state.gamemasterEnabled;
  el.gamemasterToggle.classList.toggle("hidden", !showGamemaster);
  el.gamemasterToggle.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.gamemasterToggle.setAttribute("aria-pressed", showGamemaster && state.gamemasterOpen ? "true" : "false");
  el.gamemasterPanel.classList.toggle("active", showGamemaster && state.gamemasterOpen);
  el.songActions.classList.add("hidden");
  el.bonusActions.classList.remove("active");
  el.challengePanel.classList.remove("active");
  el.libraryPanel.classList.add("hidden");
}

function renderWavelengthPanel() {
  if (!el.wavelengthPanel) return;
  if (state.started && isImposterMode() && state.imposter) {
    renderImposterPanel();
    return;
  }
  if (!state.started || !isWavelengthMode() || !state.wavelength) {
    el.wavelengthPanel.classList.remove("active");
    el.wavelengthPanel.innerHTML = "";
    if (el.songActions) el.songActions.classList.remove("hidden");
    return;
  }

  const round = state.wavelength;
  const guesser = state.players[state.currentPlayer];
  const djs = getWavelengthDjs();
  const targetText = round.showTarget ? String(round.target) : "?";
  const disabled = round.phase === "results" ? " disabled" : "";
  const finalRange = getWavelengthFinalRange();
  const finalGuess = clampWavelengthFinalGuess(round.finalGuess);
  const categoryTitle = round.category || "Find selv på en kategori";
  const categoryInput = state.wavelengthUseCategories || round.phase === "results"
    ? ""
    : `
        <label class="manual-category-field">
          <span>Kategori for runden</span>
          <input id="wavelength-manual-category" value="${escapeHtml(round.category || "")}" placeholder="Skriv jeres egen kategori" />
        </label>
      `;
  round.finalGuess = finalGuess;

  el.wavelengthPanel.classList.add("active");
  el.wavelengthPanel.innerHTML = `
    <div class="wavelength-top">
      <div>
        <p class="eyebrow">Kategori</p>
        <h2>${escapeHtml(categoryTitle)}</h2>
        <p>1 = slet ikke. 10 = perfekt. Først til ${getPlayerWinScore(guesser)} point vinder.</p>
        ${categoryInput}
      </div>
      <div class="target-box${round.showTarget ? " visible" : ""}">
        <span>Hemmeligt tal</span>
        <strong>${escapeHtml(targetText)}</strong>
        <button id="wavelength-toggle-target" class="ghost" type="button">${round.showTarget ? "Skjul" : "Vis til DJ'er"}</button>
      </div>
    </div>

    <div class="wavelength-rules">
      <strong>${escapeHtml(guesser.name)}</strong> er gætter. DJ'erne finder selv sange i Spotify, og gætteren sætter en slider efter hver sang.
    </div>

    <div class="wavelength-sliders">
      ${djs.map(({ player, index }) => {
        const value = clampWavelengthValue(round.guesses[index] || 5);
        const award = round.awards.find((item) => item.playerIndex === index);
        return `
          <label class="wavelength-slider-row" data-wavelength-dj="${index}">
            <span>
              <strong>${escapeHtml(player.name)}s sang</strong>
              <small>${award ? `${award.points} point · ${award.distance} fra` : "Gætterens vurdering efter sangen"}</small>
            </span>
            <input data-wavelength-guess="${index}" type="range" min="1" max="10" step="1" value="${value}"${disabled} />
            <output>${value}</output>
          </label>
        `;
      }).join("")}
    </div>

    <div class="wavelength-final">
      <label class="wavelength-slider-row">
        <span>
          <strong>Final guess fra ${escapeHtml(guesser.name)}</strong>
          <small>${round.phase === "results" ? getWavelengthFinalText() : `Skal ligge mellem ${finalRange.min} og ${finalRange.max}`}</small>
        </span>
        <input id="wavelength-final-guess" type="range" min="${finalRange.min}" max="${finalRange.max}" step="1" value="${finalGuess}"${disabled} />
        <output>${finalGuess}</output>
      </label>
      <div class="button-row">
        ${state.wavelengthWinnerIndex !== null
          ? `<button type="button" disabled>Spillet er slut</button>`
          : round.phase === "results"
          ? `<button id="wavelength-next-round" type="button">Næste runde</button>`
          : `<button id="wavelength-finish-round" type="button">Afslut runde</button>`}
      </div>
    </div>
  `;
}

function renderImposterPanel() {
  const round = state.imposter;
  const activeIndex = round.activeIndex;
  const activePlayer = Number.isInteger(activeIndex) ? state.players[activeIndex] : null;
  const activeIsImposter = Number.isInteger(activeIndex) && isImposterPlayer(activeIndex);
  const allSeen = round.seenIndexes.length >= state.players.length;
  const song = round.song;

  el.wavelengthPanel.classList.add("active");
  if (activePlayer) {
    el.wavelengthPanel.innerHTML = `
      <div class="imposter-reveal-card ${activeIsImposter ? "is-imposter" : "is-crewmate"}">
        <p class="eyebrow">${escapeHtml(activePlayer.name)}</p>
        <h2>${activeIsImposter ? "Du er Imposter" : "Du er Crewmate"}</h2>
        ${activeIsImposter
          ? `<p>Du får ikke sangen. Lyt ikke, kig roligt ud som om du ved alt, og gør dig klar til at bluffe.</p>`
          : `
            <p>Den hemmelige sang er:</p>
            <div class="imposter-song-card">
              <strong>${escapeHtml(song.title)}</strong>
              <span>${escapeHtml(song.artist)}${song.year ? ` · ${song.year}` : ""}</span>
            </div>
            <button id="imposter-play-again" type="button">Afspil for ${escapeHtml(activePlayer.name)}</button>
          `}
        <button id="imposter-hide-role" class="dark" type="button">Skjul igen</button>
      </div>
    `;
    return;
  }

  el.wavelengthPanel.innerHTML = `
    <div class="wavelength-top imposter-top">
      <div>
        <p class="eyebrow">Privat rolle</p>
        <h2>Tag høretelefoner på og tryk dit navn</h2>
        <p>${allSeen ? "Alle har set deres rolle. Nu kan I give hints, stille spørgsmål og stemme." : "Send spillerne op én ad gangen. Crewmates får sangen at vide og får den afspillet. Impostere får kun deres rolle."}</p>
      </div>
      <div class="target-box${allSeen ? " visible" : ""}">
        <span>Status</span>
        <strong>${round.seenIndexes.length}/${state.players.length}</strong>
        <small>${escapeHtml(getImposterCountLabel())}</small>
      </div>
    </div>

    <div class="imposter-name-grid">
      ${state.players.map((player, index) => `
        <button data-imposter-player="${index}" class="${hasSeenImposterRole(index) ? "ghost" : ""}" type="button">
          <strong>${escapeHtml(player.name)}</strong>
          <span>${hasSeenImposterRole(index) ? "Rolle set" : "Se rolle"}</span>
        </button>
      `).join("")}
    </div>

    <div class="imposter-solution">
      ${round.solutionRevealed
        ? `
          <div class="imposter-song-card">
            <span>Hemmelig sang</span>
            <strong>${escapeHtml(song.title)}</strong>
            <span>${escapeHtml(song.artist)}${song.year ? ` · ${song.year}` : ""}</span>
          </div>
          <div class="imposter-song-card">
            <span>Impostere</span>
            <strong>${round.imposterIndexes.map((index) => escapeHtml(state.players[index]?.name || `Spiller ${index + 1}`)).join(", ")}</strong>
          </div>
        `
        : `<button id="imposter-reveal-solution" class="danger" type="button"${allSeen ? "" : " disabled"}>Afslør facit</button>`}
    </div>
  `;
}

function getWavelengthFinalText() {
  const finalAward = state.wavelength?.awards.find((item) => item.role === "guesser");
  return finalAward ? `${finalAward.points} point · ${finalAward.distance} fra det rigtige tal` : "";
}

function renderGamemasterControls() {
  if (!el.gamemasterGrid) return;
  if (isWavelengthMode()) {
    renderWavelengthGamemasterControls();
    return;
  }
  if (isBattleRoyaleMode()) {
    renderBattleRoyaleGamemasterControls();
    return;
  }
  if (isSharedTimelineMode()) {
    renderSharedTimelineGamemasterControls();
    return;
  }
  if (isPushLuckMode()) {
    renderPushLuckGamemasterControls();
    return;
  }
  if (isPuzzleRushMode()) {
    renderPuzzleRushGamemasterControls();
    return;
  }
  el.gamemasterGrid.innerHTML = state.players.map((player, index) => `
    <article class="gamemaster-row" data-gm-player="${index}">
      <div>
        <h3>${escapeHtml(player.name)}</h3>
        <p>${getPlayerScore(player)}/${getPlayerWinScore(player)} kort${state.hitsterCardsEnabled ? ` · ${getHitsterCardLabel(player)} Hitster-kort` : ""}</p>
      </div>
      <label>
        <span>Score +/-</span>
        <input data-gm-setting="scoreOffset" type="number" min="-50" max="50" value="${clampScoreOffset(player.scoreOffset)}" />
      </label>
      <label>
        <span>Hitster-kort</span>
        <input data-gm-setting="hitsterCards" type="number" min="0" max="99" value="${clampHitsterCards(player.hitsterCards)}"${player.infiniteHitsterCards || !state.hitsterCardsEnabled ? " disabled" : ""} />
      </label>
      <label>
        <span>Kort for sejr</span>
        <input data-gm-setting="winScore" type="number" min="1" max="50" value="${getPlayerWinScore(player)}" />
      </label>
    </article>
  `).join("");
}

function renderPuzzleRushGamemasterControls() {
  el.gamemasterGrid.innerHTML = state.players.map((player, index) => `
    <article class="gamemaster-row shared-timeline-gamemaster-player" data-gm-player="${index}">
      <div>
        <h3>${escapeHtml(player.name)}</h3>
        <p>${isPuzzleRushPlayerFinished(index) ? "Run slut" : index === state.currentPlayer && !state.puzzleRushComplete ? "Aktiv" : "Venter"} · ${getPlayerScore(player)} point</p>
      </div>
      <label>
        <span>Point</span>
        <input data-puzzle-gm-setting="score" type="number" min="0" max="999" value="${getPlayerScore(player)}" />
      </label>
    </article>
  `).join("");
}

function handlePuzzleRushGamemasterInput(input) {
  const setting = input.dataset.puzzleGmSetting;
  if (!setting) return;
  const row = input.closest("[data-gm-player]");
  const player = row ? state.players[Number(row.dataset.gmPlayer)] : null;
  if (!player) return;
  if (setting === "score") {
    player.puzzleRushScore = Math.max(0, Math.min(999, Math.round(Number(input.value) || 0)));
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
  }
}

function renderBattleRoyaleGamemasterControls() {
  el.gamemasterGrid.innerHTML = state.players.map((player, index) => `
    <article class="gamemaster-row battle-royale-gamemaster-player" data-gm-player="${index}">
      <div>
        <h3>${escapeHtml(player.name)}</h3>
        <p>${isBattleRoyalePlayerAlive(player) ? `${getBattleRoyaleLives(player)} liv` : "Elimineret"} · ${getPlayerScore(player)} sange</p>
      </div>
      <label>
        <span>Liv</span>
        <input data-gm-setting="battleRoyaleLives" type="number" min="0" max="99" value="${getBattleRoyaleLives(player)}" />
      </label>
      <label>
        <span>Score +/-</span>
        <input data-gm-setting="scoreOffset" type="number" min="-50" max="50" value="${clampScoreOffset(player.scoreOffset)}" />
      </label>
    </article>
  `).join("");
}

function renderSharedTimelineGamemasterControls() {
  el.gamemasterGrid.innerHTML = `
    <article class="gamemaster-row push-luck-gamemaster-round">
      <div>
        <h3>Spil</h3>
        <p>${state.sharedTimelineSuddenDeathIndexes?.length ? "Sudden death er aktiv" : "Ret pointmål"}</p>
      </div>
      <label>
        <span>Pointmål</span>
        <input data-shared-gm-setting="winScore" type="number" min="1" max="999" value="${getPlayerWinScore(state.players[0] || {})}" />
      </label>
    </article>
    ${state.players.map((player, index) => `
      <article class="gamemaster-row shared-timeline-gamemaster-player" data-gm-player="${index}">
        <div>
          <h3>${escapeHtml(player.name)}</h3>
          <p>${getPlayerScore(player)}/${getPlayerWinScore(player)} point</p>
        </div>
        <label>
          <span>Point</span>
          <input data-shared-gm-setting="score" type="number" min="0" max="999" value="${getPlayerScore(player)}" />
        </label>
      </article>
    `).join("")}
  `;
}

function renderPushLuckGamemasterControls() {
  const turnLabel = state.pushLuckRiskCards ? "på spil" : "i banken";
  el.gamemasterGrid.innerHTML = `
    <article class="gamemaster-row shared-timeline-gamemaster-round">
      <div>
        <h3>Tur</h3>
        <p>${state.started ? `${state.players[state.currentPlayer]?.name || "Spiller"} har ${state.pushLuckTurnBank} ${turnLabel}` : "Ret pointmål"}</p>
      </div>
      <label>
        <span>Kortmål</span>
        <input data-push-gm-setting="winScore" type="number" min="1" max="999" value="${getPlayerWinScore(state.players[0] || {})}" />
      </label>
      <label>
        <span>Turbank</span>
        <input data-push-gm-setting="turnBank" type="number" min="0" max="999" value="${state.pushLuckTurnBank}" />
      </label>
    </article>
    ${state.players.map((player, index) => `
      <article class="gamemaster-row shared-timeline-gamemaster-player" data-gm-player="${index}">
        <div>
          <h3>${escapeHtml(player.name)}</h3>
          <p>${getPlayerScore(player)}/${getPlayerWinScore(player)} kort</p>
        </div>
        <label>
          <span>Kort</span>
          <input data-push-gm-setting="score" type="number" min="0" max="999" value="${getPlayerScore(player)}" />
        </label>
      </article>
    `).join("")}
  `;
}

function renderWavelengthGamemasterControls() {
  const round = state.wavelength;
  const target = round ? clampWavelengthValue(round.target) : 1;
  el.gamemasterGrid.innerHTML = `
    <article class="gamemaster-row wavelength-gamemaster-round">
      <div>
        <h3>Runde</h3>
        <p>Ret det hemmelige tal eller kategorien.</p>
      </div>
      <label>
        <span>Hemmeligt tal</span>
        <input data-wavelength-gm-setting="target" type="number" min="1" max="10" value="${target}" />
      </label>
      <label>
        <span>Pointmål</span>
        <input data-wavelength-gm-setting="winScore" type="number" min="1" max="999" value="${getPlayerWinScore(state.players[0] || {})}" />
      </label>
      <label class="gm-wide">
        <span>Kategori</span>
        <input data-wavelength-gm-setting="category" value="${escapeHtml(round?.category || "")}" />
      </label>
    </article>
    ${state.players.map((player, index) => `
      <article class="gamemaster-row wavelength-gamemaster-player" data-gm-player="${index}">
        <div>
          <h3>${escapeHtml(player.name)}</h3>
          <p>${index === state.currentPlayer ? "Gætter" : "DJ"} · ${getPlayerScore(player)} point</p>
        </div>
        <label>
          <span>Point</span>
          <input data-wavelength-gm-setting="score" type="number" min="0" max="999" value="${getPlayerScore(player)}" />
        </label>
        <button data-wavelength-gm-guesser="${index}" class="ghost" type="button"${index === state.currentPlayer ? " disabled" : ""}>Gør til gætter</button>
      </article>
    `).join("")}
  `;
}

function handleWavelengthGamemasterInput(input) {
  const setting = input.dataset.wavelengthGmSetting;
  if (!setting) return;

  if (setting === "target" && state.wavelength) {
    state.wavelength.target = clampWavelengthValue(input.value);
    renderWavelengthPanel();
    saveGameSnapshot();
    return;
  }

  if (setting === "category" && state.wavelength) {
    state.wavelength.category = input.value.trim();
    saveGameSnapshot();
    return;
  }

  if (setting === "winScore") {
    state.wavelengthWinScore = clampWavelengthWinScore(input.value);
    state.wavelengthWinnerIndex = getWavelengthWinnerIndex();
    renderPlayers();
    renderTurnStatus();
    renderWavelengthPanel();
    saveGameSnapshot();
    return;
  }

  if (setting === "score") {
    const row = input.closest("[data-gm-player]");
    const player = row ? state.players[Number(row.dataset.gmPlayer)] : null;
    if (!player) return;
    player.wavelengthScore = Math.max(0, Math.min(999, Math.round(Number(input.value) || 0)));
    state.wavelengthWinnerIndex = getWavelengthWinnerIndex();
    renderPlayers();
    renderTurnStatus();
    renderWavelengthPanel();
    saveGameSnapshot();
  }
}

function handleSharedTimelineGamemasterInput(input) {
  const setting = input.dataset.sharedGmSetting;
  if (!setting) return;

  if (setting === "winScore") {
    state.sharedTimelineWinScore = clampSharedTimelineWinScore(input.value);
    state.sharedTimelineWinnerIndex = getSharedTimelineWinnerIndex();
    updateSharedTimelineSuddenDeath();
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
    return;
  }

  if (setting === "score") {
    const row = input.closest("[data-gm-player]");
    const player = row ? state.players[Number(row.dataset.gmPlayer)] : null;
    if (!player) return;
    player.sharedTimelineScore = Math.max(0, Math.min(999, Math.round(Number(input.value) || 0)));
    state.sharedTimelineWinnerIndex = getSharedTimelineWinnerIndex();
    updateSharedTimelineSuddenDeath();
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
  }
}

function handlePushLuckGamemasterInput(input) {
  const setting = input.dataset.pushGmSetting;
  if (!setting) return;

  if (setting === "winScore") {
    state.pushLuckWinScore = clampPushLuckWinScore(input.value);
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
    return;
  }

  if (setting === "turnBank") {
    state.pushLuckTurnBank = Math.max(0, Math.min(999, Math.round(Number(input.value) || 0)));
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
    return;
  }

  if (setting === "score") {
    const row = input.closest("[data-gm-player]");
    const player = row ? state.players[Number(row.dataset.gmPlayer)] : null;
    if (!player) return;
    const nextScore = Math.max(0, Math.min(999, Math.round(Number(input.value) || 0)));
    if (state.pushLuckRiskCards) {
      const timelineScore = Array.isArray(player.timeline) ? player.timeline.length : 0;
      player.scoreOffset = clampScoreOffset(nextScore - timelineScore);
    } else {
      player.pushLuckScore = nextScore;
    }
    renderPlayers();
    renderTurnStatus();
    saveGameSnapshot();
  }
}

function setActionLabel(button, label) {
  const labelElement = button.querySelector(".action-label");
  if (labelElement) {
    labelElement.textContent = label;
    return;
  }
  button.textContent = label;
}

function isPlacementCorrect() {
  if (!state.currentSong || state.pendingIndex === null) return false;
  return isSlotChronologicallyCorrect(state.pendingIndex);
}

function isChallengeCorrect(challenge) {
  if (!challenge || !state.currentSong || challenge.placementIndex === null) return false;
  return isSlotChronologicallyCorrect(challenge.placementIndex);
}

function isSlotChronologicallyCorrect(index) {
  return isSlotChronologicallyCorrectForTimeline(state.players[state.currentPlayer].timeline, index);
}

function isSlotChronologicallyCorrectForTimeline(timeline, index) {
  const before = timeline[index - 1];
  const after = timeline[index];
  const afterPrevious = !before || before.year <= state.currentSong.year;
  const beforeNext = !after || state.currentSong.year <= after.year;
  return afterPrevious && beforeNext;
}

function getWinningChallenge() {
  if (isPlacementCorrect()) return null;
  return state.challenges.find((challenge) => isChallengeCorrect(challenge)) || null;
}

function isChallengeWinner(challenge) {
  return getWinningChallenge() === challenge;
}

function renderChallengeControls(hasSong) {
  el.challengePanel.classList.toggle("active", state.hitsterCardsEnabled && hasSong && !state.revealed);
  if (!state.hitsterCardsEnabled) return;

  const selectedValue = el.challengerSelect.value;
  el.challengerSelect.innerHTML = "";
  state.players.forEach((player, index) => {
    if (index === state.currentPlayer || !hasHitsterCards(player)) return;
    if (isBattleRoyaleMode() && !isBattleRoyalePlayerAlive(player)) return;
    if (state.challenges.some((challenge) => challenge.challengerIndex === index)) return;
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${player.name} (${getHitsterCardLabel(player)})`;
    el.challengerSelect.append(option);
  });

  if ([...el.challengerSelect.options].some((option) => option.value === selectedValue)) {
    el.challengerSelect.value = selectedValue;
  }

  const activeChallenge = state.activeChallengeIndex !== null ? state.challenges[state.activeChallengeIndex] : null;
  const challenger = activeChallenge ? state.players[activeChallenge.challengerIndex] : null;
  if (!hasSong) {
    el.challengeStatus.textContent = "Start spillet for at bruge Hitster-kort.";
  } else if (activeChallenge) {
    el.challengeStatus.textContent = activeChallenge.placementIndex === null
      ? `${challenger.name} udfordrer. Vælg et plus.`
      : `${challenger.name}s Hitster-kort er placeret.`;
  } else if (state.pendingIndex === null) {
    el.challengeStatus.textContent = "Den aktive spiller skal placere sangen først.";
  } else if (!el.challengerSelect.options.length) {
    el.challengeStatus.textContent = state.challenges.length
      ? "Alle mulige udfordringer er placeret."
      : "Ingen andre spillere har Hitster-kort.";
  } else {
    el.challengeStatus.textContent = state.challenges.length
      ? `${state.challenges.length} udfordring${state.challenges.length === 1 ? "" : "er"} placeret. Flere kan udfordre.`
      : "En anden spiller kan udfordre før afsløring.";
  }

  el.startChallenge.disabled = !hasSong || state.revealed || state.pendingIndex === null || state.activeChallengeIndex !== null || !el.challengerSelect.options.length;
  el.cancelChallenge.disabled = state.activeChallengeIndex === null;
}

function createSongCard(song) {
  const card = document.createElement("article");
  card.className = "song-card";
  const contextLine = song.context ? `<div class="song-context">Fra: ${escapeHtml(song.context)}</div>` : "";
  card.innerHTML = `
    <div class="song-year">${escapeHtml(String(song.year))}</div>
    <div>
      <div class="song-title">${escapeHtml(song.title)}</div>
      <div class="song-artist">${escapeHtml(song.artist)}</div>
      ${contextLine}
    </div>
  `;
  return card;
}

function createPendingCard() {
  const card = document.createElement("article");
  const correct = state.revealed && isPlacementCorrect();
  card.className = `song-card pending${state.revealed ? (correct ? " correct" : " wrong") : ""}`;
  const title = state.revealed ? state.currentSong.title : "???";
  const artist = state.revealed ? state.currentSong.artist : "Skjult sang";
  const year = state.revealed ? String(state.currentSong.year) : "?";
  const contextLine = state.revealed && state.currentSong.context ? `<div class="song-context">Fra: ${escapeHtml(state.currentSong.context)}</div>` : "";
  card.innerHTML = `
    <div class="song-year">${escapeHtml(year)}</div>
    <div>
      <div class="song-title">${escapeHtml(title)}</div>
      <div class="song-artist">${escapeHtml(artist)}</div>
      ${contextLine}
    </div>
  `;
  return card;
}

function createSharedTimelinePendingCard(playerIndex) {
  const result = getSharedTimelineResult(playerIndex);
  const revealed = Boolean(result);
  const correct = Boolean(result?.correct);
  const card = document.createElement("article");
  card.className = `song-card pending shared-pending${revealed ? (correct ? " correct" : " wrong") : ""}`;
  const title = revealed ? state.currentSong.title : "???";
  const artist = revealed ? state.currentSong.artist : "Skjult sang";
  const year = revealed ? String(state.currentSong.year) : "?";
  const resultLine = revealed ? `<div class="song-context">${correct ? "Korrekt placering" : "Forkert placering"}</div>` : "";
  card.innerHTML = `
    <div class="song-year">${escapeHtml(year)}</div>
    <div>
      <div class="song-title">${escapeHtml(title)}</div>
      <div class="song-artist">${escapeHtml(artist)}</div>
      ${resultLine}
    </div>
  `;
  return card;
}

function createChallengeCard(challenge) {
  const card = document.createElement("article");
  const correct = state.revealed && isChallengeWinner(challenge);
  const challenger = state.players[challenge.challengerIndex];
  card.className = `song-card challenge${state.revealed ? (correct ? " correct" : " wrong") : ""}`;
  const title = state.revealed ? state.currentSong.title : "Hitster-kort";
  const artist = state.revealed ? `${challenger.name} udfordrede` : challenger.name;
  const year = state.revealed ? String(state.currentSong.year) : "!";
  const contextLine = state.revealed && state.currentSong.context ? `<div class="song-context">Fra: ${escapeHtml(state.currentSong.context)}</div>` : "";
  card.innerHTML = `
    <div class="song-year">${escapeHtml(year)}</div>
    <div>
      <div class="song-title">${escapeHtml(title)}</div>
      <div class="song-artist">${escapeHtml(artist)}</div>
      ${contextLine}
    </div>
  `;
  return card;
}

function createSlotButton(index, playerIndex = state.currentPlayer) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "slot-button";
  if (isSharedTimelineMode()) {
    const placement = state.sharedTimelineRound?.placements[playerIndex];
    button.disabled = state.sharedTimelineRound?.phase === "results";
    button.classList.toggle("selected", placement === index);
  } else {
    button.disabled = state.revealed || (state.challenges.length > 0 && state.activeChallengeIndex === null);
  }
  if (!isSharedTimelineMode() && state.activeChallengeIndex !== null) {
    const activeChallenge = state.challenges[state.activeChallengeIndex];
    button.classList.add("challenge-slot");
    button.classList.toggle("selected", activeChallenge?.placementIndex === index);
  } else if (!isSharedTimelineMode()) {
    button.classList.toggle("selected", state.pendingIndex === index);
  }
  button.title = "Placer her";
  button.setAttribute("aria-label", "Placer sangen her");
  button.addEventListener("click", () => {
    if (isSharedTimelineMode()) {
      chooseSharedTimelinePlacement(playerIndex, index);
      return;
    }
    choosePlacement(index);
  });
  return button;
}

function placementLabel(timeline, index) {
  if (!timeline.length) return "Placér som første";
  if (index === 0) return `Før ${timeline[0].year}`;
  if (index === timeline.length) return `Efter ${timeline[timeline.length - 1].year}`;
  return `${timeline[index - 1].year} - ${timeline[index].year}`;
}

function loadSongLibrary() {
  localStorage.removeItem("hitster_songs");
  return getBuiltInSongLibrary();
}

async function buildGameDeck() {
  const mode = getSelectedGameMode();
  let songs = [];

  if (mode.source === "spotify") {
    songs = await loadSpotifyPlaylistSongs(mode.playlistId, mode.title, mode.minSongs);
  } else if (mode.source === "spotifyPage") {
    songs = await loadSpotifyPagePlaylistSongs(mode.playlistId, mode.title, mode.minSongs);
  } else if (mode.source === "bopster") {
    songs = await loadBopsterPlaylistSongs(mode.playlistIds || mode.playlistId, mode.title, mode.minSongs);
  } else if (mode.source === "static") {
    songs = loadStaticGameModeSongs(mode.libraryName, mode.title, mode.minSongs);
  } else {
    songs = loadSongLibrary();
  }

  const playable = applySongFilters(songs);
  if (mode.battle) return shuffle(playable);
  return shuffle(playable);
}

function getPlayableSongLibrary() {
  return applySongFilters(loadSongLibrary());
}

function loadStaticGameModeSongs(libraryName, title, minSongs = 1) {
  const library = window[libraryName];
  const songs = Array.isArray(library)
    ? library.map((song) => normalizeSong({ ...song, source: title })).filter(Boolean)
    : [];
  if (songs.length < minSongs) {
    throw new Error(`${title} har kun ${songs.length} sange tilgaengelige lige nu.`);
  }
  return dedupeSongs(songs);
}

async function loadSpotifyPlaylistSongs(playlistId, title, minSongs = 1) {
  const songs = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      fields: "items(track(name,uri,artists(name),album(release_date))),total",
    });
    const data = await spotifyFetch(`/playlists/${playlistId}/tracks?${params}`);
    const items = Array.isArray(data.items) ? data.items : [];
    songs.push(...items.map((item) => spotifyTrackToSong(item.track, title)).filter(Boolean));
    offset += items.length;
    if (!items.length || offset >= Number(data.total || 0)) break;
  }

  if (songs.length < minSongs) {
    throw new Error(`${title} har kun ${songs.length} sange tilgængelige lige nu.`);
  }

  return dedupeSongs(songs);
}

async function loadSpotifyPagePlaylistSongs(playlistId, title, minSongs = 1) {
  const response = await fetch(`/spotify-page-playlist?id=${encodeURIComponent(playlistId)}`);
  if (!response.ok) throw new Error(`Kunne ikke hente ${title}-playlisten.`);
  const data = await response.json();
  const songs = Array.isArray(data.songs)
    ? data.songs.map((song) => normalizeSong({ ...song, genre: "playlist", source: title })).filter(Boolean)
    : [];

  if (songs.length < minSongs) {
    throw new Error(`${title} har kun ${songs.length} sange tilgaengelige lige nu.`);
  }

  return dedupeSongs(songs);
}

function spotifyTrackToSong(track, source) {
  if (!track?.name || !track?.artists?.length) return null;
  const year = Number(String(track.album?.release_date || "").slice(0, 4));
  return normalizeSong({
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    year,
    uri: track.uri || "",
    genre: source === gameModes.guilty.title ? "guilty-pleasure" : "playlist",
    source,
  });
}

async function loadBopsterPlaylistSongs(playlistIds, title, minSongs = 1) {
  const ids = Array.isArray(playlistIds) ? playlistIds : [playlistIds];
  const responses = await Promise.all(ids.map(async (playlistId) => {
    const response = await fetch(`/bopster-playlist?id=${encodeURIComponent(playlistId)}`);
    if (!response.ok) throw new Error(`Kunne ikke hente ${title}-playlisten.`);
    return response.json();
  }));
  const songs = responses.flatMap((data) =>
    Array.isArray(data.songs)
      ? data.songs.map((song) => normalizeSong({
          ...song,
          genre: title === gameModes.guilty.title ? "guilty-pleasure" : song.genre,
          source: title,
        })).filter(Boolean)
      : []
  );

  if (songs.length < minSongs) {
    throw new Error(`${title} har kun ${songs.length} sange tilgængelige lige nu.`);
  }

  return dedupeSongs(songs);
}

function applySongFilters(songs) {
  const excludedGenres = new Set(state.excludedGenres.map(String));
  const excludedDecades = new Set(state.excludedDecades.map(String));
  return songs
    .map(normalizeSong)
    .filter(Boolean)
    .filter((song) => !excludedGenres.has(song.genre))
    .filter((song) => !excludedDecades.has(String(Math.floor(song.year / 10) * 10)));
}

function normalizeSong(song) {
  if (!song) return null;
  const title = String(song.title || "").trim();
  const artist = String(song.artist || "").trim();
  const year = Number(song.year);
  if (!title || !artist || !Number.isInteger(year) || year < 1900 || year > currentYear + 1) return null;

  return {
    title,
    artist,
    year,
    uri: song.uri ? toSpotifyUri(String(song.uri).trim()) : "",
    country: song.country ? String(song.country).trim() : "",
    genre: song.genre ? String(song.genre).trim() : "",
    context: song.context ? String(song.context).trim() : "",
    difficulty: Math.min(5, Math.max(1, Number(song.difficulty) || 2)),
    source: song.source ? String(song.source).trim() : "",
    searchTerms: Array.isArray(song.searchTerms) ? song.searchTerms.map((term) => String(term).trim()).filter(Boolean) : [],
  };
}

function toSpotifyUri(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const uriMatch = trimmed.match(/^spotify:track:([a-zA-Z0-9]{22})$/);
  if (uriMatch) return `spotify:track:${uriMatch[1]}`;
  const match = trimmed.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match?.[1]?.length === 22 ? `spotify:track:${match[1]}` : "";
}

function getBuiltInSongLibrary() {
  return dedupeSongs([...(window.HITSTER_SONG_LIBRARY || []), ...defaultSongs].map(normalizeSong).filter(Boolean));
}

function dedupeSongs(songs) {
  const seen = new Set();
  return songs.filter((song) => {
    const key = `${normalizeIdentityText(song.title)}::${normalizeIdentityText(song.artist)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeIdentityText(value) {
  return normalizeSearchText(value).replace(/\s+/g, " ").trim();
}

function renderLibrary() {
  const songs = loadSongLibrary();
  el.libraryTotal.textContent = String(songs.length);
  renderLibraryStats(songs);
  renderLibraryFilterOptions(songs);
  renderLibraryRows(songs);
}

function renderLibraryStats(songs) {
  const decades = countBy(songs, (song) => `${Math.floor(song.year / 10) * 10}s`);
  const genres = countBy(songs, (song) => song.genre || "ukendt");
  const countries = countBy(songs, (song) => song.country || "ukendt");
  const difficulties = countBy(songs, (song) => `Sværhed ${song.difficulty || 2}`);
  el.libraryStats.innerHTML = [
    createStatBlock("Årtier", topCounts(decades, 8)),
    createStatBlock("Genrer", topCounts(genres, 8)),
    createStatBlock("Lande", topCounts(countries, 8)),
    createStatBlock("Sværhed", topCounts(difficulties, 5)),
  ].join("");
}

function createStatBlock(title, rows) {
  return `
    <article class="library-stat">
      <strong>${escapeHtml(title)}</strong>
      <p>${rows.map(([key, count]) => `${escapeHtml(key)}: ${count}`).join("<br>")}</p>
    </article>
  `;
}

function renderLibraryFilterOptions(songs) {
  const current = el.libraryDecadeFilter.value;
  const decades = [...new Set(songs.map((song) => Math.floor(song.year / 10) * 10))].sort((a, b) => a - b);
  const html = `<option value="">Alle årtier</option>${decades.map((decade) => `<option value="${decade}">${decade}'erne</option>`).join("")}`;
  if (el.libraryDecadeFilter.dataset.optionsHtml !== html) {
    el.libraryDecadeFilter.innerHTML = html;
    el.libraryDecadeFilter.dataset.optionsHtml = html;
    el.libraryDecadeFilter.value = decades.includes(Number(current)) ? current : "";
  }

  const currentCountry = el.libraryCountryFilter?.value || "";
  const countries = [...new Set(songs.map((song) => song.country).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const countryHtml = `<option value="">Alle lande</option>${countries.map((country) => `<option value="${escapeHtml(country)}">${escapeHtml(getCountryLabel(country))}</option>`).join("")}`;
  if (el.libraryCountryFilter && el.libraryCountryFilter.dataset.optionsHtml !== countryHtml) {
    el.libraryCountryFilter.innerHTML = countryHtml;
    el.libraryCountryFilter.dataset.optionsHtml = countryHtml;
    el.libraryCountryFilter.value = countries.includes(currentCountry) ? currentCountry : "";
  }

  const currentGenre = el.libraryGenreFilter?.value || "";
  const genres = [...new Set(songs.map((song) => song.genre).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const genreHtml = `<option value="">Alle genrer</option>${genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(formatGenreLabel(genre))}</option>`).join("")}`;
  if (el.libraryGenreFilter && el.libraryGenreFilter.dataset.optionsHtml !== genreHtml) {
    el.libraryGenreFilter.innerHTML = genreHtml;
    el.libraryGenreFilter.dataset.optionsHtml = genreHtml;
    el.libraryGenreFilter.value = genres.includes(currentGenre) ? currentGenre : "";
  }
}

function renderLibraryRows(songs) {
  const query = normalizeLibraryQuery(el.librarySearch.value);
  const decade = Number(el.libraryDecadeFilter.value || 0);
  const country = el.libraryCountryFilter?.value || "";
  const genre = el.libraryGenreFilter?.value || "";
  const filtered = songs
    .filter((song) => !decade || Math.floor(song.year / 10) * 10 === decade)
    .filter((song) => !country || song.country === country)
    .filter((song) => !genre || song.genre === genre)
    .filter((song) => {
      if (!query) return true;
      return [song.title, song.artist, song.genre, song.country, getCountryLabel(song.country), String(song.year), `${Math.floor(song.year / 10) * 10}s`]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => a.year - b.year || a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));

  const visibleLimit = 360;
  const rows = filtered.slice(0, visibleLimit).map((song) => `
    <article class="library-row">
      <strong>${song.year}</strong>
      <div>
        <strong>${escapeHtml(song.title)}</strong>
        <span>${escapeHtml(song.artist)}</span>
      </div>
      <small>${escapeHtml(song.country || "?")} · ${escapeHtml(song.genre || "?")} · S${song.difficulty || 2}</small>
    </article>
  `);
  if (el.libraryResultNote) {
    el.libraryResultNote.textContent = filtered.length > visibleLimit
      ? `Viser ${visibleLimit} af ${filtered.length} sange. Brug søgning eller filtre for at snævre listen ind.`
      : `Viser ${filtered.length} ${filtered.length === 1 ? "sang" : "sange"}.`;
  }
  el.libraryList.innerHTML = rows.join("") || `<p class="tiny-note">Ingen sange matcher filtret.</p>`;
}

function normalizeLibraryQuery(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\bdansk(e|t)?\b/g, "dk")
    .replace(/\bdanish\b/g, "dk")
    .replace(/\b(\d{2})s\b/g, (_, decade) => {
      const number = Number(decade);
      return `${number >= 30 ? 1900 + number : 2000 + number}s`;
    });
}

function getCountryLabel(country) {
  const labels = { DK: "Danske sange", US: "USA", UK: "Storbritannien", SE: "Sverige", NO: "Norge" };
  return labels[country] || country || "Ukendt";
}

function formatGenreLabel(genre) {
  return String(genre || "ukendt")
    .split("-")
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(" ");
}

function countBy(items, getter) {
  const counts = new Map();
  for (const item of items) {
    const key = getter(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function topCounts(counts, limit) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

function shuffle(items) {
  const result = [...items].filter(Boolean);
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

el.saveClient.addEventListener("click", () => {
  savePersistent();
  toast("Gemt.");
});
el.copyRedirect.addEventListener("click", copyRedirectUri);
el.login.addEventListener("click", startLogin);
el.loadDevices.addEventListener("click", loadDevices);
el.startGame.addEventListener("click", startGame);
el.resetGame.addEventListener("click", resetGame);
el.openSetup?.addEventListener("click", openSetupPanel);
el.jumpLibrary?.addEventListener("click", () => {
  state.setupOpen = false;
  renderAppStage();
  el.libraryPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
});
el.welcomeModeGrid?.addEventListener("click", (event) => {
  const card = event.target instanceof HTMLElement ? event.target.closest("[data-welcome-mode]") : null;
  if (!(card instanceof HTMLElement)) return;
  const mode = card.dataset.welcomeMode;
  if (!gameModes[mode]) return;
  el.gameMode.value = mode;
  state.gameMode = mode;
  syncHitsterCardsAvailability();
  renderPlayerNameFields(Number(el.playerCount.value));
  renderModePanel();
  syncPlayersFromFields();
  savePersistent();
  openSetupPanel();
});
el.openSettings.addEventListener("click", () => {
  state.setupOpen = !state.setupOpen;
  render();
});
el.gameMode.addEventListener("change", () => {
  state.gameMode = el.gameMode.value;
  syncHitsterCardsAvailability();
  renderPlayerNameFields(Number(el.playerCount.value));
  renderModePanel();
  syncPlayersFromFields();
  savePersistent();
  render();
});
el.generationGrid.addEventListener("change", (event) => {
  if (event.target instanceof HTMLTextAreaElement && event.target.id === "wavelength-category-list") return;
  syncPlayersFromFields();
  savePersistent();
  renderModePanel(getSetupPlayerSettings());
});
el.generationGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === "save-wavelength-categories") {
    const textarea = el.generationGrid.querySelector("#wavelength-category-list");
    if (textarea instanceof HTMLTextAreaElement) saveWavelengthCategoryLines(textarea.value);
    renderModePanel();
    toast("Wavelength-kategorier gemt.");
  }
  if (target.id === "reset-wavelength-categories") {
    resetWavelengthCategoryLines();
    renderModePanel();
    toast("Wavelength-kategorier gendannet.");
  }
});
el.wavelengthPanel.addEventListener("input", (event) => {
  if (!state.wavelength || state.wavelength.phase === "results") return;
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.dataset.wavelengthGuess) {
    state.wavelength.guesses[input.dataset.wavelengthGuess] = clampWavelengthValue(input.value);
    state.wavelength.finalGuess = clampWavelengthFinalGuess(state.wavelength.finalGuess);
    renderWavelengthPanel();
    saveGameSnapshot();
    return;
  }
  if (input.id === "wavelength-final-guess") {
    state.wavelength.finalGuess = clampWavelengthFinalGuess(input.value);
    input.value = String(state.wavelength.finalGuess);
  }
  if (input.id === "wavelength-manual-category") {
    state.wavelength.category = input.value.trim();
    saveGameSnapshot();
    return;
  }
  const output = input.parentElement?.querySelector("output");
  if (output) output.textContent = String(state.wavelength.finalGuess);
  saveGameSnapshot();
});
el.wavelengthPanel.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (isImposterMode()) {
    const playerButton = target.closest("[data-imposter-player]");
    if (playerButton instanceof HTMLElement) revealImposterRole(Number(playerButton.dataset.imposterPlayer));
    if (target.id === "imposter-hide-role") hideImposterRole();
    if (target.id === "imposter-play-again") playImposterTrack();
    if (target.id === "imposter-reveal-solution") revealImposterSolution();
    return;
  }
  if (!state.wavelength) return;
  if (target.id === "wavelength-toggle-target") {
    state.wavelength.showTarget = !state.wavelength.showTarget;
    render();
  }
  if (target.id === "wavelength-finish-round") finishWavelengthRound();
  if (target.id === "wavelength-next-round") startNextWavelengthRound();
});
el.advancedSettingsToggle.addEventListener("change", () => {
  el.advancedPanel.classList.toggle("active", el.advancedSettingsToggle.checked);
  savePersistent();
});
el.gamemasterEnabled.addEventListener("change", savePersistent);
el.advancedPlayerGrid.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.dataset.setting === "infiniteHitsterCards") renderAdvancedPlayerSettings(getSetupPlayerSettings());
  savePersistent();
});
el.genreExclusions.addEventListener("click", (event) => {
  if (event.target instanceof HTMLInputElement) event.stopPropagation();
});
el.genreExclusions.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.filterGroupIndex && !target.dataset.filterType) {
    el.genreExclusions
      .querySelectorAll(`input[data-filter-type="genre"][data-filter-group-index="${target.dataset.filterGroupIndex}"]`)
      .forEach((input) => {
        input.checked = target.checked;
      });
  }
  syncGenreGroupStates();
  state.excludedGenres = getCheckedValues(el.genreExclusions);
  savePersistent();
  if (!state.started) state.deck = shuffle(getPlayableSongLibrary());
  render();
});
el.decadeExclusions.addEventListener("change", () => {
  state.excludedDecades = getCheckedValues(el.decadeExclusions);
  savePersistent();
  if (!state.started) state.deck = shuffle(getPlayableSongLibrary());
  render();
});
el.gamemasterToggle.addEventListener("click", () => {
  if (!state.started || !state.gamemasterEnabled) return;
  state.gamemasterOpen = !state.gamemasterOpen;
  render();
});
el.gamemasterGrid.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (isWavelengthMode()) {
    handleWavelengthGamemasterInput(input);
    return;
  }
  if (isSharedTimelineMode()) {
    handleSharedTimelineGamemasterInput(input);
    return;
  }
  if (isPushLuckMode()) {
    handlePushLuckGamemasterInput(input);
    return;
  }
  if (isPuzzleRushMode()) {
    handlePuzzleRushGamemasterInput(input);
    return;
  }
  const row = input.closest("[data-gm-player]");
  const player = row ? state.players[Number(row.dataset.gmPlayer)] : null;
  if (!player) return;
  if (input.dataset.gmSetting === "scoreOffset") player.scoreOffset = clampScoreOffset(input.value);
  if (input.dataset.gmSetting === "hitsterCards") player.hitsterCards = clampHitsterCards(input.value);
  if (input.dataset.gmSetting === "winScore") player.winScore = clampWinScore(input.value);
  if (input.dataset.gmSetting === "battleRoyaleLives") player.battleRoyaleLives = clampBattleRoyaleLives(input.value);
  renderPlayers();
  renderTurnStatus();
  saveGameSnapshot();
});
el.gamemasterGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !isWavelengthMode()) return;
  const guesserIndex = target.dataset.wavelengthGmGuesser;
  if (guesserIndex === undefined) return;
  state.currentPlayer = Number(guesserIndex);
  state.wavelength = createWavelengthRound();
  render();
  toast(`${state.players[state.currentPlayer]?.name || "Ny spiller"} er gætter.`);
});
el.playTrack.addEventListener("click", playCurrentTrack);
el.resumeTrack.addEventListener("click", resumePlayback);
el.pauseTrack.addEventListener("click", pausePlayback);
el.revealTrack.addEventListener("click", revealTrack);
el.keepCard.addEventListener("click", keepCard);
el.discardCard.addEventListener("click", discardCard);
el.titleCorrect.addEventListener("click", () => {
  state.titleCorrect = !state.titleCorrect;
  render();
});
el.artistCorrect.addEventListener("click", () => {
  state.artistCorrect = !state.artistCorrect;
  render();
});
el.startChallenge.addEventListener("click", startChallenge);
el.cancelChallenge.addEventListener("click", cancelChallenge);
el.librarySearch.addEventListener("input", () => renderLibraryRows(loadSongLibrary()));
el.libraryDecadeFilter.addEventListener("change", () => renderLibraryRows(loadSongLibrary()));
el.libraryCountryFilter?.addEventListener("change", () => renderLibraryRows(loadSongLibrary()));
el.libraryGenreFilter?.addEventListener("change", () => renderLibraryRows(loadSongLibrary()));
el.hitsterCardsMode.addEventListener("change", () => {
  syncHitsterCardsAvailability();
  state.hitsterCardsEnabled = canUseHitsterCards() && el.hitsterCardsMode.checked;
  state.challenges = [];
  state.activeChallengeIndex = null;
  renderAdvancedPlayerSettings(getSetupPlayerSettings());
  syncPlayersFromFields();
  savePersistent();
  render();
});
el.playerCount.addEventListener("change", () => {
  renderPlayerNameFields(Number(el.playerCount.value));
  syncPlayersFromFields();
  savePersistent();
  render();
});

loadWavelengthCategoryFile().finally(() => {
  loadPersistent();
  const restoredGame = restoreSavedGame();
  render();
  finishLoginIfNeeded()
    .catch((error) => toast(error.message))
    .finally(() => {
      armNavigationGuard();
      if (restoredGame) toast("Igangværende spil gendannet.");
    });
});
