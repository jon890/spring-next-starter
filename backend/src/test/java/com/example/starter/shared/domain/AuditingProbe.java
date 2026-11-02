package com.example.starter.shared.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** BaseTimeEntity 를 확인하는 테스트 전용 엔티티다. */
@Entity
@Table(name = "auditing_probe")
class AuditingProbe extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    protected AuditingProbe() {}

    AuditingProbe(String name) {
        this.name = name;
    }

    Long getId() {
        return id;
    }

    void rename(String name) {
        this.name = name;
    }
}
