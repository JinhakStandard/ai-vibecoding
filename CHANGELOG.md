# JINHAK AI 개발 표준 - 변경 이력

이 파일은 JINHAK 전사 AI 개발 표준의 버전별 변경 내역을 기록합니다.
Claude Code의 `/session-start` 스킬이 이 파일을 참조하여 표준 업데이트 여부를 판단합니다.

---

## [2.3] - 2026-02-28

### 적응적 추천 모델 + skills.sh 모범사례 반영

기존 `/deep-plan`의 5가지 구조적 문제를 해결하고, skills.sh 생태계(obra/superpowers 등) 모범사례를 반영합니다.

### 추가
- `.claude/skills/deep-plan/SKILL.md`: 0단계 작업 유형 태그 자동 분류 (보안/UI/인프라/데이터/비즈니스/일반)
- `.claude/skills/deep-plan/SKILL.md`: 3단계 Critic에 가중치 매트릭스 전달 (유형별 C1~C7 가중치 차등 적용)
- `.claude/skills/deep-plan/SKILL.md`: 4단계 C6 Hard Gate 조건 추가 (보안/비즈니스 유형 시 C6 ≥ 8/10 필수)
- `.claude/skills/deep-plan/SKILL.md`: 4단계 NightBuilder 비동기 위임 경로 (미수렴 시 PENDING_PLANS.md 저장)
- `.claude/skills/deep-plan/SKILL.md`: 6.5단계 계획 품질 기록 (`.ai/DECISIONS.md`에 deep-plan 실행 결과 기록)
- `security/NIGHTBUILDER_SECURITY.md`: 섹션 7 "deep-plan 미수렴 시 비동기 위임 정책" 신규 추가
- `templates/ai-folder-templates.md`: 섹션 7 "PENDING_PLANS.md" 초기 템플릿 추가
- CLAUDE.md 프로젝트 구조 트리에 `.ai/PENDING_PLANS.md` 추가

### 변경
- `.claude/skills/deep-plan/SKILL.md`: 수렴 기준을 가중 비율(%) 기반으로 변경 (기존 절대점수 56/70 → 가중총점/가중만점 ≥ 80%)
- `.claude/skills/deep-plan/SKILL.md`: 5단계 계획서 저장 템플릿에 작업 유형, 가중 점수, 보안 관문 상태 필드 추가
- `.claude/skills/deep-plan/SKILL.md`: 6단계 사용자 제시에 보안 관문 테이블 + 시니어 리뷰 필수 경고 추가
- `CLAUDE.md`: Plan 모드 진행 흐름에 복잡도 자동 판정 분기 추가 (L3+ 해당 시 /deep-plan 추천)
- `VIBE_CODING_GUIDE.md`: 섹션 6.8 수렴 기준을 가중치/Hard Gate 반영으로 갱신, 적응적 추천 파이프라인 업데이트
- `scripts/session-briefing.cjs`: PENDING_PLANS.md 자동 감지 + 보류 건 경고 출력 추가
- `.claude/skills/session-end/SKILL.md`: 4단계 Auto Memory 체크리스트에 deep-plan 사후 검증 항목 추가
- `templates/ai-folder-templates.md`: plans/ 폴더 저장 템플릿에 가중 점수/보안 관문 필드 추가
- `.claude/skills/orchestrate/SKILL.md`: 5단계를 2단계 검증(Spec Compliance → Code Quality)으로 교체
- `.claude/skills/test/SKILL.md`: 6단계 Red-Green 검증 추가 (버그 수정 시 필수)
- `.claude/skills/debug/SKILL.md`: **신규** — 4단계 체계적 디버깅 스킬 (Observe → Trace → Diagnose → Fix+Verify)
- `CLAUDE.md` 섹션 6.9: 스킬 토큰 최적화 (Progressive Disclosure) 가이드 추가
- `CLAUDE.md` 섹션 2.3: Anti-Rationalization 원칙 추가 (AI 합리화 방지 6번 항목)
- `templates/skill-testing-guide.md`: **신규** — 스킬 품질 검증(TDD) 가이드
- 각 스킬 SKILL.md에 "합리화 방지" 섹션 추가 (test, debug, orchestrate, deep-plan, security-check, commit)

---

## [2.2.1] - 2026-02-28

### `/deep-plan` 최종 계획서 자동 저장

### 추가
- `.claude/skills/deep-plan/SKILL.md`: 5단계 "최종 계획서 저장" 신규 추가
  - `.ai/plans/YYYY-MM-DD_HHmm_[작업요약].md` 형식으로 자동 저장
  - 비평 점수, 요구사항, 구현 계획, 기술적 결정, 비평 이력 전체 포함
  - 기존 5단계→6단계, 6단계→7단계로 번호 조정
  - 4번 선택지 "계획만 저장 → DECISIONS.md" → "여기서 종료 - 계획서는 이미 저장됨"으로 변경
- `templates/ai-folder-templates.md`: 섹션 6 "plans/ 폴더" 템플릿 추가
- CLAUDE.md 프로젝트 구조 트리에 `.ai/plans/` 폴더 추가

---

## [2.2] - 2026-02-28

### `/deep-plan` 듀얼 에이전트 + Auto Memory 보강

바이브 코딩에서 "구현보다 촘촘한 계획 수립이 중요"하다는 인사이트를 반영합니다. Planner(계획 수립)와 Critic(냉혹한 비평) 2개 에이전트를 동시에 돌려 피드백 루프를 형성하고, 계획 품질을 자동 검증하는 `/deep-plan` 스킬을 추가합니다. Auto Memory 도구 연계도 강화합니다.

