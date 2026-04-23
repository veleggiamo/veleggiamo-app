# Implementazioni Future

Funzionalità esistenti nel codebase da riconsiderare quando il sito editoriale sarà funzionante.

---

## Motore di ricerca attrezzatura nautica

**File chiave:**
- `src/app/risultati/page.tsx`
- `src/services/searchService.ts`
- `src/lib/matchingEngine.ts`
- `src/lib/intentParser.ts`
- `src/components/SearchBar.tsx`
- `src/components/ProductCard.tsx`
- `src/components/ProductList.tsx`
- `src/app/api/search/route.ts`

**Descrizione:** L'utente inserisce una query in linguaggio naturale (es. "ancora 10m"), il sistema interpreta barca + categoria e restituisce prodotti con score di compatibilità 0–100 e spiegazione tecnica.

**Possibili utilizzi futuri:**
- Sezione "Attrezzatura" nel menu come area separata
- Widget inline dentro articoli ("Stai pianificando questa gita? Trova l'attrezzatura giusta")
- Tool dedicato per armatori

---

## Dashboard Fornitore

**File chiave:**
- `src/app/dashboard/fornitore/page.tsx`
- `src/app/api/upload-catalog/route.ts`
- `src/app/fornitore/[id]/page.tsx`
- `src/components/FornitoreForm.tsx`

**Descrizione:** Area privata per i rivenditori nautici (auth via Clerk). Permette di caricare un catalogo prodotti (CSV/Excel) e visualizzare i prodotti caricati. La pagina `/fornitore/[id]` mostra il profilo pubblico del rivenditore con form per richiedere disponibilità.

**Possibili utilizzi futuri:**
- Sponsor/partner del sito editoriale
- Sezione "Dove comprare" dentro gli articoli
- Lead generation verso rivenditori locali

---

## Widget JS Embeddabile

**File chiave:**
- `src/app/api/widget/search/route.ts`
- `public/widget.js` (presumibile)
- `src/app/per-fornitori/page.tsx`

**Descrizione:** I fornitori incollano 2 righe di codice nel loro sito e appare una search box AI che mostra i loro prodotti. Piano Starter gratis 6 mesi, piano Pro €299/anno.

**Possibili utilizzi futuri:**
- Fonte di revenue indipendente dal sito editoriale
- Mantenere la landing `/per-fornitori` attiva come funnel separato
- Integrare con il nuovo brand editoriale ("powered by Veleggiamo")

---

## Autenticazione (Clerk)

**File chiave:**
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `src/middleware.ts`

**Descrizione:** Sistema di login/registrazione per i fornitori. Attualmente protegge solo la dashboard fornitore.

**Possibili utilizzi futuri:**
- Account utenti per salvare gite preferite
- Newsletter personalizzata
- Area membri premium

---

## Note

- Tutto il codice è conservato nel repository, nulla viene rimosso.
- Queste funzionalità non saranno visibili nella navigazione del nuovo sito editoriale finché non si decide di reintegrarle.
- Riesaminare dopo i primi 30 articoli pubblicati e i primi dati Google Search Console.
