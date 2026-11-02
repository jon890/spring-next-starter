# rule-1: 현재 시각은 주입된 Clock 으로 구한다

## 까닭

`Instant.now()` 처럼 시각을 직접 구하면 테스트가 시각을 정할 수 없다.
만료, 정렬, 감사 필드처럼 시각에 따라 결과가 달라지는 코드를 검증하지 못한다.

## 지키는 방법

`java.time.Clock` 빈을 생성자로 받아 `clock.instant()` 를 쓴다.
빈은 `shared/config/ClockConfig` 가 만든다. 통합 테스트는 `support/TestClockConfig` 가 `MutableClock` 으로 바꾼다.

## 예외

없음. 테스트 코드는 검사하지 않는다.

## 검사

`ArchitectureRulesTest.NO_DIRECT_NOW` 가 운영 코드에서 `Instant`, `LocalDateTime`, `LocalDate`, `LocalTime`, `Year`, `YearMonth`, `ZonedDateTime`, `OffsetDateTime` 의 `now`, `System.currentTimeMillis`, `new Date()`, `Clock.systemDefaultZone` 호출을 찾는다.
`SYSTEM_CLOCK_ONLY_IN_CONFIG` 가 `shared.config` 밖의 `Clock.systemUTC` 호출을 찾는다.
