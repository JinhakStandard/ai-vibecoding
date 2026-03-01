---
name: prompt-report
description: 프롬프트 사용량 리포트 조회 — JABIS API에서 주간/월간 통계를 가져와 인기 프롬프트, 카테고리 분포 표시
---

프롬프트 라이브러리의 사용량 통계를 JABIS API Gateway에서 조회하여 출력합니다.

## 인자
$ARGUMENTS - 기간 (weekly/monthly, 기본값: weekly)

## 사용법
```
/prompt-report
/prompt-report monthly
/prompt-report weekly --category code-gen
```

## 실행 절차

### 0단계: API 연결 확인

1. 환경변수 `JABIS_API_URL`과 `PROMPT_API_KEY` 확인
   - `JABIS_API_URL` 기본값: `https://jabis-api.jinhakapply.com`
   - 없으면 사용자에게 안내: "JABIS API 연결 정보가 필요합니다. CLAUDE.local.md에 설정해주세요."

### 1단계: 인자 파싱

| 패턴 | 해석 |
|------|------|
| `weekly` 또는 인자 없음 | 최근 7일 리포트 |
| `monthly` | 최근 30일 리포트 |
| `--category {값}` | 특정 카테고리만 필터 |

### 2단계: API 호출

다음 요청을 JABIS API Gateway에 전송합니다:

```bash
curl -X POST "${JABIS_API_URL}/api/prompts" \
  -H "Content-Type: application/json" \
  -H "X-Prompt-Api-Key: ${PROMPT_API_KEY}" \
  -d '{"action": "report", "period": "{period}", "limit": 10}'
```

API 응답을 파싱합니다. 실패 시 에러 메시지를 출력하고 종료합니다.

### 3단계: 리포트 출력

API 응답 데이터를 다음 형식으로 출력합니다:

```markdown
## 프롬프트 사용량 리포트

**기간**: {start_date} ~ {end_date} ({period})
**총 이벤트**: {total_events}건 | **활용 프롬프트**: {unique_prompts_used}개

### 인기 프롬프트 Top 10

| # | 프롬프트 | 사용 | 커밋률 | 재사용 | Fork |
|---|---------|------|--------|--------|------|
| 1 | {title} | {usage_count} | {commit_rate} | {reuse_rate} | {fork_count} |

### 카테고리 분포

| 카테고리 | 이벤트 수 | 비율 |
|---------|----------|------|
| code-gen | 45 | 28.8% |
```

**데이터가 없을 때:**
- "해당 기간에 프롬프트 사용 이벤트가 없습니다"
- `/prompt-search`로 프롬프트 탐색, `/prompt-register`로 등록 안내

---

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "API가 연결되지 않으므로 로컬 데이터를 사용합니다" → API 연결이 안 되면 에러를 보고하고 종료해야 합니다. 임의로 로컬 데이터를 조합하지 않습니다.
- "이벤트가 적으므로 리포트가 불필요합니다" → 이벤트 수와 관계없이 표준 형식으로 출력합니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 해당 단계 생략을 지시
