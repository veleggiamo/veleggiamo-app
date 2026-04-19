# Veleggiamo MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire un vertical search engine per attrezzatura nautica con ricerca in italiano, matching tecnico deterministico e mappa negozi Leaflet.

**Architecture:** Monolite Next.js 15 (App Router) + TypeScript + Tailwind. Pipeline deterministica `parse → enrich → match → rank → stores → response` in `services/searchService.ts`. Dati mock hardcoded in `data/`. LLM stub pronto per plug-in futuro.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Leaflet + react-leaflet, Jest (unit tests)

---

## File Map

| File | Responsabilità |
|---|---|
| `types/parsedQuery.ts` | Tipo `ParsedQuery`, `Categoria`, `Confidence` |
| `types/product.ts` | Tipi `Prodotto`, `ProdottoConSpiegazione` |
| `types/searchResult.ts` | Tipi `RisultatoRicerca`, `Negozio` |
| `constants/boatRules.ts` | Costanti tecniche per categoria (pesi, range, ecc.) |
| `data/products.ts` | 15 prodotti mock (5 ancore, 5 autopiloti, 5 energia) |
| `data/stores.ts` | 8 negozi nautici italiani con coordinate |
| `lib/intentParser.ts` | Regex rule-based → `ParsedQuery` |
| `lib/matchingEngine.ts` | `ParsedQuery` + prodotti → prodotti con punteggio e spiegazione |
| `lib/llmParser.ts` | Stub async → ritorna `null` |
| `services/searchService.ts` | Pipeline esplicita a 6 step |
| `app/api/search/route.ts` | `GET /api/search?q=` — thin orchestrator |
| `components/SearchBar.tsx` | Input + submit → redirect a `/risultati` |
| `components/ProductCard.tsx` | Card prodotto con spiegazione e link acquisto |
| `components/ProductList.tsx` | Grid di `ProductCard` |
| `components/MapView.tsx` | Mappa Leaflet client-only con pin negozi |
| `app/page.tsx` | Homepage con search bar centrata |
| `app/risultati/page.tsx` | Pagina risultati (Server Component) |
| `app/layout.tsx` | Layout root + CSS Leaflet CDN |
| `__tests__/lib/intentParser.test.ts` | Unit test parser |
| `__tests__/lib/matchingEngine.test.ts` | Unit test matching engine |
| `__tests__/services/searchService.test.ts` | Unit test pipeline |

---

## Task 1: Scaffold progetto Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Genera il progetto con create-next-app**

```bash
cd "C:/Users/Admin/Veleggiamo/veleggiamo"
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
```

Expected: cartella popolata con struttura Next.js standard.

- [ ] **Step 2: Installa Leaflet**

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

- [ ] **Step 3: Installa Jest per Next.js**

```bash
npm install --save-dev jest jest-environment-node @types/jest ts-jest
```

- [ ] **Step 4: Configura Jest**

Crea `jest.config.js`:

```js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
})
```

Aggiungi a `package.json` (scripts):

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Aggiorna `app/layout.tsx` per CSS Leaflet**

Sostituisci il contenuto di `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Veleggiamo — Attrezzatura Nautica',
  description: 'Trova l\'attrezzatura giusta per la tua barca a vela',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.min.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Verifica che il progetto compili**

```bash
npm run build
```

Expected: Build successful, nessun errore TypeScript.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 + Tailwind + Leaflet + Jest"
```

---

## Task 2: Tipi di dominio

**Files:**
- Create: `types/parsedQuery.ts`
- Create: `types/product.ts`
- Create: `types/searchResult.ts`

- [ ] **Step 1: Crea `types/parsedQuery.ts`**

```typescript
export type Categoria = 'ancora' | 'autopilota' | 'energia'
export type Confidence = 'alta' | 'media' | 'bassa'

export interface ParsedQuery {
  categoria: Categoria | null
  lunghezzaBarca: number | null
  rawQuery: string
  confidence: Confidence
}
```

- [ ] **Step 2: Crea `types/product.ts`**

```typescript
import { Categoria } from './parsedQuery'

export interface Prodotto {
  id: string
  nome: string
  categoria: Categoria
  marca: string
  prezzo: number
  specs: Record<string, string | number>
  compatibilita: {
    lunghezzaMin: number
    lunghezzaMax: number
  }
  linkAcquisto: string
  immagine: string
}

export interface ProdottoConSpiegazione extends Prodotto {
  spiegazione: string
  punteggio: number
}
```

- [ ] **Step 3: Crea `types/searchResult.ts`**

```typescript
import { ProdottoConSpiegazione } from './product'

export interface Negozio {
  id: string
  nome: string
  citta: string
  lat: number
  lng: number
  telefono: string
}

export interface RisultatoRicerca {
  prodotti: ProdottoConSpiegazione[]
  negozi: Negozio[]
  queryInterpretata: string
}
```

- [ ] **Step 4: Verifica che TypeScript compili**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add types/
git commit -m "feat: add domain types (ParsedQuery, Prodotto, RisultatoRicerca)"
```

---

## Task 3: Costanti di dominio

**Files:**
- Create: `constants/boatRules.ts`

- [ ] **Step 1: Crea `constants/boatRules.ts`**

```typescript
export const ANCORA_RULES = {
  pesoPerMetro: 1.0,
  tolleranza: 0.2,
} as const

export const AUTOPILOTA_RULES = {
  timoneria: { max: 9 },
  cockpit: { min: 9, max: 12 },
  idraulico: { min: 12 },
} as const

