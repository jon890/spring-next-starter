plugins {
    id("java")
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "com.example"
version = "0.1.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.bundles.spring.boot.starters)
    implementation(libs.flyway.mysql)
    runtimeOnly(libs.mysql.connector.j)

    testImplementation(libs.bundles.spring.test)
    testImplementation(libs.archunit)
    testRuntimeOnly(libs.junit.platform.launcher)
    testRuntimeOnly(libs.h2.database)
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-parameters", "-Xlint:all", "-Werror"))
}

tasks.test {
    useJUnitPlatform()
}