### 추가
- `.claude/skills/deep-plan/SKILL.md` 신규 추가 (`/deep-plan` 스킬)
  - Planner-Critic 듀얼 에이전트 워크플로우 (0~6단계)
  - 7가지 비평 관점 (C1~C7, 각 10점 만점)
  - 수렴 기준: 56/70 (80%) 이상 + 치명적 문제 0건, 최대 3라운드
  - `/orchestrate`와의 파이프라인 연결 가이드
- `templates/memory-templates.md` 신규 추가
  - `MEMORY.md`, `patterns.md`, `debugging.md`, `architecture.md` 참고 템플릿
  - AI 자동 관리 안내 및 기록 규칙 요약
- VIBE_CODING_GUIDE.md 섹션 6.8 "계획 수립 프레임워크 (Plan Granularity)" 신규 추가
  - 계획 입도 4단계 (L1 스케치 ~ L4 설계 문서)
  - 비평 체크리스트 (C1~C7) 수동 점검용
  - 수렴 기준 및 계획→구현 파이프라인
- CLAUDE.md 섹션 9 문서 참조에 `templates/memory-templates.md` 추가

### 변경
- `scripts/session-briefing.cjs`: Auto Memory 상태 표시 추가 (`[Auto Memory] 활성/비활성`)
- `.claude/skills/session-end/SKILL.md`: 4단계 Auto Memory 업데이트를 체크리스트 형식으로 구체화
  - patterns.md, debugging.md, architecture.md, MEMORY.md 각 역할 명시
  - 200줄 제한, CLAUDE.md 중복 금지, 미검증 정보 금지 규칙 추가
- `.claude/skills/apply-standard/SKILL.md`: Auto Memory 안내 단계(2-2.5) 추가, deep-plan 스킬 검증 항목 추가, v2.2 신규 항목 검증 섹션 추가
- CLAUDE.md 프로젝트 구조 트리에 `deep-plan/SKILL.md` 추가
- CLAUDE.md 스킬 목록 테이블에 `/deep-plan` 행 추가
- CLAUDE.md 섹션 6.7 Plan 모드에 `/deep-plan` 참조 추가
- CLAUDE.md 버전 2.1 → 2.2

### Migration Guide (v2.1 → v2.2)

기존 v2.1 프로젝트에서 업데이트 시:
1. **deep-plan 스킬 복사**: `/tmp/jinhak-standards/.claude/skills/deep-plan/` → `.claude/skills/`
2. **session-end 스킬 업데이트**: 최신 버전으로 교체 (4단계 체크리스트 개선)
3. **session-briefing.cjs 업데이트**: 최신 버전으로 교체 (Auto Memory 상태 표시)
4. **Memory 템플릿 참고**: `templates/memory-templates.md` (AI가 자동 관리하므로 수동 생성 불필요)
5. **CLAUDE.md 업데이트**: `/apply-standard`로 자동 적용 또는 프로젝트 구조/스킬 목록/Plan 모드 참조 직접 반영

---

## [2.1] - 2026-02-27

### Claude Code 신기능 통합 (Auto Memory, Agent Teams 강화, Worktree)

Claude Code의 공식 기능을 표준에 반영합니다. Auto Memory 시스템 가이드, Agent Teams 워크플로우 상세화, Git Worktree 격리 개발 가이드, `/orchestrate` 스킬을 추가합니다.

### 추가
- CLAUDE.md 섹션 2.7 "Auto Memory 활용" 신규 추가
  - `~/.claude/projects/.../memory/MEMORY.md` 경로 및 구조
  - 200줄 제한, 토픽별 서브파일 분리 가이드
  - 저장할 것/저장 안 할 것 기준
  - Auto Memory vs `.ai/` 폴더 역할 구분 테이블
- CLAUDE.md 섹션 6.8 "Git Worktree 격리 개발" 신규 추가
  - `EnterWorktree` 도구 사용법 및 주의사항
  - `isolation: "worktree"` 에이전트 파라미터 가이드
  - WorktreeCreate/Remove Hook 예시
  - 활용 시나리오 테이블
- `.claude/skills/orchestrate/SKILL.md` 신규 추가 (`/orchestrate` 스킬)
  - 0단계 적합성 판단 기준
  - 팀 구성 → 태스크 분배 → 모니터링 → 결과 통합 → 종료 전체 플로우
  - 오케스트레이션 패턴 3가지 예시
- CLAUDE.md 섹션 6.1 Hook 이벤트 테이블에 `WorktreeCreate`, `WorktreeRemove` 추가

