# Veleggiamo — Sito SEO Gite in Barca: Design Spec

**Data:** 2026-04-23  
**Stato:** Approvato  
**Scope:** Pivot completo — da marketplace attrezzatura a sito SEO gite in barca in Italia

---

## 1. Contesto e strategia

Veleggiamo pivota da marketplace B2B (attrezzatura nautica) a sito SEO-first sulle gite in barca in Italia.

**Strategia a fasi:**
- **Fase 1 (0–6 mesi):** SEO puro + affiliazione (Viator, GetYourGuide) — zero operatività
- **Fase 2 (6–12 mesi):** Contatti fornitori locali diretti, commissioni 15–25%
- **Fase 3 (opzionale):** Mini-marketplace, solo se giustificato dal traffico

**Principio fondamentale:** il vero asset è il traffico qualificato sulle destinazioni. Costruire prima la rilevanza, poi la piattaforma.

---

## 2. Stack tecnico

| Elemento | Scelta | Note |
|----------|--------|------|
| Framework | Next.js 16 (App Router) | già installato |
| Styling | Tailwind v4 | già installato |
| Componenti | shadcn/ui (Card, Badge, Button) | già installato |
| Font | Inter via `next/font/google` | sostituisce Geist |
| MDX | `next-mdx-remote` + `gray-matter` | da installare |
| Auth | Clerk | rimane, nascosto nel frontend pubblico |
| DB | Supabase | già configurato, usato in Fase 2 per eventi |
| SEO | `generateMetadata()` nativo Next.js | niente librerie extra |

**Dipendenze da aggiungere:**
```
npm install next-mdx-remote gray-matter
```

---

## 3. Struttura file

```
src/
├── app/
│   ├── destinazioni/
│   │   ├── page.tsx                    ← index: lista tutte le destinazioni
│   │   └── [slug]/page.tsx             ← + generateStaticParams
│   ├── articoli/
│   │   ├── page.tsx                    ← index: lista articoli
│   │   └── [slug]/page.tsx             ← + generateStaticParams
│   ├── gite/
│   │   └── [slug]/page.tsx             ← placeholder (Day 4+)
│   ├── layout.tsx                      ← Navbar + Footer + global metadata
│   └── page.tsx                        ← homepage (Server Component)
│
├── components/
│   ├── Navbar.tsx                      ← Server Component
│   ├── NavbarLinks.tsx                 ← Client Component (usePathname per active state)
│   ├── NavbarMobile.tsx                ← Client Component (useState per hamburger)
│   ├── Footer.tsx                      ← Server Component
│   ├── ExperienceCard.tsx              ← riusabile su tutte le pagine
│   ├── ArticleCard.tsx
│   └── DestinationCard.tsx
│
├── content/
│   ├── articoli/
│   │   └── gite-barca-sicilia.mdx      ← primo articolo (Day 3)
│   └── destinazioni/
│       ├── sicilia.mdx
│       ├── sardegna.mdx
│       ├── costiera-amalfitana.mdx
│       └── venezia.mdx
│
├── lib/
│   ├── content/
│   │   ├── articles.ts                 ← getArticle, getArticles, getAllArticleSlugs
│   │   └── destinations.ts             ← getDestination, getAllDestinations, getAllDestinationSlugs
│   ├── data/
│   │   ├── experiences.ts              ← getExperiences, getExperience
│   │   └── events.ts                   ← getEvents
│   └── config/
│       └── site.ts                     ← siteConfig
│
└── types/
    ├── article.ts
    └── experience.ts
```

**Codice eliminato dal repo precedente:**
- `src/components/SearchBar.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductList.tsx`
- `src/components/FornitoreForm.tsx`
- `src/components/MapView.tsx`
- `src/app/dashboard/`
- `src/app/risultati/`
- `src/app/fornitore/`
- `src/app/per-fornitori/`
- `src/app/api/search/`
- `src/app/api/lead/`
- `src/app/api/upload-catalog/`
- `src/app/api/widget/`
- `src/data/products.ts`, `stores.ts`, `suppliers.ts`
- `src/services/searchService.ts`
- `src/lib/matchingEngine.ts`, `intentParser.ts`
- `src/constants/boatRules.ts`

