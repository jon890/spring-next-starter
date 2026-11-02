# 시작 템플릿 기반

## 목표

다른 사람이 이 template repository 로 새 저장소를 만들고 README 만 보고 backend 와 web 을 띄울 수 있다.
처음부터 규칙과 검사, CI 가 함께 있어 비밀값이나 개인 정보가 공개 저장소에 들어가기 전에 막힌다.

## 범위

이번 PR 의 범위는 「실행되는 최소 골격, README 사용법, CI, 공개 정보 검사」 다.

- backend: Spring Boot 골격, MySQL 과 Flyway, 감사 필드(생성·수정 시각), 예시 API 하나, ArchUnit 으로 검사하는 코드 규칙
- web: Next.js 골격, 서버에서 backend 를 불러 연결 상태를 보이는 예시 화면
- 규칙과 도구: `AGENTS.md`, 코드 규칙 번호 체계, PR 크기 상한, 공개 정보 검사, 로컬 빠른 검사
- CI: GitHub Actions 의 public-safe, backend, web, pr-size
- 문서: 영어 `README.md` 와 한국어 `README.ko.md`

범위 밖이며 뒤 PR 로 미루는 것:

- 인증과 사용자 관리, API 문서(OpenAPI)
- 포매터와 정적 분석 도구(Checkstyle, Spotless, OpenRewrite), 파일 길이 기준
- 실제 MySQL 로 마이그레이션을 검사하는 CI job, 브라우저 E2E, AI 자동 리뷰 workflow
- 패키지 이름을 한 번에 바꾸는 스크립트, Docker 이미지와 배포

fos-assistant 에서 옮기지 않는 것: 가족 비서와 Hermes 에 딸린 규칙과 용어, 홈서버와 운영 저장소를 가리키는 절차, 그 제품 고유의 코드 규칙.

## 요구사항과 인수 조건

| ID | 요구사항 | 관측할 인수 조건 |
| --- | --- | --- |
| R1 | backend 가 MySQL 에 붙어 뜨고 예시 API 와 health 를 돌려준다 | `docker compose up -d mysql` 뒤 `./gradlew bootRun` 이 뜨고 `GET /api/system/info` 가 애플리케이션 이름과 시각을, `GET /actuator/health` 가 `UP` 을 돌려준다 |
| R2 | 엔티티의 생성·수정 시각을 주입된 Clock 으로 채운다 | `BaseTimeEntityTest` 가 저장 때 두 시각이 시계 값과 같고, 수정 때 `updated_at` 만 바뀌는 것을 확인한다 |
| R3 | 코드 규칙이 검사와 연결된다 | `ArchitectureRulesTest` 가 rule-1~4 를 검사하고, 일부러 위반을 만들면 실패한다. `check-rule-index.ts` 가 목록과 파일, 검사의 짝을 확인한다 |
| R4 | web 이 서버에서 backend 를 불러 연결 상태를 보인다 | backend 가 떠 있으면 첫 화면에 `Connected to starter` 가, 꺼져 있으면 `Not connected` 가 보이고 화면이 깨지지 않는다 |
| R5 | 공개 정보 검사가 비밀값과 개인 정보를 막는다 | 개인키 머리말, 토큰 모양, 예시 도메인이 아닌 메일 주소를 추적 파일에 넣으면 `check-public-safe.ts` 가 1 로 끝나고 줄 위치만 보인다. 값 목록 파일을 주면 그 값도 잡는다 |
| R6 | PR 크기 상한을 검사한다 | `pr-size.ts` 가 운영 코드·테스트·문서를 나눠 세고, 운영 코드가 1500줄을 넘으면 `size:exempt` 라벨 없이는 1 로 끝난다. lockfile 과 Gradle wrapper 는 세지 않는다 |
| R7 | 로컬 빠른 검사 하나로 push 전 검사를 돈다 | `node scripts/dev/check-local.ts --fast` 가 공개 정보, 규칙 목록, PR 크기, web 의 lint·포맷·타입, backend 테스트를 돌고 처음 실패한 단계에서 멈춘다 |
| R8 | CI 가 PR 과 main push 에서 같은 검사를 돈다 | PR 에서 public-safe, backend, web, pr-size job 이 통과한다. action 은 커밋 SHA 로 고정돼 있다 |
| R9 | README 대로 처음 쓰는 사람이 띄울 수 있다 | 이 저장소를 새 폴더로 복제해 README 의 준비물과 명령만으로 backend 와 web 을 띄우고 R1, R4 를 관측한다 |

