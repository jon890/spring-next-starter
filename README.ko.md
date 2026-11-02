# spring-next-starter

**Spring Boot** backend 와 **Next.js** web 으로 시작하는 서비스의 템플릿이다.
실행되는 골격, 테스트로 검사하는 코드 규칙, 공개 저장소 안전 검사, GitHub Actions CI 를 함께 담았다.

[English README](README.md)

## 구성

| 경로 | 내용 |
| --- | --- |
| `backend/` | Spring Boot 4.1, Java 25, Gradle(Kotlin DSL), MySQL 과 Flyway, 주입된 `Clock` 으로 채우는 JPA auditing(`created_at`, `updated_at`), ArchUnit 규칙 |
| `web/` | Next.js 16(App Router), TypeScript, Tailwind CSS 4, pnpm |
| `compose.yaml` | 로컬 개발용 MySQL |
| `scripts/` | 로컬 검사, 공개 저장소 안전 검사, PR 크기 검사(Node 24 가 바로 실행하는 TypeScript) |
| `docs/code-rules/` | 번호를 붙인 코드 규칙. 규칙마다 검사가 연결돼 있다 |
| `.github/workflows/` | CI(`public-safe`, `backend`, `web`), PR 크기 검사, 선택 기능인 Claude 코드 리뷰 |
| `AGENTS.md` | 사람과 AI 코딩 에이전트가 함께 읽는 저장소 규칙(`CLAUDE.md` 는 이 파일의 링크) |
| `docs/features/` | 기능마다 문서 하나. 지금 동작하는 방식과 다음 변경에 합의한 스펙을 담는다 |

### 템플릿이 주는 것

