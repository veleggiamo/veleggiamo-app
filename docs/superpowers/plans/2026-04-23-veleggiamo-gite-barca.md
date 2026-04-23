# Veleggiamo — Gite in Barca SEO Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pivot Veleggiamo from a boat equipment marketplace to a static, SEO-first content site about boat trips in Italy — destination pages, MDX articles, affiliate-ready experience cards, sitemap, and JSON-LD.

**Architecture:** Next.js 16 App Router, `generateStaticParams` on all dynamic routes for full static generation, `next-mdx-remote/rsc` for Server Component MDX rendering, abstract `/lib/data/` layer (mock now, Supabase-swappable later via one function), `gray-matter` for frontmatter extraction without full MDX compilation.

**Tech Stack:** Next.js 16, Tailwind v4, `next-mdx-remote` v5, `gray-matter`, shadcn/ui (Button, Card, Badge), TypeScript, Jest + ts-jest (data layer unit tests only — no jsdom needed)

---

## File Map

**Created:**
```
src/types/article.ts
src/types/experience.ts
src/lib/config/site.ts
src/lib/tracking.ts
src/lib/data/experiences.ts
src/lib/data/events.ts
src/lib/content/destinations.ts
src/lib/content/articles.ts
src/components/Navbar.tsx
src/components/NavbarLinks.tsx
src/components/NavbarMobile.tsx
src/components/Footer.tsx
src/components/DestinationCard.tsx
src/components/ExperienceCard.tsx
src/components/ArticleCard.tsx
src/app/destinazioni/page.tsx
src/app/destinazioni/[slug]/page.tsx
src/app/articoli/page.tsx
src/app/articoli/[slug]/page.tsx
src/app/gite/[slug]/page.tsx
src/app/sitemap.ts
src/app/robots.ts
src/__tests__/experiences.test.ts
src/__tests__/events.test.ts
src/__tests__/tracking.test.ts
src/__tests__/content.test.ts
content/destinazioni/sicilia.mdx
content/destinazioni/sardegna.mdx
content/destinazioni/costiera-amalfitana.mdx
content/destinazioni/venezia.mdx
content/articoli/gite-barca-sicilia.mdx
jest.config.ts
```

**Overwritten:**
```
src/app/layout.tsx
src/app/page.tsx
```

**Deleted:**
```
src/components/SearchBar.tsx
src/components/ProductCard.tsx
src/components/ProductList.tsx
src/components/FornitoreForm.tsx
src/components/MapView.tsx
src/app/dashboard/
src/app/risultati/
src/app/fornitore/
src/app/per-fornitori/
src/app/api/search/
src/app/api/lead/
src/app/api/upload-catalog/
src/app/api/widget/
src/data/products.ts
src/data/stores.ts
src/data/suppliers.ts
src/services/searchService.ts
src/lib/matchingEngine.ts
src/lib/intentParser.ts
src/constants/boatRules.ts
src/types/parsedQuery.ts
src/types/searchResult.ts
src/types/product.ts
```

---

## DAY 1

---

### Task 1: Cleanup legacy code + install dependencies + jest config

**Files:**
- Delete: all files listed in "Deleted" above
- Modify: `package.json` (add deps)
- Create: `jest.config.ts`

- [ ] **Step 1: Delete legacy components and pages**

```bash
rm -rf src/components/SearchBar.tsx src/components/ProductCard.tsx src/components/ProductList.tsx src/components/FornitoreForm.tsx src/components/MapView.tsx
rm -rf src/app/dashboard src/app/risultati src/app/fornitore src/app/per-fornitori
rm -rf src/app/api/search src/app/api/lead src/app/api/upload-catalog src/app/api/widget
rm -f src/data/products.ts src/data/stores.ts src/data/suppliers.ts
rm -f src/services/searchService.ts
rm -f src/lib/matchingEngine.ts src/lib/intentParser.ts
rm -f src/constants/boatRules.ts
rm -f src/types/parsedQuery.ts src/types/searchResult.ts src/types/product.ts
```

- [ ] **Step 2: Install new dependencies**

```bash
npm install next-mdx-remote gray-matter
```

Expected output: packages added without errors.

- [ ] **Step 3: Create jest.config.ts**

```ts
// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
}

export default config
```

- [ ] **Step 4: Create content directories**

```bash
mkdir -p content/destinazioni content/articoli public/images/experiences public/images/articoli public/images/destinazioni
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy equipment marketplace code, install next-mdx-remote + gray-matter"
```

---

### Task 2: Foundation — types, siteConfig, tracking

**Files:**
- Create: `src/types/article.ts`
- Create: `src/types/experience.ts`
- Create: `src/lib/config/site.ts`
- Create: `src/lib/tracking.ts`
- Create: `src/__tests__/tracking.test.ts`

- [ ] **Step 1: Write failing test for trackAffiliateClick**

```ts
// src/__tests__/tracking.test.ts
import { trackAffiliateClick } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

describe('trackAffiliateClick', () => {
  it('logs without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const exp = { slug: 'test', affiliateSource: 'viator' } as Experience
    expect(() => trackAffiliateClick(exp)).not.toThrow()
    expect(spy).toHaveBeenCalledWith('[affiliate_click]', 'test', 'viator')
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx jest src/__tests__/tracking.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/tracking'`

- [ ] **Step 3: Create types/article.ts**

```ts
// src/types/article.ts
export type ArticleMeta = {
  title: string
  description: string
  slug: string
  destination: string
  publishedAt: string
  updatedAt?: string
  coverImage: string
  readingTime?: number
  seo?: {
    title?: string
    description?: string
  }
}
```

- [ ] **Step 4: Create types/experience.ts**

```ts
// src/types/experience.ts
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
  order?: number
  includes?: string[]
  departureInfo?: string
  featured?: boolean
  cancellation?: string
  isIdealFor?: string[]
  notIdealFor?: string[]
}
```

- [ ] **Step 5: Create lib/config/site.ts**

```ts
// src/lib/config/site.ts
export const siteConfig = {
  name: 'Veleggiamo',
  tagline: 'Scopri le migliori gite in barca in Italia',
  domain: 'https://veleggiamo.com',
  defaultOgImage: '/og-default.jpg',
  nav: [
    { label: 'Destinazioni', href: '/destinazioni' },
    { label: 'Articoli', href: '/articoli' },
    { label: 'Esperienze', href: '/gite' },
  ],
} as const
```

- [ ] **Step 6: Create lib/tracking.ts**

```ts
// src/lib/tracking.ts
import type { Experience } from '@/types/experience'

export function trackAffiliateClick(experience: Experience): void {
  console.log('[affiliate_click]', experience.slug, experience.affiliateSource)
  // Phase 2: replace with Plausible/GA4/Supabase event
}
```

- [ ] **Step 7: Run test — verify it passes**

```bash
npx jest src/__tests__/tracking.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/types/ src/lib/config/ src/lib/tracking.ts src/__tests__/tracking.test.ts jest.config.ts
git commit -m "feat: add types, siteConfig, and affiliate tracking wrapper"
```

---

### Task 3: Data layer — experiences and events (with tests)

**Files:**
- Create: `src/lib/data/experiences.ts`
- Create: `src/lib/data/events.ts`
- Create: `src/__tests__/experiences.test.ts`
- Create: `src/__tests__/events.test.ts`

- [ ] **Step 1: Write failing tests for experiences**

```ts
// src/__tests__/experiences.test.ts
import { getExperiences, getExperience } from '@/lib/data/experiences'

describe('getExperiences', () => {
  it('returns a non-empty array', async () => {
    const results = await getExperiences()
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('filters by destination', async () => {
    const results = await getExperiences({ destination: 'sicilia' })
    results.forEach(r => expect(r.destination).toBe('sicilia'))
  })

  it('respects limit', async () => {
    const results = await getExperiences({ limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('filters featured experiences', async () => {
    const results = await getExperiences({ featured: true })
    results.forEach(r => expect(r.featured).toBe(true))
  })
})

describe('getExperience', () => {
  it('returns null for unknown slug', async () => {
    const result = await getExperience('does-not-exist')
    expect(result).toBeNull()
  })

  it('returns correct experience for valid slug', async () => {
    const all = await getExperiences()
    const first = all[0]
    const result = await getExperience(first.slug)
    expect(result?.slug).toBe(first.slug)
  })
})
```

