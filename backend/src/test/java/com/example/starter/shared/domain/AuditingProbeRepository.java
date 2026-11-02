package com.example.starter.shared.domain;

import org.springframework.data.jpa.repository.JpaRepository;

interface AuditingProbeRepository extends JpaRepository<AuditingProbe, Long> {}