- **예시 API 와 화면.** `GET /api/system/info`(`SystemInfoController`)가 애플리케이션 이름과 서버 시각을 돌려준다. 첫 화면(`web/src/app/page.tsx`)이 서버에서 `web/src/lib/backend.ts` 를 거쳐 이 API 를 부른다. 이 도우미는 서버 전용이라 브라우저가 backend 를 직접 부르지 않으므로 CORS 설정이 필요 없다.
- **제어할 수 있는 시각.** 현재 시각이 필요한 곳에는 `Clock` 빈을 주입한다. 엔티티가 `BaseTimeEntity` 를 상속하면 JPA auditing 이 그 `Clock` 으로 `created_at` 과 `updated_at` 을 채운다.
- **테스트 지원.** 통합 테스트에 `@IntegrationTest` 를 붙이면 Spring 컨텍스트를 함께 쓴다. `MutableClock` 으로 테스트가 시각을 정하고 옮긴다. 테스트는 MySQL 모드의 메모리 H2 에서 운영과 같은 Flyway 마이그레이션을 적용해 돌므로 Docker 가 필요 없다. 테스트 전용 테이블은 `backend/src/test/resources/db/test-migration` 에 둔다.
- **테스트로 검사하는 코드 규칙.** 번호를 붙인 규칙 다섯 개([코드 규칙](#코드-규칙) 참고).
- **검사와 CI.** 로컬 명령 하나, GitHub Actions 의 같은 검사, PR 크기 상한([검사](#검사) 참고).

## 준비물

- Gradle 을 돌릴 JDK 17 이상. JDK 25 가 없으면 Gradle 이 첫 빌드 때 내려받는다(toolchain 자동 설치). 처음 한 번 몇 분 걸린다.
- Node.js 24 이상
- pnpm. Corepack 으로 켠다: `corepack enable`
- Docker(로컬 MySQL 용)

## 시작하기

### 1. 저장소 만들기

GitHub 에서 **Use this template** 을 누르거나 GitHub CLI 를 쓴다.

```bash
gh repo create my-app --template jon890/spring-next-starter --private --clone
cd my-app
```

### 2. MySQL 띄우기

```bash
docker compose up -d --wait mysql
```

`--wait` 는 MySQL 이 접속을 받을 때까지 기다린다. 첫 기동은 초기화 때문에 조금 더 걸린다.
`compose.yaml` 의 계정은 로컬 전용 예시 값이다. 다른 환경에서는 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` 를 반드시 준다. 주지 않으면 backend 가 로컬 기본값으로 붙으려 한다.

### 3. backend 실행

```bash
cd backend
./gradlew bootRun
```

떴는지 확인한다.

```bash
curl http://localhost:8080/api/system/info
curl http://localhost:8080/actuator/health
```

### 4. web 실행

다른 터미널에서 실행한다.

```bash
cd web
pnpm install
pnpm dev
```

<http://localhost:3000> 을 연다. backend 가 떠 있으면 **Connected to starter**, 아니면 **Not connected** 가 보인다.
web 서버는 `BACKEND_URL`(기본 `http://localhost:8080`)로 backend 를 부른다. 바꾸려면 `web/.env.example` 을 `web/.env.local` 로 복사해 고친다.

## 컴포넌트 라이브러리 붙이기

web 은 Tailwind CSS 만 담았다. [shadcn/ui](https://ui.shadcn.com/) 를 붙이려면 아래를 실행한다.

```bash
cd web
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button
```

## 테스트 돌리기

```bash
# backend: Docker 와 MySQL 이 필요 없다(MySQL 모드의 H2)
cd backend
./gradlew test

# web
cd web
pnpm lint
pnpm typecheck
pnpm format:check
```

`node scripts/dev/check-local.ts --fast`([검사](#검사) 참고)는 저장소 검사와 함께 이 명령을 모두 돈다.

## 내 프로젝트로 바꾸기

- Java 패키지 `com.example.starter` 와 `backend/build.gradle.kts` 의 `group` 을 바꾼다.
- `backend/src/main/resources/application.yml` 의 `spring.application.name` 과 `compose.yaml` 의 데이터베이스 이름을 바꾼다.
- 예시 API(`system/presentation/SystemInfoController`)와 예시 화면(`web/src/app/page.tsx`)을 바꾼다.
- 템플릿 자체의 기능 문서 `docs/features/starter-foundation.md` 와 `docs/features/starter-foundation/` 를 지우거나 고치고, `docs/features/` 에 내 기능 문서를 시작한다.
- 필요하면 `LICENSE` 의 저작권자를 바꾼다.
- `AGENTS.md` 에 내 제품을 설명한다.

## 검사

push 전에 빠른 검사를 돌린다.

```bash
node scripts/dev/check-local.ts --fast
```

공개 저장소 안전 검사, 코드 규칙 목록 검사, PR 크기 검사, web 의 lint·포맷·타입 검사, backend 테스트(ArchUnit 규칙 포함)를 돈다.
`--fast` 없이 돌리면 backend 와 web 빌드까지 한다. 정확한 단계와 순서는 `scripts/dev/check-local.ts` 의 머리말이 갖는다.

### 공개 저장소 안전 검사

`scripts/checks/check-public-safe.ts` 가 추적 파일에서 개인키, 알려진 토큰 모양, 주소 안의 계정과 비밀번호, 사설 IP, 예시 도메인이 아닌 메일 주소를 찾는다.
나만 아는 값(호스트 이름, 계정 이름, 경로)까지 막으려면 정규식 목록을 **저장소 밖에** 두고 경로를 준다.

```bash
PUBLIC_REPO_DENYLIST=/path/to/denylist.txt node scripts/checks/check-public-safe.ts
```

CI 에서는 같은 줄을 `PUBLIC_REPO_DENYLIST` 라는 repository secret 에 넣는다. 선택이다. 없으면 내장 패턴만 검사한다.

### 코드 규칙

[`docs/code-rules/INDEX.md`](docs/code-rules/INDEX.md) 의 규칙마다 고정 번호와 까닭, 연결한 검사가 있다.
`scripts/checks/check-rule-index.ts` 가 목록과 규칙 파일, 검사가 맞는지 확인한다.
규칙은 아래 다섯 개다.

| 규칙 | 내용 |
| --- | --- |
| [rule-1](docs/code-rules/rule-1.md) | 현재 시각은 `now()` 호출이 아니라 주입된 `Clock` 으로 구한다 |
| [rule-2](docs/code-rules/rule-2.md) | 운영 코드는 생성자 주입을 쓴다 |
| [rule-3](docs/code-rules/rule-3.md) | 테스트 메서드마다 `@DisplayName` 으로 문장을 쓴다 |
| [rule-4](docs/code-rules/rule-4.md) | domain 은 웹 계층에 의존하지 않는다 |
| [rule-5](docs/code-rules/rule-5.md) | 추적 파일에 비밀값, 개인 정보, 운영 값을 두지 않는다 |

### Claude 코드 리뷰(선택)

`.github/workflows/claude-code-review.yml` 이 PR 을 열거나 다시 열거나 Ready 로 올릴 때 Claude 에게 한 번 리뷰를 맡긴다. Draft 와 포크에서 연 PR 은 건너뛴다.
켜려면 아래 repository secret 중 하나를 넣는다.

- `ANTHROPIC_API_KEY`: Anthropic Console 에서 만든 API 키. 리뷰마다 API 사용량으로 과금되고 비용은 PR 크기에 따라 다르다.
- `CLAUDE_CODE_OAUTH_TOKEN`: `claude setup-token` 으로 만든 토큰. Claude 구독을 쓴다.

둘 다 없으면 리뷰 job 을 건너뛰고 CI 는 통과한다.

### PR 크기

`scripts/pr/pr-size.ts` 가 운영 코드, 테스트, 문서의 변경 줄을 나눠 센다.
운영 코드가 `LARGE_THRESHOLD` 줄을 넘으면 `size:large` 로 알리고, `MAX_LINES` 줄을 넘으면 사람이 `size:exempt` 라벨을 붙이지 않는 한 실패한다. 두 값은 스크립트 맨 위의 상수다.

## 라이선스

[MIT](LICENSE)
