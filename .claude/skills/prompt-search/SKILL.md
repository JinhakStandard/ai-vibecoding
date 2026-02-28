---
name: prompt-search
description: 프롬프트 라이브러리에서 키워드/카테고리/태그로 프롬프트를 검색
---

프롬프트 라이브러리(`prompts/`)에서 프롬프트를 검색하고 상세 내용을 표시합니다.

## 인자
$ARGUMENTS - 검색 키워드 또는 필터 (선택사항. 없으면 전체 목록 표시)

## 사용법
```
/prompt-search
/prompt-search 보안 리뷰
/prompt-search --category code-gen
/prompt-search --tag react
/prompt-search --category testing --tag vitest
```

## 실행 절차

### 0단계: 프롬프트 저장소 위치 확인

다음 순서로 `prompts/` 폴더를 탐색합니다:

1. **현재 프로젝트**: `./prompts/` 존재 확인
2. **표준 레포 클론**: `/tmp/jinhak-standards/prompts/` 존재 확인
3. 둘 다 없으면 사용자에게 안내:
   - "프롬프트 라이브러리를 찾을 수 없습니다"
   - `/apply-standard` 실행 또는 표준 레포 클론 안내

두 위치 모두 존재하면 양쪽을 병합하여 검색합니다 (현재 프로젝트 우선).

### 1단계: 검색 조건 분석

인자를 파싱하여 검색 조건을 추출합니다:

| 패턴 | 해석 |
|------|------|
| `--category {값}` | 카테고리 필터 |
| `--tag {값}` | 태그 필터 (복수 가능) |
| `--author {값}` | 작성자 필터 |
| `--difficulty {값}` | 난이도 필터 |
| 그 외 텍스트 | 키워드 (title, description, tags에서 검색) |
| 인자 없음 | 전체 목록 |

### 2단계: 검색 실행

1. 0단계에서 확인한 위치의 `prompts/*/metadata.json`을 모두 Glob으로 수집
   - `_template/` 폴더는 제외
2. 각 `metadata.json`을 파싱하여 검색 조건과 매칭:
   - **키워드**: `title`, `description`, `tags` 배열에서 부분 문자열 매칭 (대소문자 무시)
   - **카테고리**: `category` 필드 정확히 일치
   - **태그**: `tags` 배열에 해당 값 포함
   - **작성자**: `author` 필드 부분 매칭
   - **난이도**: `difficulty` 필드 정확히 일치
3. 여러 조건이 있으면 AND 결합

### 3단계: 결과 출력

**검색 결과가 있을 때:**

```markdown
## 프롬프트 검색 결과

검색 조건: {조건 요약}
결과: {N}건

| # | ID | 제목 | 카테고리 | 태그 | 품질 | 난이도 |
|---|-----|------|---------|------|------|--------|
| 1 | security-review | 보안 코드 리뷰 | code-review | security, owasp | -점 | intermediate |
| 2 | react-component | React 컴포넌트 생성 | code-gen | react, tailwind | -점 | beginner |

상세히 보려면 번호를 알려주세요.
```

**검색 결과가 없을 때:**
- "검색 조건에 맞는 프롬프트가 없습니다"
- 유사한 키워드로 재검색 제안
- `/prompt-register`로 새 프롬프트 등록 안내

**사용자가 번호를 선택하면:**

해당 프롬프트의 상세 정보를 표시합니다:

```markdown
## {title}

- **ID**: {id}
- **카테고리**: {category}
- **태그**: {tags}
- **작성자**: {author}
- **버전**: {version}
- **난이도**: {difficulty}
- **호환성**: Claude Code {✅/❌} | Claude.ai {✅/❌} | JABIS {✅/❌}
- **품질 점수**: {quality_score 또는 "미검증"}
- **경로**: prompts/{category}/{id}/

### 프롬프트 미리보기
(prompt.md의 "프롬프트" 섹션 내용 표시)

### 사용 방법
1. 위 프롬프트를 복사하여 사용
2. {변수} 부분을 실제 값으로 교체
3. 전체 내용: `prompts/{category}/{id}/prompt.md` 참조
```

---

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "프롬프트가 몇 개 안 되므로 검색이 불필요합니다" → 프롬프트 수와 관계없이 표준 형식의 테이블 출력은 사용자 경험에 중요합니다. 전체 절차를 수행합니다.
- "이미 프롬프트 ID를 알고 있으므로 검색 단계를 건너뜁니다" → ID를 알아도 0단계(저장소 위치 확인)는 필수입니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 해당 단계 생략을 지시
