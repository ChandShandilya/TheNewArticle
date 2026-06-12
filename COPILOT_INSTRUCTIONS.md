# COPILOT_INSTRUCTIONS — TheNewArticle

Project guide for humans and AI assistants working in this repo. Keep changes
aligned with the constraints below.

## 1. Product

TheNewArticle is an **India-first, global news aggregator**. It aggregates and
clusters stories from many publishers, shows **multiple sources per story**, and
links back to the original article. Editorial philosophy: **radical transparency,
minimal bias, maximum context.** Phase 1 = aggregation only (no original
articles, no auth).

Verticals (categories): `ai`, `tech`, `science`, `politics`, `business`,
`sports`, `entertainment`, `art-culture`, `top` (cross-category trending).
Regions: `india` (default), `world`.

## 2. Architecture (monorepo, npm workspaces)

```
apps/web    Next.js (App Router) — SSR, low-bandwidth UI, PWA
apps/api    NestJS — feed/story/search API + ingestion pipeline
packages/types  Shared TypeScript domain types (@tna/types)
docker-compose.yml  Postgres + Redis for local dev
```

Layers: **Ingestion → Processing (normalize → dedup → categorize) → Storage
(Postgres) → Delivery (REST API → SSR web).**

## 3. Canonical data model (source of truth: `packages/types`)

```ts
Source   { id, name, homepageUrl, faviconUrl?, country, language, kind }
Article  { id, storyId, title, summary?, fullText?, url, source,
           language, country, categories[], publishedAt, rawTags[],
           aiSummary?, summaryKind }
Story    { id, title, canonicalUrl, categories[], region, publishedAt,
           articles[]  // all sources clustered into this story }
```

- `source.kind`: `national | regional | international | wire | government`.
- `summaryKind`: `source | ai` — **AI summaries MUST be labelled** in the UI.
- Every article MUST retain `source.name`, `url`, `publishedAt`. Never hide the
  original link.

## 4. Ingestion rules

- Adapters implement the `NewsSourceAdapter` interface (`fetch(): RawArticle[]`).
- Phase 1 uses `mock-india` (deterministic fixtures, no network/keys).
- Real adapters (NewsAPI / NewsData.io / World News API) drop in behind the same
  interface, selected via `INGEST_SOURCE` env var.
- Pipeline: `adapter.fetch()` → `normalize()` → `deduplicate()` (cluster into
  Stories by normalized-title + URL similarity within a time window) → persist.
- Run with `npm run ingest`. Idempotent: re-running must not duplicate stories.

## 5. Low-bandwidth constraints (first-class, non-negotiable)

- **HTML-first, minimal JS.** Use Server Components / SSR; avoid heavy client JS
  and large UI libraries. No CSS-in-JS runtime; use one small global stylesheet.
- **Page weight budget:** target < 50 KB HTML for core content pages (excluding
  optional images).
- **Images:** off by default on the lightweight path. When shown, small
  compressed/lazy-loaded only. Provide a **Text-only mode** toggle (cookie-based,
  works without JS).
- **Caching:** strong HTTP cache headers; client service worker caches the last
  feeds for offline/flaky networks. PWA installable (manifest + SW).
- Keep Core Web Vitals green by construction.

## 6. Coding conventions

- TypeScript **strict** everywhere. No `any` unless justified.
- Shared types come from `@tna/types`; do not redefine domain shapes in apps.
- API: REST, thin controllers, logic in services. Endpoints:
  - `GET /feed?region=india&category=ai&page=1`
  - `GET /feed/top`
  - `GET /story/:id`
  - `GET /search?q=...`
  - `GET /health`
- Web fetches the API server-side; never expose the DB to the client.
- Prefer small, composable modules. Add tests for dedup and normalization logic.

## 7. Local dev

```
cp .env.example .env
npm install
npm run db:up        # Postgres + Redis via Docker
npm run db:migrate   # Prisma schema -> DB
npm run ingest       # load mock India stories
npm run dev:api      # http://localhost:4000
npm run dev:web      # http://localhost:3000
```
