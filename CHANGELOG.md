# JINHAK AI 개발 표준 - 변경 이력

이 파일은 JINHAK 전사 AI 개발 표준의 버전별 변경 내역을 기록합니다.
Claude Code의 `/session-start` 스킬이 이 파일을 참조하여 표준 업데이트 여부를 판단합니다.

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
