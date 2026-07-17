# Documentazione del progetto — Spotify Showcase

Documento didattico di riepilogo per la consegna della Settimana 11. Spiega cosa fa il progetto, come è organizzato, e come funziona ogni singolo file/funzione, con un focus sui concetti di Redux Toolkit usati.

---

## 1. Panoramica

App React che mostra una vetrina di brani musicali in stile Spotify:

- **Navbar** con logo Spotify (SVG disegnato a mano).
- **Sidebar** con barra di ricerca e login/logout finto (demo, senza backend reale).
- **Griglia di card** (Home) con copertina, titolo, artista, bottone play e bottone preferiti (cuore).
- **Pagina dettagli** (`/song/:id`) con copertina grande, album, durata, data di uscita e bottone preferiti.
- **Footer/player finto** che appare solo dopo aver premuto play su una card, mostrando la canzone "in riproduzione" (senza audio reale).

I dati arrivano dall'API pubblica Deezer tramite il proxy didattico:
`https://striveschool-api.herokuapp.com/api/deezer/search?q=<query>` — **nessuna API key richiesta**.

---

## 2. Stack tecnologico

| Tecnologia | Ruolo |
|---|---|
| **React 19** | UI a componenti |
| **TypeScript** | Tipizzazione statica |
| **Vite** | Dev server e build |
| **Redux Toolkit** (`@reduxjs/toolkit`) | Stato globale dell'app |
| **react-redux** | Collega React ai componenti Redux (`Provider`, hook) |
| **react-router-dom** (v7) | Routing lato client (Home ↔ Dettagli) |

Comandi (`package.json`):
- `npm run dev` → avvia il dev server Vite
- `npm run build` → type-check (`tsc -b`) + build di produzione
- `npm run lint` → ESLint
- `npm run preview` → serve la build di produzione in locale

---

## 3. Struttura delle cartelle

```
src/
├── main.tsx                 # entry point: monta React, avvolge con Provider e Router
├── App.tsx                  # layout generale + definizione delle Route
├── index.css / App.css      # stili globali
├── types/
│   └── song.ts               # interfacce TypeScript: Song, Artist, Album
├── app/
│   ├── store.ts               # configureStore: unisce i reducer, esporta i tipi RootState/AppDispatch
│   └── hooks.ts                # hook tipizzati useAppDispatch / useAppSelector
├── features/
│   ├── songs/
│   │   └── songsSlice.ts        # slice Redux per canzoni, preferiti, player, chiamate API
│   └── auth/
│       └── authSlice.ts          # slice Redux per login/logout finto
├── components/
│   ├── Navbar.tsx               # logo Spotify statico
│   ├── Sidebar.tsx               # ricerca + login/logout
│   ├── SongCard.tsx              # card di una canzone nella griglia
│   └── Footer.tsx                 # player finto in basso
└── pages/
    ├── HomePage.tsx              # griglia dei risultati di ricerca
    └── DetailsPage.tsx            # pagina di dettaglio di una canzone
```

Convenzione **Redux Toolkit "feature-based"**: ogni dominio di stato (`songs`, `auth`) ha la sua cartella dentro `features/` con il proprio slice, invece di un unico reducer gigante.

---

## 4. Architettura dei dati (vista d'insieme)

```
Deezer API (via proxy striveschool)
        │
        ▼
songsSlice.ts  (createAsyncThunk: fetchSongs, fetchSongById)
        │
        ▼
   Redux Store (store.ts)
   ├── state.songs  { items, favorites, status, selected, nowPlaying, ... }
   └── state.auth   { isLoggedIn, username }
        │
        ▼
Componenti React (useAppSelector / useAppDispatch)
   Sidebar → HomePage → SongCard → DetailsPage → Footer
```

Idea chiave: **nessun componente chiama `fetch` direttamente**. Solo gli *async thunk* dentro `songsSlice.ts` parlano con l'API; i componenti leggono/scrivono solo lo store Redux.

---

## 5. `src/types/song.ts` — i tipi

```ts
interface Artist { id, name, picture_medium }
interface Album  { title, cover_medium, cover_big }
interface Song   { id, title, duration, preview, artist, album, release_date?, rank? }
```

