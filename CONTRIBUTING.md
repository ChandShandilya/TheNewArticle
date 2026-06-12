# Contributing to TheNewArticle

Thank you for your interest in contributing! This document covers the workflow expected for all changes.

---

## Table of contents

1. [Development setup](#development-setup)
2. [Branch strategy](#branch-strategy)
3. [Commit conventions](#commit-conventions)
4. [Pull request process](#pull-request-process)
5. [Coding standards](#coding-standards)
6. [Running tests](#running-tests)

---

## Development setup

```bash
# 1. Prerequisites: Node ≥ 20, PostgreSQL, Redis
# 2. Clone
git clone https://github.com/ChandShandilya/TheNewArticle.git
cd TheNewArticle

# 3. Install dependencies (also builds @tna/types)
npm install

# 4. Copy and fill env variables
cp .env.example .env

# 5. Run DB migrations
npm run db:migrate -w @tna/api

# 6. Seed with mock data
npm run ingest

# 7. Start both services in parallel
npm run dev
```

The API listens on `http://localhost:4000` and the web app on `http://localhost:3000`.

---

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Direct pushes are blocked. |
| `develop` | Integration branch. PRs merge here first. |
| `feat/<ticket>-<slug>` | New features |
| `fix/<ticket>-<slug>` | Bug fixes |
| `chore/<slug>` | Maintenance (deps, tooling, docs) |

---

## Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
[optional footer(s)]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`  
**Scopes:** `api`, `web`, `types`, `infra`, `ci`

Example: `feat(api): add pagination to feed endpoint`

---

## Pull request process

1. Fork the repo (or create a branch from `develop`).
2. Make your changes in a focused, reviewable PR.
3. Ensure the CI pipeline passes (lint, type-check, build).
4. Fill in the PR template completely.
5. Request a review — PRs require at least **1 approval** before merging.
6. Squash-merge into `develop`; the reviewer merges to `main` when ready to release.

---

## Coding standards

- **TypeScript** — strict mode enabled. No `any` without a comment justifying it.
- **Formatting** — Prettier enforced. Run `npx prettier --write .` before committing.
- **Secrets** — never commit `.env` or credentials. Add new env vars to `.env.example` with a safe placeholder.
- **Dependencies** — discuss in an issue before adding new runtime dependencies.

---

## Running tests

```bash
# All workspaces
npm test --workspaces --if-present

# Single workspace
npm test -w @tna/api
npm test -w @tna/web
```
