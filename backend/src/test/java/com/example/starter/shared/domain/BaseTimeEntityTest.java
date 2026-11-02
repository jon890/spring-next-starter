package com.example.starter.shared.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.starter.support.IntegrationTest;
import com.example.starter.support.MutableClock;
import com.example.starter.support.TestClockConfig;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@IntegrationTest
class BaseTimeEntityTest {

    @Autowired
    private AuditingProbeRepository repository;

    @Autowired
    private MutableClock clock;

    @BeforeEach
    void setUp() {
        clock.set(TestClockConfig.START);
    }

    @AfterEach
    void tearDown() {
        repository.deleteAll();
    }

    @Test
    @DisplayName("저장하면 생성 시각과 수정 시각을 주입된 시계의 시각으로 채운다")
    void fillsTimestampsOnCreate() {
        AuditingProbe saved = repository.saveAndFlush(new AuditingProbe("처음"));

        assertThat(saved.getCreatedAt()).isEqualTo(TestClockConfig.START);
        assertThat(saved.getUpdatedAt()).isEqualTo(TestClockConfig.START);
    }

    @Test
    @DisplayName("수정하면 수정 시각만 바뀌고 생성 시각은 그대로다")
    void updatesOnlyUpdatedAtOnChange() {
        AuditingProbe saved = repository.saveAndFlush(new AuditingProbe("처음"));
        clock.advance(Duration.ofMinutes(5));

        saved.rename("바뀐 이름");
        AuditingProbe updated = repository.saveAndFlush(saved);

        assertThat(updated.getCreatedAt()).isEqualTo(TestClockConfig.START);
        assertThat(updated.getUpdatedAt()).isEqualTo(TestClockConfig.START.plus(Duration.ofMinutes(5)));
    }
}
