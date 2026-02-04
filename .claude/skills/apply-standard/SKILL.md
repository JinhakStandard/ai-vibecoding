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
/apply-standard https://bitbucket.org/jinhak/standards
```

## 실행 절차

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
<!-- jinhak_standard_version: 1.0 -->
<!-- jinhak_standard_repo: https://bitbucket.org/jinhak/standards -->
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
- JINHAK 전사 AI 개발 표준 적용 (v1.0)

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
JINHAK 전사 AI 개발 표준 v1.0을 프로젝트에 적용한다.

### 참고
- 표준 저장소: [URL]
```

**ARCHITECTURE.md, CONVENTIONS.md:**
프로젝트의 현재 구조와 컨벤션을 분석하여 초기 내용을 작성합니다.

#### 2-3. .claude/ 폴더 설정

**settings.json** 생성 (OS에 맞게):
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
      "Bash(git commit *)",
      "Read", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git config *)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "command": "cat .ai/CURRENT_SPRINT.md 2>/dev/null | head -50 || echo ''"
      }
    ]
  }
}
```

> Windows 환경이면 hooks command를 `type .ai\\CURRENT_SPRINT.md 2>nul || echo.`로 변경

**Skills 복사** - 표준 저장소의 `.claude/skills/` 내용을 복사:
- `commit/SKILL.md`
- `review-pr/SKILL.md`
- `session-start/SKILL.md`
- `test/SKILL.md`

#### 2-4. .gitignore 확인
다음 항목이 포함되어 있는지 확인하고, 없으면 추가:
```
CLAUDE.local.md
.env
.env.local
.env.*.local
```

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

---

### 4단계: 적용 결과 보고

```markdown
## JINHAK 표준 적용 완료

### 적용 버전
- JINHAK Standard v1.0

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

## 표준 체크리스트

적용 후 다음 항목을 확인합니다:

- [ ] CLAUDE.md에 프로젝트 정보가 정확한가
- [ ] .ai/ 폴더와 파일이 모두 생성되었는가
- [ ] .claude/settings.json이 OS에 맞게 설정되었는가
- [ ] .claude/skills/ 에 4개 스킬이 모두 있는가
- [ ] .gitignore에 CLAUDE.local.md와 .env가 포함되었는가
- [ ] jinhak_standard_version 메타 정보가 기록되었는가