### 변경
- CLAUDE.md 섹션 6.4 Agent Teams 대폭 강화 (기존 개요 수준 → 완전한 워크플로우 문서)
  - 6.4.1 팀 워크플로우 (TeamCreate → 종료 전체 흐름)
  - 6.4.2 SendMessage 타입별 설명 (message/broadcast/shutdown/plan_approval)
  - 6.4.3 내장 Task 시스템 (TaskCreate/Update/List/Get)
  - 6.4.4 Background 에이전트 및 에이전트 Resume
  - 6.4.5 적합/부적합 작업 정리
  - `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 활성화 설정 유지
- CLAUDE.md 섹션 6.7 Plan 모드 & Task 관리 상세화
  - Plan 모드 사용/비사용 기준 명확화
  - EnterPlanMode → AskUserQuestion → ExitPlanMode 플로우 문서화
  - Agent Teams에서 plan_approval_request/response 처리 방법 추가
  - Task 도구 역할 테이블 추가
- `session-start/SKILL.md`: Auto Memory 확인 단계 추가 (1단계에 memory/MEMORY.md 포함), 브리핑에 "Auto Memory 상태" 항목 추가
- `session-end/SKILL.md`: Auto Memory 업데이트 단계(4단계) 추가
- CLAUDE.md 프로젝트 구조 트리에 `orchestrate/SKILL.md` 추가
- CLAUDE.md 스킬 목록 테이블에 `/orchestrate` 추가
- CLAUDE.md 버전 2.0.2 → 2.1

### Migration Guide (v2.0.2 → v2.1)

기존 v2.0.2 프로젝트에서 업데이트 시:
1. **Auto Memory**: `~/.claude/projects/.../memory/MEMORY.md` 생성 (선택, AI가 자동 관리)
2. **orchestrate 스킬 복사**: `/tmp/jinhak-standards/.claude/skills/orchestrate/` → `.claude/skills/`
3. **session-start/session-end 스킬 업데이트**: 최신 버전으로 교체
4. **CLAUDE.md 업데이트**: `/apply-standard`로 자동 적용 또는 섹션 2.7, 6.4, 6.7, 6.8 직접 반영

---

## [2.0.2] - 2026-02-23

### 세션 관리 개선

세션 로그 기록 누락 방지 및 Hook 적용 시 프로젝트 고유 설정 보존 문제를 개선합니다.

### 추가
- `scripts/session-end-reminder.cjs` - Stop Hook 리마인더 스크립트 (미커밋 변경사항 + SESSION_LOG 미기록 시 알림)
- `.claude/skills/session-end/SKILL.md` - `/session-end` 슬래시 명령어 (세션 종료 시 일괄 정리: 변경사항 수집, SESSION_LOG/CURRENT_SPRINT 업데이트, 종료 브리핑)

### 변경
- `.claude/settings.json` Stop Hook → `node scripts/session-end-reminder.cjs` 로 변경 (기존 단순 로그 출력 대체)
- `scripts/batch-apply.cjs` 비파괴 Hook 병합 로직 도입 (`mergeHooksNonDestructive`)
  - 기존: `settings.hooks` 통째 교체 → 프로젝트 고유 Hook 삭제됨
  - 변경: JINHAK/orchestra Hook만 식별하여 교체, 프로젝트 고유 Hook 보존
  - `JINHAK_HOOK_IDENTIFIERS` 배열로 표준 Hook 식별 (session-briefing, session-end-reminder, security-check-hook, [SECURITY], [SESSION])
- `scripts/batch-apply.cjs` session-end-reminder.cjs 대상 프로젝트 복사 로직 추가
- CLAUDE.md 섹션 2.1 skills 트리에 `session-end/SKILL.md` 추가
- CLAUDE.md 섹션 2.2 세션 관리 규칙에 `/session-end` 명령 및 Stop Hook 리마인더 설명 추가
- CLAUDE.md 섹션 6.2 Skills 표에 `/session-end` 행 추가
- PROJECT_STRUCTURE.md 섹션 4.2 .claude/ 트리에 `session-end/` 추가
- `.claude/skills/apply-standard/SKILL.md` Skills 복사 목록 및 검증 체크리스트 업데이트 (6개→7개 스킬)
- QUICK_START_PROMPT.md 스킬 목록 및 슬래시 명령어 안내 업데이트

### Migration Guide (v2.0.1 → v2.0.2)

기존 v2.0.1 프로젝트에서 업데이트 시:
1. `.claude/scripts/session-end-reminder.cjs` 파일 복사
2. `.claude/settings.json` Stop Hook command를 `node .claude/scripts/session-end-reminder.cjs`로 변경
3. `.claude/skills/session-end/SKILL.md` 파일 복사
4. 세션 재시작 (settings.json 변경 반영)

---

## [2.0.1] - 2026-02-23

### ESM 호환성 수정

`package.json`에 `"type": "module"`이 설정된 프로젝트에서 Hook 스크립트가 `require()` 사용으로 인해 `ERR_REQUIRE_ESM` 에러가 발생하는 문제를 수정합니다.

### 변경
- 모든 CommonJS 스크립트 확장자 `.js` → `.cjs` 변경 (6개 파일)
  - `.claude/scripts/session-briefing.js` → `.cjs`
  - `scripts/session-briefing.js` → `.cjs`
  - `scripts/batch-apply.js` → `.cjs`
  - `scripts/check-standard.js` → `.cjs`
  - `scripts/install-global-hook.js` → `.cjs`
  - `scripts/security-check-hook.js` → `.cjs`
- `.claude/settings.json` Hook 경로 업데이트 (`session-briefing.cjs`, `security-check-hook.cjs`)
- `.gitattributes`에 `.cjs` 파일 LF 강제 규칙 추가

### 수정
- `install-global-hook.cjs`: 레거시 `.js` Hook 항목이 제거되지 않고 `.cjs`와 공존하던 버그 수정

### Migration Guide (v2.0 → v2.0.1)

기존 v2.0 프로젝트에서 업데이트 시:
1. `.claude/scripts/session-briefing.js` → `session-briefing.cjs`로 이름 변경
2. `.claude/settings.json` Hook 경로에서 `.js` → `.cjs` 변경
3. `scripts/security-check-hook.js` → `security-check-hook.cjs`로 이름 변경
4. 글로벌 Hook 재설치: `node /tmp/jinhak-standards/scripts/install-global-hook.cjs`

---

## [2.0] - 2026-02

### AI 보안 가이드레일 도입 (7-Layer Defense)

OWASP LLM Top 10 2025 기반의 7-Layer AI 보안 프레임워크를 도입합니다. 기존 3중 방어 구조(자연어 감지, deny 블로킹, hooks 경고)를 7-Layer Defense로 확장하고, AI 코드 생성 보안, 의존성 보안, 데이터 분류, 인시던트 대응 체계를 추가합니다.

### 추가
- `security/` 폴더 신규 생성 (6개 문서):
  - `AI_SECURITY_GUARDRAILS.md` - 7-Layer Defense 마스터 문서
  - `OWASP_LLM_CHECKLIST.md` - OWASP LLM Top 10 2025 + Web Top 10 교차 체크리스트
  - `FORBIDDEN_PATTERNS.md` - AI 금지 코드 패턴 카탈로그 (12개 패턴, 위험/안전 코드 비교)
  - `DATA_CLASSIFICATION.md` - 진학어플라이 특화 데이터 분류/처리 기준 (극비/대외비/내부용/공개 4등급)
  - `INCIDENT_RESPONSE.md` - AI 보안 인시던트 대응 가이드 (P1~P4 분류, SLA, 보고서 템플릿)
  - `NIGHTBUILDER_SECURITY.md` - NightBuilder(24/7 AI 개발) 보안 규칙
- `scripts/security-check-hook.js` - PreToolUse 보안 검사 Hook (민감 파일/금지 명령 감지)
- `.claude/skills/security-check/SKILL.md` - `/security-check` 슬래시 명령어 (보안 점검 7항목, Security Score)
- `templates/.eslintrc.security.js` - ESLint 보안 규칙 템플릿 (eslint-plugin-security)
- `templates/.secretlintrc.json` - Secretlint 시크릿 스캔 설정 (JINHAK 커스텀 패턴 포함)
- `templates/.semgreprc.yml` - Semgrep SAST 설정 (금지 패턴 탐지 규칙)
- `templates/husky-security-hooks.md` - husky + lint-staged 기반 Git Hooks 보안 설정 가이드
- CLAUDE.md 섹션 11 "AI 보안 가이드레일" 신규 추가 (~50줄)
  - 보안 등급별 행동 규칙 (BLOCK/WARN/LOG)
  - 금지 코드 패턴 요약 (12개)
  - Human-in-the-Loop 필수 영역 (6개)
  - /security-check 명령어 안내
- CODING_CONVENTIONS.md 섹션 9.1 "보안 금지 패턴" + 섹션 10 "보안 코딩 체크리스트" 신규
- SECURITY_ISMS.md 섹션 7.6~7.8 신규 (AI 코드 생성/의존성/추적 보안) + 체크리스트 8.7
- VIBE_CODING_GUIDE.md 섹션 6.7 "AI 보안 체크 워크플로우" 신규

### 변경
- CLAUDE.md 3중 방어 구조 → 7-Layer Defense 매핑 테이블로 확장 (제거하지 않고 확장)
- CLAUDE.md 프로젝트 구조에 `security/` 폴더 + `security-check` 스킬 반영
- CLAUDE.md 섹션 6.2 Skills 목록에 `/security-check` 추가
- CLAUDE.md 섹션 9 문서 참조에 security/ 6개 문서 추가
- CLAUDE.md 섹션 10 체크리스트에 보안 가이드레일 확인 항목 추가
- CLAUDE.md 버전 1.8 → 2.0
- `.claude/settings.json` deny 규칙 3개 추가: `curl|sh`, `wget|bash`, `curl|bash`
- `.claude/settings.json` PreToolUse에 Bash 보안 검사 Hook 추가
- `.claude/settings.json` PostToolUse에 npm install 감시 Hook 추가
- `apply-standard/SKILL.md`: v2.0 파일 복사/검증 절차 추가 (security/, security-check 스킬, 보안 Hook, 템플릿)
- `review-pr/SKILL.md`: 필수 검토에 보안 항목 3개 추가 (금지 패턴, 의존성 보안, 데이터 분류)
- `session-start/SKILL.md`: 세션 브리핑에 보안 상태 항목 추가
- `scripts/session-briefing.js`: v2.0 보안 가이드레일 존재 확인 로직 추가
- `templates/project-claude.md`: "AI 보안 가이드레일" 섹션 추가, 메타 버전 2.0
- `README.md`: 버전 2.0, 문서 구조에 security/ + 보안 템플릿 반영, 히스토리 추가
- `PROJECT_STRUCTURE.md`: security/ 폴더 + security-check 스킬 반영
- `QUICK_START_PROMPT.md`: 보안 가이드레일 복사 단계(4.5) + security-check 명령어 추가
- VIBE_CODING_GUIDE.md 섹션 6.1 "절대 하지 말 것" 보안 항목 3개 추가

### Migration Guide (v1.8 → v2.0)

기존 v1.8 프로젝트를 v2.0으로 업그레이드하는 방법:

1. **표준 저장소 최신화**: `git -C /tmp/jinhak-standards pull`
2. **security/ 폴더 복사**: `/tmp/jinhak-standards/security/` → 프로젝트 루트
3. **보안 스킬 복사**: `/tmp/jinhak-standards/.claude/skills/security-check/` → `.claude/skills/`
4. **보안 Hook 복사**: `/tmp/jinhak-standards/scripts/security-check-hook.js` → `scripts/`
5. **settings.json 업데이트**:
   - deny에 `curl|sh`, `wget|bash`, `curl|bash` 추가
   - PreToolUse에 보안 검사 Hook 추가
   - PostToolUse에 패키지 설치 감시 Hook 추가
6. **CLAUDE.md 업데이트**: 섹션 11 추가, 버전 메타 2.0으로 변경
7. **보안 도구 템플릿 복사 (선택)**: `templates/.eslintrc.security.js` 등
8. **검증**: `/security-check` 명령어 실행하여 정상 동작 확인

또는 `/apply-standard`를 실행하면 위 절차가 자동으로 수행됩니다.

---

## [1.8] - 2026-02

### Hook 시스템 크로스 플랫폼 통일

모든 Hook 명령을 Node.js 기반으로 통일하여 Windows/macOS/Linux에서 동일하게 동작하도록 개선합니다. OS 종속 명령(`powershell`, `echo`, `cat`, `sed` 등)을 제거하고 `node` 또는 `node -e`로 대체합니다.

### 추가
- CLAUDE.md 섹션 2.6 "Windows 개발 환경 규칙" 신규 추가
  - 경로 규칙 (MSYS 경로 금지, 슬래시 통일, 한글/공백 경로 따옴표)
  - Unix ↔ Windows 명령어 호환성 대응표 (15개 명령)
  - 명령 체이닝 규칙 (&&, PowerShell 5.x 제한)
  - 자주 발생하는 Windows 실패 패턴 8종 및 해결 방법
  - 환경 변수 설정 방법 (Git Bash / PowerShell / cross-env)
- `scripts/check-standard.js` 신규 추가 - 글로벌 Hook용 크로스 플랫폼 표준 감지 스크립트
  - 기존 `install-global-hook.js`의 bash 인라인 명령(`sed`, `tr`, `if [ ... ]`)을 Node.js로 대체
  - CLAUDE.md에서 `jinhak_standard_version` 확인 → 버전 있으면 `session-briefing.js` 위임 실행, 없으면 경고 출력
  - `install-global-hook.js`가 `~/.claude/scripts/`에 자동 복사
- CLAUDE.md 섹션 2.5 "Hook 크로스 플랫폼 원칙" 추가 (기존 "Windows 환경 규칙" 대체)

### 수정
- `.claude/scripts/session-briefing.js` 누락 수정 - Hook이 참조하는 경로에 파일이 없어 에러 발생하던 문제
- `apply-standard/SKILL.md` 3단계에 파일 무결성 검증 추가 - 버전 일치 시에도 필수 파일 존재 확인
- `apply-standard/SKILL.md` 버전 참조 v1.3 → v1.8 일괄 수정 (4곳)
- `apply-standard/SKILL.md` 검증 체크리스트 v1.8 기준으로 업데이트

### 변경
- `install-global-hook.js`: bash 인라인 명령 → `node ~/.claude/scripts/check-standard.js` 호출로 변경
  - 설치 시 `check-standard.js`를 `~/.claude/scripts/`에 자동 복사
  - 제거 시 `check-standard.js`도 함께 삭제
  - 레거시 bash 버전 Hook 자동 감지 및 호환
- `.claude/settings.json` Hook 전면 Node.js화:
  - `UserPromptSubmit`: `powershell -Command "..."` → `node .claude/scripts/session-briefing.js`
  - `PreToolUse`: `echo ... %file%` → `node -e "console.log(...)"`
  - `SubagentStart`: `echo ...` → `node -e "console.log(...)"`
  - `Stop`: `echo ...` → `node -e "console.log(...)"`
- `apply-standard/SKILL.md`: settings.json 템플릿 Hook을 Node.js 기반으로 변경, "Windows 환경 변경 안내" 제거
- `SECURITY_ISMS.md`: 보안 설정 예시의 Hook command를 `node -e` 기반으로 변경
- `PROJECT_STRUCTURE.md`: bash/PowerShell 두 버전의 Hook을 `node .claude/scripts/session-briefing.js`로 통일
- CLAUDE.md 섹션 6.1 설정 예시에서 OS 종속 폴백 제거, Node.js 기반 안내로 변경
- CLAUDE.md 버전 1.7 → 1.8

---

## [1.7] - 2026-02

### 세션 브리핑 자동화 및 표준 미적용 경고 강화

세션 시작 시 `/session-start` 스킬의 핵심 동작을 자동으로 수행하는 브리핑 스크립트를 추가하고, 표준 미적용 프로젝트에서의 경고를 강화합니다.

### 추가
- `scripts/session-briefing.js` 신규 추가 - 세션 자동 브리핑 스크립트
  - 현재 스프린트, 최근 작업, git 상태, 최근 커밋, 표준 버전을 한 번에 출력
  - `UserPromptSubmit` Hook에서 자동 실행 (세션 1회, `once: true`)
  - `/session-start` 스킬의 1~3단계를 자동화하여 별도 실행 불필요
  - Node.js 기반 크로스 플랫폼 (Windows/Mac/Linux)
- CLAUDE.md 프로젝트 구조에 `.claude/scripts/` 폴더 추가
- `apply-standard/SKILL.md`에 Scripts 복사 단계 추가 (session-briefing.js)

### 변경
- `UserPromptSubmit` Hook: 단순 `cat` 명령 → `session-briefing.js` 우선 실행 (폴백 유지)
- 글로벌 Hook 경고 강화: 표준 미적용 시 강조 박스(`!!`) 형식으로 표시
- 글로벌 Hook: 표준 적용 프로젝트에서 session-briefing.js 자동 실행
- `.gitignore` 지침에 `*vibecoding-ref/` 추가 (참조 저장소 사본 커밋 방지)
- CLAUDE.md 버전 1.6 → 1.7

---

## [1.6] - 2026-02

### 글로벌 Hook 자동 감지

모든 프로젝트에서 Claude Code 세션 시작 시 JINHAK 표준 적용 여부를 자동 감지하는 글로벌 Hook 시스템을 추가합니다. 비개발자도 별도 명령 없이 표준 적용 안내를 받을 수 있습니다.

### 추가
- `scripts/install-global-hook.js` 신규 추가 - 글로벌 Hook 설치/제거 스크립트
  - `~/.claude/settings.json`에 JINHAK 표준 자동 감지 Hook 추가
  - 기존 설정 보존, 백업 자동 생성, 중복 설치 방지
  - `--remove` 옵션으로 깔끔한 제거 지원
  - Node.js 기반 크로스 플랫폼 (Windows/Mac/Linux)
- CLAUDE.md 섹션 6.1.1 "글로벌 Hook (자동 표준 감지)" 신규 추가
- CLAUDE.md 섹션 10 체크리스트에 글로벌 Hook 설치 안내 추가

### 변경
- README.md: "방법 0: 글로벌 Hook 설치" 섹션 추가, 문서 구조에 scripts/ 반영
- `.gitignore` 지침에 `.claude/settings.local.json` 추가 (CLAUDE.md, templates, apply-standard, QUICK_START_PROMPT)
- CLAUDE.md 버전 1.5 → 1.6

---

## [1.5.1] - 2026-02

### .gitignore 지침 보강

`.claude/settings.local.json`이 모든 적용 프로젝트의 `.gitignore`에 포함되도록 표준 문서 전체의 지침을 업데이트합니다.

### 변경
- CLAUDE.md 섹션 2.1.1: `.gitignore` 필수 포함 항목에 `.claude/settings.local.json` 명시
- CLAUDE.md 섹션 10 체크리스트: `.gitignore` 항목에 `.claude/settings.local.json` 추가
- `templates/project-claude.md`: 로컬 오버라이드 섹션에 `settings.local.json` 안내 추가
- `apply-standard/SKILL.md`: 2-4단계 `.gitignore` 확인 목록 및 검증 체크리스트에 추가
- `QUICK_START_PROMPT.md`: 5단계 `.gitignore` 업데이트 항목에 추가

---

## [1.5] - 2026-02

### 빠른 적용 프롬프트 추가

표준을 프로젝트에 적용할 때 Claude Code에 복사-붙여넣기할 수 있는 표준화된 프롬프트를 제공합니다.

### 추가
- `QUICK_START_PROMPT.md` 신규 추가 - 표준 적용용 복사-붙여넣기 프롬프트
  - 0단계 로컬 클론 방식으로 웹 크롤링 대비 속도/안정성 개선
  - 신규/기존 프로젝트 동일 프롬프트 사용 가능
  - FAQ 및 기존 방식 대비 개선점 비교표 포함
- `apply-standard/SKILL.md`에 0단계 "표준 레포 로컬 클론" 절차 추가

### 변경
- CLAUDE.md 섹션 7.1: 빠른 적용 프롬프트를 권장 방법으로 추가, 0단계 클론 절차 반영
- CLAUDE.md 섹션 9: 문서 참조 테이블에 QUICK_START_PROMPT.md 추가
- CLAUDE.md 섹션 10: 빠른 시작 체크리스트에 QUICK_START_PROMPT.md 참조 추가
- CLAUDE.md 버전 1.4 → 1.5
- README.md: "내 프로젝트에 적용하는 방법" 섹션에 빠른 적용 프롬프트 방식 추가
- README.md: 문서 구조 및 설명 테이블에 QUICK_START_PROMPT.md 추가
- `apply-standard/SKILL.md` 메타 정보 버전 1.3 → 1.5

---

## [1.4] - 2026-02

### 권한 설정 보강

Git 서브커맨드 옵션이 포함된 commit/push 명령 패턴을 허용 목록에 추가합니다.

### 변경
- `.claude/settings.json` allow 목록에 `Bash(git * commit *)`, `Bash(git * push *)` 추가
  - `git -c user.name=... commit ...` 등 옵션이 앞에 오는 패턴 허용
- CLAUDE.md 섹션 6.3 권한 설정 예시에 동일 패턴 추가
- CLAUDE.md 버전 1.3 → 1.4

---

## [1.3] - 2026-02

### Opus 4.6 대응 업데이트

Claude Opus 4.6 출시 (2026-02-05) 및 Claude Code v2.1.30~2.1.34 업데이트에 맞춰 전사 표준을 현대화합니다.

### 추가
- CLAUDE.md 섹션 6.4 "Agent Teams (멀티 에이전트 협업)" 신규 추가
  - Agent Teams 활성화 방법, 적합/부적합 작업 가이드
  - 환경변수 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` 설정
