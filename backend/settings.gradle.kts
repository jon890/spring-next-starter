plugins {
    // 설치된 JDK 중 toolchain 버전(25)이 없으면 Gradle 이 내려받는다.
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "starter-backend"