export type TipoAutopilota = 'timoneria' | 'cockpit' | 'idraulico'

export const ENERGIA_RULES = {
  ahPerMetro: 10,
  tolleranza: 0.2,
} as const
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add constants/
git commit -m "feat: add boatRules constants (ancora, autopilota, energia)"
```

---

## Task 4: Dati mock

**Files:**
- Create: `data/products.ts`
- Create: `data/stores.ts`

- [ ] **Step 1: Crea `data/products.ts`**

```typescript
import { Prodotto } from '../types/product'

export const products: Prodotto[] = [
  // ANCORE
  {
    id: 'anc-001',
    nome: 'Ancora Delta 8kg',
    categoria: 'ancora',
    marca: 'Rocna',
    prezzo: 189,
    specs: { peso: 8, materiale: 'acciaio galvanizzato', tipo: 'delta' },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 9 },
    linkAcquisto: 'https://www.nautica.it/ancora-delta-8kg',
    immagine: '/images/ancora-delta.jpg',
  },
  {
    id: 'anc-002',
    nome: 'Ancora Delta 10kg',
    categoria: 'ancora',
    marca: 'Rocna',
    prezzo: 239,
    specs: { peso: 10, materiale: 'acciaio galvanizzato', tipo: 'delta' },
    compatibilita: { lunghezzaMin: 8, lunghezzaMax: 11 },
    linkAcquisto: 'https://www.nautica.it/ancora-delta-10kg',
    immagine: '/images/ancora-delta-10.jpg',
  },
  {
    id: 'anc-003',
    nome: 'Ancora Rocna 12kg',
    categoria: 'ancora',
    marca: 'Rocna',
    prezzo: 349,
    specs: { peso: 12, materiale: 'acciaio inox', tipo: 'rocna' },
    compatibilita: { lunghezzaMin: 10, lunghezzaMax: 13 },
    linkAcquisto: 'https://www.nautica.it/ancora-rocna-12kg',
    immagine: '/images/ancora-rocna.jpg',
  },
  {
    id: 'anc-004',
    nome: 'Ancora Rocna 15kg',
    categoria: 'ancora',
    marca: 'Rocna',
    prezzo: 449,
    specs: { peso: 15, materiale: 'acciaio inox', tipo: 'rocna' },
    compatibilita: { lunghezzaMin: 12, lunghezzaMax: 15 },
    linkAcquisto: 'https://www.nautica.it/ancora-rocna-15kg',
    immagine: '/images/ancora-rocna-15.jpg',
  },
  {
    id: 'anc-005',
    nome: 'Ancora CQR 7kg',
    categoria: 'ancora',
    marca: 'Simpson Lawrence',
    prezzo: 159,
    specs: { peso: 7, materiale: 'acciaio galvanizzato', tipo: 'cqr' },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 8 },
    linkAcquisto: 'https://www.nautica.it/ancora-cqr-7kg',
    immagine: '/images/ancora-cqr.jpg',
  },
  // AUTOPILOTI
  {
    id: 'aut-001',
    nome: 'Autopilota Tiller Pilot ST1000+',
    categoria: 'autopilota',
    marca: 'Raymarine',
    prezzo: 389,
    specs: { tipo: 'timoneria', potenzaW: 30, voltaggio: 12 },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 9 },
    linkAcquisto: 'https://www.nautica.it/autopilota-st1000',
    immagine: '/images/autopilota-tiller.jpg',
  },
  {
    id: 'aut-002',
    nome: 'Autopilota Wheel Pilot EV-100',
    categoria: 'autopilota',
    marca: 'Raymarine',
    prezzo: 899,
    specs: { tipo: 'cockpit', potenzaW: 60, voltaggio: 12 },
    compatibilita: { lunghezzaMin: 9, lunghezzaMax: 12 },
    linkAcquisto: 'https://www.nautica.it/autopilota-ev100',
    immagine: '/images/autopilota-wheel.jpg',
  },
  {
    id: 'aut-003',
    nome: 'Autopilota Cockpit Pro X5',
    categoria: 'autopilota',
    marca: 'Garmin',
    prezzo: 1199,
    specs: { tipo: 'cockpit', potenzaW: 80, voltaggio: 12 },
    compatibilita: { lunghezzaMin: 9, lunghezzaMax: 12 },
    linkAcquisto: 'https://www.nautica.it/autopilota-x5',
    immagine: '/images/autopilota-x5.jpg',
  },
  {
    id: 'aut-004',
    nome: 'Autopilota Idraulico EV-200',
    categoria: 'autopilota',
    marca: 'Raymarine',
    prezzo: 2499,
    specs: { tipo: 'idraulico', potenzaW: 120, voltaggio: 12 },
    compatibilita: { lunghezzaMin: 12, lunghezzaMax: 15 },
    linkAcquisto: 'https://www.nautica.it/autopilota-ev200',
    immagine: '/images/autopilota-idraulico.jpg',
  },
  {
    id: 'aut-005',
    nome: 'Autopilota Tiller Compact T100',
    categoria: 'autopilota',
    marca: 'Simrad',
    prezzo: 299,
    specs: { tipo: 'timoneria', potenzaW: 25, voltaggio: 12 },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 8 },
    linkAcquisto: 'https://www.nautica.it/autopilota-t100',
    immagine: '/images/autopilota-compact.jpg',
  },
  // ENERGIA
  {
    id: 'ene-001',
    nome: 'Batteria AGM 100Ah',
    categoria: 'energia',
    marca: 'Varta',
    prezzo: 279,
    specs: { capacitaAh: 100, voltaggio: 12, tipo: 'AGM', pesoKg: 28 },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 9 },
    linkAcquisto: 'https://www.nautica.it/batteria-agm-100',
    immagine: '/images/batteria-agm.jpg',
  },
  {
    id: 'ene-002',
    nome: 'Batteria Litio 120Ah LiFePO4',
    categoria: 'energia',
    marca: 'Victron',
    prezzo: 1199,
    specs: { capacitaAh: 120, voltaggio: 12, tipo: 'LiFePO4', pesoKg: 14 },
    compatibilita: { lunghezzaMin: 8, lunghezzaMax: 12 },
    linkAcquisto: 'https://www.nautica.it/batteria-litio-120',
    immagine: '/images/batteria-litio.jpg',
  },
  {
    id: 'ene-003',
    nome: 'Pannello Solare 200W',
    categoria: 'energia',
    marca: 'Solbian',
    prezzo: 549,
    specs: { capacitaAh: 160, potenzaW: 200, tipo: 'solare', pesoKg: 4.5 },
    compatibilita: { lunghezzaMin: 9, lunghezzaMax: 13 },
    linkAcquisto: 'https://www.nautica.it/pannello-200w',
    immagine: '/images/pannello-solare.jpg',
  },
  {
    id: 'ene-004',
    nome: 'Kit Solare 300W + Regolatore MPPT',
    categoria: 'energia',
    marca: 'Victron',
    prezzo: 1099,
    specs: { capacitaAh: 240, potenzaW: 300, tipo: 'solare', pesoKg: 8 },
    compatibilita: { lunghezzaMin: 11, lunghezzaMax: 15 },
    linkAcquisto: 'https://www.nautica.it/kit-solare-300w',
    immagine: '/images/kit-solare.jpg',
  },
  {
    id: 'ene-005',
    nome: 'Batteria AGM 80Ah',
    categoria: 'energia',
    marca: 'Banner',
    prezzo: 199,
    specs: { capacitaAh: 80, voltaggio: 12, tipo: 'AGM', pesoKg: 22 },
    compatibilita: { lunghezzaMin: 6, lunghezzaMax: 8 },
    linkAcquisto: 'https://www.nautica.it/batteria-agm-80',
    immagine: '/images/batteria-agm-80.jpg',
  },
]
```

- [ ] **Step 2: Crea `data/stores.ts`**

```typescript
import { Negozio } from '../types/searchResult'

