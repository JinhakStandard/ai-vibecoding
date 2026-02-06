---
name: review-pr
description: PR을 JINHAK 표준 기준으로 리뷰
args: PR번호 또는 URL
---

PR을 JINHAK 표준 기준으로 리뷰합니다.

## 인자
$ARGUMENTS - PR 번호 또는 URL

## 사용법
```
/review-pr 123
/review-pr https://github.com/JinhakStandard/ai-vibecoding/pull/123
```

> **팁**: `claude --from-pr 123`으로 PR 컨텍스트에서 직접 세션을 시작할 수도 있습니다.

## 실행 절차

### 1단계: PR 정보 수집
- `gh pr view $ARGUMENTS` 또는 GitHub API로 PR 내용 확인
- `gh pr diff $ARGUMENTS`로 변경된 파일 목록과 diff 확인

### 2단계: 코드 품질 체크
다음 항목을 순서대로 검토합니다:

**필수 검토 (차단 사유):**
1. **보안 취약점**: XSS, SQL Injection, 커맨드 인젝션 등 OWASP Top 10
2. **비밀키 노출**: 하드코딩된 URL/포트/비밀키, `.env` 파일 포함 여부
3. **타입 안전성**: `any` 타입 사용 여부 (TypeScript)
4. **HTTP 메서드**: GET/POST만 사용하는지 (PUT/PATCH/DELETE 금지)
5. **프로덕션 console.log**: 프로덕션 코드에 console.log 잔존 여부
6. **ISMS 보안**: 개인정보 처리 규칙 준수, 감사 로깅 누락, 암호화 미적용 (SECURITY_ISMS.md 참조)
7. **AI 안티패턴**: `--no-verify`, `push --force` 등 위험 명령 포함 여부, 하드코딩된 민감 정보 존재 여부

**품질 검토 (권장):**
1. **네이밍 컨벤션**: PascalCase(컴포넌트), camelCase(함수/변수), UPPER_SNAKE_CASE(상수)
2. **import 순서**: 외부 → 아이콘 → UI → 컴포넌트 → 스토어 → 유틸
3. **컴포넌트 구조**: hooks → effects → handlers → render 순서
4. **상태 관리**: Zustand 패턴 준수, 적절한 상태 배치
5. **에러 처리**: 시스템 경계에서만 검증, 의미 있는 에러 메시지
6. **파일 위치**: 프로젝트 구조 표준에 맞는 위치
7. **미사용 코드**: 미사용 import/변수, 주석 처리된 코드

**크로스 체크:**
1. 버그 가능성 확인
2. 크로스플랫폼 호환성 (Windows/Linux)
3. 성능 이슈 (불필요한 리렌더링, 메모리 누수 등)
4. Agent Teams 관련: 서브에이전트가 생성한 코드의 일관성 확인

### 3단계: 리뷰 결과 작성

## 출력 형식

```markdown
## PR 리뷰: #번호 - 제목

### 요약
- 전체 평가: [승인 / 수정 요청 / 논의 필요]
- 변경 파일 수: N개
- 위험도: [낮음 / 보통 / 높음]

### 차단 (반드시 수정)
- [ ] `파일:라인` - 문제 설명 및 수정 제안

### 권장 (수정 권장)
- [ ] `파일:라인` - 개선 제안

### 참고
- 잘된 부분, 참고 사항
```