Rispecchiano esattamente la forma della risposta Deezer, così TypeScript sa cosa aspettarsi ovunque nell'app (autocompletamento, errori a compile-time se un campo è sbagliato).

---

## 6. `src/app/store.ts` — lo store Redux

```ts
export const store = configureStore({
  reducer: {
    songs: songsReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

- **`configureStore`**: funzione di Redux Toolkit che crea lo store, combinando automaticamente i reducer passati nell'oggetto `reducer` (equivalente moderno di `combineReducers` + `createStore`), e aggiunge middleware utili di default (es. controlli su mutazioni accidentali, thunk middleware già incluso).
- **`RootState`**: tipo TypeScript dedotto automaticamente dallo store — rappresenta *la forma intera* dello stato globale (`{ songs: SongsState, auth: AuthState }`). Serve per tipizzare `useSelector`.
- **`AppDispatch`**: tipo della funzione `dispatch` di questo store specifico (necessario perché con i thunk async `dispatch` accetta anche funzioni, non solo action object semplici).

---

## 7. `src/app/hooks.ts` — hook tipizzati

```ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

React-Redux fornisce `useDispatch`/`useSelector` generici; qui vengono "pre-tipizzati" con `RootState`/`AppDispatch` così che in ogni componente:
- `useAppSelector((state) => state.songs.items)` → TypeScript sa già che `state` è `RootState`, niente da scrivere a mano.
- `useAppDispatch()` → il `dispatch` risultante accetta anche i thunk async senza errori di tipo.

Pattern ufficiale consigliato da Redux Toolkit per evitare di ripetere i generic ovunque.

---

## 8. `src/features/songs/songsSlice.ts` — lo slice principale

### Stato (`SongsState`)

| Campo | Tipo | A cosa serve |
|---|---|---|
| `items` | `Song[]` | risultati della ricerca corrente (Home) |
| `favorites` | `number[]` | id delle canzoni preferite (solo in memoria, non persistito) |
| `status` | `"idle" \| "loading" \| "succeeded" \| "failed"` | stato della fetch di `items` |
| `error` | `string \| null` | messaggio di errore della fetch di `items` |
| `selected` | `Song \| null` | canzone caricata per la pagina dettagli |
| `selectedStatus` / `selectedError` | come sopra | stato/errore della fetch della canzone singola |
| `nowPlaying` | `Song \| null` | canzone mostrata nel player finto in footer |

### Funzioni async (`createAsyncThunk`)

**`fetchSongs(query: string)`**
```ts
createAsyncThunk("songs/fetchSongs", async (query) => {
  const res = await fetch(`.../search?q=${query}`);
  const data = await res.json();
  return data.data as Song[];
});
```
Cerca canzoni per parola chiave (artista/titolo) e restituisce l'array di risultati. `createAsyncThunk` genera automaticamente **3 action type**: `pending`, `fulfilled`, `rejected`, dispatchate rispettivamente prima della chiamata, dopo un successo, dopo un errore.

**`fetchSongById(id: number)`**
Scarica i dettagli di una singola canzone (usata dalla pagina `/song/:id`).

### Reducer sincroni (`reducers`)

**`toggleFavorite(id: number)`**
Aggiunge o rimuove l'id dalla lista `favorites`:
```ts
if (state.favorites.includes(id)) rimuovi
else aggiungi
```
Nota: grazie a **Immer** (integrato in Redux Toolkit), si può scrivere `state.favorites.push(id)` come se si mutasse direttamente lo stato — RTK genera dietro le quinte un nuovo stato immutabile.

**`setNowPlaying(song: Song)`**
Imposta la canzone corrente nel player finto (footer).

### `extraReducers`

Gestisce le 3 fasi di *entrambi* i thunk (`fetchSongs` e `fetchSongById`), aggiornando `status`/`error` o `selectedStatus`/`selectedError` a seconda del caso. È il punto in cui lo slice "ascolta" le action generate automaticamente dai thunk, che non sono definite dentro `reducers` perché non sono azioni sincrone dirette.

### Export

```ts
export const { toggleFavorite, setNowPlaying } = songsSlice.actions;
export default songsSlice.reducer;
```
Le *action creators* sincrone vengono esportate singolarmente per essere usate con `dispatch(...)`; il reducer va allo store.