export const stores: Negozio[] = [
  {
    id: 'neg-001',
    nome: 'Nautica Genova',
    citta: 'Genova',
    lat: 44.4056,
    lng: 8.9463,
    telefono: '+39 010 123 4567',
  },
  {
    id: 'neg-002',
    nome: 'Mare Equipment La Spezia',
    citta: 'La Spezia',
    lat: 44.1073,
    lng: 9.8289,
    telefono: '+39 0187 234 567',
  },
  {
    id: 'neg-003',
    nome: 'Vela e Mare Napoli',
    citta: 'Napoli',
    lat: 40.8518,
    lng: 14.2681,
    telefono: '+39 081 345 6789',
  },
  {
    id: 'neg-004',
    nome: 'Attrezzature Nautiche Palermo',
    citta: 'Palermo',
    lat: 38.1157,
    lng: 13.3615,
    telefono: '+39 091 456 7890',
  },
  {
    id: 'neg-005',
    nome: 'Sestante Livorno',
    citta: 'Livorno',
    lat: 43.5485,
    lng: 10.3106,
    telefono: '+39 0586 567 890',
  },
  {
    id: 'neg-006',
    nome: 'Porto Vecchio Marine Trieste',
    citta: 'Trieste',
    lat: 45.6495,
    lng: 13.7768,
    telefono: '+39 040 678 9012',
  },
  {
    id: 'neg-007',
    nome: 'Marina di Roma Fiumicino',
    citta: 'Fiumicino',
    lat: 41.7672,
    lng: 12.2298,
    telefono: '+39 06 789 0123',
  },
  {
    id: 'neg-008',
    nome: 'Adriatica Nautica Ancona',
    citta: 'Ancona',
    lat: 43.6158,
    lng: 13.5189,
    telefono: '+39 071 890 1234',
  },
]
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add data/
git commit -m "feat: add mock products (15) and stores (8 Italian locations)"
```

---

## Task 5: intentParser — rule-based

**Files:**
- Create: `lib/intentParser.ts`
- Create: `__tests__/lib/intentParser.test.ts`

- [ ] **Step 1: Scrivi il test (TDD — prima il test)**

Crea `__tests__/lib/intentParser.test.ts`:

```typescript
import { parse } from '../../lib/intentParser'

