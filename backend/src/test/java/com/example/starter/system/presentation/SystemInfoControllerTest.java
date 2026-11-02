package com.example.starter.system.presentation;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.starter.support.IntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class SystemInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("애플리케이션 이름과 주입된 시계의 현재 시각을 돌려준다")
    void returnsApplicationNameAndServerTime() throws Exception {
        mockMvc.perform(get("/api/system/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.application").value("starter"))
                .andExpect(jsonPath("$.serverTime").value("2026-01-01T00:00:00Z"));
    }

    @Test
    @DisplayName("health 엔드포인트가 UP 을 돌려준다")
    void healthIsUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
