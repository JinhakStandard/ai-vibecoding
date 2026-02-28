# JINHAK 프롬프트 라이브러리

개발자가 만든 좋은 프롬프트를 팀 전체가 공유하고, 품질을 체계적으로 관리하는 시스템입니다.

---

## 1. 개요

프롬프트 라이브러리는 JINHAK 개발팀이 AI와 협업할 때 자주 사용하는 프롬프트를 표준화된 형식으로 등록·검색·품질검증하는 시스템입니다.

**핵심 가치:**
- **재사용**: 검증된 프롬프트를 팀 전체가 공유
- **품질 보증**: 자동 품질 검증으로 일정 수준 이상 유지
- **발견 가능성**: 카테고리/태그 기반 검색으로 빠른 탐색

**Phase 로드맵:**
| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 등록/검색/품질검증 기반 | ✅ 현재 |
| Phase 2 | JABIS API 연동 + 사용량 추적 | 계획 |
| Phase 3 | Slack 자동 다이제스트 + 웹 대시보드 | 계획 |
| Phase 4 | NightBuilder 연동 자동 품질 테스트 | 계획 |

---

## 2. 폴더 구조

```
prompts/
├── _template/                    # 템플릿 (새 프롬프트 작성 시 참고)
│   ├── metadata.json             #   메타데이터 스키마
│   └── prompt.md                 #   프롬프트 본문 구조
├── code-gen/                     # 코드 생성/구현
│   └── react-component/
│       ├── metadata.json
│       └── prompt.md
├── code-review/                  # 코드 리뷰/분석
│   └── security-review/
│       ├── metadata.json
│       └── prompt.md
├── testing/                      # 테스트 작성/실행
│   └── unit-test-gen/
│       ├── metadata.json
│       └── prompt.md
├── docs/                         # 문서 생성/업데이트
├── refactor/                     # 리팩토링/최적화
├── debug/                        # 디버깅/문제 해결
└── planning/                     # 설계/계획 수립
```

각 프롬프트는 **카테고리 폴더** 아래에 **고유 ID 폴더**를 가지며, 그 안에 `metadata.json`과 `prompt.md` 두 파일로 구성됩니다.

---

## 3. 메타데이터 스키마

`metadata.json` 필수/선택 필드:

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `id` | string | ✅ | 고유 식별자 (폴더명과 일치) |
| `title` | string | ✅ | 프롬프트 제목 (한국어) |
| `description` | string | ✅ | 1~2줄 설명 |
| `category` | string | ✅ | 대분류 (폴더명과 일치) |
| `tags` | string[] | ✅ | 검색용 태그 (2개 이상) |
| `author` | string | ✅ | 작성자명 |
| `created` | string | ✅ | 생성일 (YYYY-MM-DD) |
| `updated` | string | ✅ | 수정일 (YYYY-MM-DD) |
| `version` | string | ✅ | 프롬프트 버전 |
| `compatibility` | object | ✅ | 플랫폼 호환성 (`claude_code`, `claude_ai`, `jabis`) |
| `tech_stack` | string[] | | 관련 기술 스택 |
| `difficulty` | string | | `beginner` / `intermediate` / `advanced` |
| `estimated_tokens` | number | | 예상 토큰 수 |
| `quality_score` | number\|null | | `/prompt-quality-check` 점수 (100점 만점) |
| `usage_count` | number | | 사용 횟수 (Phase 2) |
| `fork_parent` | string\|null | | 포크 원본 프롬프트 ID |

---

## 4. 카테고리 분류

2레벨 구조: 대분류(폴더) + 세분류(태그)

| 대분류 (폴더명) | 설명 | 태그 예시 |
|-----------------|------|----------|
| `code-gen` | 코드 생성/구현 | `react`, `api`, `component`, `crud` |
| `code-review` | 코드 리뷰/분석 | `security`, `performance`, `accessibility` |
| `testing` | 테스트 작성/실행 | `unit-test`, `e2e`, `vitest`, `jest` |
| `docs` | 문서 생성/업데이트 | `api-doc`, `readme`, `jsdoc` |
| `refactor` | 리팩토링/최적화 | `performance`, `readability`, `dry` |
| `debug` | 디버깅/문제 해결 | `error-trace`, `memory-leak`, `network` |
| `planning` | 설계/계획 수립 | `architecture`, `migration`, `estimation` |

