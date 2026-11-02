# spring-next-starter

A starter template for a service with a **Spring Boot** backend and a **Next.js** web app.
It ships with a running skeleton, code rules that are enforced by tests, a public-repository safety check, and GitHub Actions CI.

[한국어 README](README.ko.md)

## What's inside

| Path | What it is |
| --- | --- |
| `backend/` | Spring Boot 4.1, Java 25, Gradle (Kotlin DSL), MySQL + Flyway, JPA auditing (`created_at`, `updated_at`) driven by an injected `Clock`, ArchUnit rules |
| `web/` | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, pnpm |
| `compose.yaml` | Local MySQL for development |
| `scripts/` | Local checks, public-repository safety check, PR size check (TypeScript run directly by Node 24) |
| `docs/code-rules/` | Numbered code rules, each linked to the check that enforces it |
| `.github/workflows/` | CI (`public-safe`, `backend`, `web`), PR size check, and an optional Claude code review |
| `AGENTS.md` | Repository rules for humans and AI coding agents (`CLAUDE.md` links to it) |
| `docs/features/` | One document per feature: how it works now, and the agreed spec for the next change |

### What you get

- **An example API and page.** `GET /api/system/info` (`SystemInfoController`) returns the application name and the server time. The home page (`web/src/app/page.tsx`) calls it from the server through `web/src/lib/backend.ts`, which is server-only, so the browser never calls the backend directly and CORS needs no setup.
- **Time you can control.** A `Clock` bean is injected wherever the current time is needed. JPA auditing fills `created_at` and `updated_at` from that `Clock` when an entity extends `BaseTimeEntity`.
- **Test support.** Annotate an integration test with `@IntegrationTest` to share one Spring context. `MutableClock` lets a test set and advance the time. Tests run on an in-memory H2 database in MySQL mode with the same Flyway migrations as production, so they need no Docker. Test-only tables go in `backend/src/test/resources/db/test-migration`.
- **Code rules checked by tests.** Five numbered rules (listed under [Code rules](#code-rules)).
- **Checks and CI.** One local command, the same checks in GitHub Actions, and a PR size limit (see [Checks](#checks)).
## Prerequisites

- A JDK 17 or later to run Gradle. If JDK 25 is not installed, Gradle downloads it on the first build (toolchain auto-provisioning), which takes a few minutes once.
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

## Adding a component library

The web app ships with Tailwind CSS only. To add [shadcn/ui](https://ui.shadcn.com/):

```bash
cd web
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
```

## Running the tests

```bash
# backend: needs neither Docker nor MySQL (H2 in MySQL mode)
cd backend
./gradlew test

# web
cd web
pnpm lint
pnpm typecheck
pnpm format:check
```

`node scripts/dev/check-local.ts --fast` (see [Checks](#checks)) runs all of these together with the repository checks.

## Make it yours

- Rename the Java package `com.example.starter` and the `group` in `backend/build.gradle.kts`.
- Change `spring.application.name` in `backend/src/main/resources/application.yml` and the database name in `compose.yaml`.
- Replace the example API (`system/presentation/SystemInfoController`) and the example page (`web/src/app/page.tsx`).
- Delete or rewrite the template's own feature docs, `docs/features/starter-foundation.md` and `docs/features/starter-foundation/`, and start your own under `docs/features/`.
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
The rule documents are written in Korean. The rules are:

| Rule | Meaning |
| --- | --- |
| [rule-1](docs/code-rules/rule-1.md) | Get the current time from an injected `Clock`, not from `now()` calls |
| [rule-2](docs/code-rules/rule-2.md) | Use constructor injection in production code |
| [rule-3](docs/code-rules/rule-3.md) | Name each test method with `@DisplayName` |
| [rule-4](docs/code-rules/rule-4.md) | The domain layer does not depend on the web layer |
| [rule-5](docs/code-rules/rule-5.md) | Tracked files hold no secrets, personal data, or production values |

### Claude code review (optional)

`.github/workflows/claude-code-review.yml` asks Claude to review a PR once when it is opened, reopened, or marked ready for review. Drafts and pull requests from forks are skipped.
To turn it on, add one of these repository secrets:

- `ANTHROPIC_API_KEY`: an API key from the Anthropic Console. Each review is billed as API usage, so the cost depends on the PR size.
- `CLAUDE_CODE_OAUTH_TOKEN`: a token created with `claude setup-token`, which uses your Claude subscription.

Without either secret, the review job is skipped and CI stays green.

### PR size

`scripts/pr/pr-size.ts` counts changed lines of production code, tests, and docs separately.
A PR above the `LARGE_THRESHOLD` of production code lines is flagged `size:large`, and one above `MAX_LINES` fails unless a person adds the `size:exempt` label. Both values are constants at the top of the script.

## License

[MIT](LICENSE)