---

## 9. `src/features/auth/authSlice.ts` — login finto

Stato minimo: `{ isLoggedIn: boolean, username: string | null }`.

- **`login(username: string)`** → imposta `isLoggedIn = true` e salva lo username.
- **`logout()`** → resetta lo stato.

Nessuna chiamata API: è un login "demo" puramente client-side (vedi `Sidebar.tsx`, che passa sempre `"Utente Demo"`).

---

## 10. `src/main.tsx` — entry point

```tsx
createRoot(...).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
```

Ordine importante:
1. **`Provider`** (react-redux) → rende lo store disponibile a tutti i componenti tramite `useAppSelector`/`useAppDispatch`.
2. **`BrowserRouter`** (react-router-dom) → abilita il routing basato sull'URL del browser.
3. **`App`** → il componente radice vero e proprio.

---

## 11. `src/App.tsx` — layout e routing

```tsx
<div className="app-layout">
  <Navbar />
  <div className="app-body">
    <Sidebar />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/song/:id" element={<DetailsPage />} />
      </Routes>
    </main>
  </div>
  <Footer />
</div>
```

- `Navbar` e `Sidebar` sono **fissi** su ogni pagina (non cambiano con la route).
- `Routes`/`Route` decidono quale pagina mostrare in base all'URL:
  - `/` → `HomePage` (griglia di risultati)
  - `/song/:id` → `DetailsPage` (`:id` è un parametro dinamico, letto con `useParams`)
- `Footer` è sempre presente ma si "auto-nasconde" (`return null`) finché non c'è una canzone in riproduzione.

---

## 12. `src/components/Navbar.tsx`

Componente puramente statico: disegna il logo Spotify con un `<svg>` (cerchio verde + tre archi bianchi) e il testo "Spotify". Nessuno stato, nessuna prop.

---

## 13. `src/components/Sidebar.tsx`

Due responsabilità:

**Ricerca**
```ts
const handleSearch = (e: FormEvent) => {
  e.preventDefault();
  const trimmed = query.trim();
  if (!trimmed) return;
  dispatch(fetchSongs(trimmed));
  navigate("/");
};
```
- `query` è stato locale (`useState`) del testo digitato.
- Al submit del form, lancia il thunk `fetchSongs` con il testo pulito e riporta l'utente sulla Home (utile se stava guardando i dettagli di un'altra canzone).

**Login/logout finto**
```tsx
{isLoggedIn ? (
  <>Ciao, {username} <button onClick={() => dispatch(logout())}>Esci</button></>
) : (
  <button onClick={() => dispatch(login("Utente Demo"))}>Accedi</button>
)}
```
Rendering condizionale basato su `state.auth.isLoggedIn`.

---

## 14. `src/pages/HomePage.tsx`

```ts
useEffect(() => {
  dispatch(fetchSongs("queen"));
}, [dispatch]);
```
Al primo render, lancia una ricerca di default (`"queen"`) così la griglia non è mai vuota all'avvio. Poi legge `status`/`error`/`items` dallo store per mostrare:
- `"Caricamento..."` se `status === "loading"`
- messaggio d'errore se `status === "failed"`
- altrimenti la griglia di `SongCard`

---

## 15. `src/components/SongCard.tsx`

Rappresenta una singola canzone nella griglia. Punti tecnici interessanti:

**Navigazione manuale invece di `<Link>`**
```tsx
<div onClick={() => navigate(`/song/${song.id}`)} role="link" tabIndex={0}>
```
Commento nel codice spiega il motivo: un `<button>` dentro un `<a>` (che è cosa che genera `<Link>`) è HTML non valido e causerebbe la navigazione anche cliccando sui bottoni interni nonostante `stopPropagation`. Soluzione: l'intera card è un `div` cliccabile con `useNavigate`, mentre i bottoni interni fermano la propagazione dell'evento.

**Bottone play**
```ts
onClick={(e) => { e.stopPropagation(); dispatch(setNowPlaying(song)); }}
```
Imposta la canzone nel player finto del footer senza navigare ai dettagli.

