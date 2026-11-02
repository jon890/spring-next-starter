#!/usr/bin/env node
// docs/code-rules/INDEX.md 의 규칙 목록이 실제 파일, 검사와 맞는지 본다.
//
// - 표의 줄마다 rule-N.md 링크와 규칙 한 문장, 검사 링크가 있다
// - 번호가 겹치지 않고, rule-N.md 파일과 표의 줄이 하나씩 짝을 이룬다
// - 검사 링크가 가리키는 파일이 있고, 그 파일이 rule-N 을 언급한다(역참조)
//
// 종료 코드: 0 맞다, 1 어긋난 곳이 있다
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const DIR = "docs/code-rules";
const INDEX = join(DIR, "INDEX.md");

const problems: string[] = [];
const listed = new Set<number>();

for (const line of readFileSync(INDEX, "utf8").split("\n")) {
  const row = /^\|\s*\[rule-(\d+)\]\(rule-(\d+)\.md\)\s*\|(.*)\|(.*)\|\s*$/.exec(line);
  if (!row) continue;
  const [, label, target, sentence, checks] = row;
  const number = Number(label);
  if (label !== target) problems.push(`rule-${label}: 링크가 rule-${target}.md 를 가리킨다`);
  if (listed.has(number)) problems.push(`rule-${number}: 번호가 겹친다`);
  listed.add(number);
  if (!sentence.trim()) problems.push(`rule-${number}: 규칙 한 문장이 없다`);
  const links = [...checks.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  if (links.length === 0) problems.push(`rule-${number}: 검사 링크가 없다`);
  for (const link of links) {
    const file = normalize(join(DIR, link.split("#")[0]));
    if (!existsSync(file)) {
      problems.push(`rule-${number}: 검사 파일이 없다 (${file})`);
    } else if (!new RegExp(`rule-${number}\\b`).test(readFileSync(file, "utf8"))) {
      problems.push(`rule-${number}: ${file} 가 rule-${number} 를 언급하지 않는다`);
    }
  }
}

for (const name of readdirSync(DIR)) {
  const match = /^rule-(\d+)\.md$/.exec(name);
  if (match && !listed.has(Number(match[1]))) problems.push(`${join(DIR, name)}: INDEX.md 에 없다`);
}
for (const number of listed) {
  if (!existsSync(join(DIR, `rule-${number}.md`))) problems.push(`rule-${number}: 규칙 파일이 없다`);
}

if (listed.size === 0) problems.push(`${INDEX}: 규칙 줄을 찾지 못했다`);

if (problems.length > 0) {
  for (const problem of problems) console.log(problem);
  process.exitCode = 1;
} else {
  console.log(`통과: 규칙 ${listed.size}개가 파일과 검사에 맞다 (${dirname(INDEX)})`);
}