- CLAUDE.md 섹션 6.5 "Adaptive Thinking & Effort 설정" 신규 추가
  - 4단계 Effort 설정 (low/medium/high/max) 및 작업별 권장 수준
- CLAUDE.md 섹션 6.6 "컨텍스트 & 출력 사양" 신규 추가
  - 1M 토큰 컨텍스트 윈도우, 128K 출력 토큰, Context Compaction 활용 가이드
- CLAUDE.md 섹션 6.7 "Plan 모드 & Task 관리" 신규 추가
  - Plan 모드 활용 시나리오, Task 종속성 추적, `--from-pr` 옵션
- CLAUDE.md 섹션 6.1 Hook 이벤트 테이블에 3종 신규 추가
  - `SubagentStart` - 서브에이전트 보안 규칙 전파
  - `TaskCompleted` - 작업 완료 추적/알림
  - `TeammateIdle` - Agent Teams 팀원 유휴 시 조정
- CLAUDE.md 섹션 6.1에 Hook 옵션 설명 추가 (`once: true`, `additionalContext`)
- `.claude/settings.json`에 `env` 섹션 추가 (Agent Teams 활성화)
- `.claude/settings.json`에 `SubagentStart` hook 추가 (보안 규칙 전파 알림)
- `.claude/settings.json`에 `Stop` hook 추가 (세션 완료 알림)

