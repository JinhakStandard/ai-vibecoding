---
name: apply-standard
description: JINHAK 전사 AI 개발 표준을 현재 프로젝트에 적용
---

JINHAK 전사 AI 개발 표준을 현재 프로젝트에 적용합니다.
신규 프로젝트와 기존 프로젝트 모두 지원합니다.

## 인자
$ARGUMENTS - 표준 저장소 URL (선택사항. 없으면 기본 URL 사용)

## 사용법
```
/apply-standard
/apply-standard https://github.com/JinhakStandard/ai-vibecoding
```

## 사전 준비 체크리스트 (적용 전)

적용을 시작하기 전에 다음을 확인합니다:

- [ ] 프로젝트 루트 디렉토리에서 실행 중인가
- [ ] git 저장소가 초기화되어 있는가 (`git init`)
- [ ] 커밋되지 않은 변경사항이 없는가 (`git status` 확인)
- [ ] 패키지 매니저가 설치되어 있는가 (npm/pnpm)
- [ ] Node.js 20+ 버전인가

---

## 실행 절차

### 0단계: 표준 레포 로컬 클론

표준 저장소를 로컬에 클론하여 파일을 직접 참고합니다 (웹 크롤링보다 빠르고 안정적):

```bash
git clone https://github.com/JinhakStandard/ai-vibecoding.git /tmp/jinhak-standards
```

- 이미 `/tmp/jinhak-standards`가 있으면 `git -C /tmp/jinhak-standards pull`로 최신화만 수행
- `/tmp/jinhak-standards`는 참고용일 뿐, 현재 프로젝트의 git에 포함시키지 않음
- 이후 단계에서 표준 파일을 참조할 때 `/tmp/jinhak-standards/` 경로의 로컬 파일을 읽기

---

### 1단계: 현재 프로젝트 분석

프로젝트의 현재 상태를 파악합니다:

1. **CLAUDE.md 존재 여부 확인**
   - 있으면 → 기존 프로젝트 (업데이트 모드)
   - 없으면 → 신규 적용 모드

2. **기술 스택 파악** (package.json, tsconfig.json 등 확인)
   - 프레임워크: React / Next.js / Express / NestJS 등
   - 언어: JavaScript / TypeScript
   - 패키지 매니저: pnpm / npm / yarn
   - 빌드 도구: Vite / Webpack 등
   - 테스트: Vitest / Jest 등

3. **기존 프로젝트 구조 파악**
   - 폴더 구조 확인
   - 기존 컨벤션 파악

---

### 2단계: 표준 적용 (신규 프로젝트)

CLAUDE.md가 없는 경우 다음을 순서대로 생성합니다:

#### 2-1. CLAUDE.md 생성
표준 저장소의 `templates/project-claude.md` 템플릿을 기반으로 프로젝트 정보를 채워 생성합니다.

반드시 포함할 메타 정보:
```markdown
<!-- JINHAK Standard Metadata -->
<!-- jinhak_standard_version: 1.8 -->
<!-- jinhak_standard_repo: https://github.com/JinhakStandard/ai-vibecoding -->
<!-- applied_date: YYYY-MM-DD -->
```

1단계에서 파악한 기술 스택 정보를 기반으로 템플릿의 `[대괄호]` 내용을 실제 정보로 교체합니다.

#### 2-2. .ai/ 폴더 생성
```
.ai/
├── SESSION_LOG.md
├── CURRENT_SPRINT.md
├── DECISIONS.md
├── ARCHITECTURE.md
└── CONVENTIONS.md
```

각 파일에 초기 내용을 작성합니다:

**SESSION_LOG.md:**
```markdown
# 세션 작업 기록

## YYYY-MM-DD

### 세션 작업 내용
- JINHAK 전사 AI 개발 표준 적용 (v1.8)

### 변경 파일
- `CLAUDE.md` - 프로젝트 AI 설정 파일 생성
- `.ai/*` - 세션 관리 폴더 생성
- `.claude/*` - Claude Code 설정 및 스킬 생성
```

**CURRENT_SPRINT.md:**
```markdown
# 현재 스프린트

## 진행 중
- (없음)

## 대기 중
- (없음)

## 완료
- [x] JINHAK 표준 적용
```

**DECISIONS.md:**
```markdown
# 기술 의사결정 기록 (ADR)

## ADR-001: JINHAK 전사 AI 개발 표준 적용

### 상태
승인됨 (YYYY-MM-DD)

### 결정
JINHAK 전사 AI 개발 표준 v1.8을 프로젝트에 적용한다.

### 참고
- 표준 저장소: [URL]
```

**ARCHITECTURE.md, CONVENTIONS.md:**
프로젝트의 현재 구조와 컨벤션을 분석하여 초기 내용을 작성합니다.

#### 2-3. .claude/ 폴더 설정

**settings.json** 생성 (OS에 맞게):

> **중요**: `deny` 규칙은 프로젝트 전체에 **강제 적용**됩니다. `settings.local.json`이나 `~/.claude/settings.json`으로 우회할 수 없으므로, 위험 명령 차단에 가장 확실한 방법입니다. `deny`가 `allow`보다 우선합니다.

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(pnpm *)",
      "Bash(npx *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git * commit *)",
      "Bash(git commit *)",
      "Bash(git * push *)",
      "Bash(git push *)",
      "Bash(git checkout *)",
      "Bash(git branch *)",
      "Bash(git fetch *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Read", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git clean -f*)",
      "Bash(git config *)",
      "Bash(*--no-verify*)"
    ]
  },
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/session-briefing.js",
            "once": true
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"console.log('[SECURITY] 파일 수정 감지: ${file}')\""
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"console.log('[SECURITY] 서브에이전트 시작 - deny 규칙이 상속됩니다')\""
          }
        ]
      }
    ]
  }
}
```

> Hook은 Node.js 기반으로 작성되어 OS별 변환이 필요 없습니다. Windows/macOS/Linux 모두 동일한 설정을 사용합니다.

**Scripts 복사** - 표준 저장소의 세션 브리핑 스크립트를 복사:
- `/tmp/jinhak-standards/scripts/session-briefing.js` → `.claude/scripts/session-briefing.js`

> 이 스크립트는 `UserPromptSubmit` Hook에서 실행되어 세션 시작 시 자동으로 프로젝트 상태(현재 스프린트, 최근 작업, git 상태, 표준 버전)를 Claude에게 주입합니다.

**Skills 복사** - 표준 저장소의 `.claude/skills/` 내용을 복사:
- `commit/SKILL.md`
- `review-pr/SKILL.md`
- `session-start/SKILL.md`
- `test/SKILL.md`

#### 2-4. .gitignore 확인
다음 항목이 포함되어 있는지 확인하고, 없으면 추가:
```
CLAUDE.local.md
.claude/settings.local.json
.env
.env.local
.env.*.local
*vibecoding-ref/
```

> `*vibecoding-ref/` 패턴은 표준 적용 시 프로젝트 폴더 내에 클론된 참조 저장소 사본(예: `프로젝트명_vibecoding-ref/`)이 커밋되지 않도록 방지합니다.

---

### 3단계: 표준 업데이트 (기존 프로젝트)

CLAUDE.md가 이미 있는 경우:

1. **버전 확인**: CLAUDE.md의 `jinhak_standard_version` 메타 정보 확인
2. **최신 버전 비교**: 표준 저장소의 CHANGELOG.md에서 최신 버전 확인
3. **변경 내역 파악**: 현재 버전과 최신 버전 사이의 변경 사항을 CHANGELOG.md에서 확인
4. **사용자 확인**: 변경 내역을 요약하여 보여주고 업데이트 여부 확인
5. **적용**: 승인 시 다음을 업데이트
   - CLAUDE.md의 변경된 규칙 반영
   - 새로 추가된 스킬 파일 복사
   - settings.json 규칙 업데이트
   - `jinhak_standard_version` 메타 정보 업데이트
6. **파일 무결성 검증** (버전 일치 시에도 반드시 수행):
   다음 필수 파일이 존재하고 올바른지 확인하여, 누락/불일치 파일은 표준 저장소에서 복사/수정:
   - [ ] `.claude/scripts/session-briefing.js` 존재 여부
   - [ ] `.claude/settings.json` Hook 경로가 `node .claude/scripts/session-briefing.js`인지
   - [ ] `.claude/skills/` 내 5개 스킬 존재 (commit, review-pr, session-start, test, apply-standard)
   - [ ] `.ai/` 폴더 5개 파일 존재
   - [ ] `.gitignore`에 필수 항목 포함

   누락/불일치 항목이 있으면 사용자에게 보고하고 수정 적용

---

### 4단계: 적용 결과 보고

```markdown
## JINHAK 표준 적용 완료

### 적용 버전
- JINHAK Standard v1.8

### 생성/수정된 파일
- `CLAUDE.md` - [생성/업데이트]
- `.ai/SESSION_LOG.md` - [생성]
- `.ai/CURRENT_SPRINT.md` - [생성]
- `.ai/DECISIONS.md` - [생성]
- `.ai/ARCHITECTURE.md` - [생성]
- `.ai/CONVENTIONS.md` - [생성]
- `.claude/settings.json` - [생성/업데이트]
- `.claude/skills/commit/SKILL.md` - [생성]
- `.claude/skills/review-pr/SKILL.md` - [생성]
- `.claude/skills/session-start/SKILL.md` - [생성]
- `.claude/skills/test/SKILL.md` - [생성]

### 다음 단계
1. `CLAUDE.md`의 [대괄호] 내용을 프로젝트 정보로 확인/수정
2. `/session-start`로 첫 세션 시작
3. 작업 완료 후 `/commit`으로 커밋

### 사용 가능한 명령어
- `/session-start` - 세션 시작
- `/commit` - 커밋 생성
- `/review-pr <번호>` - PR 리뷰
- `/test` - 테스트 실행
```

## 적용 후 검증 체크리스트

적용 후 다음 3개 영역을 순서대로 확인합니다:

### 파일 생성 검증
- [ ] CLAUDE.md에 프로젝트 정보가 정확한가
- [ ] .ai/ 폴더와 5개 파일이 모두 생성되었는가 (SESSION_LOG, CURRENT_SPRINT, DECISIONS, ARCHITECTURE, CONVENTIONS)
- [ ] .claude/settings.json이 Node.js 기반으로 설정되었는가
- [ ] .claude/skills/ 에 5개 스킬이 모두 있는가 (apply-standard, commit, review-pr, session-start, test)
- [ ] .gitignore에 CLAUDE.local.md, .claude/settings.local.json, .env가 포함되었는가
- [ ] jinhak_standard_version 메타 정보가 기록되었는가

### 기능 동작 검증
- [ ] `/session-start` 명령이 정상 실행되는가
- [ ] UserPromptSubmit hook이 CURRENT_SPRINT.md를 정상 출력하는가 (세션 1회, `once: true`)
- [ ] PreToolUse hook이 파일 수정 시 보안 경고를 출력하는가
- [ ] SubagentStart hook이 서브에이전트 시작 시 알림을 출력하는가

### 보안 검증
- [ ] settings.json deny 규칙에 `--no-verify`, `push --force`, `reset --hard`, `clean -f`, `rm -rf`, `git config` 포함되었는가
- [ ] .env 파일이 .gitignore에 포함되었는가
- [ ] SECURITY_ISMS.md 보안 가이드를 참조하도록 설정되었는가

### v1.8 신규 항목 검증
- [ ] `.claude/scripts/session-briefing.js` 파일이 존재하고 실행 가능한가
- [ ] settings.json Hook이 Node.js 기반(`node` 또는 `node -e`)으로 통일되었는가
- [ ] OS 종속 명령(`echo`, `cat`, `powershell` 등)이 Hook에 포함되지 않았는가
