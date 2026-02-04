# JINHAK AI 개발 표준 - 변경 이력

이 파일은 JINHAK 전사 AI 개발 표준의 버전별 변경 내역을 기록합니다.
Claude Code의 `/session-start` 스킬이 이 파일을 참조하여 표준 업데이트 여부를 판단합니다.

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