describe('intentParser.parse', () => {
  test('estrae lunghezza in metri', () => {
    const result = parse('ancora per barca da 10m')
    expect(result.lunghezzaBarca).toBe(10)
  })

  test('estrae lunghezza con parola "metri"', () => {
    const result = parse('barca 12 metri')
    expect(result.lunghezzaBarca).toBe(12)
  })

  test('estrae lunghezza con "mt"', () => {
    const result = parse('vela 9mt')
    expect(result.lunghezzaBarca).toBe(9)
  })

  test('estrae categoria ancora', () => {
    const result = parse('ancora per barca')
    expect(result.categoria).toBe('ancora')
  })

  test('estrae categoria ancora da "anchor"', () => {
    const result = parse('anchor 10m')
    expect(result.categoria).toBe('ancora')
  })

  test('estrae categoria autopilota', () => {
    const result = parse('autopilota per vela')
    expect(result.categoria).toBe('autopilota')
  })

  test('estrae categoria autopilota da "pilota automatico"', () => {
    const result = parse('pilota automatico 11m')
    expect(result.categoria).toBe('autopilota')
  })

  test('estrae categoria energia da "batterie"', () => {
    const result = parse('batterie per barca 10m')
    expect(result.categoria).toBe('energia')
  })

  test('estrae categoria energia da "solare"', () => {
    const result = parse('pannello solare 12m')
    expect(result.categoria).toBe('energia')
  })

  test('confidence alta quando categoria e lunghezza estratti', () => {
    const result = parse('ancora per barca da 10m')
    expect(result.confidence).toBe('alta')
  })

  test('confidence media quando solo categoria', () => {
    const result = parse('ancora')
    expect(result.confidence).toBe('media')
  })

  test('confidence media quando solo lunghezza', () => {
    const result = parse('barca 10m')
    expect(result.confidence).toBe('media')
  })

  test('confidence bassa quando nulla estratto', () => {
    const result = parse('voglio qualcosa')
    expect(result.confidence).toBe('bassa')
  })

  test('rawQuery è preservata', () => {
    const result = parse('ancora per barca da 10m')
    expect(result.rawQuery).toBe('ancora per barca da 10m')
  })

  test('lunghezza decimale', () => {
    const result = parse('barca 10.5m')
    expect(result.lunghezzaBarca).toBe(10.5)
  })
})
```

- [ ] **Step 2: Esegui il test per verificare che fallisca**

```bash
npm test -- intentParser
```

Expected: FAIL con "Cannot find module '../../lib/intentParser'"

- [ ] **Step 3: Implementa `lib/intentParser.ts`**

```typescript
import { ParsedQuery, Categoria, Confidence } from '../types/parsedQuery'

export function parse(rawQuery: string): ParsedQuery {
  const lower = rawQuery.toLowerCase().trim()
  const lunghezzaBarca = extractLunghezza(lower)
  const categoria = extractCategoria(lower)

  const confidence: Confidence =
    lunghezzaBarca !== null && categoria !== null ? 'alta' :
    lunghezzaBarca !== null || categoria !== null ? 'media' : 'bassa'

  return { categoria, lunghezzaBarca, rawQuery, confidence }
}

function extractLunghezza(query: string): number | null {
  const match = query.match(/(\d+(?:\.\d+)?)\s*(?:m|metri|mt)\b/)
  if (match) return parseFloat(match[1])
  return null
}

function extractCategoria(query: string): Categoria | null {
  if (/ancora|anchor|ancoraggio/.test(query)) return 'ancora'
  if (/autopilot|pilota\s*auto|pilota\s+automatico/.test(query)) return 'autopilota'
  if (/batter|solar|energia|pannello/.test(query)) return 'energia'
  return null
}
```

- [ ] **Step 4: Esegui il test per verificare che passi**

```bash
npm test -- intentParser
```

Expected: PASS — 16 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/intentParser.ts __tests__/lib/intentParser.test.ts
git commit -m "feat: add intentParser with rule-based extraction (TDD)"
```

---

## Task 6: matchingEngine

**Files:**
- Create: `lib/matchingEngine.ts`
- Create: `__tests__/lib/matchingEngine.test.ts`

- [ ] **Step 1: Scrivi il test**

Crea `__tests__/lib/matchingEngine.test.ts`:

```typescript
import { match } from '../../lib/matchingEngine'
import { products } from '../../data/products'
import { ParsedQuery } from '../../types/parsedQuery'

describe('matchingEngine.match', () => {
  test('ritorna ancore compatibili per barca 10m', () => {
    const query: ParsedQuery = {
      categoria: 'ancora',
      lunghezzaBarca: 10,
      rawQuery: 'ancora 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(p => expect(p.categoria).toBe('ancora'))
  })

  test('esclude ancore fuori range per barca 10m', () => {
    const query: ParsedQuery = {
      categoria: 'ancora',
      lunghezzaBarca: 10,
      rawQuery: 'ancora 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    // peso ideale = 10kg, range 8–12kg
    results.forEach(p => {
      const peso = p.specs.peso as number
      expect(peso).toBeGreaterThanOrEqual(8)
      expect(peso).toBeLessThanOrEqual(12)
    })
  })

  test('ogni risultato ha punteggio > 0', () => {
    const query: ParsedQuery = {
      categoria: 'ancora',
      lunghezzaBarca: 10,
      rawQuery: 'ancora 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    results.forEach(p => expect(p.punteggio).toBeGreaterThan(0))
  })

  test('ogni risultato ha spiegazione non vuota', () => {
    const query: ParsedQuery = {
      categoria: 'ancora',
      lunghezzaBarca: 10,
      rawQuery: 'ancora 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    results.forEach(p => expect(p.spiegazione.length).toBeGreaterThan(0))
  })

  test('autopilota cockpit per barca 10m', () => {
    const query: ParsedQuery = {
      categoria: 'autopilota',
      lunghezzaBarca: 10,
      rawQuery: 'autopilota 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(p => expect(p.specs.tipo).toBe('cockpit'))
  })

  test('autopilota timoneria per barca 7m', () => {
    const query: ParsedQuery = {
      categoria: 'autopilota',
      lunghezzaBarca: 7,
      rawQuery: 'autopilota 7m',
      confidence: 'alta',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(p => expect(p.specs.tipo).toBe('timoneria'))
  })

  test('autopilota idraulico per barca 13m', () => {
    const query: ParsedQuery = {
      categoria: 'autopilota',
      lunghezzaBarca: 13,
      rawQuery: 'autopilota 13m',
      confidence: 'alta',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
    results.forEach(p => expect(p.specs.tipo).toBe('idraulico'))
  })

  test('energia per barca 10m filtra batterie con capacità sufficiente', () => {
    const query: ParsedQuery = {
      categoria: 'energia',
      lunghezzaBarca: 10,
      rawQuery: 'batterie 10m',
      confidence: 'alta',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
    // baseline = 10 * 10 = 100Ah, min = 80Ah
    results.forEach(p => {
      const capacita = p.specs.capacitaAh as number
      expect(capacita).toBeGreaterThanOrEqual(80)
    })
  })

  test('ritorna array vuoto se categoria null', () => {
    const query: ParsedQuery = {
      categoria: null,
      lunghezzaBarca: 10,
      rawQuery: '10m',
      confidence: 'media',
    }
    const results = match(query, products)
    expect(results).toHaveLength(0)
  })

  test('ritorna prodotti senza filtro lunghezza se lunghezza null', () => {
    const query: ParsedQuery = {
      categoria: 'ancora',
      lunghezzaBarca: null,
      rawQuery: 'ancora',
      confidence: 'media',
    }
    const results = match(query, products)
    expect(results.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Esegui il test per verificare che fallisca**

```bash
npm test -- matchingEngine
```

Expected: FAIL con "Cannot find module '../../lib/matchingEngine'"

- [ ] **Step 3: Implementa `lib/matchingEngine.ts`**

```typescript
import { ParsedQuery } from '../types/parsedQuery'
import { Prodotto, ProdottoConSpiegazione } from '../types/product'
import {
  ANCORA_RULES,
  AUTOPILOTA_RULES,
  ENERGIA_RULES,
  TipoAutopilota,
} from '../constants/boatRules'

export function match(
  query: ParsedQuery,
  products: Prodotto[]
): ProdottoConSpiegazione[] {
  if (!query.categoria) return []

  return products
    .filter(p => p.categoria === query.categoria)
    .map(p => score(p, query))
    .filter((p): p is ProdottoConSpiegazione => p !== null)
}

function score(
  prodotto: Prodotto,
  query: ParsedQuery
): ProdottoConSpiegazione | null {
  if (prodotto.categoria === 'ancora') return scoreAncora(prodotto, query.lunghezzaBarca)
  if (prodotto.categoria === 'autopilota') return scoreAutopilota(prodotto, query.lunghezzaBarca)
  if (prodotto.categoria === 'energia') return scoreEnergia(prodotto, query.lunghezzaBarca)
  return null
}

function scoreAncora(
  prodotto: Prodotto,
  lunghezza: number | null
): ProdottoConSpiegazione | null {
  if (lunghezza === null) {
    return { ...prodotto, spiegazione: 'Ancora compatibile con barche a vela', punteggio: 50 }
  }
  const pesoIdeale = lunghezza * ANCORA_RULES.pesoPerMetro
  const min = pesoIdeale * (1 - ANCORA_RULES.tolleranza)
  const max = pesoIdeale * (1 + ANCORA_RULES.tolleranza)
  const peso = prodotto.specs.peso as number

  if (peso < min || peso > max) return null

  const distanza = Math.abs(peso - pesoIdeale) / (pesoIdeale * ANCORA_RULES.tolleranza)
  const punteggio = Math.round(100 * (1 - distanza))

  return {
    ...prodotto,
    spiegazione: `Peso ${peso}kg — ideale per barche ${Math.round(min / ANCORA_RULES.pesoPerMetro)}–${Math.round(max / ANCORA_RULES.pesoPerMetro)}m`,
    punteggio,
  }
}

function scoreAutopilota(
  prodotto: Prodotto,
  lunghezza: number | null
): ProdottoConSpiegazione | null {
  if (lunghezza === null) {
    return { ...prodotto, spiegazione: 'Autopilota compatibile con barche a vela', punteggio: 50 }
  }

  const tipoRichiesto: TipoAutopilota =
    lunghezza < AUTOPILOTA_RULES.timoneria.max ? 'timoneria' :
    lunghezza <= AUTOPILOTA_RULES.cockpit.max ? 'cockpit' : 'idraulico'

  if (prodotto.specs.tipo !== tipoRichiesto) return null

  const rangeLabel =
    tipoRichiesto === 'timoneria' ? `fino a ${AUTOPILOTA_RULES.timoneria.max}m` :
    tipoRichiesto === 'cockpit' ? `${AUTOPILOTA_RULES.cockpit.min}–${AUTOPILOTA_RULES.cockpit.max}m` :
    `oltre ${AUTOPILOTA_RULES.idraulico.min}m`

  return {
    ...prodotto,
    spiegazione: `Autopilota ${tipoRichiesto} — indicato per barche ${rangeLabel}`,
    punteggio: 80,
  }
}