**Bottone preferiti (cuore)**
```ts
onClick={(e) => { e.stopPropagation(); dispatch(toggleFavorite(song.id)); }}
```
`isFavorite` viene letto con `useAppSelector` controllando se `song.id` è dentro `state.songs.favorites`; determina la classe CSS `is-favorite` e il simbolo `♥`/`♡`.

---

## 16. `src/pages/DetailsPage.tsx`

```ts
const { id } = useParams<{ id: string }>();
useEffect(() => {
  if (id) dispatch(fetchSongById(Number(id)));
}, [id, dispatch]);
```
- `useParams` legge `:id` dall'URL corrente (stringa, va convertito a `Number`).
- Effettua il fetch della canzone selezionata ogni volta che `id` cambia (es. si passa da `/song/1` a `/song/2`).

Gestione stati (`loading`/`failed`) identica alla Home, ma su `selectedStatus`/`selectedError`.

**Formattazione durata**
```ts
const minutes = Math.floor(selected.duration / 60);
const seconds = String(selected.duration % 60).padStart(2, "0");
```
Deezer fornisce `duration` in secondi totali; qui viene convertita in `mm:ss` (con zero-padding, es. `3:05` invece di `3:5`).

Mostra anche il bottone preferiti, identico nella logica a quello della card.

---

## 17. `src/components/Footer.tsx`

```ts
const nowPlaying = useAppSelector((state) => state.songs.nowPlaying);
if (!nowPlaying) return null;
```
Non è un footer "sempre visibile": appare solo dopo che l'utente ha premuto play su una card, mostrando copertina, titolo, artista e un simbolo ▶ puramente grafico (nessun audio reale viene riprodotto — è dichiarato esplicitamente nel commento del codice).

---

## 18. Concetti Redux Toolkit da ricordare per l'esame

| Concetto | Cosa fa | Dove nel progetto |
|---|---|---|
| `configureStore` | Crea lo store combinando i reducer, con middleware di default | `app/store.ts` |
| `createSlice` | Genera reducer + action creators da un solo oggetto | `songsSlice.ts`, `authSlice.ts` |
| `createAsyncThunk` | Gestisce chiamate async generando automaticamente le action `pending/fulfilled/rejected` | `fetchSongs`, `fetchSongById` |
| `extraReducers` | Fa reagire uno slice ad action generate *fuori* dai suoi `reducers` (es. i thunk) | `songsSlice.ts` |
| Immer (dentro RTK) | Permette mutazioni "finte" dello stato scritte in modo diretto e leggibile | `toggleFavorite` |
| `Provider` | Rende lo store Redux disponibile via Context a tutto l'albero React | `main.tsx` |
| `useSelector` / `useDispatch` (tipizzati) | Leggere/scrivere lo store dai componenti | `app/hooks.ts` + tutti i componenti |

---

## 19. Flusso utente end-to-end (esempio)

1. L'utente digita "queen" nella Sidebar e preme cerca → `dispatch(fetchSongs("queen"))`.
2. Il thunk fa `fetch` all'API Deezer → dispatcha `pending` (status: loading) → poi `fulfilled` (status: succeeded, items popolati).
3. `HomePage` si ri-renderizza mostrando le `SongCard`.
4. L'utente clicca su una card → `navigate('/song/<id>')`.
5. `DetailsPage` monta, legge `id` da `useParams`, dispatcha `fetchSongById(id)`.
6. Nel frattempo l'utente aveva premuto play su una card in precedenza → il Footer mostra quella canzone, indipendentemente dalla pagina in cui ci si trova (stato globale condiviso).
7. L'utente clicca il cuore nella pagina dettagli → `dispatch(toggleFavorite(id))` → lo stato `favorites` si aggiorna ovunque venga letto (card e pagina dettagli restano sincronizzate).

---

## 20. API esterna

- **Ricerca**: `GET https://striveschool-api.herokuapp.com/api/deezer/search?q=<query>` → `{ data: Song[] }`
- **Dettaglio**: `GET https://striveschool-api.herokuapp.com/api/deezer/track/<id>` → `Song`

Nessuna autenticazione richiesta (proxy pubblico didattico verso l'API Deezer).
