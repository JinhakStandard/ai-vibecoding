# JINHAK AI 개발 표준 - 릴리스 노트

이 문서는 JINHAK 전사 AI 개발 표준의 주요 버전별 업데이트 내용을 정리합니다.
상세 변경 이력(파일별 diff)은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.

---

## v2.0.1 (2026-02-23) - ESM 호환성 수정

### 핵심 변경

`package.json`에 `"type": "module"`이 설정된 프로젝트에서 Hook 스크립트(`require()` 사용)가 ESM으로 해석되어 에러가 발생하는 문제를 수정합니다. 모든 CommonJS 스크립트 확장자를 `.js` → `.cjs`로 변경하여 `package.json`의 `type` 설정과 무관하게 항상 CommonJS로 동작합니다.

### 변경 파일
- 스크립트 6개 `.js` → `.cjs` 확장자 변경
- `.claude/settings.json` Hook 경로 업데이트
- `.gitattributes`에 `.cjs` LF 강제 규칙 추가
- `install-global-hook.cjs` 레거시 `.js` Hook 미제거 버그 수정

---

## v2.0 (2026-02) - AI 보안 가이드레일 도입

### 핵심 변경

OWASP LLM Top 10 2025 기반의 **7-Layer AI 보안 프레임워크**를 도입합니다. 기존 3중 방어 구조를 7-Layer Defense로 확장하여 AI 코드 생성 보안, 의존성 보안, 데이터 분류, 인시던트 대응 체계를 추가합니다.

### 주요 내용

**신규 문서 (security/ 폴더)**
| 문서 | 내용 |
|------|------|
| `AI_SECURITY_GUARDRAILS.md` | 7-Layer Defense 마스터 문서 |
| `OWASP_LLM_CHECKLIST.md` | OWASP LLM Top 10 + Web Top 10 교차 체크리스트 |
| `FORBIDDEN_PATTERNS.md` | AI 금지 코드 패턴 12개 (위험/안전 코드 비교) |
| `DATA_CLASSIFICATION.md` | 진학어플라이 데이터 분류 4등급 (극비/대외비/내부용/공개) |
| `INCIDENT_RESPONSE.md` | 보안 인시던트 대응 가이드 (P1~P4 분류, SLA, 보고서 템플릿) |
| `NIGHTBUILDER_SECURITY.md` | NightBuilder(24/7 AI 개발) 보안 규칙 |

**자동화 도구**
- `/security-check` 스킬: 보안 점검 7항목 + Security Score 산출
- `security-check-hook.js`: PreToolUse Hook으로 민감 파일/금지 명령 실시간 감지
- ESLint, Secretlint, Semgrep 보안 템플릿 제공
- husky + lint-staged 기반 Git Hooks 보안 설정 가이드

**기존 문서 보안 강화**
- `CLAUDE.md`: 섹션 11 "AI 보안 가이드레일" 신규, 3중 방어 → 7-Layer 매핑
- `CODING_CONVENTIONS.md`: 보안 금지 패턴 + 보안 코딩 체크리스트 추가
- `SECURITY_ISMS.md`: AI 코드 생성/의존성/추적 보안 섹션 추가
- `VIBE_CODING_GUIDE.md`: AI 보안 체크 워크플로우 추가

**settings.json 강화**
- deny 규칙 3개 추가: `curl|sh`, `wget|bash`, `curl|bash`
- PreToolUse 보안 검사 Hook + PostToolUse 패키지 설치 감시 Hook

### 업그레이드

