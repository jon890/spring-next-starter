package com.example.starter.system.presentation;

import java.time.Instant;

/** {@code GET /api/system/info} 의 응답이다. */
public record SystemInfoResponse(String application, Instant serverTime) {}
