# 코드 규칙 목록

번호는 고정하며 폐지한 번호를 다시 쓰지 않는다.
규칙의 까닭과 예외는 각 `rule-N.md` 가, 정확한 실행 조건과 범위는 연결한 검사 코드가 갖는다.

이 목록은 `scripts/checks/check-rule-index.ts` 가 확인한다.
표의 줄과 규칙 파일이 짝을 이루는지, 검사 파일이 있는지, 검사 파일이 그 번호를 언급하는지를 본다.

## 채택 기준

- 규칙은 코드가 갖출 상태로 쓴다. 하지 말아야 할 행동의 나열로 쓰지 않는다.
- 겪은 것만 올린다. 일어날 법한 일을 미리 규칙으로 만들지 않는다.
- 검사 방법을 적을 수 없으면 규칙으로 만들지 않는다.
- 새 규칙은 문서와 검사를 같은 PR 에 넣는다.
- 검사를 고치면 일부러 위반을 만들어 잡히는지 본다.

## 규칙

| 번호 | 규칙 한 문장 | 검사 |
| --- | --- | --- |
| [rule-1](rule-1.md) | 현재 시각은 주입된 Clock 으로 구한다. | [NO_DIRECT_NOW](../../backend/src/test/java/com/example/starter/architecture/ArchitectureRulesTest.java) |
| [rule-2](rule-2.md) | 운영 코드는 생성자 주입을 쓴다. | [NO_FIELD_INJECTION](../../backend/src/test/java/com/example/starter/architecture/ArchitectureRulesTest.java) |
| [rule-3](rule-3.md) | 테스트 문장은 메서드의 DisplayName 으로 쓴다. | [TEST_METHODS_HAVE_DISPLAY_NAME](../../backend/src/test/java/com/example/starter/architecture/ArchitectureRulesTest.java) |
| [rule-4](rule-4.md) | domain 은 웹 계층에 의존하지 않는다. | [DOMAIN_DOES_NOT_DEPEND_ON_WEB](../../backend/src/test/java/com/example/starter/architecture/ArchitectureRulesTest.java) |
| [rule-5](rule-5.md) | 추적 파일에 비밀값, 개인 정보, 운영 값을 두지 않는다. | [공개 정보 검사](../../scripts/checks/check-public-safe.ts) |

## 규칙을 더하는 순서

1. 다음 번호로 `rule-N.md` 를 만든다. 까닭, 예외, 검사를 적는다.
2. 검사를 만든다. ArchUnit 규칙이면 `ArchitectureRulesTest` 에 상수와 테스트를 더하고 주석이나 DisplayName 에 `rule-N` 을 적는다.
3. 위 표에 줄을 더한다.
4. 일부러 위반을 만들어 검사가 잡는지 본 뒤 되돌린다.
5. `node scripts/checks/check-rule-index.ts` 로 목록을 확인한다.
