# rule-4: domain 은 웹 계층에 의존하지 않는다

## 까닭

domain 은 업무 규칙을 담는다. HTTP 요청과 응답 타입을 알면 API 모양이 바뀔 때 업무 규칙까지 함께 고쳐야 한다.

## 지키는 방법

패키지는 `<기능>.<역할>` 로 나눈다. 역할은 `presentation`(컨트롤러와 요청·응답), `application`(서비스와 트랜잭션), `domain`(엔티티와 규칙), `infrastructure`(외부 연동)이다.
`domain` 은 `presentation`, `org.springframework.web`, `jakarta.servlet` 을 쓰지 않는다.

## 예외

없음.

## 검사

`ArchitectureRulesTest.DOMAIN_DOES_NOT_DEPEND_ON_WEB` 이 `..domain..` 패키지의 의존을 본다.