**Mantenuto:**
- `src/lib/supabase.ts`
- `src/lib/db.ts`
- `src/lib/utils.ts`
- `src/components/ui/` (badge, button, card, input)
- Clerk (ClerkProvider in layout, sign-in/sign-up pages)

---

## 4. Tipi TypeScript

### `types/article.ts`
```ts
export type ArticleMeta = {
  title: string
  description: string
  slug: string
  destination: string
  publishedAt: string
  updatedAt?: string
  coverImage: string
  readingTime?: number        // calcolato da articles.ts (parole / 200)
  seo?: {
    title?: string
    description?: string
  }
}
```

### `types/experience.ts`
```ts
export type Experience = {
  id: string
  slug: string
  title: string
  description: string
  destination: string
  price: string
  duration: string
  rating: number
  reviewCount: number
  image: string
  affiliateUrl: string
  affiliateSource: 'viator' | 'getyourguide' | 'direct'
  order?: number              // ordinamento semi-curato
  includes?: string[]
  departureInfo?: string
  featured?: boolean
  cancellation?: string       // es. "Cancellazione gratuita fino a 24h"
  isIdealFor?: string[]       // es. ["coppie", "relax", "famiglie"]
  notIdealFor?: string[]      // es. ["gruppi numerosi", "chi ha poco tempo"]
}
```

### Destinazione (inline in `destinations.ts`, non un type file separato)
```ts
type DestinationMeta = {
  slug: string
  name: string
  tagline: string
  coverImage: string
  publishedAt: string
}
```

---

## 5. Data layer (`/lib/data/`)

**Principio:** il frontend chiama sempre una funzione — mai import diretto dei dati.

```ts
// lib/data/experiences.ts
export async function getExperiences(params?: {
  destination?: string
  limit?: number
  featured?: boolean
}): Promise<Experience[]>

export async function getExperience(slug: string): Promise<Experience | null>
```

```ts
// lib/data/events.ts
export async function getEvents(params?: {
  limit?: number
}): Promise<Event[]>
```

**Day 1–3:** le funzioni ritornano dati mock hardcoded.  
**Fase 2:** si swappa l'implementazione interna con Supabase — il frontend non cambia.

---

## 6. siteConfig (`/lib/config/site.ts`)

```ts
export const siteConfig = {
  name: "Veleggiamo",
  tagline: "Scopri le migliori gite in barca in Italia",
  domain: "https://veleggiamo.com",
  nav: [
    { label: "Destinazioni", href: "/destinazioni" },
    { label: "Articoli",     href: "/articoli" },
    { label: "Esperienze",   href: "/gite" },
  ],
  defaultOgImage: "/og-default.jpg",
}
```

---

## 7. Homepage (`/`)

**Tipo:** Server Component (niente `'use client'`).

**5 sezioni:**

1. **Hero**
   - Immagine mare full-width con overlay
   - H1: "Scopri le migliori gite in barca in Italia"
   - Paragrafo SEO 50–80 parole con keyword: "gite in barca in Italia", "escursioni in mare", "esperienze costiere"
   - CTA primaria: "Scopri le gite" → `/destinazioni`
   - CTA secondaria soft: "Leggi le guide" → `/articoli`
   - Micro-proof: "Oltre 500+ esperienze selezionate in tutta Italia"

2. **Destinazioni** (griglia 2×2 mobile, 4 colonne desktop)
   - 4 destinazioni hardcoded con `DestinationCard`
   - Ogni card: immagine, nome, tagline
   - Link → `/destinazioni/[slug]`

3. **Top Esperienze** — titolo: "Le nostre scelte migliori" + sub "Selezionate dalla redazione"
   - `getExperiences({ limit: 3, featured: true })`
   - `ExperienceCard` × 3

4. **Guide** (non "Articoli recenti") — titolo: "Guide per organizzare la tua gita"
   - `getArticles({ limit: 3 })`
   - `ArticleCard` × 3

5. **Banner eventi** — titolo: "Eventi da non perdere questo mese"
   - `getEvents({ limit: 2 })`
   - Stile editoriale, non pubblicitario (sfondo `amber-50`)

