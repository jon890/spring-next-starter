#!/usr/bin/env node
// push 전 로컬 검사를 차례로 돌린다. 돌리는 명령과 순서, 작업 폴더는 이 스크립트가 원본이다.
//
// 사용법: node scripts/dev/check-local.ts [--fast]
//   --fast  Draft PR 을 열기 전에 쓴다. 공개 정보, 규칙 목록, PR 크기, web 의 lint·포맷·타입,
//           backend 테스트(ArchUnit 규칙 포함)를 돈다. 빌드 산출물은 CI 가 확인한다.
//   (없음)  위에 더해 backend 와 web 의 빌드까지 돈다. CI 가 돌지 못할 때 머지 전에 쓴다.
// 공개 정보 검사는 push 하면 되돌릴 수 없으므로 빼지 않고 맨 앞에 둔다.
//
// 처음 받은 checkout 에서도 돌도록 web 의존성을 lockfile 로 설치한다.
// 단계별 원본 로그는 $TMPDIR 아래 새 폴더에 남긴다. 처음 실패한 단계에서 멈추고 마지막 40줄과 로그 경로를 보인다.
// 모두 통과하면 로그 폴더를 지운다.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--fast");
if (unknown.length > 0) {
  console.error(`알 수 없는 인자: ${unknown.join(" ")}. 사용법: node scripts/dev/check-local.ts [--fast]`);
  process.exit(2);
}
const fast = args.includes("--fast");

const [major] = process.versions.node.split(".").map(Number);
if (major < 24) {
  console.error(`Node 24 이상이 필요하다. 지금은 ${process.versions.node} 이다.`);
  process.exit(2);
}

const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const web = join(ROOT, "web");
const backend = join(ROOT, "backend");

function hasOriginMain(): boolean {
  return spawnSync("git", ["merge-base", "origin/main", "HEAD"], { cwd: ROOT }).status === 0;
}

type Step = { name: string; cwd: string; command: string; args: string[]; skip?: () => string | null };

const steps: Step[] = [
  { name: "public-safe", cwd: ROOT, command: "node", args: ["scripts/checks/check-public-safe.ts"] },
  { name: "rule-index", cwd: ROOT, command: "node", args: ["scripts/checks/check-rule-index.ts"] },
  {
    name: "pr-size",
    cwd: ROOT,
    command: "node",
    args: ["scripts/pr/pr-size.ts", "origin/main", "HEAD"],
    skip: () => (hasOriginMain() ? null : "origin/main 과의 공통 조상을 구하지 못했다"),
  },
  { name: "web-install", cwd: web, command: "pnpm", args: ["install", "--frozen-lockfile"] },
  { name: "web-lint", cwd: web, command: "pnpm", args: ["lint"] },
  { name: "web-format", cwd: web, command: "pnpm", args: ["format:check"] },
  { name: "web-typecheck", cwd: web, command: "pnpm", args: ["typecheck"] },
  ...(fast
    ? [{ name: "backend-test", cwd: backend, command: gradlew, args: ["test"] }]
    : [
        { name: "backend-build", cwd: backend, command: gradlew, args: ["build"] },
        { name: "web-build", cwd: web, command: "pnpm", args: ["build"] },
      ]),
];

const logDir = mkdtempSync(join(tmpdir(), "starter-check-"));
console.log(`로그 폴더(통과하면 지운다): ${logDir}`);

for (const step of steps) {
  const label = step.name.padEnd(16);
  const reason = step.skip?.();
  if (reason) {
    console.log(`${label}건너뜀 (${reason})`);
    continue;
  }
  const started = Date.now();
  // Windows 의 gradlew.bat 과 pnpm.cmd 는 셸을 거쳐야 실행된다.
  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  const seconds = Math.round((Date.now() - started) / 1000);
  const log = join(logDir, `${step.name}.log`);
  writeFileSync(log, `${result.stdout ?? ""}${result.stderr ?? ""}${result.error ? String(result.error) : ""}`);
  if (result.status === 0) {
    console.log(`${label}통과 (${seconds}초)`);
    // 통과해도 검사 범위가 줄었다는 알림과 PR 크기는 보인다.
    const text = readFileSync(log, "utf8");
    if (step.name === "pr-size") process.stdout.write(text);
    else for (const line of text.split("\n").filter((line) => line.startsWith("알림:"))) console.log(`  ${line}`);
    continue;
  }
  console.log(`${label}실패 (${seconds}초)`);
  const lines = readFileSync(log, "utf8").trimEnd().split("\n");
  console.error(`--- ${log} 의 끝 ---`);
  console.error(lines.slice(-40).join("\n"));
  console.error(`원본 로그: ${log}`);
  process.exit(1);
}

rmSync(logDir, { recursive: true, force: true });
console.log(fast ? "빠른 검사를 모두 통과했다." : "전체 검사를 모두 통과했다.");