- [ ] **Step 2: Write failing test for events**

```ts
// src/__tests__/events.test.ts
import { getEvents } from '@/lib/data/events'

describe('getEvents', () => {
  it('returns an array', async () => {
    const results = await getEvents()
    expect(Array.isArray(results)).toBe(true)
  })

  it('respects limit', async () => {
    const results = await getEvents({ limit: 1 })
    expect(results.length).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npx jest src/__tests__/experiences.test.ts src/__tests__/events.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/data/experiences'`

- [ ] **Step 4: Create lib/data/experiences.ts**

```ts
// src/lib/data/experiences.ts
import type { Experience } from '@/types/experience'

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: '1',
    slug: 'gita-barca-taormina',
    title: 'Gita in barca a Taormina e Isola Bella',
    description: 'Scopri le meraviglie della costa taorminese a bordo di un elegante cabinato. Snorkeling nelle acque cristalline di Isola Bella.',
    destination: 'sicilia',
    price: 'da €80',
    duration: '4 ore',
    rating: 4.8,
    reviewCount: 124,
    image: '/images/experiences/taormina.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: true,
    includes: ['Skipper incluso', 'Attrezzatura snorkeling', 'Acqua e snack'],
    departureInfo: 'Partenza dal porto di Taormina, ore 9:00',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['coppie', 'appassionati di snorkeling', 'amanti della natura'],
    notIdealFor: ['gruppi numerosi (max 8 persone)', 'chi soffre il mal di mare'],
  },
  {
    id: '2',
    slug: 'escursione-eolie-lipari',
    title: 'Escursione alle Isole Eolie da Milazzo',
    description: 'Un giorno intero alla scoperta di Lipari, Vulcano e Panarea. Mare vulcanico e paesaggi unici al mondo.',
    destination: 'sicilia',
    price: 'da €120',
    duration: 'Giornata intera',
    rating: 4.9,
    reviewCount: 87,
    image: '/images/experiences/eolie.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 2,
    featured: true,
    includes: ['Skipper e guida', 'Pranzo a bordo', 'Snorkeling'],
    departureInfo: 'Partenza dal porto di Milazzo, ore 8:00',
    cancellation: 'Cancellazione gratuita fino a 48h prima',
    isIdealFor: ['avventurieri', 'famiglie con bambini grandi', 'fotografi'],
    notIdealFor: ['chi ha poco tempo'],
  },
  {
    id: '3',
    slug: 'tour-costa-amalfitana-positano',
    title: 'Tour in barca della Costiera da Positano',
    description: 'Naviga tra Positano, Praiano e la Grotta dello Smeraldo. Aperitivo al tramonto incluso.',
    destination: 'costiera-amalfitana',
    price: 'da €95',
    duration: '5 ore',
    rating: 4.7,
    reviewCount: 203,
    image: '/images/experiences/positano.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: true,
    includes: ['Skipper', 'Aperitivo a bordo', 'Soste balneari'],
    departureInfo: 'Partenza dal molo Beaurivage di Positano, ore 10:00',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['coppie romantiche', 'amanti del tramonto', 'turisti premium'],
    notIdealFor: ['chi cerca spiagge affollate'],
  },
  {
    id: '4',
    slug: 'gita-maddalena-caprera',
    title: 'Arcipelago della Maddalena in barca a vela',
    description: 'Esplora le 7 isole dell\'Arcipelago della Maddalena. Acque turchesi e natura incontaminata.',
    destination: 'sardegna',
    price: 'da €110',
    duration: '6 ore',
    rating: 4.9,
    reviewCount: 156,
    image: '/images/experiences/maddalena.jpg',
    affiliateUrl: 'https://www.getyourguide.com',
    affiliateSource: 'getyourguide',
    order: 1,
    featured: true,
    includes: ['Skipper', 'Pranzo sardo', 'Snorkeling', 'Kayak'],
    departureInfo: 'Partenza da La Maddalena, ore 9:30',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['famiglie', 'amanti della vela', 'naturalisti'],
    notIdealFor: ['chi cerca movida'],
  },
  {
    id: '5',
    slug: 'gita-barca-venezia-laguna',
    title: 'Tour privato in barca della Laguna di Venezia',
    description: 'Scopri Burano, Murano e Torcello lontano dalla folla. Un\'esperienza esclusiva nella Laguna.',
    destination: 'venezia',
    price: 'da €150',
    duration: '4 ore',
    rating: 4.8,
    reviewCount: 98,
    image: '/images/experiences/venezia-laguna.jpg',
    affiliateUrl: 'https://www.viator.com',
    affiliateSource: 'viator',
    order: 1,
    featured: false,
    includes: ['Barca privata', 'Guida locale', 'Stop a Burano e Murano'],
    departureInfo: 'Partenza da Fondamente Nove, Venezia',
    cancellation: 'Cancellazione gratuita fino a 24h prima',
    isIdealFor: ['chi vuole evitare la folla', 'fotografi', 'coppie'],
    notIdealFor: ['chi cerca divertimento notturno'],
  },
]

export async function getExperiences(params?: {
  destination?: string
  limit?: number
  featured?: boolean
}): Promise<Experience[]> {
  let results = [...MOCK_EXPERIENCES]

  if (params?.destination) {
    results = results.filter(e => e.destination === params.destination)
  }
  if (params?.featured !== undefined) {
    results = results.filter(e => e.featured === params.featured)
  }

  results.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  if (params?.limit) {
    results = results.slice(0, params.limit)
  }

  return results
}

export async function getExperience(slug: string): Promise<Experience | null> {
  return MOCK_EXPERIENCES.find(e => e.slug === slug) ?? null
}
```

- [ ] **Step 5: Create lib/data/events.ts**

```ts
// src/lib/data/events.ts
export type SiteEvent = {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string
  href: string
}

const MOCK_EVENTS: SiteEvent[] = [
  {
    id: '1',
    title: 'Veleggiata della Primavera — Sicilia',
    description: 'Il grande raduno velico primaverile lungo la costa siciliana. Aperto a tutti.',
    date: '2026-05-10',
    location: 'Palermo',
    image: '/images/events/veleggiata-sicilia.jpg',
    href: '/articoli/veleggiata-primavera-sicilia',
  },
  {
    id: '2',
    title: 'Regata dell\'Adriatico — Venezia',
    description: 'Storica regata nella Laguna di Venezia. Spettacolo garantito per grandi e piccini.',
    date: '2026-06-15',
    location: 'Venezia',
    image: '/images/events/regata-venezia.jpg',
    href: '/articoli/regata-adriatico-venezia',
  },
]

export async function getEvents(params?: { limit?: number }): Promise<SiteEvent[]> {
  if (params?.limit) return MOCK_EVENTS.slice(0, params.limit)
  return MOCK_EVENTS
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npx jest src/__tests__/experiences.test.ts src/__tests__/events.test.ts
```

Expected: PASS (all 6 tests)

- [ ] **Step 7: Commit**

```bash
git add src/lib/data/ src/__tests__/experiences.test.ts src/__tests__/events.test.ts
git commit -m "feat: add mock data layer for experiences and events with tests"
```

---

### Task 4: Content layer — MDX utilities (with tests)

**Files:**
- Create: `src/lib/content/destinations.ts`
- Create: `src/lib/content/articles.ts`
- Create: `src/__tests__/content.test.ts`

Note: these functions read files from `content/` at the project root. Tests will only pass after Task 8 (MDX files) — that's expected. The test in this task verifies the function contract only.

- [ ] **Step 1: Write failing tests**

