#!/usr/bin/env node
// PR 의 base 와 head 의 공통 조상부터 추가·삭제 줄을 센다.
// 사용법: node scripts/pr/pr-size.ts <base> [head] [--json]
// 운영 코드가 LARGE_THRESHOLD 를 넘으면 size:large 후보로 알리고, MAX_LINES 를 넘으면 실패한다.
// size:exempt 라벨이 있으면(환경 변수 PR_LABELS 의 JSON 배열) 상한을 넘어도 통과한다. 라벨은 사람이 붙인다.
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// 수치와 제외 규칙은 이 파일이 갖는다.
export const LARGE_THRESHOLD = 400;
export const MAX_LINES = 1500;
export const EXEMPT_LABEL = "size:exempt";

type Kind = "production" | "tests" | "docs" | "ignored";
type Change = { files: string[]; changed: number; kind: Kind };
export type Counts = Record<Kind, number>;

// lockfile, 빌드 산출물, 도구가 만든 파일은 세지 않는다.
export function excluded(file: string): boolean {
  return (
    /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|bun\.lockb?)$/.test(file) ||
    /(^|\/)(dist|build|\.next|coverage|__snapshots__)\//.test(file) ||
    /\.(snap|min\.js|map)$/.test(file) ||
    /(^|\/)(gradlew|gradlew\.bat)$/.test(file) ||
    /(^|\/)gradle\/wrapper\//.test(file)
  );
}

// 테스트와 문서는 규모를 표시하되 운영 코드 상한에는 넣지 않는다.
export function category(file: string): Exclude<Kind, "ignored"> {
  if (/\.md$/i.test(file) || /(^|\/)docs\//.test(file)) return "docs";
  if (/(^|\/)(test|tests|e2e)\//.test(file) || /\.(test|spec)\.[^/]+$/.test(file)) return "tests";
  return "production";
}

export function parseChanges(numstat: string): Change[] {
  const changes: Change[] = [];
  const records = numstat.split("\0");
  for (let i = 0; i < records.length; i++) {
    if (!records[i]) continue;
    const match = /^(\d+|-)\t(\d+|-)\t([\s\S]*)$/.exec(records[i]);
    if (!match) throw new Error("numstat 형식이 올바르지 않다");
    const [, added, deleted, file] = match;
    // -z 의 이름 변경 기록은 빈 경로 뒤에 이전·새 경로를 각각 담는다.
    const files = file ? [file] : [records[++i], records[++i]];
    if (files.some((name) => !name)) throw new Error("이름 변경 경로가 없다");
    const changed = added === "-" ? 0 : Number(added) + Number(deleted);
    let kind: Kind = "ignored";
    if (!files.every(excluded)) {
      const kinds = files.filter((name) => !excluded(name)).map(category);
      // 운영 코드를 다른 영역으로 옮기며 고쳐도 그 변경을 상한에 넣는다.
      kind = kinds.includes("production") ? "production" : kinds.includes("tests") ? "tests" : "docs";
    }
    changes.push({ files, changed, kind });
  }
  return changes;
}

export function sum(changes: Change[]): Counts {
  const counts: Counts = { production: 0, tests: 0, docs: 0, ignored: 0 };
  for (const change of changes) counts[change.kind] += change.changed;
  return counts;
}

export function classify(production: number, labels: string[] = []) {
  return { large: production > LARGE_THRESHOLD, pass: production <= MAX_LINES || labels.includes(EXEMPT_LABEL) };
}

// 최상위 디렉터리별 운영 코드 줄 수다. 나눌 경계를 고를 때의 단서다.
function areas(changes: Change[]): [string, number][] {
  const result = new Map<string, number>();
  for (const change of changes) {
    if (change.kind !== "production") continue;
    const name = change.files.at(-1)!.split("/")[0];
    result.set(name, (result.get(name) ?? 0) + change.changed);
  }
  return [...result].sort(([a], [b]) => a.localeCompare(b));
}

function main(args: string[]) {
  const json = args.includes("--json");
  const [base, head = "HEAD"] = args.filter((arg) => arg !== "--json");
  if (!base) {
    console.error("사용법: node scripts/pr/pr-size.ts <base> [head] [--json]");
    process.exit(2);
  }
  const numstat = execFileSync("git", ["diff", "--numstat", "-z", "--find-renames", `${base}...${head}`, "--"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const changes = parseChanges(numstat);
  const counts = sum(changes);
  const verdict = classify(counts.production, JSON.parse(process.env.PR_LABELS || "[]"));
  const summary =
    `PR 변경: 운영 코드 ${counts.production}줄, 테스트 ${counts.tests}줄, 문서 ${counts.docs}줄 ` +
    `(생성 파일 제외 ${counts.ignored}줄), 운영 코드 상한 ${MAX_LINES}줄, ${verdict.pass ? "통과" : "실패"}`;
  const detail = [
    summary,
    ...(verdict.large ? ["나눌 경계 후보(최상위 디렉터리별 운영 코드):", ...areas(changes).map(([name, lines]) => `- ${name}: ${lines}줄`)] : []),
  ].join("\n");
  console.log(json ? JSON.stringify({ counts, ...verdict, large_threshold: LARGE_THRESHOLD, max_lines: MAX_LINES }) : detail);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `large=${verdict.large}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${detail}\n`);
  if (!verdict.pass) {
    console.error(`::error::PR 운영 코드 변경이 ${MAX_LINES}줄을 넘었다. 단계별 PR 로 나눈다. ${EXEMPT_LABEL} 라벨은 사람이 붙인다.`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