**Metadata homepage:**
```ts
export const metadata: Metadata = {
  title: "Veleggiamo — Gite in Barca in Italia",
  description: "Scopri le migliori escursioni e gite in barca in Italia. Guide, destinazioni e esperienze selezionate.",
  openGraph: { images: [siteConfig.defaultOgImage] }
}
```

---

## 8. Pagina Destinazione (`/destinazioni/[slug]`)

**Tipo:** Server Component + `generateStaticParams`.

**Struttura (8 blocchi):**

1. **Header:** H1 "Gite in barca in [Nome]" + sottotitolo "Escursioni, tour e esperienze selezionate lungo la costa"
2. **Intro MDX:** hook emozionale + info pratica (periodo migliore, cosa aspettarsi)
3. **Top 3 Esperienze:** titolo "Le migliori gite in barca in [Nome]" + sub "Selezionate dalla redazione" — ordine semi-curato (`order` field)
4. **Lista esperienze:** prime 6–9 + "Mostra altre esperienze" (paginazione semplice, Day 4+)
5. **Cosa sapere:** bullet points scansionabili (💰 Prezzi medi, 📅 Quando andare, ⏱️ Durata)
6. **FAQ:** 3–4 domande + JSON-LD FAQ schema (rich snippet)
7. **Articoli correlati:** `getArticles({ destination: slug, limit: 3 })` + `ArticleCard` × 3
8. **Contenuto MDX:** separato semanticamente in `intro` (top) e `guida` (bottom dello stesso file)

**generateMetadata:**
```ts
title: "Gite in barca in Sicilia — Veleggiamo"
description: dal frontmatter MDX
canonical: `${siteConfig.domain}/destinazioni/${slug}`
```

---

## 9. Pagina Articolo (`/articoli/[slug]`)

**Tipo:** Server Component + `generateStaticParams`.

**Frontmatter:**
```yaml
title: "Le migliori gite in barca in Sicilia (2026)"
description: "Guida completa..."
slug: gite-barca-sicilia
destination: sicilia
publishedAt: "2026-04-23"
updatedAt: "2026-04-23"
coverImage: /images/articoli/sicilia-cover.jpg
seo:
  title: "Gite in Barca in Sicilia 2026 — Guida Completa | Veleggiamo"
  description: "Scopri le migliori escursioni..."
```

**Layout:** 2 colonne desktop (main 70% + sidebar 30%), 1 colonna mobile.

**Main:**
- Info rapide: 📍 Destinazione, ⏱️ Tempo lettura, 📅 Aggiornato
- TOC cliccabile (generato dai titoli `##`)
- Mini-box soft "above fold": "Vuoi vedere subito le migliori gite? → [3 consigliate]"
- Corpo MDX
- Box "Esperienze consigliate in [Destinazione]" (dopo 3° paragrafo) — iniettato dalla page, non dall'MDX
- FAQ (2–3 domande) + JSON-LD

**Sidebar:**
- "Vai alla guida completa della [Destinazione]" → `/destinazioni/[slug]`
- "Esperienze più prenotate" (3 experience cards compatte)
- CTA sticky

**generateMetadata:** usa `seo.title` e `seo.description` se presenti, fallback su `title`/`description`.

**Link interni obbligatori nel MDX:**
- ≥1 link → `/destinazioni/[slug]`
- ≥1 link → `/gite/[slug]` (anche placeholder)
- 1–2 link → altri articoli correlati

---

## 10. Pagina Gita (`/gite/[slug]`) — Day 4+

**Tipo:** Server Component. Placeholder per Day 1–3 (ritorna 404).

**Layout conversione:**
- Highlights above fold: ⏱️ durata, 📍 partenza, ⭐ rating + recensioni, 💰 prezzo
- Sidebar sticky: prezzo, CTA "Verifica disponibilità" → `affiliateUrl`, badge "Prenotazione sicura tramite [Source]"
- Corpo: descrizione, cosa include, info partenza, sezione "Per chi è / non è"
- Bottom: 2 esperienze simili + 1 alternativa (durata/stile diverso)
- Schema JSON-LD: `Product + AggregateRating`

---

## 11. Index pages

### `/destinazioni`
- H1: "Destinazioni per gite in barca in Italia"
- Intro breve (30–40 parole)
- Griglia `DestinationCard` di tutte le destinazioni

