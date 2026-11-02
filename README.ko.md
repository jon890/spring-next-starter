# spring-next-starter

**Spring Boot** backend 와 **Next.js** web 으로 시작하는 서비스의 템플릿이다.
실행되는 골격, 테스트로 검사하는 코드 규칙, 공개 저장소 안전 검사, GitHub Actions CI 를 함께 담았다.

[English README](README.md)

## 구성

| 경로 | 내용 |
| --- | --- |
| `backend/` | Spring Boot 4, Java 21, Gradle(Kotlin DSL), MySQL 과 Flyway, 주입된 `Clock` 으로 채우는 JPA auditing(`created_at`, `updated_at`), ArchUnit 규칙 |
| `web/` | Next.js 16(App Router), TypeScript, Tailwind CSS 4, pnpm |
| `compose.yaml` | 로컬 개발용 MySQL |
| `scripts/` | 로컬 검사, 공개 저장소 안전 검사, PR 크기 검사(Node 24 가 바로 실행하는 TypeScript) |
| `docs/code-rules/` | 번호를 붙인 코드 규칙. 규칙마다 검사가 연결돼 있다 |
| `.github/workflows/` | CI(`public-safe`, `backend`, `web`)와 PR 크기 검사 |
| `AGENTS.md` | 사람과 AI 코딩 에이전트가 함께 읽는 저장소 규칙(`CLAUDE.md` 는 이 파일의 링크) |

## 준비물

- JDK 21
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
docker compose up -d mysql
```

`compose.yaml` 의 계정은 로컬 전용 예시 값이다. 다른 환경에서는 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` 를 준다.

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

## 내 프로젝트로 바꾸기

- Java 패키지 `com.example.starter` 와 `backend/build.gradle.kts` 의 `group` 을 바꾼다.
- `backend/src/main/resources/application.yml` 의 `spring.application.name` 과 `compose.yaml` 의 데이터베이스 이름을 바꾼다.
- 예시 API(`system/presentation/SystemInfoController`)와 예시 화면(`web/src/app/page.tsx`)을 바꾼다.
- 필요하면 `LICENSE` 의 저작권자를 바꾼다.
- `AGENTS.md` 에 내 제품을 설명한다.

## 검사

push 전에 빠른 검사를 돌린다.

```bash
node scripts/dev/check-local.ts --fast
```

공개 저장소 안전 검사, 코드 규칙 목록 검사, PR 크기 검사, web 의 lint·포맷·타입 검사, backend 테스트(ArchUnit 규칙 포함)를 차례로 돈다.
`--fast` 없이 돌리면 backend 와 web 빌드까지 한다.

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

### PR 크기

`scripts/pr/pr-size.ts` 가 운영 코드, 테스트, 문서의 변경 줄을 나눠 센다.
운영 코드가 400줄을 넘으면 `size:large` 라벨이 붙고, 1500줄을 넘으면 사람이 `size:exempt` 라벨을 붙이지 않는 한 실패한다.

## 라이선스

[MIT](LICENSE)