### 변경
- CLAUDE.md 섹션 6.3 권한 설정: deny 규칙 강제 메커니즘 설명 추가, allow에 `git push *`, `git checkout *`, `git branch *`, `git fetch *` 추가, deny 규칙별 차단 이유 테이블 추가
- `apply-standard/SKILL.md`: settings.json 템플릿에 deny 강제 적용 안내 추가, allow 목록 보강
- `templates/project-claude.md`: 금지 사항 섹션에 deny 규칙 강제 적용 안내 추가
- CLAUDE.md 섹션 2.2 세션 관리 규칙: Agent Memory 활용 안내 추가, SESSION_LOG 경량화 (요약 기록 방식)
- CLAUDE.md 섹션 2.4 안티패턴 테이블: "5개 이상 동시 요청" → "순차 의존성 있는 5개 이상" 으로 완화 (독립 작업은 Agent Teams 활용 가능)
- `.claude/settings.json` UserPromptSubmit hook에 `once: true` 추가 (세션 1회 실행으로 토큰 절약)
- CLAUDE.md 섹션 7.2 버전 추적 예시를 1.3으로 업데이트
- CLAUDE.md 버전 1.2 → 1.3, 날짜 2026-02
- `session-start/SKILL.md`: Agent Memory 안내 추가, `--from-pr` 세션 재개 옵션 추가
- `commit/SKILL.md`: Co-Authored-By 모델 비종속 정책 명시, 세션 기록 순서 조정
- `review-pr/SKILL.md`: `--from-pr` 팁 추가, 크로스 체크에 Agent Teams 코드 일관성 항목 추가
- `test/SKILL.md`: Agent Teams 병렬 테스트 분석 안내 추가
- `apply-standard/SKILL.md`: settings.json 템플릿을 v1.3 사양으로 업데이트 (env, 신규 hooks, once, deny 보강), 검증 체크리스트에 v1.3 항목 추가, 버전 참조 1.0 → 1.3
- VIBE_CODING_GUIDE.md 섹션 1 "부적합한 경우" → "주의가 필요한 경우"로 톤 완화, 코드 리뷰/대규모 분석 적합 항목 추가
- VIBE_CODING_GUIDE.md 섹션 5 세션 관리: Agent Memory 안내, `--from-pr`, Plan 모드 추가
- VIBE_CODING_GUIDE.md 섹션 6.3 "AI가 잘 못하는 것" → "AI 협업 시 주의가 필요한 영역"으로 변경, Opus 4.6 향상 반영
- VIBE_CODING_GUIDE.md 섹션 6.6 "Opus 4.6 신기능 활용법" 신규 추가 (Agent Teams, Plan 모드, Effort 설정)
- VIBE_CODING_GUIDE.md 섹션 6 안티패턴: "과도한 기능 요청" Agent Teams 반영 완화
- VIBE_CODING_GUIDE.md 섹션 9.4 트러블슈팅: Context Compaction, Agent Memory 반영
- `templates/project-claude.md`: 메타 정보 버전 1.2 → 1.3, 세션 관리에 Agent Memory 안내 추가, SESSION_LOG 기록 형식 경량화
- `templates/ai-folder-templates.md`: SESSION_LOG 템플릿 경량화 (요약 기록 방식)
- `SECURITY_ISMS.md`: 섹션 7.3 "Agent Teams 보안" 신규 추가 (데이터 격리, deny 규칙 상속, 감사 추적)
- `SECURITY_ISMS.md`: 섹션 7.4 "디버그 로그 보안" 신규 추가 (OAuth 토큰/API Key 노출 방지)
- `SECURITY_ISMS.md`: 섹션 7.5 Claude Code 보안 설정에 SubagentStart hook 추가
- `SECURITY_ISMS.md`: 섹션 8.6 체크리스트에 Agent Teams, 디버그 로그 보안 항목 추가
- `ARCHITECTURE.md`: 섹션 7 "AI 협업 아키텍처 고려사항" 신규 추가 (1M 컨텍스트 활용 전략, Agent Teams 아키텍처 패턴)

