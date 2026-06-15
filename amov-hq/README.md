# AMOV HQ — 회사 본부

AMOV(아모브)를 **하나의 회사처럼** 운영하는 본부 레포입니다.
여기서 사장님(유상철)이 목표를 말하면, 엔지니어링 리드(`CLAUDE.md`)가 계획을 세우고
`.claude/agents/`의 전문가 6명에게 위임해 **어느 앱이든** 진행합니다.

## 구성
- `CLAUDE.md` — AMOV 엔지니어링 리드 지침 (회사 표준·팀)
- `.claude/agents/` — 전문 서브에이전트 6종 (backend·frontend·review·qa·i18n·devops)
- `docs/apps.md` — **앱 레지스트리** (다바르·셀라·새빛교회 곁에·만나 …)
- `docs/roadmap.md` — 회사/앱 로드맵
- `docs/design-system.md` — 앱별 브랜드·디자인 토큰
- `docs/infra.md` — 계정·인프라 인벤토리 (비밀번호 X, "무엇이 어디 있나")

## 처음 세팅 (이 폴더를 `amov` 레포로)
1. GitHub에 새 레포 **`amov`** 생성 (private 권장).
2. 이 `amov-hq/` 폴더의 **내용 전체**를 그 레포 루트로 옮김.
3. `docs/`의 `[대괄호]` 자리(앱 URL·레포·상태 등)를 채움.

## 각 앱 레포에 팀 붙이기 (일관성 핵심)
Claude Code는 `CLAUDE.md` / `.claude/agents/`를 **레포별로** 읽습니다.
그래서 각 앱 레포에도 같은 2가지를 복사하세요:
```
CLAUDE.md
.claude/agents/   (6개 .md)
```
- **DABAR**: 이미 설치됨 ✅
- **GitHub 레포가 있는 앱**(셀라·만나 등): 위 2개 복사 → 커밋.
- **Lovable로 만든 앱**: Lovable 프로젝트를 **GitHub에 연결**(Lovable → Settings → GitHub)하면 깃 레포가 생깁니다. 그 레포에 위 2개를 넣으면 AMOV 팀이 그 앱도 관리합니다.

## 한 곳에서 여러 앱 작업하기 (Claude Code 웹)
- 한 세션에 **여러 앱 레포를 add** 하면 한 대화에서 앱들을 오가며 작업할 수 있습니다.
- 편집하는 그 레포의 `CLAUDE.md`가 그 작업을 지배 → 그래서 모든 앱에 같은 CLAUDE.md를 둡니다.