---

## 5. 사용법

### 5.1 프롬프트 등록

```
/prompt-register
```

대화형으로 프롬프트를 등록합니다. 카테고리 선택, 메타데이터 자동 추론, 품질 기본 검증을 수행합니다.

### 5.2 프롬프트 검색

```
/prompt-search 보안 리뷰
/prompt-search --category code-gen --tag react
```

키워드, 카테고리, 태그로 프롬프트를 검색합니다. 결과를 테이블로 출력하고 선택 시 상세 내용을 표시합니다.

### 5.3 품질 검증

```
/prompt-quality-check security-review
/prompt-quality-check prompts/code-gen/react-component
```

100점 만점으로 프롬프트 품질을 평가합니다:
- 구조 검증 (25점): 필수 필드, 섹션, ID 일치
- 내용 검증 (35점): 길이, 명확성, 예시 포함
- 보안 검증 (25점): 민감정보, 금지패턴 유도, Injection 방어
- 호환성 검증 (15점): compatibility 필드, 기술 스택 명시

---

## 6. 프롬프트 작성 가이드라인

### 6.1 좋은 프롬프트의 조건

1. **자체 완결성**: 프롬프트만 복사-붙여넣기해도 동작
2. **변수 명시**: `{변수}`로 교체할 부분을 명확하게 표시
3. **출력 형식 지정**: 기대하는 출력 형식을 구체적으로 명시
4. **JINHAK 규칙 인라인**: 관련 표준 규칙을 프롬프트 내에 포함
5. **사용 예시 제공**: 최소 1개의 구체적 사용 예시

### 6.2 작성 절차

1. `prompts/_template/`의 두 파일을 복사하여 시작
2. `metadata.json`의 모든 필수 필드를 채움
3. `prompt.md`의 각 섹션(컨텍스트, 프롬프트, 사용 예시, 변형)을 작성
4. `/prompt-quality-check`으로 품질 검증
5. 70점 이상이면 커밋, 미달이면 개선 후 재검증

### 6.3 금지 사항

- 프롬프트에 실제 API 키, 비밀번호, 개인정보 포함 금지
- 금지 패턴(eval, exec 등)을 유도하는 프롬프트 금지
- 특정 환경(IP, 포트, 도메인)에 하드코딩된 프롬프트 금지
- 설명 없는 매직 넘버/문자열 사용 금지

---

## 7. Phase 2 로드맵

### 7.1 JABIS API 연동

JINHAK HTTP API 규칙(GET/POST만, action 필드)을 준수하는 API 설계:

```
POST /api/prompts  { action: "search", query: "...", category: "..." }
POST /api/prompts  { action: "register", metadata: {...}, content: "..." }
POST /api/prompts  { action: "track", prompt_id: "...", event: "used" }
POST /api/prompts  { action: "report", period: "weekly" }
```

### 7.2 사용량 추적

- `scripts/prompt-track.cjs`: Claude Code Hook에서 프롬프트 사용 시 자동 기록
- `/prompt-report` 스킬: 주간/월간 사용 통계 출력

### 7.3 자동 평가 지표

| 지표 | 가중치 | 설명 |
|------|--------|------|
| 사용 횟수 | 30% | 검색 + 복사 + 적용 횟수 |
| 커밋 채택률 | 40% | 프롬프트 사용 후 실제 커밋까지 이어진 비율 |
| 재사용률 | 20% | 서로 다른 프로젝트에서의 사용 비율 |
| Fork 횟수 | 10% | 다른 프롬프트의 기반이 된 횟수 |

### 7.4 Slack 다이제스트 (Phase 3)

- 주간 "이 주의 인기 프롬프트" 자동 발송
- 새 프롬프트 등록 시 채널 알림

### 7.5 NightBuilder 연동 (Phase 4)

- 등록된 프롬프트를 NightBuilder가 자동 실행하여 품질 테스트
- 실패 시 작성자에게 알림, quality_score 자동 업데이트

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
