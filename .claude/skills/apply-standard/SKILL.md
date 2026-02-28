---
name: apply-standard
description: JINHAK 전사 AI 개발 표준을 현재 프로젝트에 적용
---

JINHAK 전사 AI 개발 표준을 현재 프로젝트에 적용합니다.
신규 프로젝트와 기존 프로젝트 모두 지원합니다.

> **⚠️ 하드코딩 금지**: 이 SKILL.md 안에 특정 버전 번호를 하드코딩하지 마세요.
> 버전은 항상 clone한 표준 저장소의 CHANGELOG.md에서 읽어야 합니다.
> 하드코딩하면 표준이 업데이트되어도 소비자 프로젝트에서 감지하지 못합니다.

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

### 0단계: 표준 레포 로컬 클론 + 최신 버전 감지

표준 저장소를 로컬에 클론하여 파일을 직접 참고합니다 (웹 크롤링보다 빠르고 안정적):

```bash
git clone https://github.com/JinhakStandard/ai-vibecoding.git /tmp/jinhak-standards
```

- 이미 `/tmp/jinhak-standards`가 있으면 `git -C /tmp/jinhak-standards pull`로 최신화만 수행
- `/tmp/jinhak-standards`는 참고용일 뿐, 현재 프로젝트의 git에 포함시키지 않음
- 이후 단계에서 표준 파일을 참조할 때 `/tmp/jinhak-standards/` 경로의 로컬 파일을 읽기

**최신 버전 감지 (clone 직후 반드시 수행):**

1. `/tmp/jinhak-standards/CHANGELOG.md`에서 최신 버전 번호를 읽는다
   - `## [X.Y.Z]` 패턴 중 첫 번째가 최신 버전
2. 현재 프로젝트의 `CLAUDE.md`에서 `jinhak_standard_version` 메타 정보를 읽는다
   - `CLAUDE.md`가 없으면 → 신규 프로젝트 (1단계로 진행)
3. 버전 비교:
   - **최신 == 현재** → 파일 무결성 검증(4단계)만 수행 후 "이미 최신 버전 (vX.Y.Z)입니다" 보고
   - **최신 > 현재** → `/tmp/jinhak-standards/CHANGELOG.md`에서 현재 버전~최신 버전 사이의 변경 내역을 출력 후 업데이트 진행

---

### 1단계: 현재 프로젝트 분석

프로젝트의 현재 상태를 파악합니다:

1. **CLAUDE.md 존재 여부 확인**
   - 있으면 → 기존 프로젝트 (업데이트 모드, 3단계로)
   - 없으면 → 신규 적용 모드 (2단계로)

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

