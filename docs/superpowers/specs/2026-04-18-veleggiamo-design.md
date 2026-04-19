# Veleggiamo — Sailboat Intelligence Platform
**Design Spec** | 2026-04-18

---

## 1. Obiettivo

Vertical search engine per armatori di barche a vela (6–15m) che permette di trovare attrezzatura nautica tramite ricerca in linguaggio naturale (italiano), matching tecnico deterministico e visualizzazione negozi vicini su mappa.

**Non è:** e-commerce, chatbot, sistema AI autonomo.
**È:** motore di ricerca verticale tecnico con logica deterministica e interfaccia LLM pronta per il futuro.

---

## 2. Ruoli (Operating Manual)

| Ruolo | Attore | Responsabilità |
|---|---|---|
| Product Owner | Umano | Decide feature, approva tutto |
| Architect | ChatGPT | Definisce architettura, valida scelte |
| Executor | Claude Code | Scrive codice, implementa spec alla lettera |

---

## 3. Architettura

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Leaflet (mappa), dati mock JSON.

**Pattern:** Monolite Next.js puro — API routes + React frontend in un unico repo.

### Struttura directory

```
veleggiamo/
├── app/
│   ├── page.tsx                    # Homepage — search bar centrata
│   ├── risultati/
│   │   └── page.tsx                # Pagina risultati
│   └── api/
│       └── search/
│           └── route.ts            # GET /api/search?q= (thin orchestrator)
├── components/
│   ├── SearchBar.tsx
│   ├── ProductList.tsx
│   ├── ProductCard.tsx
│   └── MapView.tsx                 # Leaflet + OpenStreetMap
├── services/
│   └── searchService.ts            # Pipeline esplicita a 6 step
├── lib/
│   ├── intentParser.ts             # Rule-based → ParsedQuery
│   ├── matchingEngine.ts           # Match + spiegazione
│   └── llmParser.ts                # Stub LLM (ritorna null, pronto per plug-in)
├── constants/
│   └── boatRules.ts                # Regole tecniche per categoria
├── data/
│   ├── products.ts                 # Mock prodotti italiani
│   └── stores.ts                   # Mock negozi con coordinate italiane
└── types/
    ├── parsedQuery.ts
    ├── product.ts
    └── searchResult.ts
```

---

## 4. Tipi di dominio

### `types/parsedQuery.ts`
```typescript
type Categoria = 'ancora' | 'autopilota' | 'energia'
type Confidence = 'alta' | 'media' | 'bassa'

interface ParsedQuery {
  categoria: Categoria | null
  lunghezzaBarca: number | null   // metri
  rawQuery: string
  confidence: Confidence
}
```

### `types/product.ts`
```typescript
interface Prodotto {
  id: string
  nome: string
  categoria: Categoria
  marca: string
  prezzo: number
  specs: Record<string, string | number>
  compatibilita: { lunghezzaMin: number; lunghezzaMax: number }
  linkAcquisto: string
  immagine: string
}

interface ProdottoConSpiegazione extends Prodotto {
  spiegazione: string
  punteggio: number
}
```

### `types/searchResult.ts`
```typescript
interface Negozio {
  id: string
  nome: string
  citta: string
  lat: number
  lng: number
  telefono: string
}

interface RisultatoRicerca {
  prodotti: ProdottoConSpiegazione[]
  negozi: Negozio[]
  queryInterpretata: string
}
```

---

## 5. Pipeline obbligatoria

```
rawQuery
   ↓
intentParser.parse()      → ParsedQuery
   ↓
enrich()                  → arricchisce con range tecnici da boatRules
   ↓
matchingEngine.match()    → filtra prodotti compatibili
   ↓
rank()                    → ordina per punteggio di centralità nel range
   ↓
getNearbyStores()         → restituisce negozi mock (futuro: geo reale)
   ↓
buildResponse()           → RisultatoRicerca
```

**Nessuna deviazione dalla pipeline è permessa senza approvazione.**

---

## 6. Logica di matching per categoria

### Ancora
- Peso consigliato = `lunghezza × 1.0` kg (range ±20%)
- Prodotto compatibile se `specs.peso` è nel range `[lunghezza×0.8, lunghezza×1.2]`

### Autopilota
- < 9m → timoneria (tiller pilot)
- 9–12m → cockpit (wheel pilot)
- > 12m → idraulico (hydraulic)
- Match su `specs.tipo` che corrisponde alla fascia

### Energia (batterie/solare)
- Capacità baseline = `lunghezza × 10` Ah
- Prodotto compatibile se `specs.capacitaAh >= baseline × 0.8`

### Punteggio (ranking)
- 100 = al centro del range ottimale
- Decresce linearmente verso i bordi del range
- Prodotti fuori range esclusi

---

## 7. intentParser — regole di estrazione

| Pattern regex | Esempio input | Output |
|---|---|---|
| `(\d+)\s*m` | "barca 10m" | `lunghezzaBarca: 10` |
| `(\d+)\s*metri` | "dieci metri" | `lunghezzaBarca: 10` |
| `ancora\|anchor` | "ancora per vela" | `categoria: 'ancora'` |
| `autopilot\|pilota auto` | "autopilota" | `categoria: 'autopilota'` |
| `batter\|solar\|energia\|pannello` | "batterie litio" | `categoria: 'energia'` |

**Confidence:** `alta` se entrambi categoria + lunghezza estratti, `media` se solo uno, `bassa` se nessuno.

---

## 8. UI

### Homepage (`app/page.tsx`)
- Search bar centrata (stile Google)
- Placeholder: "es. ancora per barca da 10m"
- Suggerimenti statici sotto la barra
- Submit → redirect a `/risultati?q=...`

### Pagina risultati (`app/risultati/page.tsx`)
- Banner: query interpretata (es. "Ancora per barca da 10m")
- Lista prodotti (`ProductList` + `ProductCard`)
- Mappa Leaflet con pin negozi (`MapView`)

### ProductCard
- Nome, marca, prezzo
- Specs principali
- Spiegazione ("Peso ideale per barche 9–11m")
- Link acquisto online

### MapView
- Leaflet + OpenStreetMap (gratis, no API key)
- Pin per ogni negozio mock
- Popup con nome, città, telefono

---

## 9. API

**Endpoint:** `GET /api/search?q={query}`

**Response:**
```json
{
  "prodotti": [...],
  "negozi": [...],
  "queryInterpretata": "Ancora per barca da 10m"
}
```

---

## 10. Mock Data

- **Prodotti:** ~15 prodotti (5 ancore, 5 autopiloti, 5 energia) con marca, prezzo, specs realistici
- **Negozi:** ~8 negozi nautici italiani con coordinate reali (Genova, La Spezia, Napoli, Palermo, ecc.)

---

## 11. Fasi intelligenza

| Fase | Stato | Cosa cambia |
|---|---|---|
| MVP | **Attuale** | rule-based, mock data, deterministic |
| V2 | Futuro | llmParser.ts attivato (sostituisce intentParser) |
| V3 | Futuro | ranking AI, semantic search |

**L'LLM è SOLO un plug-in sostituibile, mai il core logico iniziale.**

---

## 12. Definition of Done

Una feature è completa quando:
1. È integrata nella pipeline (tutti e 6 gli step)
2. È testabile manualmente via browser
3. Non rompe l'architettura definita
4. È coerente con questo spec

---

## 13. Dipendenze approvate per MVP

| Libreria | Motivo |
|---|---|
| `next` | Framework |
| `react` | UI |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `leaflet` + `react-leaflet` | Mappa interattiva |

**Nessuna altra dipendenza senza approvazione esplicita.**