```ts
// src/__tests__/content.test.ts
import { getAllDestinationSlugs, getDestination, getAllDestinations } from '@/lib/content/destinations'
import { getAllArticleSlugs, getArticles } from '@/lib/content/articles'

describe('getAllDestinationSlugs', () => {
  it('returns an array', async () => {
    const slugs = await getAllDestinationSlugs()
    expect(Array.isArray(slugs)).toBe(true)
  })
})

describe('getAllDestinations', () => {
  it('returns array of objects with slug and name', async () => {
    const dests = await getAllDestinations()
    expect(Array.isArray(dests)).toBe(true)
    dests.forEach(d => {
      expect(typeof d.slug).toBe('string')
      expect(typeof d.name).toBe('string')
    })
  })
})

describe('getAllArticleSlugs', () => {
  it('returns an array', async () => {
    const slugs = await getAllArticleSlugs()
    expect(Array.isArray(slugs)).toBe(true)
  })
})

describe('getArticles', () => {
  it('returns array of article metas', async () => {
    const articles = await getArticles()
    expect(Array.isArray(articles)).toBe(true)
    articles.forEach(a => {
      expect(typeof a.slug).toBe('string')
      expect(typeof a.title).toBe('string')
    })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx jest src/__tests__/content.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/content/destinations'`

- [ ] **Step 3: Create lib/content/destinations.ts**

```ts
// src/lib/content/destinations.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DEST_DIR = path.join(process.cwd(), 'content', 'destinazioni')

export type DestinationMeta = {
  slug: string
  name: string
  tagline: string
  coverImage: string
  publishedAt: string
}

export async function getAllDestinationSlugs(): Promise<{ slug: string }[]> {
  if (!fs.existsSync(DEST_DIR)) return []
  return fs
    .readdirSync(DEST_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

export async function getAllDestinations(): Promise<DestinationMeta[]> {
  if (!fs.existsSync(DEST_DIR)) return []
  const files = fs.readdirSync(DEST_DIR).filter(f => f.endsWith('.mdx'))
  return files.map(file => {
    const slug = file.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(DEST_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return { slug, name: data.name ?? slug, tagline: data.tagline ?? '', coverImage: data.coverImage ?? '', publishedAt: data.publishedAt ?? '' }
  })
}

export async function getDestination(slug: string): Promise<{ meta: DestinationMeta; source: string } | null> {
  const filePath = path.join(DEST_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const meta: DestinationMeta = {
    slug,
    name: data.name ?? slug,
    tagline: data.tagline ?? '',
    coverImage: data.coverImage ?? '',
    publishedAt: data.publishedAt ?? '',
  }
  return { meta, source: raw }
}
```

- [ ] **Step 4: Create lib/content/articles.ts**

```ts
// src/lib/content/articles.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ArticleMeta } from '@/types/article'

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articoli')

function calcReadingTime(source: string): number {
  const wordCount = source.replace(/---[\s\S]*?---/, '').split(/\s+/).length
  return Math.max(1, Math.round(wordCount / 200))
}

export async function getAllArticleSlugs(): Promise<{ slug: string }[]> {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

export async function getArticles(params?: {
  destination?: string
  limit?: number
}): Promise<ArticleMeta[]> {
  if (!fs.existsSync(ARTICLES_DIR)) return []
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'))
  let articles: ArticleMeta[] = files.map(file => {
    const slug = file.replace('.mdx', '')
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return {
      slug,
      title: data.title ?? '',
      description: data.description ?? '',
      destination: data.destination ?? '',
      publishedAt: data.publishedAt ?? '',
      updatedAt: data.updatedAt,
      coverImage: data.coverImage ?? '',
      readingTime: calcReadingTime(raw),
      seo: data.seo,
    }
  })

  articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  if (params?.destination) {
    articles = articles.filter(a => a.destination === params.destination)
  }
  if (params?.limit) {
    articles = articles.slice(0, params.limit)
  }
  return articles
}

export async function getArticle(slug: string): Promise<{ meta: ArticleMeta; source: string } | null> {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  const meta: ArticleMeta = {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    destination: data.destination ?? '',
    publishedAt: data.publishedAt ?? '',
    updatedAt: data.updatedAt,
    coverImage: data.coverImage ?? '',
    readingTime: calcReadingTime(raw),
    seo: data.seo,
  }
  return { meta, source: raw }
}

export function extractToc(source: string): { id: string; title: string }[] {
  const matches = source.matchAll(/^## (.+)$/gm)
  return Array.from(matches).map(m => ({
    id: m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: m[1],
  }))
}
```

- [ ] **Step 5: Run tests — verify they pass (array assertions only, files not yet created)**

```bash
npx jest src/__tests__/content.test.ts
```

Expected: PASS — empty arrays returned when directory is empty, all type assertions pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content/ src/__tests__/content.test.ts
git commit -m "feat: add MDX content layer utilities for destinations and articles"
```

---

### Task 5: Global layout — Navbar, Footer, layout.tsx

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/NavbarLinks.tsx`
- Create: `src/components/NavbarMobile.tsx`
- Create: `src/components/Footer.tsx`
- Overwrite: `src/app/layout.tsx`

- [ ] **Step 1: Create components/Navbar.tsx**

```tsx
// src/components/Navbar.tsx
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'
import { NavbarLinks } from './NavbarLinks'
import { NavbarMobile } from './NavbarMobile'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-sky-600 tracking-tight">
          {siteConfig.name}
        </Link>
        <NavbarLinks className="hidden md:flex items-center gap-8" />
        <NavbarMobile />
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Create components/NavbarLinks.tsx**

```tsx
// src/components/NavbarLinks.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/config/site'
import { cn } from '@/lib/utils'