function scoreEnergia(
  prodotto: Prodotto,
  lunghezza: number | null
): ProdottoConSpiegazione | null {
  if (lunghezza === null) {
    return { ...prodotto, spiegazione: 'Adatto a barche a vela', punteggio: 50 }
  }

  const ahBaseline = lunghezza * ENERGIA_RULES.ahPerMetro
  const ahMin = ahBaseline * (1 - ENERGIA_RULES.tolleranza)
  const capacita = prodotto.specs.capacitaAh as number

  if (capacita < ahMin) return null

  const punteggio = Math.min(100, Math.round(80 + ((capacita - ahBaseline) / ahBaseline) * 20))

  return {
    ...prodotto,
    spiegazione: `Capacità ${capacita}Ah — sufficiente per una barca da ${lunghezza}m (baseline: ${ahBaseline}Ah)`,
    punteggio,
  }
}
```

- [ ] **Step 4: Esegui il test per verificare che passi**

```bash
npm test -- matchingEngine
```

Expected: PASS — 10 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/matchingEngine.ts __tests__/lib/matchingEngine.test.ts
git commit -m "feat: add matchingEngine with scoring for ancora/autopilota/energia (TDD)"
```

---

## Task 7: llmParser stub

**Files:**
- Create: `lib/llmParser.ts`

- [ ] **Step 1: Crea `lib/llmParser.ts`**

```typescript
import { ParsedQuery } from '../types/parsedQuery'

// Stub — ritorna null, così intentParser rimane attivo.
// Per attivare LLM: sostituire il corpo con la chiamata API.
export async function parseWithLLM(_rawQuery: string): Promise<ParsedQuery | null> {
  return null
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add lib/llmParser.ts
git commit -m "feat: add llmParser stub (ready for future LLM plug-in)"
```

---

## Task 8: searchService — pipeline esplicita

**Files:**
- Create: `services/searchService.ts`
- Create: `__tests__/services/searchService.test.ts`

- [ ] **Step 1: Scrivi il test**

Crea `__tests__/services/searchService.test.ts`:

```typescript
import { search } from '../../services/searchService'

describe('searchService.search', () => {
  test('ritorna struttura RisultatoRicerca valida', async () => {
    const result = await search('ancora per barca da 10m')
    expect(result).toHaveProperty('prodotti')
    expect(result).toHaveProperty('negozi')
    expect(result).toHaveProperty('queryInterpretata')
  })

  test('prodotti sono ordinati per punteggio decrescente', async () => {
    const result = await search('ancora 10m')
    const scores = result.prodotti.map(p => p.punteggio)
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1])
    }
  })

  test('queryInterpretata per "ancora 10m"', async () => {
    const result = await search('ancora 10m')
    expect(result.queryInterpretata).toBe('Ancora per barca da 10m')
  })

  test('queryInterpretata per "autopilota" senza lunghezza', async () => {
    const result = await search('autopilota')
    expect(result.queryInterpretata).toBe('Autopilota')
  })

  test('negozi sempre presenti (mock)', async () => {
    const result = await search('ancora 10m')
    expect(result.negozi.length).toBeGreaterThan(0)
  })

  test('prodotti vuoti per query senza categoria', async () => {
    const result = await search('voglio qualcosa')
    expect(result.prodotti).toHaveLength(0)
  })

  test('prodotti filtrati per autopilota cockpit 11m', async () => {
    const result = await search('autopilota 11m')
    result.prodotti.forEach(p => expect(p.specs.tipo).toBe('cockpit'))
  })
})
```

- [ ] **Step 2: Esegui il test per verificare che fallisca**

```bash
npm test -- searchService
```

Expected: FAIL con "Cannot find module '../../services/searchService'"

- [ ] **Step 3: Implementa `services/searchService.ts`**

```typescript
import { parse } from '../lib/intentParser'
import { parseWithLLM } from '../lib/llmParser'
import { match } from '../lib/matchingEngine'
import { products } from '../data/products'
import { stores } from '../data/stores'
import { ParsedQuery } from '../types/parsedQuery'
import { ProdottoConSpiegazione } from '../types/product'
import { RisultatoRicerca, Negozio } from '../types/searchResult'

export async function search(rawQuery: string): Promise<RisultatoRicerca> {
  const parsed = await doParse(rawQuery)
  const enriched = enrich(parsed)
  const matched = match(enriched, products)
  const ranked = rank(matched)
  const negozi = getNearbyStores()
  return buildResponse(ranked, negozi, parsed)
}

async function doParse(rawQuery: string): Promise<ParsedQuery> {
  const llmResult = await parseWithLLM(rawQuery)
  if (llmResult !== null) return llmResult
  return parse(rawQuery)
}

function enrich(parsed: ParsedQuery): ParsedQuery {
  return parsed
}

function rank(prodotti: ProdottoConSpiegazione[]): ProdottoConSpiegazione[] {
  return [...prodotti].sort((a, b) => b.punteggio - a.punteggio)
}

function getNearbyStores(): Negozio[] {
  return stores
}

function buildResponse(
  prodotti: ProdottoConSpiegazione[],
  negozi: Negozio[],
  parsed: ParsedQuery
): RisultatoRicerca {
  return { prodotti, negozi, queryInterpretata: buildQueryLabel(parsed) }
}

function buildQueryLabel(parsed: ParsedQuery): string {
  const cat = parsed.categoria
    ? parsed.categoria.charAt(0).toUpperCase() + parsed.categoria.slice(1)
    : 'Prodotto'
  const barca = parsed.lunghezzaBarca ? ` per barca da ${parsed.lunghezzaBarca}m` : ''
  return `${cat}${barca}`
}
```

- [ ] **Step 4: Esegui il test per verificare che passi**

