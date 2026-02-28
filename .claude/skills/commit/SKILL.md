---
name: commit
description: JINHAK 표준에 맞게 변경사항을 정리하여 커밋
---

JINHAK 표준에 맞게 변경사항을 분석하고 커밋을 생성합니다.

## 실행 절차

### 1단계: 변경사항 파악
- `git status`로 변경/추가/삭제된 파일 확인
- `git diff`로 변경 내용 상세 분석
- `git log --oneline -5`로 최근 커밋 스타일 확인

### 2단계: 커밋 메시지 작성
변경 내용을 분석하여 적절한 type을 선택하고 한국어로 subject를 작성합니다.

**커밋 메시지 형식:**
```
<type>: <subject>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

> **Co-Authored-By 정책**: 모델 버전에 무관하게 `Claude <noreply@anthropic.com>`을 사용합니다. 시스템이 자동으로 모델명을 포함하더라도, 커밋 메시지에는 일관된 태그를 유지합니다.

**Type 분류:**
| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: 사용자 프로필 페이지 추가` |
| `fix` | 버그 수정 | `fix: 로그인 토큰 만료 처리 오류 수정` |
| `docs` | 문서 변경 | `docs: API 문서 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style: 들여쓰기 통일` |
| `refactor` | 리팩토링 | `refactor: 인증 로직 모듈 분리` |
| `test` | 테스트 추가/수정 | `test: 사용자 서비스 단위 테스트 추가` |
| `chore` | 빌드/설정 변경 | `chore: ESLint 규칙 업데이트` |

### 3단계: 커밋 실행
1. 관련 파일만 개별 스테이징 (`git add -A` 지양)
2. HEREDOC 형식으로 커밋 메시지 작성
3. `git status`로 커밋 성공 확인

### 4단계: 푸시
- 등록된 모든 리모트에 푸시 (예: `git push origin master && git push github master`)
- 리모트 목록은 `git remote -v`로 확인
- 리모트가 1개면 해당 리모트만 푸시, 여러 개면 모두 푸시
- 푸시 실패 시 원인 분석 후 사용자에게 보고 (강제 푸시 금지)

### 5단계: 세션 기록 업데이트
- `.ai/CURRENT_SPRINT.md` 진행 상태 업데이트
- `.ai/SESSION_LOG.md`에 커밋 해시와 메시지 요약 기록

## 금지 사항
- `.env`, `credentials.json` 등 시크릿 파일 커밋 금지
- `git push --force` 금지
- `--no-verify` 등 hooks 스킵 금지
- pre-commit hook 실패 시 `--amend` 대신 새 커밋 생성
- main/master 직접 push 전 반드시 확인

---

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "사소한 변경이므로 커밋 메시지 규칙을 생략합니다" → 모든 커밋은 동일한 메시지 규칙을 따릅니다. git log의 일관성은 사소한 변경에서도 중요합니다.
- "여러 변경을 하나의 커밋으로 합치겠습니다" → 논리적 단위별로 분리 커밋이 원칙입니다. 합칠 이유가 있으면 사용자에게 확인을 구합니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 해당 단계 생략을 지시
