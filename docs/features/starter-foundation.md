# 시작 템플릿 기반

템플릿이 처음부터 갖는 실행 골격과 검사가 지금 어떻게 동작하는지 적는다.
합의한 요구사항과 인수 조건은 [`starter-foundation/spec.md`](starter-foundation/spec.md) 가 갖는다.

## 실행 흐름

1. `compose.yaml` 이 로컬 MySQL(`starter` 데이터베이스)을 띄운다.
2. backend 가 기동하며 Flyway 가 `db/migration` 을 적용하고, Hibernate 가 엔티티와 스키마를 대조한다.
3. web 의 첫 화면이 요청마다 서버에서 `GET {BACKEND_URL}/api/system/info` 를 부른다. 답이 오면 애플리케이션 이름과 서버 시각을, 실패하면 연결 안 됨을 보인다.

## 검사 흐름

| 언제 | 무엇이 | 돌리는 것 |
| --- | --- | --- |
| push 전 | `scripts/dev/check-local.ts --fast` | 공개 정보, 규칙 목록, PR 크기, web 의 lint·포맷·타입, backend 테스트 |
| PR 과 main push | `.github/workflows/ci.yml` | public-safe(공개 정보, 규칙 목록), backend(`./gradlew build`), web(lint, 포맷, 타입, 빌드) |
| PR | `.github/workflows/pr-size.yml` | 운영 코드 변경 줄. 400줄을 넘으면 `size:large` 라벨, 1500줄을 넘으면 실패 |

로컬 검사는 `origin/main` 과의 공통 조상을 구하지 못하면(예: 원격이 없는 새 저장소) PR 크기 단계를 건너뛰고 알린다.
각 검사의 정확한 조건은 그 스크립트와 workflow 가 갖는다. 코드 규칙은 [`docs/code-rules/INDEX.md`](../code-rules/INDEX.md) 가 갖는다.