```bash
npm test -- searchService
```

Expected: PASS — 7 tests.

- [ ] **Step 5: Esegui tutti i test**

```bash
npm test
```

Expected: PASS — tutti i test (intentParser + matchingEngine + searchService).

- [ ] **Step 6: Commit**

```bash
git add services/searchService.ts __tests__/services/searchService.test.ts
git commit -m "feat: add searchService pipeline (parse→enrich→match→rank→stores→response)"
```

---

## Task 9: API Route

**Files:**
- Create: `app/api/search/route.ts`

- [ ] **Step 1: Crea `app/api/search/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { search } from '../../../services/searchService'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: 'Parametro q mancante' }, { status: 400 })
  }

  const risultati = await search(q.trim())
  return NextResponse.json(risultati)
}
```

- [ ] **Step 2: Avvia il server di sviluppo e testa manualmente**

```bash
npm run dev
```

Apri nel browser: `http://localhost:3000/api/search?q=ancora+10m`

Expected: JSON con `prodotti`, `negozi`, `queryInterpretata`.

Testa anche: `http://localhost:3000/api/search?q=autopilota+12m`

- [ ] **Step 3: Ferma il server e fai commit**

```bash
git add app/api/search/route.ts
git commit -m "feat: add GET /api/search route"
```

---

## Task 10: Componente SearchBar

**Files:**
- Create: `components/SearchBar.tsx`

- [ ] **Step 1: Crea `components/SearchBar.tsx`**

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/risultati?q=${encodeURIComponent(query.trim())}`)
  }

  const suggerimenti = ['ancora 10m', 'autopilota 12m', 'batterie barca vela']

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="es. ancora per barca da 10m"
          className="flex-1 rounded-full border border-gray-300 px-6 py-3 text-lg shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Cerca
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-sm text-gray-500">
        <span>Prova:</span>
        {suggerimenti.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s)
              router.push(`/risultati?q=${encodeURIComponent(s)}`)
            }}
            className="hover:text-blue-600 underline underline-offset-2 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/SearchBar.tsx
git commit -m "feat: add SearchBar component with suggestions"
```

---

## Task 11: Componente ProductCard

**Files:**
- Create: `components/ProductCard.tsx`

- [ ] **Step 1: Crea `components/ProductCard.tsx`**

```tsx
import { ProdottoConSpiegazione } from '../types/product'

interface Props {
  prodotto: ProdottoConSpiegazione
}

export function ProductCard({ prodotto }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{prodotto.nome}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{prodotto.marca}</p>
        </div>
        <span className="text-lg font-bold text-blue-600 whitespace-nowrap ml-3">
          €{prodotto.prezzo.toLocaleString('it-IT')}
        </span>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm text-emerald-800">
        ✓ {prodotto.spiegazione}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(prodotto.specs).map(([k, v]) => (
          <span
            key={k}
            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md"
          >
            {k}: {v}
          </span>
        ))}
      </div>

      <a
        href={prodotto.linkAcquisto}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Acquista online →
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat: add ProductCard component"
```

---

## Task 12: Componente ProductList

**Files:**
- Create: `components/ProductList.tsx`

- [ ] **Step 1: Crea `components/ProductList.tsx`**

```tsx
import { ProdottoConSpiegazione } from '../types/product'
import { ProductCard } from './ProductCard'

interface Props {
  prodotti: ProdottoConSpiegazione[]
}

export function ProductList({ prodotti }: Props) {
  if (prodotti.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        <p className="text-lg">Nessun prodotto trovato.</p>
        <p className="text-sm mt-2">Prova con una ricerca diversa, es. "ancora 10m" o "autopilota 12m".</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prodotti.map(p => (
        <ProductCard key={p.id} prodotto={p} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/ProductList.tsx
git commit -m "feat: add ProductList component with empty state"
```

---

## Task 13: Componente MapView (Leaflet)

**Files:**
- Create: `components/MapView.tsx`

- [ ] **Step 1: Crea `components/MapView.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { Negozio } from '../types/searchResult'

interface Props {
  negozi: Negozio[]
}

export function MapView({ negozi }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then(L => {
      // Fix per icone default di Leaflet con Next.js (webpack rompe i path)
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView([41.9, 12.5], 5)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      negozi.forEach(n => {
        L.marker([n.lat, n.lng])
          .addTo(map)
          .bindPopup(
            `<strong>${n.nome}</strong><br/>${n.citta}<br/><a href="tel:${n.telefono}">${n.telefono}</a>`
          )
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="h-72 w-full rounded-xl overflow-hidden border border-gray-200"
      style={{ zIndex: 0 }}
    />
  )
}
```

- [ ] **Step 2: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Expected: nessun errore.

- [ ] **Step 3: Commit**

```bash
git add components/MapView.tsx
git commit -m "feat: add MapView component (Leaflet + OpenStreetMap, client-only)"
```

---

## Task 14: Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Sostituisci il contenuto di `app/page.tsx`**

```tsx
import { SearchBar } from '../components/SearchBar'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          Veleggiamo
        </h1>
        <p className="text-gray-500 text-xl max-w-md mx-auto">
          Trova l&apos;attrezzatura giusta per la tua barca a vela
        </p>
      </div>
      <SearchBar />
      <p className="mt-12 text-xs text-gray-400">
        Ancore · Autopiloti · Sistemi Energia — barche 6–15m
      </p>
    </main>
  )
}
```

- [ ] **Step 2: Avvia il server e verifica visivamente**

