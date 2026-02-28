---
name: prompt-register
description: 프롬프트 라이브러리에 새 프롬프트를 등록 — 중복 검사, 메타데이터 생성, 품질 기본 검증
---

프롬프트 라이브러리(`prompts/`)에 새 프롬프트를 등록합니다.

## 인자
$ARGUMENTS - 프롬프트 제목 또는 설명 (선택사항. 없으면 대화형으로 수집)

## 사용법
```
/prompt-register
/prompt-register 보안 코드 리뷰 프롬프트
```

## 실행 절차

### 0단계: 입력 분석

인자가 없으면 AskUserQuestion으로 다음을 수집:
- 프롬프트 제목
- 프롬프트 용도 (어떤 작업에 사용하는지)
- 프롬프트 본문 (사용자가 이미 작성한 경우)

인자가 있으면 해당 내용을 기반으로 진행.

### 1단계: 중복 검사

기존 등록된 프롬프트와의 중복을 확인합니다:

1. `prompts/` 하위의 모든 `metadata.json`을 Glob으로 수집
2. 각 metadata.json의 `title`, `description`, `tags`를 읽어 유사성 판단
3. 유사한 프롬프트가 있으면 사용자에게 보고:
   - 기존 프롬프트 정보 (ID, 제목, 카테고리)
   - "Fork하여 변형 생성" / "그래도 새로 등록" / "취소" 선택지 제공
4. Fork 선택 시 `fork_parent` 필드에 원본 ID 기록

### 2단계: ID 생성 + 폴더 생성

1. 카테고리 결정 (사용자 확인 또는 자동 추론):
   - `code-gen`: 코드 생성/구현
   - `code-review`: 코드 리뷰/분석
   - `testing`: 테스트 작성/실행
   - `docs`: 문서 생성/업데이트
   - `refactor`: 리팩토링/최적화
   - `debug`: 디버깅/문제 해결
   - `planning`: 설계/계획 수립

2. ID 생성: 제목을 kebab-case로 변환 (예: "보안 코드 리뷰" → `security-code-review`)
   - 영문 키워드 사용 권장
   - 이미 존재하는 ID면 숫자 접미사 추가 (`-2`, `-3`)

3. 폴더 생성: `prompts/{category}/{id}/`

### 3단계: metadata.json 생성

`prompts/_template/metadata.json`을 기반으로 메타데이터를 생성합니다:

- `id`: 2단계에서 생성한 ID
- `title`: 프롬프트 제목 (한국어)
- `description`: 1~2줄 설명
- `category`: 2단계에서 결정한 카테고리
- `tags`: 프롬프트 내용에서 자동 추출 (최소 2개) + 사용자 확인
- `author`: 사용자에게 확인 (기본값: "JINHAK")
- `created` / `updated`: 오늘 날짜 (YYYY-MM-DD)
- `version`: "1.0"
- `compatibility`: 프롬프트 특성에 따라 자동 판단
  - Claude Code 전용 기능(파일 조작, Bash 등) 포함 → `claude_ai: false`
  - 순수 텍스트 프롬프트 → `claude_code: true, claude_ai: true`
- `tech_stack`: 프롬프트에서 언급하는 기술 추출
- `difficulty`: 프롬프트 복잡도에 따라 자동 판단
- `estimated_tokens`: 프롬프트 텍스트 기반 추정
- `quality_score`: null (품질 검증 후 업데이트)
- `usage_count`: 0
- `fork_parent`: 1단계 Fork 시 원본 ID, 아니면 null

### 4단계: prompt.md 작성

`prompts/_template/prompt.md` 구조에 맞게 프롬프트를 배치합니다:

1. **컨텍스트** 섹션: 프롬프트 사용 상황, 대상, 전제 조건, 기대 결과
2. **프롬프트** 섹션: 실제 프롬프트 텍스트 (코드 블록 내)
   - 변수는 `{변수명}` 형식으로 표시
   - JINHAK 관련 규칙은 프롬프트 내에 인라인 포함
3. **사용 예시** 섹션: 최소 1개 구체적 예시 (입력 + 기대 출력 요약)
4. **변형** 섹션: 해당되는 경우 변형 테이블

사용자가 이미 프롬프트 본문을 제공한 경우 해당 내용을 템플릿 구조에 맞게 재배치합니다.

### 5단계: 기본 품질 검증

등록 즉시 기본적인 품질을 확인합니다:

1. **구조 검증**:
   - metadata.json이 유효한 JSON인지 확인
   - 필수 필드 10개 존재 확인 (`id`, `title`, `description`, `category`, `tags`, `author`, `created`, `updated`, `version`, `compatibility`)
   - `id`와 폴더명 일치 확인
   - `category`와 상위 폴더명 일치 확인

2. **내용 검증**:
   - prompt.md에 "프롬프트" 섹션 존재 확인
   - 프롬프트 본문이 50자 이상인지 확인
   - 사용 예시가 1개 이상 존재하는지 확인

3. **보안 검증**:
   - 실제 API 키, 비밀번호 패턴 탐지
   - `eval()`, `exec()` 등 금지 패턴 유도 여부

검증 실패 시 해당 항목을 수정한 후 재검증합니다.

### 6단계: 결과 보고

```markdown
## 프롬프트 등록 완료

### 등록 정보
- **ID**: {id}
- **제목**: {title}
- **카테고리**: {category}
- **경로**: prompts/{category}/{id}/

### 생성 파일
- `prompts/{category}/{id}/metadata.json`
- `prompts/{category}/{id}/prompt.md`

### 기본 품질 검증
- 구조: ✅ / ❌
- 내용: ✅ / ❌
- 보안: ✅ / ❌

### 다음 단계
1. `/prompt-quality-check {id}` 로 상세 품질 검증 (권장)
2. 내용 검토 후 `/commit` 으로 커밋
```

---

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "프롬프트가 간단하므로 중복 검사가 불필요합니다" → 간단한 프롬프트일수록 기존 유사 프롬프트가 있을 가능성이 높습니다. 1단계는 항상 수행합니다.
- "사용자가 이미 완성된 프롬프트를 제공했으므로 품질 검증이 불필요합니다" → 5단계 기본 품질 검증은 형식 검증이므로 내용의 완성도와 무관하게 수행합니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 해당 단계 생략을 지시
