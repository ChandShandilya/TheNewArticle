# TheNewArticle

[![CI](https://github.com/ChandShandilya/TheNewArticle/actions/workflows/ci.yml/badge.svg)](https://github.com/ChandShandilya/TheNewArticle/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ChandShandilya/TheNewArticle/actions/workflows/codeql.yml/badge.svg)](https://github.com/ChandShandilya/TheNewArticle/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

India-first, low-bandwidth, source-first news aggregator. **Phase 1 MVP** —
aggregation only, mock India data, no auth.

> Read [COPILOT_INSTRUCTIONS.md](./COPILOT_INSTRUCTIONS.md) for architecture,
> data model, and the low-bandwidth constraints that drive every decision.

## Stack

- **apps/web** — Next.js (App Router), SSR, text-first low-bandwidth UI, PWA
- **apps/api** — NestJS, Prisma + PostgreSQL, ingestion pipeline
- **packages/types** — shared `@tna/types` domain model
- **Postgres + Redis** via `docker-compose.yml`

## Quick start

```bash
cp .env.example .env
npm install

npm run db:up          # start Postgres + Redis (Docker)
npm run db:migrate     # apply Prisma schema
npm run ingest         # load mock India stories into the DB

npm run dev:api        # API  -> http://localhost:4000
npm run dev:web        # Web  -> http://localhost:3000
```

### No Docker? Use a native PostgreSQL

If Docker isn't available, install Postgres locally instead of `npm run db:up`:

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE ROLE tna LOGIN PASSWORD 'tna' CREATEDB;"
sudo -u postgres createdb -O tna thenewarticle
ln -sf ../../.env apps/api/.env   # let the Prisma CLI find DATABASE_URL
```

`DATABASE_URL` in `.env` already points at this database. The `CREATEDB`
privilege is required by `prisma migrate dev` (shadow database). Then run
`npm run db:migrate` and `npm run ingest` as above.

## What works in Phase 1

- Mock India + World stories ingested, normalized, and **clustered into stories**
  (multiple sources per story).
- API: `/feed`, `/feed/top`, `/story/:id`, `/search`, `/health`.
- Web: India Top home, category tabs, World tab, story page with full source
  list, search, **Text-only mode**, PWA manifest + service worker.

## Next phases

See COPILOT_INSTRUCTIONS.md §1 and the `about/` notes: real news APIs, user
accounts + personalization, AI summaries/clustering, editorial CMS.