`/apply-standard` 실행 또는 [Migration Guide](./CHANGELOG.md#migration-guide-v18--v20) 참조

---

## v1.8 (2026-02) - Hook 크로스 플랫폼 통일

### 핵심 변경

모든 Hook 명령을 **Node.js 기반으로 통일**하여 Windows/macOS/Linux에서 동일하게 동작하도록 개선합니다.

### 주요 내용

- Hook command를 `node` 또는 `node -e`로 시작하도록 전면 교체
  - `UserPromptSubmit`: `powershell -Command "..."` → `node .claude/scripts/session-briefing.js`
  - `PreToolUse/SubagentStart/Stop`: OS 종속 명령 → `node -e "..."`
- `scripts/check-standard.js` 신규: 글로벌 Hook용 크로스 플랫폼 표준 감지 스크립트
- `install-global-hook.js`: bash 인라인 명령 → Node.js 호출로 변경, 레거시 자동 업그레이드
- CLAUDE.md 섹션 2.5 "Hook 크로스 플랫폼 원칙" 추가
- CLAUDE.md 섹션 2.6 "Windows 개발 환경 규칙" 추가
  - 경로 규칙, Unix ↔ Windows 명령어 호환성 대응표 (15개)
  - Windows 실패 패턴 8종 및 해결 방법

---

## v1.7 (2026-02) - 세션 브리핑 자동화

### 핵심 변경

세션 시작 시 `/session-start`의 핵심 동작을 **자동으로 수행**하는 브리핑 스크립트를 추가합니다.

### 주요 내용

- `scripts/session-briefing.js` 신규: 세션 자동 브리핑 스크립트
  - 현재 스프린트, 최근 작업, git 상태, 최근 커밋, 표준 버전을 한 번에 출력
  - `UserPromptSubmit` Hook에서 `once: true`로 세션 1회 자동 실행
- 표준 미적용 프로젝트에서 강조 박스 형식 경고 강화
- `.gitignore` 지침에 `*vibecoding-ref/` 추가

---

## v1.6 (2026-02) - 글로벌 Hook 자동 감지

### 핵심 변경

모든 프로젝트에서 Claude Code 세션 시작 시 JINHAK 표준 적용 여부를 **자동 감지**하는 글로벌 Hook 시스템을 추가합니다.

### 주요 내용

- `scripts/install-global-hook.js` 신규: 글로벌 Hook 설치/제거 스크립트
  - `~/.claude/settings.json`에 자동 감지 Hook 추가
  - 기존 설정 보존, 백업 자동 생성, 중복 설치 방지
  - `--remove` 옵션으로 깔끔한 제거
- CLAUDE.md 섹션 6.1.1 "글로벌 Hook (자동 표준 감지)" 추가
- 설치 후 동작:
  - 표준 미적용 프로젝트 → `/apply-standard` 안내 자동 표시
  - 표준 적용된 프로젝트 → `/session-start` 안내 자동 표시

---

## v1.5 (2026-02) - 빠른 적용 프롬프트

### 핵심 변경

표준을 프로젝트에 적용할 때 Claude Code에 **복사-붙여넣기할 수 있는 표준화된 프롬프트**를 제공합니다.

### 주요 내용

- `QUICK_START_PROMPT.md` 신규: 6단계 적용 프롬프트
  - 0단계 로컬 클론 방식으로 웹 크롤링 대비 속도/안정성 대폭 개선
  - 신규/기존 프로젝트 동일 프롬프트 사용
  - FAQ 및 기존 방식 대비 개선점 비교표 포함
- `apply-standard/SKILL.md`에 0단계 "표준 레포 로컬 클론" 절차 추가

---

## v1.4 (2026-02) - 권한 설정 보강

### 핵심 변경

Git 서브커맨드 옵션이 포함된 commit/push 명령 패턴을 허용 목록에 추가합니다.

### 주요 내용

- `.claude/settings.json` allow에 `Bash(git * commit *)`, `Bash(git * push *)` 추가
  - `git -c user.name=... commit ...` 등 옵션이 앞에 오는 패턴 허용
- CLAUDE.md 섹션 6.3 권한 설정 예시에 동일 패턴 반영

---

## v1.3 (2026-02) - Opus 4.6 대응

### 핵심 변경

Claude Opus 4.6 출시 및 Claude Code v2.1.30~2.1.34 업데이트에 맞춰 전사 표준을 현대화합니다.

### 주요 내용

**CLAUDE.md 신규 섹션 4개**
| 섹션 | 내용 |
|------|------|
| 6.4 Agent Teams | 멀티 에이전트 협업: 활성화 방법, 적합/부적합 작업 가이드 |
| 6.5 Adaptive Thinking | 4단계 Effort 설정 (low/medium/high/max) |
| 6.6 컨텍스트 & 출력 | 1M 토큰 컨텍스트, 128K 출력, Context Compaction |
| 6.7 Plan 모드 & Task | Plan 모드 활용, Task 종속성 추적, `--from-pr` |

**Hook 이벤트 3종 추가**
- `SubagentStart`: 서브에이전트 보안 규칙 전파
- `TaskCompleted`: 작업 완료 추적/알림
- `TeammateIdle`: Agent Teams 팀원 유휴 시 조정

**기타 주요 변경**
- settings.json에 `env` 섹션 추가 (Agent Teams 활성화)
- deny 규칙 강제 메커니즘 설명 + deny 규칙별 차단 이유 테이블
- 세션 관리에 Agent Memory 활용 안내, SESSION_LOG 경량화
- VIBE_CODING_GUIDE.md: Opus 4.6 신기능 활용법 섹션 추가
- SECURITY_ISMS.md: Agent Teams 보안, 디버그 로그 보안 추가
- ARCHITECTURE.md: AI 협업 아키텍처 고려사항 추가

---

*이 문서는 v1.3 이후 주요 변경사항을 기록합니다. 전체 변경 이력(v1.0~)은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.*