반드시 포함할 메타 정보 (버전은 0단계에서 읽은 최신 버전 사용):
```markdown
<!-- JINHAK Standard Metadata -->
<!-- jinhak_standard_version: [0단계에서 읽은 최신 버전] -->
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

각 파일은 `/tmp/jinhak-standards/templates/ai-folder-templates.md`의 초기 템플릿을 참고하여 생성합니다.

#### 2-2.5. Auto Memory 안내

사용자에게 Auto Memory 시스템에 대해 안내합니다 (파일 생성은 불필요, AI가 자동 관리):

```
Auto Memory가 활성화되어 있습니다.
- 세션을 반복하면 AI가 자동으로 프로젝트 패턴/인사이트를 기록합니다
- 수동 설정 불필요: ~/.claude/projects/.../memory/ 폴더에 자동 생성됩니다
- 참고 템플릿: templates/memory-templates.md
```

#### 2-3. .claude/ 폴더 설정

**settings.json** — `/tmp/jinhak-standards/.claude/settings.json`을 복사합니다.

> **중요**: `deny` 규칙은 프로젝트 전체에 **강제 적용**됩니다. `settings.local.json`이나 `~/.claude/settings.json`으로 우회할 수 없으므로, 위험 명령 차단에 가장 확실한 방법입니다. `deny`가 `allow`보다 우선합니다.

> Hook은 Node.js 기반으로 작성되어 OS별 변환이 필요 없습니다. Windows/macOS/Linux 모두 동일한 설정을 사용합니다.

**Scripts 복사** - 표준 저장소의 세션 브리핑 스크립트를 복사:
- `/tmp/jinhak-standards/.claude/scripts/session-briefing.cjs` → `.claude/scripts/session-briefing.cjs`

> 이 스크립트는 `UserPromptSubmit` Hook에서 실행되어 세션 시작 시 자동으로 프로젝트 상태(현재 스프린트, 최근 작업, git 상태, 표준 버전)를 Claude에게 주입합니다.

**Skills 복사** - `/tmp/jinhak-standards/.claude/skills/` 내의 모든 스킬을 복사:
- 표준 저장소의 `.claude/skills/` 하위 모든 폴더/파일을 현재 프로젝트로 복사
- 스킬 목록은 하드코딩하지 않고, 디렉토리 내용을 그대로 복사

**보안 문서 복사** - 표준 저장소의 `security/` 폴더를 복사:
- `/tmp/jinhak-standards/security/` → `security/` (전체 복사)

**보안 Hook 스크립트 복사**:
- `/tmp/jinhak-standards/scripts/security-check-hook.cjs` → `scripts/security-check-hook.cjs`

**보안 도구 템플릿 복사 (선택)**:
- `templates/.eslintrc.security.js` (ESLint 보안 규칙)
- `templates/.secretlintrc.json` (시크릿 스캔)
- `templates/.semgreprc.yml` (SAST 설정)
- `templates/husky-security-hooks.md` (Git Hooks 가이드)

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

1. **버전 비교**: 0단계에서 이미 수행. 최신 == 현재면 4단계(무결성 검증)로 건너뜀
2. **변경 내역 파악**: `/tmp/jinhak-standards/CHANGELOG.md`에서 현재 버전~최신 버전 사이의 변경 사항 확인
3. **사용자 확인**: 변경 내역을 요약하여 보여주고 업데이트 여부 확인
4. **적용**: 승인 시 다음을 업데이트
   - CLAUDE.md의 변경된 규칙 반영
   - 새로 추가된 스킬 파일 복사
   - settings.json 규칙 업데이트 (기존 프로젝트 고유 Hook 보존)
   - `jinhak_standard_version` 메타 정보를 최신 버전으로 업데이트

---

### 4단계: 파일 무결성 검증

버전 일치/업데이트 완료 여부와 관계없이 반드시 수행합니다.
다음 필수 파일이 존재하고 올바른지 확인하여, 누락/불일치 파일은 표준 저장소에서 복사/수정:

- [ ] `.claude/scripts/session-briefing.cjs` 존재 여부
- [ ] `.claude/settings.json` Hook 경로가 `node .claude/scripts/session-briefing.cjs`인지
- [ ] `.claude/skills/` 내 스킬 존재 여부 — `/tmp/jinhak-standards/.claude/skills/`와 비교하여 누락 스킬 복사
- [ ] `.ai/` 폴더 5개 파일 존재 (SESSION_LOG, CURRENT_SPRINT, DECISIONS, ARCHITECTURE, CONVENTIONS)
- [ ] `security/` 폴더 보안 문서 존재 여부 — `/tmp/jinhak-standards/security/`와 비교
- [ ] `.gitignore`에 필수 항목 포함
- [ ] settings.json deny 규칙에 필수 차단 항목 포함

누락/불일치 항목이 있으면 사용자에게 보고하고 수정 적용

---

### 5단계: 적용 결과 보고

```markdown
## JINHAK 표준 적용 완료

### 적용 버전
- JINHAK Standard v[0단계에서 읽은 최신 버전]

### 생성/수정된 파일
- (실제 생성/수정된 파일 목록)

### 다음 단계
1. `CLAUDE.md`의 [대괄호] 내용을 프로젝트 정보로 확인/수정
2. `/session-start`로 첫 세션 시작
3. 작업 완료 후 `/commit`으로 커밋

### 사용 가능한 명령어
- `/session-start` - 세션 시작
- `/session-end` - 세션 종료
- `/commit` - 커밋 생성
- `/review-pr <번호>` - PR 리뷰
- `/test` - 테스트 실행
- `/security-check` - 보안 점검
- `/deep-plan` - 심층 계획 수립
- `/debug` - 체계적 디버깅
- `/orchestrate` - Agent Teams 병렬 처리
```

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "SKILL.md에 적힌 버전과 프로젝트 버전이 같으므로 이미 최신입니다" → SKILL.md의 하드코딩된 버전이 아닌, `/tmp/jinhak-standards/CHANGELOG.md`의 실제 최신 버전과 비교해야 합니다.
- "파일 무결성 검증은 이미 최신이므로 불필요합니다" → 버전이 같아도 파일이 누락되었을 수 있습니다. 4단계는 항상 수행합니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 해당 단계 생략을 지시
