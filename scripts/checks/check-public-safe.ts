#!/usr/bin/env node
// 코드 규칙: rule-5. 까닭과 예외는 docs/code-rules/rule-5.md 를 본다.
// 공개 저장소에 적으면 안 되는 비밀값, 개인 정보, 운영 값이 git 추적 파일에 들어갔는지 검사한다.
//
// 두 층으로 나눈다.
//   형태 패턴  키와 토큰처럼 값이 아니라 모양으로 알아볼 수 있는 것. 이 파일이 갖는다
//   값 목록    내 환경의 호스트 이름, 경로, 계정처럼 모양으로 모르는 값. 저장소 밖 파일이 갖는다
// 값 목록은 PUBLIC_REPO_DENYLIST 환경 변수가 가리키는 파일에서 읽는다. 한 줄에 확장 정규식 하나이고
// '#' 로 시작하는 줄과 빈 줄은 건너뛴다. 값이 공개되지 않도록 목록 파일은 이 저장소에 두지 않는다.
// 변수가 없으면 형태 패턴만 검사하고 그 사실을 알린다.
//
// 추적 파일의 지금 내용만 본다. 커밋 메시지와 앞 커밋에 넣었다 지운 값은 push 전에 직접 확인한다.
//
// 종료 코드: 0 찾지 못했다, 1 의심스러운 줄을 찾았다, 2 검사를 돌리지 못했다
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

// 이 파일은 패턴 자체를 담으므로 검사에서 뺀다.
const SELF = "scripts/checks/check-public-safe.ts";

// 예시로 써도 되는 메일 도메인이다. 그 밖의 메일 주소는 개인 정보로 본다.
const EMAIL_ALLOWED = /@(example\.(com|org|net)|users\.noreply\.github\.com)$/i;

// git@github.com:owner/repo 같은 SSH 원격 주소는 메일 주소가 아니다.
const SSH_REMOTE = /^git@[A-Za-z0-9.-]+$/;

// allow 는 걸린 문자열과 그 뒤에 이어지는 글자를 받는다.
type Shape = { pattern: RegExp; reason: string; allow?: (match: string, rest: string) => boolean };

const SHAPES: Shape[] = [
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, reason: "개인키" },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/, reason: "AWS 액세스 키" },
  { pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/, reason: "GitHub 토큰" },
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/, reason: "GitHub 토큰" },
  { pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/, reason: "Slack 토큰" },
  { pattern: /\bsk-[A-Za-z0-9_-]{20,}/, reason: "API 키" },
  { pattern: /\bAIza[0-9A-Za-z_-]{35}\b/, reason: "Google API 키" },
  { pattern: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:[^\s:/@]+@/i, reason: "주소 안의 계정과 비밀번호" },
  {
    pattern: /\b(10\.\d{1,3}|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/,
    reason: "사설 IP 주소",
  },
  {
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
    reason: "메일 주소",
    allow: (match, rest) => EMAIL_ALLOWED.test(match) || (SSH_REMOTE.test(match) && rest.startsWith(":")),
  },
];

type Hit = { file: string; line: number; reason: string };

function trackedFiles(): string[] {
  return execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter((file) => file && file !== SELF && isFile(file));
}

// 지운 파일, 디렉터리(서브모듈), 링크가 가리키는 대상이 없는 것은 건너뛴다.
function isFile(file: string): boolean {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function readDenylist(): RegExp[] | null {
  const file = process.env.PUBLIC_REPO_DENYLIST;
  if (!file) return null;
  const patterns: RegExp[] = [];
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((raw, index) => {
      const line = raw.trim();
      if (!line || line.startsWith("#")) return;
      try {
        patterns.push(new RegExp(line));
      } catch {
        // 오류 메시지에 패턴 원문이 들어 있어 줄 번호만 알린다.
        throw new Error(`값 목록 ${index + 1}번째 줄의 정규식이 잘못됐다`);
      }
    });
  return patterns;
}

function scan(files: string[], denylist: RegExp[]): Hit[] {
  const hits: Hit[] = [];
  for (const file of files) {
    const buffer = readFileSync(file);
    // NUL 이 있으면 바이너리로 보고 건너뛴다.
    if (buffer.includes(0)) continue;
    buffer
      .toString("utf8")
      .split("\n")
      .forEach((text, index) => {
        for (const shape of SHAPES) {
          const global = new RegExp(shape.pattern.source, shape.pattern.flags + "g");
          const matches = [...text.matchAll(global)];
          if (matches.some((m) => !shape.allow?.(m[0], text.slice(m.index + m[0].length)))) {
            hits.push({ file, line: index + 1, reason: shape.reason });
          }
        }
        if (denylist.some((pattern) => pattern.test(text))) {
          hits.push({ file, line: index + 1, reason: "값 목록에 걸렸다" });
        }
      });
  }
  return hits;
}

function main() {
  let denylist: RegExp[] | null;
  try {
    denylist = readDenylist();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    console.error(code ? `값 목록 파일을 읽지 못했다: ${code}` : (error as Error).message);
    process.exit(2);
  }
  if (denylist === null) {
    console.log("알림: PUBLIC_REPO_DENYLIST 가 없어 형태 패턴만 검사했다.");
  }
  let hits: Hit[];
  try {
    hits = scan(trackedFiles(), denylist ?? []);
  } catch (error) {
    console.error(`검사를 돌리지 못했다: ${(error as Error).message}`);
    process.exit(2);
  }
  if (hits.length === 0) {
    console.log("통과: 공개 저장소에 적으면 안 되는 것을 찾지 못했다.");
    return;
  }
  // 줄 내용은 출력하지 않는다. 값 목록에 걸린 비공개 값이 CI 로그에 남지 않게 하려는 것이다.
  for (const hit of hits) console.log(`${hit.file}:${hit.line} ${hit.reason}`);
  console.log("\n위 줄을 고친다. 비밀값은 환경 변수나 secret 으로 옮기고, 예시에는 example.com 같은 예약 값을 쓴다.");
  process.exitCode = 1;
}

main();
