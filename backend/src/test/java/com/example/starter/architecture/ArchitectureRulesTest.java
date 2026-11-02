package com.example.starter.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noFields;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.Year;
import java.time.YearMonth;
import java.time.ZonedDateTime;
import java.util.Date;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.params.ParameterizedTest;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * 코드 규칙 중 ArchUnit 으로 검사하는 것이다.
 *
 * <p>규칙의 까닭과 예외는 docs/code-rules/INDEX.md 에서 번호로 찾는다. 규칙을 고치면 일부러 위반을 만들어 잡히는지 본다.
 */
class ArchitectureRulesTest {

    private static final String BASE_PACKAGE = "com.example.starter";

    private static final JavaClasses PRODUCTION =
            new ClassFileImporter()
                    .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                    .importPackages(BASE_PACKAGE);

    private static final JavaClasses TESTS =
            new ClassFileImporter()
                    .withImportOption(ImportOption.Predefined.ONLY_INCLUDE_TESTS)
                    .importPackages(BASE_PACKAGE);

    /** rule-1. */
    static final ArchRule NO_DIRECT_NOW =
            noClasses()
                    .should()
                    .callMethod(Instant.class, "now")
                    .orShould()
                    .callMethod(LocalDateTime.class, "now")
                    .orShould()
                    .callMethod(LocalDate.class, "now")
                    .orShould()
                    .callMethod(LocalTime.class, "now")
                    .orShould()
                    .callMethod(Year.class, "now")
                    .orShould()
                    .callMethod(YearMonth.class, "now")
                    .orShould()
                    .callMethod(ZonedDateTime.class, "now")
                    .orShould()
                    .callMethod(OffsetDateTime.class, "now")
                    .orShould()
                    .callMethod(System.class, "currentTimeMillis")
                    .orShould()
                    .callConstructor(Date.class)
                    .orShould()
                    .callMethod(Clock.class, "systemDefaultZone")
                    .because("현재 시각은 주입된 Clock 으로 구한다(rule-1)");

    /** rule-1. 시계 빈을 만드는 shared.config 만 시스템 시계를 만든다. */
    static final ArchRule SYSTEM_CLOCK_ONLY_IN_CONFIG =
            noClasses()
                    .that()
                    .resideOutsideOfPackage(BASE_PACKAGE + ".shared.config")
                    .should()
                    .callMethod(Clock.class, "systemUTC")
                    .because("시스템 시계는 ClockConfig 만 만든다(rule-1)");

    /** rule-2. */
    static final ArchRule NO_FIELD_INJECTION =
            noFields()
                    .should()
                    .beAnnotatedWith(Autowired.class)
                    .because("운영 코드는 생성자 주입을 쓴다(rule-2)");

    /** rule-3. */
    static final ArchRule TEST_METHODS_HAVE_DISPLAY_NAME =
            methods()
                    .that()
                    .areAnnotatedWith(Test.class)
                    .or()
                    .areAnnotatedWith(ParameterizedTest.class)
                    .or()
                    .areAnnotatedWith(RepeatedTest.class)
                    .or()
                    .areAnnotatedWith(TestFactory.class)
                    .should()
                    .beAnnotatedWith(DisplayName.class)
                    .because("테스트 문장은 DisplayName 으로 쓴다(rule-3)");

    /** rule-4. */
    static final ArchRule DOMAIN_DOES_NOT_DEPEND_ON_WEB =
            noClasses()
                    .that()
                    .resideInAPackage("..domain..")
                    .should()
                    .dependOnClassesThat()
                    .resideInAnyPackage("org.springframework.web..", "jakarta.servlet..", "..presentation..")
                    .because("domain 은 웹 계층을 모른다(rule-4)");

    @Test
    @DisplayName("rule-1: 운영 코드는 현재 시각을 직접 구하지 않는다")
    void noDirectNow() {
        NO_DIRECT_NOW.check(PRODUCTION);
        SYSTEM_CLOCK_ONLY_IN_CONFIG.check(PRODUCTION);
    }

    @Test
    @DisplayName("rule-2: 운영 코드에 필드 주입이 없다")
    void noFieldInjection() {
        NO_FIELD_INJECTION.check(PRODUCTION);
    }

    @Test
    @DisplayName("rule-3: 테스트 메서드에 DisplayName 이 있다")
    void testMethodsHaveDisplayName() {
        TEST_METHODS_HAVE_DISPLAY_NAME.check(TESTS);
    }

    @Test
    @DisplayName("rule-4: domain 은 웹 계층에 의존하지 않는다")
    void domainDoesNotDependOnWeb() {
        DOMAIN_DOES_NOT_DEPEND_ON_WEB.check(PRODUCTION);
    }
}