### `/articoli`
- H1: "Guide per organizzare la tua gita in barca"
- Intro breve
- Griglia `ArticleCard` di tutti gli articoli (ordinati per `publishedAt` desc)

---

## 12. Layout globale (Navbar + Footer)

### Navbar
- `Navbar.tsx` → Server Component (logo + layout)
- `NavbarLinks.tsx` → Client Component (`usePathname()` per active state — highlight con `sky-600` + underline)
- `NavbarMobile.tsx` → Client Component (`useState` per hamburger drawer)
- Nessun auth UI nel frontend pubblico

### Footer
- 3 colonne desktop: logo+tagline | link principali | link utilità
- Link SEO destinazioni: Sicilia, Sardegna, Costiera Amalfitana, Venezia
- Sfondo `amber-50`

### Global metadata in `layout.tsx`
```ts
export const metadata: Metadata = {
  title: { default: "Veleggiamo", template: "%s | Veleggiamo" },
  description: siteConfig.tagline,
  openGraph: { images: [siteConfig.defaultOgImage] },
}
```

---

## 13. Paletta e stile

| Token | Valore | Uso |
|-------|--------|-----|
| Primario | `sky-600` | link, CTA, accenti |
| Sfondo | `white` | pagine |
| Sabbia | `amber-50` | footer, banner eventi |
| Testo | `gray-900` / `gray-500` | corpo / secondario |
| Font | Inter | tutto il sito |

---

## 14. Piano giornate (scope)

### Day 1
- Setup: installa `next-mdx-remote`, `gray-matter`
- Elimina codice legacy
- `siteConfig`, tipi, data layer mock
- Layout globale (Navbar, Footer)
- Homepage completa

### Day 2
- 4 file MDX destinazioni (contenuto mock ma struttura reale)
- `/lib/content/destinations.ts` + `articles.ts`
- Pagina `/destinazioni/[slug]` completa
- Index page `/destinazioni`
- `ExperienceCard` riusabile

### Day 3
- Primo articolo MDX: `/content/articoli/gite-barca-sicilia.mdx`
- Pagina `/articoli/[slug]` completa
- Index page `/articoli`
- `generateMetadata` su tutte le pagine
- Link interni obbligatori
- FAQ JSON-LD su destinazione + articolo
- *Bonus:* tabella Supabase `events` + `banners`

---

## 15. Pattern SEO (tutte le pagine)

- `<title>` unico per pagina (via `generateMetadata`)
- `<meta description>` da frontmatter o hardcoded
- H1 unico per pagina
- Canonical su **tutte** le pagine: homepage, destinazioni, articoli, gite — via `siteConfig.domain + pathname`
- `<html lang="it">` (già in layout)
- JSON-LD FAQ su destinazioni e articoli
- JSON-LD `Product + AggregateRating` su `/gite/[slug]`
- `og:image` fallback su `siteConfig.defaultOgImage`

---

## 16. Sitemap e robots.txt (Day 1–3, obbligatori)

- `src/app/sitemap.ts` — genera automaticamente tutte le URL (homepage, destinazioni, articoli) via `generateSitemap()` nativo Next.js
- `src/app/robots.ts` — `Allow: /`, `Sitemap: ${siteConfig.domain}/sitemap.xml`

Entrambi devono essere live prima del primo deploy.

---

## 17. Fallback UI (dati mancanti)

Ogni sezione che carica dati dal data layer deve gestire il caso vuoto senza rompere il layout:

- **Esperienze vuote:** mostra sezione nascosta (non renderizzare il blocco)
- **Articoli vuoti:** grid assente, nessun errore visivo
- **Evento mancante:** banner eventi non appare

Regola: se `array.length === 0` → non renderizzare la sezione, non mostrare errori.

---

## 18. Affiliate click tracking

Wrapper minimo in `lib/tracking.ts` prima di andare live:

```ts
export function trackAffiliateClick(experience: Experience) {
  // Day 1-3: console.log per debug
  console.log('[affiliate_click]', experience.slug, experience.affiliateSource)
  // Fase 2: sostituire con analytics reale (Plausible, GA4, Supabase event)
}
```

Ogni `affiliateUrl` click passa da questa funzione — mai link diretto hardcoded nei componenti.