export function NavbarLinks({ className }: { className?: string }) {
  const pathname = usePathname()
  return (
    <ul className={className}>
      {siteConfig.nav.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-sky-600',
              pathname.startsWith(href)
                ? 'text-sky-600 underline underline-offset-4 decoration-sky-300'
                : 'text-gray-700'
            )}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 3: Create components/NavbarMobile.tsx**

```tsx
// src/components/NavbarMobile.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

export function NavbarMobile() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-700 hover:text-sky-600"
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
      >
        {open ? (
          <span className="text-xl font-light">✕</span>
        ) : (
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
          </div>
        )}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 px-6 py-4 space-y-4 shadow-sm">
          {siteConfig.nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-base font-medium text-gray-700 hover:text-sky-600"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create components/Footer.tsx**

```tsx
// src/components/Footer.tsx
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

const DESTINATION_LINKS = [
  { label: 'Sicilia', href: '/destinazioni/sicilia' },
  { label: 'Sardegna', href: '/destinazioni/sardegna' },
  { label: 'Costiera Amalfitana', href: '/destinazioni/costiera-amalfitana' },
  { label: 'Venezia', href: '/destinazioni/venezia' },
]

export function Footer() {
  return (
    <footer className="bg-amber-50 border-t border-amber-100 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="font-bold text-lg text-sky-600 mb-2">{siteConfig.name}</p>
          <p className="text-sm text-gray-500">{siteConfig.tagline}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-3">Destinazioni</p>
          <ul className="space-y-2">
            {DESTINATION_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-gray-500 hover:text-sky-600 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-3">Informazioni</p>
          <ul className="space-y-2">
            {siteConfig.nav.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-gray-500 hover:text-sky-600 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-amber-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {siteConfig.name}. Tutti i diritti riservati.
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Overwrite src/app/layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/lib/config/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    images: [siteConfig.defaultOgImage],
    siteName: siteConfig.name,
    locale: 'it_IT',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="it" className={inter.variable}>
        <body className="min-h-screen flex flex-col font-sans antialiased">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 6: Run dev server and verify layout renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000`. Expected: Navbar visible with 3 links, footer at bottom, Inter font applied.

- [ ] **Step 7: Commit**

```bash
git add src/components/Navbar.tsx src/components/NavbarLinks.tsx src/components/NavbarMobile.tsx src/components/Footer.tsx src/app/layout.tsx
git commit -m "feat: add global layout with Navbar, NavbarLinks (active state), NavbarMobile, and Footer"
```

---

### Task 6: Homepage

**Files:**
- Overwrite: `src/app/page.tsx`

- [ ] **Step 1: Overwrite src/app/page.tsx**

```tsx
// src/app/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getExperiences } from '@/lib/data/experiences'
import { getEvents } from '@/lib/data/events'
import { getArticles } from '@/lib/content/articles'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ArticleCard } from '@/components/ArticleCard'
import { DestinationCard } from '@/components/DestinationCard'
import { siteConfig } from '@/lib/config/site'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: `${siteConfig.name} — Gite in Barca in Italia`,
  description: 'Scopri le migliori escursioni e gite in barca in Italia. Guide, destinazioni e esperienze selezionate per vivere il mare al meglio.',
  openGraph: {
    title: `${siteConfig.name} — Gite in Barca in Italia`,
    description: 'Scopri le migliori escursioni e gite in barca in Italia.',
    images: [siteConfig.defaultOgImage],
  },
}

const DESTINATIONS = [
  { slug: 'sicilia', name: 'Sicilia', tagline: 'Acque cristalline e grotte marine', coverImage: '/images/destinazioni/sicilia.jpg' },
  { slug: 'costiera-amalfitana', name: 'Costiera Amalfitana', tagline: 'Coste spettacolari e tramonti sul Tirreno', coverImage: '/images/destinazioni/costiera.jpg' },
  { slug: 'sardegna', name: 'Sardegna', tagline: 'Mare turchese e calette selvagge', coverImage: '/images/destinazioni/sardegna.jpg' },
  { slug: 'venezia', name: 'Venezia', tagline: 'Laguna unica, esperienze fuori dal comune', coverImage: '/images/destinazioni/venezia.jpg' },
]

export default async function HomePage() {
  const [experiences, events, articles] = await Promise.all([
    getExperiences({ featured: true, limit: 3 }),
    getEvents({ limit: 2 }),
    getArticles({ limit: 3 }),
  ])

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative bg-sky-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/80 to-sky-800/60" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Scopri le migliori gite in barca in Italia
          </h1>
          <p className="text-sky-100 text-lg max-w-2xl mx-auto">
            Guide esperte, destinazioni selezionate e le migliori esperienze in mare lungo le coste italiane.
          </p>
          <p className="text-sm text-sky-200">
            Gite in barca in Italia · Escursioni in mare · Esperienze costiere uniche — oltre 500+ esperienze selezionate in tutta Italia
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/destinazioni">
              <Button className="bg-white text-sky-700 hover:bg-sky-50 font-semibold px-8">
                Scopri le gite
              </Button>
            </Link>
            <Link href="/articoli">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                Leggi le guide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DESTINAZIONI */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Destinazioni principali</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESTINATIONS.map(dest => (
            <DestinationCard key={dest.slug} destination={dest} />
          ))}
        </div>
      </section>

      {/* TOP ESPERIENZE */}
      {experiences.length > 0 && (
        <section className="bg-sky-50 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Le nostre scelte migliori</h2>
              <p className="text-gray-500 text-sm mt-1">Selezionate dalla redazione</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experiences.map(exp => (
                <ExperienceCard key={exp.slug} experience={exp} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GUIDE / ARTICOLI */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Guide per organizzare la tua gita</h2>
            <Link href="/articoli" className="text-sm text-sky-600 hover:underline">
              Tutte le guide →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* BANNER EVENTI */}
      {events.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-100 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Eventi da non perdere questo mese
            </h2>
            <div className="space-y-4">
              {events.map(event => (
                <Link key={event.id} href={event.href} className="flex gap-4 p-4 bg-white rounded-xl border border-amber-100 hover:border-sky-200 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-1">📍 {event.location} · 📅 {event.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
```

- [ ] **Step 2: Verify homepage renders in browser**

Visit `http://localhost:3000`. Expected: Hero section, 4 destination placeholders, 3 experience cards, 3 article cards (empty until Task 8/11), events banner.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add homepage with hero, destinations, top experiences, guides, and events banner"
```

---

### Task 7: Sitemap + robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create src/app/sitemap.ts**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config/site'
import { getAllDestinationSlugs } from '@/lib/content/destinations'
import { getAllArticleSlugs } from '@/lib/content/articles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.domain
  const now = new Date().toISOString()

  const destinationSlugs = await getAllDestinationSlugs()
  const articleSlugs = await getAllArticleSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/destinazioni`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/articoli`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const destinationRoutes: MetadataRoute.Sitemap = destinationSlugs.map(({ slug }) => ({
    url: `${base}/destinazioni/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map(({ slug }) => ({
    url: `${base}/articoli/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...destinationRoutes, ...articleRoutes]
}
```

- [ ] **Step 2: Create src/app/robots.ts**

```ts
// src/app/robots.ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.domain}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Verify sitemap and robots in browser**

Visit `http://localhost:3000/sitemap.xml` — expected: XML with homepage, /destinazioni, /articoli (destinations and articles empty until Task 8/11).
Visit `http://localhost:3000/robots.txt` — expected: `Allow: /` and sitemap URL.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add auto-generated sitemap.xml and robots.txt"
```

---

## DAY 2

---

### Task 8: MDX destination content files (4 destinations)

**Files:**
- Create: `content/destinazioni/sicilia.mdx`
- Create: `content/destinazioni/sardegna.mdx`
- Create: `content/destinazioni/costiera-amalfitana.mdx`
- Create: `content/destinazioni/venezia.mdx`

- [ ] **Step 1: Create content/destinazioni/sicilia.mdx**

```mdx
---
name: Sicilia
tagline: Acque cristalline e grotte marine
coverImage: /images/destinazioni/sicilia.jpg
publishedAt: "2026-04-23"
---

## Intro

La Sicilia offre alcune delle esperienze in barca più spettacolari d'Italia, con coste che alternano faraglioni drammatici, grotte nascoste e calette di sabbia fine raggiungibili solo dal mare. Il periodo migliore va da maggio a ottobre, quando il mare è calmo e le temperature permettono di nuotare e fare snorkeling in acque limpidissime.

Navigare intorno alla Sicilia significa scoprire un'isola che ancora sorprende: dalla costa orientale con Taormina e l'Etna sullo sfondo, alle Isole Eolie con i loro paesaggi vulcanici, fino alle acque turchesi dello Stretto di Messina.

## Cosa sapere

- 💰 **Prezzi medi:** €70–€150 a persona per escursioni di mezza giornata; €200–€400 per giornate intere con pranzo a bordo
- 📅 **Quando andare:** maggio–ottobre (picco luglio–agosto — prenotare con anticipo)
- ⏱️ **Durata tipica:** 3–6 ore per gite classiche; giornate intere per isole offshore
- 📍 **Porti principali:** Palermo, Catania, Taormina, Milazzo, Trapani
- 🎒 **Cosa portare:** protezione solare alta, scarpe da scoglio, asciugamano, spuntini

## FAQ

**Quanto costa una gita in barca in Sicilia?**
Le escursioni di mezza giornata costano in media €70–€120 a persona. Per gite private o giornate intere con pranzo a bordo, i prezzi salgono a €200–€400 a persona.

**Qual è il periodo migliore per le gite in barca in Sicilia?**
Da maggio a settembre. Il picco è luglio–agosto, quando il mare è più caldo ma anche più affollato. Maggio e settembre offrono ottimo clima con meno folla.

**Serve prenotare in anticipo le gite in barca in Sicilia?**
In estate (giugno–agosto) è consigliabile prenotare con almeno 1–2 settimane di anticipo, soprattutto per le escursioni alle Eolie che si esauriscono rapidamente.
```

- [ ] **Step 2: Create content/destinazioni/sardegna.mdx**

```mdx
---
name: Sardegna
tagline: Mare turchese e calette selvagge
coverImage: /images/destinazioni/sardegna.jpg
publishedAt: "2026-04-23"
---

## Intro

La Sardegna vanta alcune delle acque più trasparenti del Mediterraneo, con tonalità che vanno dall'azzurro al verde smeraldo. Le calette raggiungibili solo via mare sono il segreto meglio custodito dell'isola: spiagge di sabbia bianca circondate da granito rosa, accessibili solo a chi arriva in barca. Il periodo ideale va da giugno a settembre, con mare quasi sempre piatto nelle zone più riparate.

Dall'Arcipelago della Maddalena al Golfo di Orosei, dalla Costa Smeralda alle grotte di Nettuno, ogni tratto di costa riserva scoperte indimenticabili.

## Cosa sapere

- 💰 **Prezzi medi:** €80–€160 a persona per escursioni di mezza giornata; €250–€500 per giornate intere
- 📅 **Quando andare:** giugno–settembre (luglio–agosto è il picco, ma anche il più bello)
- ⏱️ **Durata tipica:** 4–8 ore; l'Arcipelago della Maddalena richiede almeno 6 ore
- 📍 **Porti principali:** Olbia, Palau, La Maddalena, Cagliari, Arbatax, Alghero
- 🎒 **Cosa portare:** protezione solare molto alta, costume, occhiali da snorkeling

## FAQ

**Qual è la zona migliore della Sardegna per le gite in barca?**
L'Arcipelago della Maddalena è il must assoluto. Per acque turchesi vicino alla terraferma, il Golfo di Orosei è insuperabile. La Costa Smeralda è spettacolare ma più affollata.

**Quanto costa noleggiare una barca in Sardegna?**
Per escursioni guidate con skipper, si parte da €80 a persona. Il noleggio di un gommone autonomo va da €150 al giorno. Una barca a vela privata per una giornata costa da €600 in su.

**È possibile fare snorkeling durante le gite in Sardegna?**
Sì, quasi tutte le escursioni includono soste per nuoto e snorkeling. Le acque dell'Arcipelago della Maddalena e del Golfo di Orosei sono tra le più ricche di fauna marina d'Italia.
```

- [ ] **Step 3: Create content/destinazioni/costiera-amalfitana.mdx**

```mdx
---
name: Costiera Amalfitana
tagline: Coste spettacolari e tramonti sul Tirreno
coverImage: /images/destinazioni/costiera.jpg
publishedAt: "2026-04-23"
---

## Intro

La Costiera Amalfitana vista dal mare è un'esperienza radicalmente diversa da quella terrestre. Dal basso, i borghi colorati sembrano sospesi sulla roccia, i giardini di limoni profumano l'aria salmastra, e le grotte nascoste — come la celebre Grotta dello Smeraldo — si aprono solo a chi arriva in barca. Il periodo migliore va da aprile a ottobre, con i tramonti di maggio e settembre che regalano luci spettacolari.

Navigare da Positano ad Amalfi, sostando a Praiano e alle Grotte di Pertosa, è uno dei tragitti costieri più belli d'Europa.

## Cosa sapere

- 💰 **Prezzi medi:** €90–€180 a persona per escursioni di mezza giornata; €300–€600 per gite private
- 📅 **Quando andare:** aprile–ottobre; evitare agosto se si vuole meno folla
- ⏱️ **Durata tipica:** 3–5 ore per il percorso classico Positano–Amalfi
- 📍 **Porti principali:** Positano, Amalfi, Salerno, Sorrento
- 🎒 **Cosa portare:** protezione solare, giacca per la brezza serale, macchina fotografica

## FAQ

**Qual è il miglior punto di partenza per le gite in barca sulla Costiera?**
Positano e Amalfi sono i più comodi. Da Sorrento si raggiunge la Costiera in circa 30 minuti di navigazione.

**È possibile fare gite al tramonto sulla Costiera Amalfitana?**
Sì, le gite al tramonto da Positano sono tra le esperienze più richieste. Durano circa 2–3 ore e includono spesso aperitivo a bordo.

**Le gite in barca includono la Grotta dello Smeraldo?**
Molte escursioni prevedono la sosta alla Grotta. Verificare sempre l'itinerario prima della prenotazione.
```

- [ ] **Step 4: Create content/destinazioni/venezia.mdx**

```mdx
---
name: Venezia
tagline: Laguna unica, esperienze fuori dal comune
coverImage: /images/destinazioni/venezia.jpg
publishedAt: "2026-04-23"
---

## Intro

Venezia in barca non è solo un modo per spostarsi: è il modo autentico di capire la città. La laguna, con le sue barene, i canali minori e le isole dimenticate, è quasi inaccessibile ai turisti a piedi. Burano con le sue case coloratissime, Torcello con la sua basilica millenaria, Murano con i vetrai — ognuna ha un carattere completamente diverso. Il periodo migliore va da aprile a ottobre, evitando il vaporetto nei mesi estivi e scegliendo una barca privata per un'esperienza completamente diversa.

## Cosa sapere

- 💰 **Prezzi medi:** €120–€250 a persona per escursioni guidate alle isole; €300–€800 per barca privata
- 📅 **Quando andare:** aprile–giugno e settembre–ottobre per evitare la folla e l'acqua alta
- ⏱️ **Durata tipica:** 3–4 ore per il giro delle isole (Burano, Murano, Torcello)
- 📍 **Partenza:** Fondamente Nove o San Marco
- 🎒 **Cosa portare:** strati di abbigliamento (il vento in laguna è freddo anche d'estate)

## FAQ

**Vale la pena prendere una barca privata a Venezia invece del vaporetto?**
Assolutamente sì, se il budget lo permette. Una barca privata permette di fermarsi dove si vuole, evitare la folla, e raggiungere canali minori inaccessibili ai mezzi pubblici.

**Quale isola della laguna merita di più la visita in barca?**
Burano per le fotografie e l'atmosfera, Torcello per la storia (la basilica è del VI secolo), Murano per chi è appassionato di arte vetraria.

**Le gite in barca a Venezia sono adatte ai bambini?**
Sì, la laguna è quasi sempre piatta e sicura. Le isole di Burano e Murano sono particolarmente apprezzate dai bambini.
```

- [ ] **Step 5: Run content tests — verify they now return real data**

```bash
npx jest src/__tests__/content.test.ts
```

Expected: PASS — `getAllDestinationSlugs` returns 4 slugs.

- [ ] **Step 6: Commit**

```bash
git add content/destinazioni/
git commit -m "content: add 4 destination MDX files (Sicilia, Sardegna, Costiera, Venezia)"
```

---

### Task 9: Shared components — DestinationCard, ExperienceCard, ArticleCard

**Files:**
- Create: `src/components/DestinationCard.tsx`
- Create: `src/components/ExperienceCard.tsx`
- Create: `src/components/ArticleCard.tsx`

- [ ] **Step 1: Create components/DestinationCard.tsx**

```tsx
// src/components/DestinationCard.tsx
import Link from 'next/link'
import type { DestinationMeta } from '@/lib/content/destinations'

export function DestinationCard({ destination }: { destination: Pick<DestinationMeta, 'slug' | 'name' | 'tagline'> & { coverImage?: string } }) {
  return (
    <Link
      href={`/destinazioni/${destination.slug}`}
      className="group relative overflow-hidden rounded-xl bg-sky-900 text-white aspect-square flex flex-col justify-end p-4 hover:ring-2 hover:ring-sky-400 transition-all"
    >
      {destination.coverImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity"
          style={{ backgroundImage: `url(${destination.coverImage})` }}
        />
      )}
      <div className="relative z-10">
        <p className="font-bold text-base leading-tight">{destination.name}</p>
        <p className="text-xs text-sky-200 mt-0.5">{destination.tagline}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create components/ExperienceCard.tsx**

```tsx
// src/components/ExperienceCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackAffiliateClick } from '@/lib/tracking'
import type { Experience } from '@/types/experience'

const SOURCE_LABEL: Record<Experience['affiliateSource'], string> = {
  viator: 'Viator',
  getyourguide: 'GetYourGuide',
  direct: 'operatore verificato',
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-44 bg-sky-100 shrink-0">
        {experience.image && (
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{experience.title}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">{experience.price}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>⭐ {experience.rating} ({experience.reviewCount})</span>
          <span>⏱️ {experience.duration}</span>
        </div>
        {experience.cancellation && (
          <p className="text-xs text-green-600 font-medium">{experience.cancellation}</p>
        )}
        <div className="mt-auto pt-1 space-y-1.5">
          <a
            href={experience.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAffiliateClick(experience)}
            className="block"
          >
            <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm h-9">
              Verifica disponibilità
            </Button>
          </a>
          <p className="text-xs text-gray-400 text-center">
            Prenotazione sicura tramite {SOURCE_LABEL[experience.affiliateSource]}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create components/ArticleCard.tsx**

```tsx
// src/components/ArticleCard.tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { ArticleMeta } from '@/types/article'

export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link href={`/articoli/${article.slug}`} className="group">
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <div className="relative h-40 bg-sky-100 shrink-0">
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">{article.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {article.readingTime && <span>⏱️ {article.readingTime} min</span>}
            <span>{article.updatedAt ?? article.publishedAt}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 4: Verify homepage now shows components correctly**

Run dev server, visit `http://localhost:3000`. Expected: ExperienceCard shows 3 featured experiences with "Verifica disponibilità" CTA, DestinationCard shows 4 destinations with gradient overlay.

- [ ] **Step 5: Commit**

```bash
git add src/components/DestinationCard.tsx src/components/ExperienceCard.tsx src/components/ArticleCard.tsx
git commit -m "feat: add DestinationCard, ExperienceCard (affiliate-ready), and ArticleCard components"
```

---

### Task 10: Destinations feature — index + [slug] pages

**Files:**
- Create: `src/app/destinazioni/page.tsx`
- Create: `src/app/destinazioni/[slug]/page.tsx`

- [ ] **Step 1: Create src/app/destinazioni/page.tsx**

```tsx
// src/app/destinazioni/page.tsx
import type { Metadata } from 'next'
import { getAllDestinations } from '@/lib/content/destinations'
import { DestinationCard } from '@/components/DestinationCard'
import { siteConfig } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Destinazioni per Gite in Barca in Italia',
  description: 'Scopri le destinazioni migliori per le gite in barca in Italia: Sicilia, Sardegna, Costiera Amalfitana, Venezia e molto altro.',
  alternates: { canonical: `${siteConfig.domain}/destinazioni` },
}

export default async function DestinazioniPage() {
  const destinations = await getAllDestinations()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Destinazioni per gite in barca in Italia
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Esplora le coste più belle d&apos;Italia. Guide dettagliate, esperienze selezionate e tutto quello che devi sapere per organizzare la tua gita in barca.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.map(dest => (
          <DestinationCard key={dest.slug} destination={dest} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/app/destinazioni/[slug]/page.tsx**

```tsx
// src/app/destinazioni/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { getDestination, getAllDestinationSlugs } from '@/lib/content/destinations'
import { getExperiences } from '@/lib/data/experiences'
import { getArticles } from '@/lib/content/articles'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export async function generateStaticParams() {
  return getAllDestinationSlugs()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getDestination(slug)
  if (!data) return {}
  return {
    title: `Gite in barca in ${data.meta.name}`,
    description: `Scopri le migliori gite in barca in ${data.meta.name}. Esperienze selezionate, guide pratiche e tutto quello che devi sapere.`,
    alternates: { canonical: `${siteConfig.domain}/destinazioni/${slug}` },
  }
}

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  sicilia: [
    { q: 'Quanto costa una gita in barca in Sicilia?', a: 'Le escursioni di mezza giornata costano in media €70–€120 a persona. Per gite private o giornate intere con pranzo a bordo, i prezzi salgono a €200–€400.' },
    { q: 'Qual è il periodo migliore per le gite in barca in Sicilia?', a: 'Da maggio a settembre. Maggio e settembre offrono ottimo clima con meno folla.' },
    { q: 'Serve prenotare in anticipo?', a: 'In estate è consigliabile prenotare con almeno 1–2 settimane di anticipo, soprattutto per le escursioni alle Eolie.' },
  ],
  sardegna: [
    { q: 'Qual è la zona migliore della Sardegna per le gite in barca?', a: "L'Arcipelago della Maddalena è il must assoluto. Per acque turchesi, il Golfo di Orosei è insuperabile." },
    { q: 'Quanto costa noleggiare una barca in Sardegna?', a: 'Per escursioni guidate si parte da €80 a persona. Il noleggio autonomo va da €150 al giorno.' },
    { q: 'Quando è meglio andare in Sardegna?', a: 'Giugno–settembre, con picco luglio–agosto.' },
  ],
  'costiera-amalfitana': [
    { q: 'Qual è il miglior punto di partenza per le gite sulla Costiera?', a: 'Positano e Amalfi sono i più comodi. Da Sorrento si raggiunge la Costiera in circa 30 minuti.' },
    { q: 'È possibile fare gite al tramonto sulla Costiera?', a: 'Sì, le gite al tramonto da Positano sono tra le esperienze più richieste, con aperitivo a bordo.' },
    { q: 'Le gite includono la Grotta dello Smeraldo?', a: 'Molte escursioni prevedono la sosta alla Grotta. Verificare sempre l\'itinerario.' },
  ],
  venezia: [
    { q: 'Vale la pena prendere una barca privata a Venezia?', a: 'Sì, se il budget lo permette. Permette di fermarsi dove si vuole e raggiungere canali inaccessibili ai mezzi pubblici.' },
    { q: 'Quale isola della laguna merita di più?', a: 'Burano per le fotografie, Torcello per la storia, Murano per chi ama l\'arte vetraria.' },
    { q: 'Le gite sono adatte ai bambini?', a: 'Sì, la laguna è quasi sempre piatta e sicura.' },
  ],
}

export default async function DestinazioneSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, experiences, articles] = await Promise.all([
    getDestination(slug),
    getExperiences({ destination: slug }),
    getArticles({ destination: slug, limit: 3 }),
  ])

  if (!data) notFound()

  const { content } = await compileMDX({
    source: data.source,
    options: { parseFrontmatter: true },
  })

  const topExperiences = experiences.slice(0, 3)
  const remainingExperiences = experiences.slice(3, 9)
  const faqs = FAQ_DATA[slug] ?? []
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  return (
    <div className="bg-white">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Header */}
      <div className="bg-sky-50 border-b border-sky-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Gite in barca in {data.meta.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Escursioni, tour e esperienze selezionate lungo la costa
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        {/* Intro MDX */}
        <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-sky-600">
          {content}
        </div>

        {/* Top 3 Esperienze */}
        {topExperiences.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Le migliori gite in barca in {data.meta.name}
            </h2>
            <p className="text-sm text-gray-500 mb-6">Selezionate dalla redazione</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {topExperiences.map(exp => (
                <ExperienceCard key={exp.slug} experience={exp} />
              ))}
            </div>
          </section>
        )}

        {/* Lista esperienze rimanenti */}
        {remainingExperiences.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Altre esperienze</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {remainingExperiences.map(exp => (
                <ExperienceCard key={exp.slug} experience={exp} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Domande frequenti sulle gite in barca in {data.meta.name}
            </h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm">{q}</p>
                  <p className="text-gray-600 text-sm mt-1">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Articoli correlati */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Guide su {data.meta.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {articles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify destination pages in browser**

Visit `http://localhost:3000/destinazioni` — expected: grid of 4 destinations.
Visit `http://localhost:3000/destinazioni/sicilia` — expected: H1 "Gite in barca in Sicilia", MDX content rendered, ExperienceCards, FAQ section.

- [ ] **Step 4: Commit**

```bash
git add src/app/destinazioni/
git commit -m "feat: add /destinazioni index and /destinazioni/[slug] with MDX, experiences, FAQ, JSON-LD"
```

---

## DAY 3

---

### Task 11: First MDX article

**Files:**
- Create: `content/articoli/gite-barca-sicilia.mdx`

- [ ] **Step 1: Create content/articoli/gite-barca-sicilia.mdx**

```mdx
---
title: "Le migliori gite in barca in Sicilia (2026)"
description: "Guida completa alle escursioni in barca in Sicilia: dove andare, quanto costa, quando partire e le esperienze da non perdere."
slug: gite-barca-sicilia
destination: sicilia
publishedAt: "2026-04-23"
updatedAt: "2026-04-23"
coverImage: /images/articoli/sicilia-cover.jpg
seo:
  title: "Gite in Barca in Sicilia 2026 — Guida Completa | Veleggiamo"
  description: "Scopri le migliori gite in barca in Sicilia: Taormina, Eolie, Palermo. Prezzi, periodi migliori e consigli pratici."
---

La Sicilia è, senza dubbio, una delle destinazioni più spettacolari per le gite in barca in Italia. Il mare siciliano offre tutto: acque cristalline, grotte nascoste, isole vulcaniche e borghi costieri che sembrano usciti da un altro tempo. Il periodo ideale va da maggio a ottobre, con il mare più caldo in luglio e agosto.

In questa guida trovi tutto quello che ti serve per organizzare la tua escursione in barca in Sicilia: le zone migliori, i prezzi reali, cosa aspettarsi e i consigli pratici per scegliere bene.

## Le zone migliori per le gite in barca in Sicilia

La Sicilia è grande e le esperienze cambiano molto da zona a zona. Eccole in breve.

**Costa orientale (Taormina, Catania):** La combinazione di Taormina dall'acqua con l'Etna sullo sfondo è una delle viste più iconiche d'Italia. Le gite partono tipicamente dal porto di Taormina e raggiungono Isola Bella, la Grotta Azzurra e le spiagge di Mazzarò. Ideale per chi cerca bellezza paesaggistica e snorkeling.

**Isole Eolie (da Milazzo):** Un mondo a parte. Lipari, Vulcano, Stromboli, Panarea — ogni isola ha un carattere unico. Le escursioni di giornata intera da Milazzo permettono di visitarne 2–3 in una sola uscita. I fondali sono ricchi di vita marina e le acque termali di Vulcano sono un'esperienza indimenticabile. Scopri di più sulla [destinazione Sicilia](/destinazioni/sicilia).

**Costa nord-occidentale (Palermo, Cefalù):** Meno conosciuta ma altrettanto bella. Le riserve naturali dello Zingaro e di Capo Gallo si raggiungono comodamente in barca. Le calette accessibili solo via mare valgono da sole il viaggio.

**Costa sud (Agrigento, Sciacca):** Per chi cerca quiete e autenticità. Le acque sono meno frequentate e i prezzi più contenuti. La Valle dei Templi vista dal mare al tramonto è uno spettacolo raro.

## Quanto costano le gite in barca in Sicilia

I prezzi variano molto in base alla zona, alla durata e al tipo di imbarcazione. Ecco una panoramica realistica per il 2026.

**Escursioni di gruppo di mezza giornata (3–4 ore):** €60–€100 a persona. Include di solito skipper, soste per nuoto e snorkeling, acqua a bordo.

**Escursioni di gruppo per una giornata intera:** €100–€160 a persona. Include pranzo a bordo o a terra, più soste e distanze maggiori (es. Eolie).

**Noleggio barca privata (senza skipper):** €150–€400 al giorno per gommoni e piccoli cabinati. Richiede patente nautica.

**Barca privata con skipper (2–8 persone):** €400–€1.000 al giorno, da dividere nel gruppo.

Per un confronto diretto delle [esperienze disponibili in Sicilia](/destinazioni/sicilia), puoi trovare le opzioni selezionate dalla nostra redazione.

## Quando andare: il calendario ideale

- **Maggio–giugno:** Ottimo periodo. Mare già caldo (20–23°C), poca folla, prezzi pre-stagionali.
- **Luglio–agosto:** Picco stagionale. Mare caldo (26–28°C), ma prenotazioni necessarie con settimane di anticipo. Prezzi al massimo.
- **Settembre–ottobre:** Il nostro mese preferito. Mare ancora caldo, folla dimezzata, prezzi in calo. Settembre è spesso il mese con le acque più trasparenti.
- **Novembre–aprile:** Sconsigliato per la maggior parte delle escursioni. Il mare può essere agitato e molti operatori sospendono il servizio.

## Cosa aspettarsi a bordo

La maggior parte delle escursioni in Sicilia usa gommoni semi-rigidi (RIB) o piccoli cabinati. I gommoni sono più veloci e consentono di raggiungere più luoghi, ma espongono di più al vento. I cabinati sono più confortevoli per giornate intere.

Quasi tutte le escursioni prevedono:
- Skipper professionista con patente nautica
- Attrezzatura base per lo snorkeling
- Soste in calette per nuoto libero
- Acqua a bordo (bevande e cibo extra a pagamento, salvo indicazioni)

Porta sempre: protezione solare alta (l'acqua amplifica i raggi), scarpe da scoglio, asciugamano, mal di mare preventivo se sei sensibile.

## Consigli pratici prima di prenotare

**Prenotare in anticipo è fondamentale in estate.** Le escursioni più richieste — specialmente alle Eolie — si esauriscono in pochi giorni. Da luglio ad agosto, prenota con almeno 2 settimane di anticipo.

**Confronta le cancellazioni.** Le condizioni meteo in Sicilia cambiano rapidamente. Scegli sempre operatori con politica di cancellazione gratuita fino a 24–48 ore prima.

**Diffida dei prezzi troppo bassi.** Sotto €40 a persona per un'escursione di mezza giornata, spesso si tratta di barchette sovraffollate o itinerari ridotti.

**Verifica le recensioni recenti.** Le barche cambiano spesso proprietà o gestione. Le recensioni degli ultimi 6 mesi sono più affidabili di quelle vecchie.

## FAQ

**Qual è la gita in barca più bella in Sicilia?**
Le Isole Eolie, specialmente il percorso Lipari–Vulcano–Panarea, è quasi unanimemente considerata l'escursione più spettacolare. Per bellezza paesaggistica più vicina alla terraferma, Taormina e Isola Bella non deludono mai.

**Quanto dura una gita in barca media in Sicilia?**
Le escursioni di mezza giornata durano 3–4 ore. Le giornate intere 6–8 ore. Per le Eolie da Milazzo è consigliabile almeno 8 ore.

**Le gite in barca in Sicilia sono adatte ai bambini?**
Sì, in condizioni di mare calmo (primavera e inizio estate). I bambini amano lo snorkeling e le soste nelle calette. Evitare luglio–agosto se i bambini soffrono il caldo.
```

- [ ] **Step 2: Commit**

```bash
git add content/articoli/
git commit -m "content: add first SEO article — gite in barca in Sicilia (2026)"
```

---

### Task 12: Articles feature — index + [slug] pages

**Files:**
- Create: `src/app/articoli/page.tsx`
- Create: `src/app/articoli/[slug]/page.tsx`

- [ ] **Step 1: Create src/app/articoli/page.tsx**

```tsx
// src/app/articoli/page.tsx
import type { Metadata } from 'next'
import { getArticles } from '@/lib/content/articles'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Guide per Gite in Barca in Italia',
  description: 'Guide pratiche per organizzare la tua gita in barca in Italia. Destinazioni, prezzi, consigli e itinerari selezionati dalla redazione.',
  alternates: { canonical: `${siteConfig.domain}/articoli` },
}

export default async function ArticoliPage() {
  const articles = await getArticles()

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Guide per organizzare la tua gita in barca
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Tutto quello che devi sapere per scegliere la destinazione giusta, prenotare al momento giusto e vivere un&apos;esperienza indimenticabile in mare.
      </p>
      {articles.length === 0 ? (
        <p className="text-gray-400 text-sm">Nessun articolo disponibile al momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create src/app/articoli/[slug]/page.tsx**

```tsx
// src/app/articoli/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { compileMDX } from 'next-mdx-remote/rsc'
import { getArticle, getAllArticleSlugs, getArticles, extractToc } from '@/lib/content/articles'
import { getExperiences } from '@/lib/data/experiences'
import { ExperienceCard } from '@/components/ExperienceCard'
import { ArticleCard } from '@/components/ArticleCard'
import { siteConfig } from '@/lib/config/site'

export async function generateStaticParams() {
  return getAllArticleSlugs()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) return {}
  const title = data.meta.seo?.title ?? data.meta.title
  const description = data.meta.seo?.description ?? data.meta.description
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.domain}/articoli/${slug}` },
    openGraph: { title, description, images: data.meta.coverImage ? [data.meta.coverImage] : [siteConfig.defaultOgImage] },
  }
}

export default async function ArticoloSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getArticle(slug)
  if (!data) notFound()

  const [experiences, relatedArticles] = await Promise.all([
    getExperiences({ destination: data.meta.destination, limit: 3 }),
    getArticles({ destination: data.meta.destination, limit: 3 }),
  ])

  const otherArticles = relatedArticles.filter(a => a.slug !== slug).slice(0, 2)
  const toc = extractToc(data.source)

  const { content } = await compileMDX({
    source: data.source,
    options: { parseFrontmatter: true },
  })

  const displayDate = data.meta.updatedAt ?? data.meta.publishedAt

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* MAIN */}
        <article className="flex-1 min-w-0">
          {/* Cover */}
          {data.meta.coverImage && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-sky-100 mb-8">
              <img src={data.meta.coverImage} alt={data.meta.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* H1 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {data.meta.title}
          </h1>

          {/* Info rapide */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-b border-gray-100 pb-4 mb-6">
            <span>📍 <Link href={`/destinazioni/${data.meta.destination}`} className="hover:text-sky-600 capitalize">{data.meta.destination.replace('-', ' ')}</Link></span>
            {data.meta.readingTime && <span>⏱️ {data.meta.readingTime} min di lettura</span>}
            <span>📅 Aggiornato: {displayDate}</span>
          </div>

          {/* Mini-box esperienze above fold */}
          {experiences.length > 0 && (
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 mb-6 text-sm">
              <span className="text-gray-600">Vuoi vedere subito le migliori gite? </span>
              <a href="#esperienze-consigliate" className="text-sky-600 font-semibold hover:underline">
                → {experiences.length} esperienze consigliate ↓
              </a>
            </div>
          )}

          {/* TOC */}
          {toc.length > 0 && (
            <nav className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-8">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Indice</p>
              <ul className="space-y-1.5">
                {toc.map(({ id, title }) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-sm text-sky-600 hover:underline">
                      {title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* MDX content */}
          <div className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-sky-600 prose-h2:text-xl prose-h2:font-bold">
            {content}
          </div>

          {/* Box esperienze consigliate */}
          {experiences.length > 0 && (
            <section id="esperienze-consigliate" className="mt-12 scroll-mt-20">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Esperienze consigliate in {data.meta.destination.replace('-', ' ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {experiences.map(exp => (
                  <ExperienceCard key={exp.slug} experience={exp} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* SIDEBAR */}
        <aside className="lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-5">
            <p className="font-semibold text-gray-900 text-sm mb-3">
              Guida completa alla destinazione
            </p>
            <Link
              href={`/destinazioni/${data.meta.destination}`}
              className="block text-sky-600 font-medium text-sm hover:underline capitalize"
            >
              → Vai alla guida {data.meta.destination.replace('-', ' ')}
            </Link>
          </div>

          {experiences.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-4">Esperienze più prenotate</p>
              <div className="space-y-3">
                {experiences.slice(0, 2).map(exp => (
                  <a
                    key={exp.slug}
                    href={exp.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-gray-700 hover:text-sky-600"
                  >
                    ⭐ {exp.title} — {exp.price}
                  </a>
                ))}
              </div>
            </div>
          )}

          {otherArticles.length > 0 && (
            <div className="border border-gray-100 rounded-xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-3">Leggi anche</p>
              <ul className="space-y-2">
                {otherArticles.map(a => (
                  <li key={a.slug}>
                    <Link href={`/articoli/${a.slug}`} className="text-sm text-sky-600 hover:underline">
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify article pages in browser**

Visit `http://localhost:3000/articoli` — expected: list with one article card.
Visit `http://localhost:3000/articoli/gite-barca-sicilia` — expected: H1, info bar, mini-box esperienze, TOC, MDX content, ExperienceCards, sidebar with destination link.

- [ ] **Step 4: Commit**

```bash
git add src/app/articoli/
git commit -m "feat: add /articoli index and /articoli/[slug] with TOC, sidebar, experiences box, SEO metadata"
```

---

### Task 13: /gite/[slug] placeholder + final run

**Files:**
- Create: `src/app/gite/[slug]/page.tsx`

- [ ] **Step 1: Create src/app/gite/[slug]/page.tsx (placeholder)**

```tsx
// src/app/gite/[slug]/page.tsx
import { notFound } from 'next/navigation'

// Day 4+: implement full experience page
// For now, all /gite/[slug] routes return 404 so internal links don't break the build
export default function GitaSlugPage() {
  notFound()
}
```

- [ ] **Step 2: Run full test suite**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 3: Run production build to verify no errors**

```bash
npm run build
```

Expected: build completes without errors. All static pages pre-rendered.

- [ ] **Step 4: Verify sitemap now includes all URLs**

```bash
npm run start
```

Visit `http://localhost:3000/sitemap.xml` — expected: homepage, /destinazioni, /articoli, 4 destination slugs, 1 article slug.

- [ ] **Step 5: Final commit**

```bash
git add src/app/gite/
git commit -m "feat: add /gite/[slug] placeholder (returns 404, Day 4+ implementation)"
```

---

## Self-Review

**Spec coverage check:**

| Spec Section | Task |
|---|---|
| File structure | File Map + Task 1 |
| Types (ArticleMeta, Experience) | Task 2 |
| siteConfig | Task 2 |
| Tracking wrapper | Task 2 |
| Data layer — experiences | Task 3 |
| Data layer — events | Task 3 |
| Content layer — destinations | Task 4 |
| Content layer — articles | Task 4 |
| Global layout, Navbar, Footer | Task 5 |
| Homepage (5 sections) | Task 6 |
| Sitemap + robots.txt | Task 7 |
| Destination MDX files | Task 8 |
| DestinationCard, ExperienceCard, ArticleCard | Task 9 |
| /destinazioni index + [slug] | Task 10 |
| First article MDX | Task 11 |
| /articoli index + [slug] | Task 12 |
| /gite/[slug] placeholder | Task 13 |
| generateStaticParams on all dynamic routes | Task 10, 12 |
| generateMetadata on all pages | Task 6, 7, 10, 12 |
| FAQ JSON-LD | Task 10 |
| Canonical URLs | Task 6, 10, 12 |
| Active state Navbar | Task 5 (NavbarLinks) |
| Footer SEO destination links | Task 5 |
| Fallback UI (empty data) | Task 6, 11, 12 (conditional render) |
| Inter font | Task 5 |
| Affiliate-ready Experience type | Task 2 |
| `order` field for curated ordering | Task 3 |
| `affiliateSource` typed union | Task 2 |
| `seo.title` / `seo.description` fallback | Task 12 |
| readingTime calculation | Task 4 |
| TOC extraction | Task 4, 12 |
| deletions of legacy code | Task 1 |

All spec requirements covered.
