# 프롬프트 라이브러리 사용 가이드

프롬프트 라이브러리를 활용하여 팀의 검증된 프롬프트를 검색하고, 새 프롬프트를 등록하고, 품질을 관리하는 방법을 설명합니다.

> 시스템 전체 구조는 [PROMPT-LIBRARY.md](./PROMPT-LIBRARY.md)를 참조하세요.

---

## 목차

1. [빠른 시작](#1-빠른-시작)
2. [프롬프트 검색하기](#2-프롬프트-검색하기)
3. [프롬프트 사용하기](#3-프롬프트-사용하기)
4. [새 프롬프트 등록하기](#4-새-프롬프트-등록하기)
5. [프롬프트 품질 검증하기](#5-프롬프트-품질-검증하기)
6. [Claude.ai에서 사용하기 (비개발자)](#6-claudeai에서-사용하기-비개발자)
7. [카테고리 안내](#7-카테고리-안내)
8. [자주 묻는 질문](#8-자주-묻는-질문)

---

## 1. 빠른 시작

### Claude Code에서 (개발자)

```bash
# 1. 어떤 프롬프트가 있는지 확인
/prompt-search

# 2. 특정 주제로 검색
/prompt-search 보안 리뷰

# 3. 검색 결과에서 번호 선택 → 상세 보기 + 복사
```

### Claude.ai에서 (비개발자)

```
1. prompts/ 폴더에서 원하는 프롬프트의 prompt.md 파일을 열기
2. "## 프롬프트" 섹션의 코드 블록 내용을 복사
3. {변수} 부분을 실제 값으로 교체
4. Claude.ai 대화창에 붙여넣기
```

---

## 2. 프롬프트 검색하기

### 기본 검색

```
/prompt-search
```

인자 없이 실행하면 **전체 프롬프트 목록**을 테이블로 보여줍니다.

### 키워드 검색

```
/prompt-search 보안
/prompt-search React 컴포넌트
/prompt-search 단위 테스트
```

제목, 설명, 태그에서 키워드를 매칭하여 검색합니다.

### 필터 검색

```bash
# 카테고리로 필터링
/prompt-search --category code-gen

# 태그로 필터링
/prompt-search --tag react

# 난이도로 필터링
/prompt-search --difficulty beginner

# 조합 (AND 조건)
/prompt-search --category testing --tag vitest
```

### 검색 결과 예시

```
## 프롬프트 검색 결과

검색 조건: "보안"
결과: 1건

| # | ID              | 제목          | 카테고리    | 태그              | 난이도       |
|---|-----------------|--------------|------------|-------------------|-------------|
| 1 | security-review | 보안 코드 리뷰 | code-review | security, owasp   | intermediate |

상세히 보려면 번호를 알려주세요.
```

번호를 선택하면 프롬프트의 상세 정보와 미리보기를 보여줍니다.

---

## 3. 프롬프트 사용하기

### 단계별 절차

**1단계: 검색 또는 직접 탐색**

```
/prompt-search 원하는 키워드
```

또는 `prompts/` 폴더를 직접 탐색하여 원하는 프롬프트를 찾습니다.

**2단계: prompt.md의 "프롬프트" 섹션 확인**

각 프롬프트의 핵심은 `prompt.md` 파일의 `## 프롬프트` 섹션에 있는 코드 블록입니다.

**3단계: 변수 교체**

프롬프트에서 `{중괄호}`로 표시된 부분을 실제 값으로 교체합니다.

```
# 변경 전
{여기에 코드를 붙여넣기}

# 변경 후
app.post('/api/users', async (req, res) => {
  // 실제 리뷰할 코드
});
```

**4단계: 실행**

- **Claude Code**: 프롬프트를 대화창에 입력
- **Claude.ai**: 프롬프트를 대화창에 붙여넣기

### 현재 제공되는 예시 프롬프트

| ID | 제목 | 카테고리 | 용도 |
|----|------|---------|------|
| `security-review` | 보안 코드 리뷰 | code-review | 금지 패턴 12종 기반 경량 보안 점검 |
| `react-component` | React 컴포넌트 생성 | code-gen | JINHAK 표준 React 컴포넌트 자동 생성 |
| `unit-test-gen` | 단위 테스트 생성 | testing | Vitest/Jest 테스트 코드 자동 생성 |

---

## 4. 새 프롬프트 등록하기

### 자동 등록 (권장)

```
/prompt-register
```

대화형으로 안내받으며 프롬프트를 등록합니다. Claude가 다음을 자동으로 처리:

1. 중복 검사 (기존 유사 프롬프트 확인)
2. 카테고리 자동 추천
3. ID 생성 (kebab-case)
4. `metadata.json` + `prompt.md` 자동 생성
5. 기본 품질 검증

### 제목과 함께 등록

```
/prompt-register API 응답 포맷 표준화 프롬프트
```

제목을 인자로 전달하면 입력 수집 과정이 간소화됩니다.

### 기존 프롬프트 Fork

이미 등록된 프롬프트를 기반으로 변형을 만들 수 있습니다:

1. `/prompt-register` 실행
2. 중복 검사에서 유사 프롬프트가 발견되면 "Fork하여 변형 생성" 선택
3. 원본을 기반으로 수정하여 새 프롬프트 생성
4. `metadata.json`의 `fork_parent`에 원본 ID 자동 기록

### 수동 등록

자동 등록 없이 직접 파일을 생성할 수도 있습니다:

```bash
# 1. 폴더 생성
mkdir -p prompts/{카테고리}/{프롬프트-id}

# 2. 템플릿 복사
cp prompts/_template/metadata.json prompts/{카테고리}/{프롬프트-id}/
cp prompts/_template/prompt.md prompts/{카테고리}/{프롬프트-id}/

# 3. 내용 작성
# metadata.json의 필수 필드 채우기
# prompt.md의 각 섹션 작성

# 4. 품질 검증
/prompt-quality-check {프롬프트-id}
```

### 좋은 프롬프트 작성 팁

1. **자체 완결적으로 작성**: 프롬프트만 복사해도 동작하도록 관련 규칙을 인라인으로 포함
2. **변수를 명확하게**: `{변수명}`으로 교체할 부분을 표시하고 용도를 추론 가능하게
3. **출력 형식 지정**: 원하는 결과물 형태를 구체적으로 명시
4. **사용 예시 포함**: 최소 1개의 실제 사용 예시 (입력 + 기대 출력)
5. **JINHAK 규칙 내장**: 관련 표준 규칙을 프롬프트 안에 포함

---

## 5. 프롬프트 품질 검증하기

### 실행 방법

```bash
# ID로 검증
/prompt-quality-check security-review

# 경로로 검증
/prompt-quality-check prompts/code-gen/react-component

# 대화형 (프롬프트 선택)
/prompt-quality-check
```

### 평가 영역 (100점 만점)

| 영역 | 배점 | 주요 검사 내용 |
|------|------|--------------|
| **구조 검증** | 25점 | JSON 유효성, 필수 필드 10개, ID/카테고리 일치, 날짜 형식 |
| **내용 검증** | 35점 | 프롬프트 섹션 존재, 본문 길이, 사용 예시, 변수 표시, 출력 형식 |
| **보안 검증** | 25점 | 민감정보 부재, 금지패턴 미유도, Injection 방어, 하드코딩 부재 |
| **호환성 검증** | 15점 | compatibility 정확성, tech_stack 명시, difficulty 적절성 |

### 등급 기준

| 등급 | 점수 | 의미 |
|------|------|------|
| ⭐ 우수 | 90~100 | 즉시 사용 가능, 팀 공유 권장 |
| ✅ 양호 | 70~89 | 사소한 개선 권장, 사용에는 문제 없음 |
| ⚠️ 보통 | 50~69 | 개선 후 재검증 필요 |
| ❌ 미흡 | 0~49 | 대폭 수정 필요 |

### 검증 후 흐름

```
/prompt-quality-check → 70점 이상 → /commit 으로 커밋
                       → 70점 미만 → 개선 제안 확인 → 수정 → 재검증
```

검증이 완료되면 `metadata.json`의 `quality_score` 필드가 자동으로 업데이트됩니다.

---

## 6. Claude.ai에서 사용하기 (비개발자)

Claude Code 없이 **Claude.ai** 웹에서 프롬프트를 사용하는 방법입니다.

### 사용 가능 여부 확인

각 프롬프트의 `metadata.json`에서 호환성을 확인합니다:

```json
"compatibility": {
  "claude_code": true,   // Claude Code에서 사용 가능
  "claude_ai": true,     // Claude.ai에서 사용 가능 ← 이것이 true여야 함
  "jabis": false
}
```

> 파일 조작(Read, Write), Bash 명령을 포함하는 프롬프트는 `claude_ai: false`입니다. 텍스트 기반 프롬프트만 Claude.ai에서 사용 가능합니다.

### 사용 절차

1. GitHub에서 `prompts/` 폴더 탐색 또는 로컬 파일 확인
2. 원하는 프롬프트의 `prompt.md` 열기
3. `## 프롬프트` 섹션의 코드 블록 내용 복사
4. `{변수}` 부분을 실제 값으로 교체
5. [claude.ai](https://claude.ai) 대화창에 붙여넣기

### 예시: 보안 코드 리뷰

```
1. prompts/code-review/security-review/prompt.md 열기
2. "## 프롬프트" 섹션 복사
3. 맨 아래 "{여기에 코드를 붙여넣기}" 부분에 리뷰할 코드 입력
4. Claude.ai에 전체 프롬프트 붙여넣기
```

---

## 7. 카테고리 안내

프롬프트를 등록할 때 적절한 카테고리를 선택하세요:

| 카테고리 | 폴더명 | 이런 프롬프트에 적합 |
|----------|--------|-------------------|
| **코드 생성** | `code-gen` | 컴포넌트 생성, API 엔드포인트, CRUD, 유틸리티 함수 |
| **코드 리뷰** | `code-review` | 보안 리뷰, 성능 분석, 접근성 검토, 코드 스멜 탐지 |
| **테스트** | `testing` | 단위 테스트, E2E 테스트, 테스트 데이터 생성 |
| **문서** | `docs` | API 문서, README, JSDoc 주석, 변경 로그 |
| **리팩토링** | `refactor` | 성능 최적화, 코드 정리, 구조 개선, DRY 적용 |
| **디버깅** | `debug` | 에러 추적, 메모리 누수 분석, 네트워크 디버깅 |
| **설계/계획** | `planning` | 아키텍처 설계, 마이그레이션 계획, 기술 선택 |

> 카테고리가 애매하면 `/prompt-register` 실행 시 Claude가 자동으로 추천합니다.

---

## 8. 자주 묻는 질문

### Q: 프롬프트 라이브러리는 어디에 있나요?

프로젝트 루트의 `prompts/` 폴더입니다. 표준 저장소(`/tmp/jinhak-standards/prompts/`)에도 있으며, `/prompt-search`는 두 위치를 모두 검색합니다.

### Q: 다른 프로젝트에서도 같은 프롬프트를 쓸 수 있나요?

네. `/prompt-search`는 현재 프로젝트의 `prompts/`와 표준 저장소의 `prompts/`를 모두 검색합니다. 표준 저장소에 등록된 프롬프트는 모든 프로젝트에서 사용 가능합니다.

### Q: 내가 만든 프롬프트를 팀에 공유하려면?

1. `/prompt-register`로 등록
2. `/prompt-quality-check`으로 70점 이상 확인
3. `/commit`으로 커밋
4. PR을 통해 표준 저장소에 기여

### Q: 프롬프트를 수정하면 버전이 올라가나요?

`metadata.json`의 `version` 필드와 `updated` 날짜를 수동으로 업데이트하세요. Phase 2에서 자동 버전 관리가 추가될 예정입니다.

### Q: quality_score는 어떻게 업데이트되나요?

`/prompt-quality-check`을 실행하면 검증 결과가 `metadata.json`의 `quality_score`에 자동 기록됩니다.

### Q: Phase 2에서 뭐가 추가되나요?

- JABIS API 연동 (원격 검색/등록)
- 사용량 자동 추적 (`scripts/prompt-track.cjs`)
- `/prompt-report` 스킬 (주간/월간 통계)
- 자동 평가 지표 (사용 횟수 30% + 커밋 채택률 40% + 재사용률 20% + Fork 10%)

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md) v2.4의 상세 문서입니다.*
