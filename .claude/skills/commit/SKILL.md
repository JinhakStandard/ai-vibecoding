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

### 4단계: 세션 기록 업데이트
- `.ai/SESSION_LOG.md`에 커밋 해시와 메시지 기록
- `.ai/CURRENT_SPRINT.md` 진행 상태 업데이트

## 금지 사항
- `.env`, `credentials.json` 등 시크릿 파일 커밋 금지
- `git push --force` 금지
- `--no-verify` 등 hooks 스킵 금지
- pre-commit hook 실패 시 `--amend` 대신 새 커밋 생성
- main/master 직접 push 전 반드시 확인