---

## [1.2] - 2026-02

### 추가
- `SECURITY_ISMS.md` 신규 추가 - ISMS 인증 기준에 맞는 AI 개발 보안 가이드
  - 개인정보 보호, 접근 통제, 감사 로깅, 암호화, AI 특화 보안 규칙
  - ISMS 보안 체크리스트 (6개 영역)
- `templates/claude-local-template.md` 신규 추가 - CLAUDE.local.md 가이드 및 템플릿
  - 오버라이드 우선순위, 사용 시나리오, 금지 사항, 템플릿 본문
- CLAUDE.md 섹션 2.1에 `CLAUDE.local.md` 파일 추가 및 섹션 2.1.1 "CLAUDE.local.md 오버라이드" 추가
- CLAUDE.md 섹션 2.4 "AI 안티패턴 자동 감지" 신규 추가
  - 6가지 안티패턴 분류 테이블 + Claude 대응 규칙
  - 3중 방어 구조 (자연어 감지, deny 블로킹, hooks 경고)
- CLAUDE.md 섹션 3.1에 ISMS 보안 준수 참조 추가
- CLAUDE.md 섹션 9 문서 참조 테이블에 SECURITY_ISMS.md, claude-local-template.md 추가
- CLAUDE.md 섹션 10 빠른 시작 체크리스트에 CLAUDE.local.md, 보안 항목 추가
- VIBE_CODING_GUIDE.md 섹션 6.4 "AI 안티패턴 상세 목록" 추가 (3개 카테고리별 상세 테이블)
- VIBE_CODING_GUIDE.md 섹션 6.5 "안티패턴 자동 감지 메커니즘" 추가 (감지 규칙 + 대화 예시)
- `apply-standard/SKILL.md`에 "사전 준비 체크리스트" 섹션 추가
- `review-pr/SKILL.md` 필수 검토 항목에 ISMS 보안, AI 안티패턴 검토 추가
- `templates/project-claude.md`에 "AI 안티패턴 금지" 및 "로컬 오버라이드" 섹션 추가

