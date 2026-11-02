# rule-2: 운영 코드는 생성자 주입을 쓴다

## 까닭

필드 주입은 의존성이 생성자에 드러나지 않아 빠진 의존성을 컴파일러가 잡지 못한다.
`final` 로 둘 수 없고, Spring 없이 객체를 만들어 테스트하기 어렵다.

## 지키는 방법

의존성을 `private final` 필드로 두고 생성자로 받는다. 생성자가 하나면 `@Autowired` 를 붙이지 않는다.

## 예외

테스트 클래스는 JUnit 이 객체를 만들므로 필드에 `@Autowired` 를 써도 된다. 검사는 운영 코드만 본다.

## 검사

`ArchitectureRulesTest.NO_FIELD_INJECTION` 이 운영 코드의 필드에 `@Autowired` 가 있는지 본다.
