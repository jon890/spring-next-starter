# web

Next.js 16(App Router)과 TypeScript, Tailwind CSS 4 를 쓴다. 패키지 관리자는 pnpm 이고 버전은 `package.json` 의 `packageManager` 가 정한다.

저장소 전체에 걸리는 규칙은 루트 [`AGENTS.md`](../AGENTS.md) 가 갖는다.

## backend 호출

backend 는 서버 컴포넌트에서만 부른다. 브라우저가 직접 부르지 않으므로 CORS 설정이 필요 없다.
주소는 환경 변수 `BACKEND_URL` 로 받고 기본값은 `http://localhost:8080` 이다. 호출 도우미는 `src/lib/backend.ts` 다.

Cache Components(`cacheComponents: true`)가 켜져 있다. 요청마다 새로 읽을 데이터는 `await connection()` 뒤에 읽고 `<Suspense>` 로 감싼다.
예시는 `src/app/page.tsx` 의 `BackendStatus` 다.

## 검사

```bash
# cwd: web/
pnpm lint
pnpm format:check   # 고치려면 pnpm format
pnpm typecheck
pnpm build
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