### 변경
- `.claude/settings.json` deny 목록에 `Bash(*--no-verify*)` 추가
- `.claude/settings.json`에 `PreToolUse` hook 추가 (Edit|Write 매처로 보안 경고)
- `apply-standard/SKILL.md` 적용 후 검증 체크리스트를 3개 영역(파일/기능/보안)으로 상세화
- `templates/project-claude.md` 메타 정보 버전 1.0 → 1.2
- `ARCHITECTURE.md` 섹션 5에 SECURITY_ISMS.md 참조 링크 추가
- CLAUDE.md 버전 1.1 → 1.2, 날짜 2026-02

---

## [1.1] - 2025-02

### 추가
- `/apply-standard` 스킬 신규 추가 - 다른 프로젝트에 표준을 자동 적용
- `/session-start` 스킬에 표준 버전 체크 로직 추가
- `/commit`, `/review-pr`, `/test` 스킬 상세 내용 보강
- `CHANGELOG.md` 파일 추가 - 버전별 변경 이력 관리
- `templates/project-claude.md`에 표준 메타 정보 필드 추가
  - `jinhak_standard_version` - 적용된 표준 버전
  - `jinhak_standard_repo` - 표준 저장소 URL
  - `applied_date` - 적용 일자
- `templates/ai-folder-templates.md` 추가 - .ai/ 폴더 파일 초기 템플릿
- CLAUDE.md에 "표준 적용 프로세스" 섹션 추가
- CLAUDE.md Hooks 섹션에 이벤트 종류/변수 테이블 추가
- VIBE_CODING_GUIDE.md에 트러블슈팅 섹션 추가