```bash
npm run dev
```

Apri `http://localhost:3000`. Verifica:
- Titolo "Veleggiamo" centrato
- Search bar con placeholder corretto
- 3 suggerimenti cliccabili sotto la barra
- Click su "ancora 10m" → redirect a `/risultati?q=ancora+10m`

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add homepage with centered search bar"
```

---

## Task 15: Pagina Risultati

**Files:**
- Create: `app/risultati/page.tsx`

- [ ] **Step 1: Crea la directory e il file**

```bash
mkdir -p app/risultati
```

Crea `app/risultati/page.tsx`:

```tsx
import { search } from '../../services/searchService'
import { ProductList } from '../../components/ProductList'
import { MapView } from '../../components/MapView'
import { SearchBar } from '../../components/SearchBar'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function RisultatiPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams
  const query = rawQ?.trim() ?? ''

  if (!query) {
    return (
      <main className="min-h-screen p-8">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Torna alla ricerca
        </Link>
        <p className="mt-4 text-gray-500">Inserisci una ricerca per vedere i risultati.</p>
      </main>
    )
  }

  const risultati = await search(query)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-gray-900 shrink-0">
            Veleggiamo
          </Link>
          <div className="flex-1 max-w-xl">
            <SearchBar defaultValue={query} />
          </div>
        </div>
      </header>

      {/* Contenuto */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Intestazione risultati */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Risultati per:{' '}
            <span className="text-blue-600">{risultati.queryInterpretata}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {risultati.prodotti.length} prodott{risultati.prodotti.length === 1 ? 'o' : 'i'} trovat{risultati.prodotti.length === 1 ? 'o' : 'i'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prodotti */}
          <div className="lg:col-span-2">
            <ProductList prodotti={risultati.prodotti} />
          </div>

          {/* Sidebar negozi */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Negozi vicini</h3>
            <MapView negozi={risultati.negozi} />
            <div className="mt-4 space-y-2">
              {risultati.negozi.slice(0, 5).map(n => (
                <div
                  key={n.id}
                  className="bg-white rounded-lg p-3 border border-gray-200 text-sm"
                >
                  <p className="font-medium text-gray-900">{n.nome}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {n.citta} ·{' '}
                    <a href={`tel:${n.telefono}`} className="hover:text-blue-600">
                      {n.telefono}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Avvia il server e testa il flusso completo**

```bash
npm run dev
```

Testa i seguenti URL e verifica visivamente:

1. `http://localhost:3000/risultati?q=ancora+10m`
   - Expected: 2–3 ancore con peso 8–12kg, spiegazione verde, mappa Italia con pin, lista negozi

2. `http://localhost:3000/risultati?q=autopilota+12m`
   - Expected: autopiloti cockpit, spiegazione corretta

3. `http://localhost:3000/risultati?q=batterie+vela+10m`
   - Expected: batterie con capacità ≥ 80Ah

4. `http://localhost:3000/risultati?q=voglio+qualcosa`
   - Expected: "Nessun prodotto trovato"

5. `http://localhost:3000/risultati` (senza q)
   - Expected: messaggio "Inserisci una ricerca"

- [ ] **Step 3: Commit**

```bash
git add app/risultati/
git commit -m "feat: add risultati page (Server Component, pipeline completa)"
```

---

## Task 16: Build finale e smoke test

**Files:** nessuna modifica

- [ ] **Step 1: Esegui tutti i test unitari**

```bash
npm test
```

Expected: PASS — tutti i test (intentParser + matchingEngine + searchService).

- [ ] **Step 2: Build di produzione**

```bash
npm run build
```

Expected: Build successful, nessun errore TypeScript o lint.

- [ ] **Step 3: Avvia la build di produzione e verifica**

```bash
npm start
```

Apri `http://localhost:3000` e ripeti i test manuali del Task 15.

- [ ] **Step 4: Commit finale**

```bash
git add .
git commit -m "feat: MVP complete — Veleggiamo sailboat intelligence platform"
```

---

## Come avviare il progetto

```bash
cd "C:/Users/Admin/Veleggiamo/veleggiamo"
npm install
npm run dev        # sviluppo: http://localhost:3000
npm test           # unit test
npm run build      # build produzione
```

---

## Self-Review

**Spec coverage:**
- ✅ Homepage con search bar centrata (Task 14)
- ✅ Endpoint `/api/search?q=` (Task 9)
- ✅ Pagina risultati con prodotti + spiegazione + mappa + negozi (Task 15)
- ✅ ProductCard con nome/specs/spiegazione/link (Task 11)
- ✅ MapView Leaflet + dati fake (Task 13)
- ✅ Pipeline deterministica 6 step (Task 8)
- ✅ intentParser rule-based + stub LLM (Task 5, 7)
- ✅ matchingEngine per ancora/autopilota/energia (Task 6)
- ✅ Tipi separati per dominio (Task 2)
- ✅ Costanti separate in boatRules (Task 3)
- ✅ Mock 15 prodotti + 8 negozi italiani (Task 4)
- ✅ UI in italiano

**Type consistency:** tutti i tipi definiti in Task 2 usati consistentemente in Tasks 5–15. `ProdottoConSpiegazione` estende `Prodotto` e aggiunge `spiegazione: string` e `punteggio: number`. `match()` riceve `(ParsedQuery, Prodotto[])` e ritorna `ProdottoConSpiegazione[]` in ogni task che la referenzia.

**No placeholders:** nessun TBD, ogni step ha codice completo.
