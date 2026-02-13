# JINHAK AI 개발 표준 - 변경 이력

이 파일은 JINHAK 전사 AI 개발 표준의 버전별 변경 내역을 기록합니다.
Claude Code의 `/session-start` 스킬이 이 파일을 참조하여 표준 업데이트 여부를 판단합니다.

---

## [1.8] - 2026-02

### Hook 시스템 크로스 플랫폼 통일

모든 Hook 명령을 Node.js 기반으로 통일하여 Windows/macOS/Linux에서 동일하게 동작하도록 개선합니다. OS 종속 명령(`powershell`, `echo`, `cat`, `sed` 등)을 제거하고 `node` 또는 `node -e`로 대체합니다.

### 추가
- `scripts/check-standard.js` 신규 추가 - 글로벌 Hook용 크로스 플랫폼 표준 감지 스크립트
  - 기존 `install-global-hook.js`의 bash 인라인 명령(`sed`, `tr`, `if [ ... ]`)을 Node.js로 대체
  - CLAUDE.md에서 `jinhak_standard_version` 확인 → 버전 있으면 `session-briefing.js` 위임 실행, 없으면 경고 출력
  - `install-global-hook.js`가 `~/.claude/scripts/`에 자동 복사
- CLAUDE.md 섹션 2.5 "Hook 크로스 플랫폼 원칙" 추가 (기존 "Windows 환경 규칙" 대체)

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
