# spring-next-starter

A starter template for a service with a **Spring Boot** backend and a **Next.js** web app.
It ships with a running skeleton, code rules that are enforced by tests, a public-repository safety check, and GitHub Actions CI.

[한국어 README](README.ko.md)

## What's inside

| Path | What it is |
| --- | --- |
| `backend/` | Spring Boot 4, Java 21, Gradle (Kotlin DSL), MySQL + Flyway, JPA auditing (`created_at`, `updated_at`) driven by an injected `Clock`, ArchUnit rules |
| `web/` | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, pnpm |
| `compose.yaml` | Local MySQL for development |
| `scripts/` | Local checks, public-repository safety check, PR size check (TypeScript run directly by Node 24) |
| `docs/code-rules/` | Numbered code rules, each linked to the check that enforces it |
| `.github/workflows/` | CI (`public-safe`, `backend`, `web`) and PR size check |
| `AGENTS.md` | Repository rules for humans and AI coding agents (`CLAUDE.md` links to it) |

## Prerequisites

- JDK 21
- Node.js 24 or later
- pnpm, enabled through Corepack: `corepack enable`
- Docker (for the local MySQL)

## Getting started

### 1. Create your repository

Click **Use this template** on GitHub, or use the GitHub CLI:

```bash
gh repo create my-app --template jon890/spring-next-starter --private --clone
cd my-app
```

### 2. Start MySQL

```bash
docker compose up -d --wait mysql
```

`--wait` returns once MySQL accepts connections (the first start takes a little longer while it initializes).
The account in `compose.yaml` is a local-only example. In any other environment, always set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`; otherwise the backend falls back to the local defaults.

### 3. Run the backend

```bash
cd backend
./gradlew bootRun
```

Check that it is up:

```bash
curl http://localhost:8080/api/system/info
curl http://localhost:8080/actuator/health
```

### 4. Run the web app

In another terminal:

```bash
cd web
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The page shows **Connected to starter** when the backend is running, and **Not connected** otherwise.
The web server calls the backend at `BACKEND_URL` (default `http://localhost:8080`). To change it, copy `web/.env.example` to `web/.env.local`.

## Make it yours

- Rename the Java package `com.example.starter` and the `group` in `backend/build.gradle.kts`.
- Change `spring.application.name` in `backend/src/main/resources/application.yml` and the database name in `compose.yaml`.
- Replace the example API (`system/presentation/SystemInfoController`) and the example page (`web/src/app/page.tsx`).
- Update `LICENSE` with your own copyright holder if needed.
- Edit `AGENTS.md` to describe your product.

## Checks

Run the fast checks before you push:

```bash
node scripts/dev/check-local.ts --fast
```

It runs the public-repository safety check, the code rule index check, the PR size check, web lint/format/typecheck, and the backend tests (including ArchUnit rules).
Run it without `--fast` to also build the backend and the web app. The exact steps and their order are described at the top of `scripts/dev/check-local.ts`.

### Public-repository safety check

`scripts/checks/check-public-safe.ts` scans tracked files for private keys, well-known token shapes, credentials in URLs, private IP addresses, and email addresses outside the example domains.
To also block values that only you know (host names, account names, paths), keep a list of regular expressions **outside the repository** and point to it:

```bash
PUBLIC_REPO_DENYLIST=/path/to/denylist.txt node scripts/checks/check-public-safe.ts
```

In CI, put the same lines in a repository secret named `PUBLIC_REPO_DENYLIST`. It is optional; without it, only the built-in shapes are checked.

### Code rules

Each rule in [`docs/code-rules/INDEX.md`](docs/code-rules/INDEX.md) has a fixed number, a reason, and a linked check.
`scripts/checks/check-rule-index.ts` verifies that the index, the rule files, and the checks match.

### PR size

`scripts/pr/pr-size.ts` counts changed lines of production code, tests, and docs separately.
A PR with more than 400 lines of production code gets the `size:large` label, and more than 1500 lines fails unless a person adds the `size:exempt` label.

## License

[MIT](LICENSE)
