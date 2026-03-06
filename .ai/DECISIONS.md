# 아키텍처 의사결정 기록 (ADR)

이 문서는 프로젝트의 주요 기술 의사결정을 ADR(Architecture Decision Record) 형식으로 기록합니다.

---

## ADR-001: Hook 실행 환경 — bash 기반 Unix 문법 사용

### 상태
개정됨 (2026-03, 초기: 2026-02)

### 컨텍스트
- Claude Code의 Hook은 **bash 셸에서 실행**됨 (Windows에서도 Git Bash 사용)
- 기존 결정: "모든 Hook을 `node`로만 시작" → 과도한 제한으로 판명
- `npx eslint`, `git` 등 bash에서 사용 가능한 명령을 불필요하게 제한함
- 문서 내 자기모순 발생 (규칙은 "node만", 예시는 `npx eslint` 사용)

### 결정
Hook은 bash에서 실행되므로 Unix 문법과 bash PATH의 모든 명령을 허용.
**Windows 전용 문법만 금지**: `> nul`, `2>nul`, `powershell -Command` 등.
복잡한 로직은 `.cjs` 스크립트로 분리하여 `node script.cjs`로 실행 권장.

### 대안
- 대안 1 (기존): `node`로만 시작 강제 → 과도한 제한, 문서 자기모순 유발
- 대안 2: OS별 분기 설정 → 유지보수 부담

### 결과
- (+) bash 기본 기능 활용 가능 (`2>/dev/null`, `||`, `&&` 등)
- (+) `npx`, `git` 등 직접 호출 가능 — 불필요한 node 래핑 제거
- (+) 문서 일관성 확보
- (-) Windows 전용 문법 주의 필요 (nul 예약어 등)

---

## ADR-002: 세션 브리핑 자동화 (session-briefing.js)

### 상태
승인됨 (2026-02)

### 컨텍스트
- 매 세션 시작 시 수동으로 /session-start를 실행해야 하는 불편함
- UserPromptSubmit Hook의 `once: true` 옵션으로 세션 1회 자동 실행 가능

### 결정
session-briefing.js를 UserPromptSubmit Hook으로 세션 시작 시 자동 실행

### 결과
- (+) 세션 시작 시 자동으로 컨텍스트 로드
- (+) /session-start 수동 실행 불필요
- (-) Hook 실행 시간만큼 첫 응답 지연

---

## ADR-003: v2.0 AI 보안 가이드레일 도입 (7-Layer Defense)

### 상태
승인됨 (2026-02-20)

### 컨텍스트
- 기존 3중 방어 구조(자연어 감지, deny 블로킹, hooks 경고)가 AI 코드 생성 보안에 부족
- OWASP LLM Top 10 2025 발표로 체계적인 AI 보안 프레임워크 필요
- 진학어플라이 특성상 수험생 개인정보(성적, 지원 이력 등) 보호 필수

### 결정
7-Layer AI 보안 가이드레일을 도입하여 기존 3중 방어를 확장

### 핵심 변경
- `security/` 폴더에 6개 보안 문서 생성 (가이드레일, OWASP 체크리스트, 금지 패턴, 데이터 분류, 인시던트 대응, NightBuilder)
- `/security-check` 스킬로 보안 점검 자동화
- settings.json에 `curl|sh`, `wget|bash` deny 규칙 추가
- PreToolUse 보안 검사 Hook + PostToolUse 패키지 설치 감시 Hook

### 대안
- 대안 1: 기존 3중 방어만 보강 → OWASP 커버리지 부족
- 대안 2: 외부 보안 도구만 도입 → 표준 문서와 연계 부족

### 결과
- (+) OWASP LLM Top 10 2025 전체 커버
- (+) 데이터 분류 체계로 ISMS-P 대응 강화
- (+) 인시던트 대응 프로세스 표준화
- (-) 신규 문서 13개로 관리 범위 증가

---

## 의사결정 변경 이력

| 날짜 | ADR | 변경 내용 |
|------|-----|----------|
| 2026-02 | ADR-001 | 초기 작성 (Node.js 기반 통일) |
| 2026-03-06 | ADR-001 | 개정: bash 기반 Unix 문법 허용으로 변경 |
| 2026-02 | ADR-002 | 초기 작성 |
| 2026-02-20 | ADR-003 | v2.0 보안 가이드레일 도입 |
