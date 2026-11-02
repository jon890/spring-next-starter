# rule-3: 테스트 문장은 메서드의 DisplayName 으로 쓴다

## 까닭

테스트 보고서와 실패 메시지를 읽는 사람이 메서드 이름을 해석하지 않고 무엇을 확인하는지 바로 알게 한다.
문장은 한국어로 쓰고, 메서드 이름은 짧은 영어 식별자로 둔다.

## 지키는 방법

`@Test` 를 붙인 메서드마다 `@DisplayName("…")` 을 붙인다. 문장은 관측할 결과로 끝낸다.

## 예외

없음.

## 검사

`ArchitectureRulesTest.TEST_METHODS_HAVE_DISPLAY_NAME` 이 테스트 코드의 `@Test` 메서드에 `@DisplayName` 이 있는지 본다.