## 설계

### 사용자 결정

| 날짜 | 결정 |
| --- | --- |
| 2026-10-16 | template repository, 프론트는 Next.js |
| 2026-11-01 | 공개 template repository. README 사용법, 라이선스, 운영 값·개인 정보 없음 검사를 포함한다 |
| 2026-11-02 | 저장소 이름 `spring-next-starter`, 라이선스 MIT |
| 2026-11-02 | backend, web 구성, 옮길 규칙 범위, CI 범위, 문서 언어는 아래 「구성」 대로 한다 |

### 구성

- backend(R1, R2): Java 21, Spring Boot 4.1, Gradle Kotlin DSL 과 version catalog(`backend/gradle/libs.versions.toml`). 운영 MySQL, 테스트는 MySQL 모드 H2. Flyway 가 스키마를 만들고 Hibernate 는 `validate` 만 한다. 로컬 MySQL 은 루트 `compose.yaml` 이 띄운다. 접속 값은 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` 로 덮어쓴다.
- 감사 필드(R2): `BaseTimeEntity` 가 `created_at`, `updated_at` 을 갖고 `JpaAuditingConfig` 가 `Clock` 빈으로 채운다. 확인용 엔티티와 테이블은 테스트 소스와 `db/test-migration` 에만 둔다.
- web(R4): Next.js 16 App Router, TypeScript, Tailwind CSS 4, pnpm. 컴포넌트 라이브러리는 넣지 않는다. backend 는 서버 컴포넌트에서 `BACKEND_URL` 로 부르고, 실패하면 `null` 로 바꿔 화면에 연결 안 됨을 보인다.
- 규칙(R3): fos-assistant 의 번호 체계(INDEX.md 와 rule-N.md, 검사 연결)를 옮기고, 규칙은 검사가 붙은 일반적인 것만 둔다. 상세는 [`docs/code-rules/INDEX.md`](../../code-rules/INDEX.md).
- 스크립트(R5~R7): Node 24 가 바로 실행하는 TypeScript 로 쓴다. 템플릿을 쓰는 사람이 web 때문에 Node 를 이미 갖고 있어 다른 런타임이 필요 없다.
- CI(R8): `.github/workflows/ci.yml`(public-safe, backend, web)과 `pr-size.yml`. secret 없이 포크한 저장소에서도 통과한다. `PUBLIC_REPO_DENYLIST` secret 은 선택이다.
- 문서 언어: 루트 `README.md` 는 영어, `README.ko.md` 는 같은 내용의 한국어. `AGENTS.md`, `docs/`, 코드 주석은 한국어.

### 실패 동작

- backend 가 꺼져 있거나 3초 안에 답하지 않으면 web 은 `Not connected` 를 보인다(R4).
- 공개 정보 검사는 걸린 줄의 내용을 출력하지 않고 파일과 줄 번호, 종류만 보인다. 값 목록에 걸린 비공개 값이 CI 로그에 남지 않게 하려는 것이다(R5).
- 값 목록 파일을 읽지 못하면 2 로 끝난다. 변수가 없으면 형태 패턴만 검사하고 알린다(R5).

### 테스트 방법

| ID | 방법 |
| --- | --- |
| R1 | `SystemInfoControllerTest`(MockMvc), 그리고 README 절차로 실제 MySQL 에 붙여 `curl` |
| R2 | `BaseTimeEntityTest` |
| R3 | `./gradlew test`, 규칙마다 일부러 위반을 넣어 실패를 본 뒤 되돌린다, `check-rule-index.ts` |
| R4 | 개발 서버와 빌드 서버에서 backend 를 켜고 끈 상태로 첫 화면을 받는다 |
| R5, R6 | 임시 git 저장소에 위반 파일을 만들어 스크립트를 돌린다 |
| R7 | `node scripts/dev/check-local.ts --fast` |
| R8 | PR 의 CI 결과 |
| R9 | 새 폴더로 복제해 README 절차를 그대로 따른다 |

## 미결정

없음
