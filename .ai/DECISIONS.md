# 아키텍처 의사결정 기록 (ADR)

이 문서는 프로젝트의 주요 기술 의사결정을 ADR(Architecture Decision Record) 형식으로 기록합니다.

---

## ADR-001: Hook 크로스 플랫폼 통일 (Node.js 기반)

### 상태
승인됨 (2026-02)

### 컨텍스트
- Windows, macOS, Linux 환경에서 Claude Code Hook이 동일하게 동작해야 함
- `echo`, `type`, `powershell` 등 OS 종속 명령어 사용으로 크로스 플랫폼 호환성 문제 발생
- Claude Code는 Node.js를 필수 의존성으로 요구

### 결정
모든 Hook command를 `node` 또는 `node -e`로 시작하도록 통일

### 대안
- 대안 1: OS별 분기 설정 → 유지보수 부담
- 대안 2: Shell 스크립트 + Git Bash 강제 → macOS/Linux에서 불필요한 의존성

### 결과
- (+) 모든 OS에서 동일 동작 보장
- (+) 유지보수 포인트 단일화
- (-) 단순 echo도 node -e로 감싸야 하는 번거로움

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
| 2026-02 | ADR-001 | 초기 작성 |
| 2026-02 | ADR-002 | 초기 작성 |
| 2026-02-20 | ADR-003 | v2.0 보안 가이드레일 도입 |