### 변경
- `.claude/settings.json` 권한 목록 보강 (pnpm, eslint 추가)
- `.claude/settings.json`에 `git config` deny 규칙 추가
- `Co-Authored-By` 형식을 `Claude <noreply@anthropic.com>`으로 통일
- README.md 폴더 구조 표기 수정
- PROJECT_STRUCTURE.md PowerShell 스크립트 개선
- PROJECT_STRUCTURE.md 초기화 스크립트에 apply-standard 스킬 포함

### 삭제
- `claude.standard.md` 삭제 - 유일한 내용을 기존 문서에 통합 후 제거
  - .ai/ 파일 템플릿 → `templates/ai-folder-templates.md`
  - 트러블슈팅 → `VIBE_CODING_GUIDE.md` 섹션 9
  - Hooks 상세 → `CLAUDE.md` 섹션 6.1

### 수정
- README.md에서 `standards/` 경로 접두사 제거 (실제 구조와 불일치)
- PowerShell hooks command 호환성 개선

---

## [1.0] - 2025-02

### 최초 버전
- JINHAK Template 프로젝트 기반으로 전사 AI 개발 표준 작성
- 기술 스택 표준 정의 (React, Zustand, Tailwind CSS, PostgreSQL/MSSQL 등)
- 코드 품질 기준 및 금지 사항 정의
- Git 커밋 규칙 정의
- HTTP API 규칙 정의 (GET/POST만 사용)
- 프론트엔드/백엔드 아키텍처 패턴 정의
- Vault 기반 비밀키 관리 규칙 정의
- 세션 관리 구조 정의 (.ai/ 폴더)
- Claude Code 설정 가이드 (.claude/ 폴더)
- 바이브 코딩 가이드 작성
- 프로젝트 템플릿 제공 (project-claude.md, component-template.md)
