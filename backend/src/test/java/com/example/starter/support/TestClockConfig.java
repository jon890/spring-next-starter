package com.example.starter.support;

import java.time.Instant;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/** 통합 테스트의 시계를 {@link MutableClock} 으로 바꾼다. */
@TestConfiguration(proxyBeanMethods = false)
public class TestClockConfig {

    public static final Instant START = Instant.parse("2026-01-01T00:00:00Z");

    @Bean
    @Primary
    public MutableClock testClock() {
        return new MutableClock(START);
    }
}
