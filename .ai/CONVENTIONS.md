# JabisStandard 코딩 컨벤션

이 문서는 JabisStandard 저장소의 코딩 규칙과 네이밍 규칙을 정의합니다.
JINHAK 전사 표준을 기반으로 프로젝트 특화 규칙을 추가합니다.

---

## 네이밍 규칙

### 파일/폴더
| 유형 | 규칙 | 예시 |
|------|------|------|
| 스크립트 | kebab-case | `session-briefing.js`, `batch-apply.js` |
| 스킬 폴더 | kebab-case | `apply-standard/`, `review-pr/` |
| 문서 | UPPER_SNAKE_CASE | `SESSION_LOG.md`, `CURRENT_SPRINT.md` |
| 템플릿 | kebab-case | `project-claude.md` |

### 코드
| 유형 | 규칙 | 예시 |
|------|------|------|
| 함수/변수 | camelCase | `readFile`, `getStandardVersion` |
| 상수 | UPPER_SNAKE_CASE | `STANDARD_VERSION`, `TARGET_PROJECTS` |

---

## Hook 작성 규칙

1. 모든 command는 `node` 또는 `node -e`로 시작
2. OS 종속 명령(`echo`, `type`, `powershell`) 사용 금지
3. 파일 경로는 `path.join()`으로 생성
4. 에러는 Node.js 내부에서 처리 (리다이렉션 금지)

---

## 스킬 작성 규칙

1. `SKILL.md` 파일에 명령어 정의
2. 한글로 설명 작성
3. 단계별 절차를 명확히 기술

---

## Git 커밋 규칙

| Type | 설명 |
|------|------|
| feat | 새 기능 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| style | 코드 포맷팅 |
| refactor | 리팩토링 |
| test | 테스트 |
| chore | 빌드/설정 |

---

## 금지 사항

1. OS 종속 Hook command 사용 금지
2. `> nul`, `2>nul` 리다이렉션 사용 금지
3. 하드코딩된 절대 경로 사용 금지 (Hook에서)
4. 주석 처리된 코드 방치 금지
