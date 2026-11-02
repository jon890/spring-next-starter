package com.example.starter.shared.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 애플리케이션이 쓰는 시계다.
 *
 * <p>현재 시각은 이 빈을 주입받아 구한다. 테스트가 시각을 고정할 수 있게 하려는 것이다. 규칙은 docs/code-rules/rule-1.md 가 갖는다.
 */
@Configuration(proxyBeanMethods = false)
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
