# AGENTS.md

Spring Boot backend 와 Next.js web 으로 시작하는 서비스의 템플릿이다.
사람과 AI 에이전트가 함께 읽는 저장소 규칙을 이 파일이 갖는다. `CLAUDE.md` 는 이 파일을 가리키는 링크다.

## 읽기 순서

| 문서 | 언제 보는지 |
| --- | --- |
| [`README.md`](README.md) | 처음 받아 실행할 때 |
| [`docs/features/`](docs/features/) | 기능마다 지금 동작하는 요구와 흐름, 합의한 변경의 스펙 |
| [`docs/code-rules/INDEX.md`](docs/code-rules/INDEX.md) | 코드 규칙의 고정 번호, 까닭과 예외, 연결한 검사 |
| [`backend/AGENTS.md`](backend/AGENTS.md) | backend 를 고칠 때 |
| [`web/AGENTS.md`](web/AGENTS.md) | web 을 고칠 때 |

기능 문서는 `docs/features/<기능 ID>.md` 에 지금 동작하는 요구와 흐름을 두고,
합의한 변경의 요구사항 ID 와 인수 조건, 설계는 `docs/features/<기능 ID>/spec.md` 에 둔다.

## 지켜야 할 것

- **공개 저장소다.** 비밀값, 개인 정보, 운영 주소를 코드, 문서, 커밋 메시지, PR 본문 어디에도 적지 않는다. 기준과 검사는 [rule-5](docs/code-rules/rule-5.md) 가 갖는다.
- 규칙은 검사와 함께 둔다. 새 규칙을 만드는 순서는 [`docs/code-rules/INDEX.md`](docs/code-rules/INDEX.md) 가 갖는다.
- 구현이 문서와 달라지면 같은 커밋에서 문서를 고친다.

## 로컬 검사와 PR

push 전에 빠른 검사를 돌린다. 무엇을 어떤 순서로 돌리는지는 그 스크립트의 머리말이 갖는다.

```bash
# cwd: 저장소 루트
node scripts/dev/check-local.ts --fast
```

공개 정보 검사는 `--fast` 에도 들어 있다. push 하면 되돌릴 수 없어서다.

- 한 PR 은 관심사 하나만 담는다. 리팩터링은 이동만 하는 커밋과 동작을 바꾸는 커밋을 나눈다.
- 운영 코드의 변경 줄 상한은 `scripts/pr/pr-size.ts` 가 정한다. 넘으면 설계와 구현을 함께 담은 단계별 PR 로 나눈다. `size:exempt` 라벨은 사람만 붙인다.
- Draft PR 로 열고, CI 와 리뷰를 통과한 뒤 Ready 로 올린다.
- 계획서만으로 PR 을 열지 않는다. 설계 문서와 그 구현을 한 PR 에 담는다.
- GitHub Actions 가 돌지 못하면 머지 전에 인자 없이 `node scripts/dev/check-local.ts` 를 돌려 전체 통과를 확인한다.

## 커밋

제목은 `<type>(<범위>): <메시지>` 형식이다. type 은 `feat`, `fix`, `refactor`, `docs`, `test`, `chore` 등이고 범위는 `backend`, `web`, `docs`, `infra` 중 하나다.
변경 대상과 달라진 동작을 함께 적는다.

## 언어

코드 주석, 문서, 커밋 메시지는 한국어로 쓴다. 코드 식별자, 타입, 라이브러리 이름, 명령, 경로는 원문 그대로 둔다.
예외는 하나다. 루트 `README.md` 는 영어로 쓰고 [`README.ko.md`](README.ko.md) 와 같은 내용을 유지한다.
