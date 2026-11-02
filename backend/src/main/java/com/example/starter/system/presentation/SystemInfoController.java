package com.example.starter.system.presentation;

import java.time.Clock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** web 이 backend 와 연결됐는지 확인하는 예시 API 다. 새 기능을 만들 때 지우거나 바꿔도 된다. */
@RestController
@RequestMapping("/api/system")
public class SystemInfoController {

    private final String application;
    private final Clock clock;

    public SystemInfoController(@Value("${spring.application.name}") String application, Clock clock) {
        this.application = application;
        this.clock = clock;
    }

    @GetMapping("/info")
    public SystemInfoResponse info() {
        return new SystemInfoResponse(application, clock.instant());
    }
}
