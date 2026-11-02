-- BaseTimeEntity 의 auditing 을 확인하는 테스트 전용 테이블이다. 운영 DB 에는 적용되지 않는다.
CREATE TABLE auditing_probe (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
);
