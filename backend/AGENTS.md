# backend

Spring Boot 4.0 과 Java 25, Gradle(Kotlin DSL)을 쓴다. JDK 25 가 없으면 Gradle toolchain 이 내려받는다. 운영 DB 는 MySQL, 테스트 DB 는 MySQL 모드의 H2 이고 스키마는 Flyway 가 만든다.

저장소 전체에 걸리는 규칙은 루트 [`AGENTS.md`](../AGENTS.md) 가 갖는다.

## 변경 전에 고를 규칙

| 변경 대상 | 규칙 |
| --- | --- |
| 시각과 감사 필드 | [rule-1](../docs/code-rules/rule-1.md) |
| 빈 주입 | [rule-2](../docs/code-rules/rule-2.md) |
| 테스트 이름 | [rule-3](../docs/code-rules/rule-3.md) |
| 패키지와 의존 방향 | [rule-4](../docs/code-rules/rule-4.md) |
| 설정 값과 비밀값 | [rule-5](../docs/code-rules/rule-5.md) |

## 패키지 배치

`com.example.starter.<기능>.<역할>` 로 나눈다. 역할은 [rule-4](../docs/code-rules/rule-4.md) 가 정한다.
여러 기능이 함께 쓰는 설정과 부모 타입은 `shared` 에 둔다.

- `shared/config/ClockConfig`: 현재 시각을 주는 `Clock` 빈
- `shared/config/JpaAuditingConfig`, `shared/domain/BaseTimeEntity`: 엔티티의 `created_at`, `updated_at` 을 `Clock` 으로 채운다
- `system/presentation/SystemInfoController`: web 이 연결을 확인하는 예시 API(`GET /api/system/info`). 새 기능을 만들 때 지우거나 바꿔도 된다

## 마이그레이션

`src/main/resources/db/migration/V<번호>__<설명>.sql` 로 더한다. 테이블과 컬럼 이름은 lower_snake_case 로 쓴다.
시각은 `Instant` 로 다루고 UTC 로 저장한다(`hibernate.jdbc.time_zone: UTC`).
`BaseTimeEntity` 를 상속한 엔티티의 테이블에는 `created_at DATETIME(6) NOT NULL`, `updated_at DATETIME(6) NOT NULL` 을 둔다.
**이미 적용된 마이그레이션 파일은 고치지 않는다.** Flyway 가 주석까지 체크섬에 넣어 기동이 멈춘다.
`src/test/resources/db/test-migration/` 은 테스트 전용 테이블이다. 운영 DB 에는 적용되지 않는다.

## 테스트

통합 테스트는 `support/IntegrationTest` 애너테이션 하나만 붙인다. 테스트마다 설정이 다르면 Spring 컨텍스트가 여러 번 떠 느려진다.
시각은 `MutableClock` 을 주입받아 정하고 옮긴다.

```bash
# cwd: backend/
./gradlew test                                   # 테스트와 ArchUnit 규칙
./gradlew test --tests '*ArchitectureRulesTest'  # 구조 규칙만
./gradlew build                                  # 컴파일 경고도 실패로 본다(-Werror)
```
