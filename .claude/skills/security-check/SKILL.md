---
name: security-check
description: 현재 변경사항에 대한 보안 점검 수행
---

현재 프로젝트의 변경사항에 대해 JINHAK AI 보안 가이드레일 기준으로 종합 보안 점검을 수행합니다.

## 실행 절차

### 1단계: 변경 파일 파악

`git diff --cached --name-only`로 스테이징된 파일을 먼저 확인합니다.
스테이징된 파일이 없으면 `git diff --name-only`로 미스테이징 변경 파일을 확인합니다.
둘 다 없으면 `git diff HEAD~1 --name-only`로 최근 커밋 변경 파일을 대상으로 합니다.

### 2단계: 7가지 보안 항목 검사

각 변경 파일의 내용을 읽고 아래 7가지 항목을 검사합니다.

#### [1] 시크릿 스캔
변경된 파일에서 다음 패턴을 탐지합니다:
- API 키 패턴: `(api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]`
- 토큰 패턴: `(token|bearer|auth)\s*[:=]\s*['"][A-Za-z0-9._-]{20,}['"]`
- 비밀번호 패턴: `(password|passwd|pwd|secret)\s*[:=]\s*['"][^'"]{4,}['"]`
- AWS 키: `AKIA[0-9A-Z]{16}`
- 개인정보: 주민등록번호(`\d{6}-[1-4]\d{6}`), 전화번호(`01[016789]-\d{3,4}-\d{4}`)
- 하드코딩된 IP/도메인: `http://\d+\.\d+\.\d+\.\d+`

#### [2] 금지 패턴 탐지
`security/FORBIDDEN_PATTERNS.md`의 12개 금지 코드 패턴을 기반으로 검사합니다:
1. `eval()`, `Function()`, `new Function()` - 동적 코드 실행
2. `child_process.exec()` + 사용자 입력 - 커맨드 인젝션
3. `fs.readFile/writeFile` + 미검증 경로 - Path Traversal
4. `crypto.createHash('md5')` 또는 `'sha1'` - 취약한 해시
5. `http://` (비암호화 통신) - 프로덕션 평문 전송
6. `cors({ origin: '*' })` - 무제한 CORS
7. `console.log(password|token|secret)` - 민감정보 로깅
8. SQL 문자열 연결: `"SELECT...${" + var` - SQL Injection
9. `res.send(error.stack)` - 스택 트레이스 노출
10. `jwt.verify()` without algorithm - 알고리즘 혼동 공격
11. `Math.random()` 보안 목적 사용 - 예측 가능한 난수
12. 하드코딩된 IP/포트/도메인 - 환경 분리 위반

#### [3] 입력 검증
사용자 입력을 처리하는 새 코드(req.body, req.query, req.params, FormData, URLSearchParams 등)에서:
- Zod, Joi, class-validator 등의 검증 라이브러리 사용 여부 확인
- parseInt, Number() 사용 시 범위 검증 동반 여부 확인
- 파일 업로드 시 확장자 화이트리스트 + MIME 타입 검증 존재 여부 확인

#### [4] SQL 안전성
새로운 DB 쿼리 코드에서:
- Prisma, Drizzle, TypeORM 등 ORM 사용 여부 확인
- Raw 쿼리 사용 시 파라미터화 여부 확인 (`$queryRaw`, `$executeRaw` 등)
- 문자열 연결(concatenation)로 쿼리를 생성하는 코드 탐지

#### [5] 의존성 검사
package.json 변경이 있는 경우:
- `npm audit --audit-level=high --json` 실행하여 고위험 취약점 확인
- 새로 추가된 패키지의 주간 다운로드 수, 최근 업데이트 여부 확인
- 알려진 typosquatting 패키지명 주의

#### [6] CORS/헤더 검사
보안 관련 설정 파일이나 미들웨어 코드에서:
- CORS origin이 와일드카드(`*`)로 설정되어 있지 않은지 확인
- 보안 헤더(helmet 등) 적용 여부 확인
- Content-Security-Policy, X-Frame-Options 등 설정 적절성 확인

#### [7] 에러 처리 검사
에러 핸들링 코드에서:
- `error.stack`, `error.message` 를 응답 본문에 직접 포함하는 코드 탐지
- 프로덕션 환경에서 상세 에러 정보 노출 여부 확인
- DB 구조, 서버 경로 등 내부 시스템 정보 유출 패턴 탐지

### 3단계: 결과 출력

아래 형식으로 결과를 출력합니다:

```markdown
## 보안 점검 결과

**대상**: 변경된 N개 파일
**기준**: JINHAK AI 보안 가이드레일 v2.0

### 검사 항목

✅ PASS: [시크릿 스캔] - 민감 정보 패턴이 발견되지 않았습니다
⚠️ WARN: [금지 패턴] - console.log에 token 변수 참조 발견 → 프로덕션 배포 전 제거 필요
❌ FAIL: [SQL 안전성] - 문자열 연결로 생성된 쿼리 발견 → 파라미터화 쿼리로 반드시 수정

(각 항목별 상세 내역)

### 종합 점수

Security Score: {점수}/100
- Critical: N건
- Warning: N건
- Pass: N건
```

#### 점수 계산 기준
- 기본 점수: 100점
- FAIL(Critical) 항목당: -20점
- WARN 항목당: -5점
- 최소 점수: 0점

#### 권장 기준
- 90~100점: 안전 - 커밋/배포 가능
- 70~89점: 주의 - 경고 사항 검토 후 진행
- 50~69점: 위험 - 수정 후 재검사 권장
- 0~49점: 차단 - 반드시 수정 필요

## 후속 조치 안내

검사 완료 후 필요 시 다음 조치를 안내합니다:
- FAIL 항목에 대한 구체적 수정 방법 제시
- 관련 security/ 문서 참조 링크 안내
- 시니어 리뷰가 필요한 영역(인증/결제/개인정보) 식별

---

## 합리화 방지

이 스킬의 단계를 건너뛰려는 다음 이유들은 유효하지 않습니다:

- "보안 관련 변경이 아니므로 검사가 불필요합니다" → 보안 영향은 코드 변경의 의도가 아닌 실제 영향으로 판단합니다. 금지 패턴 12개 대조는 항상 수행합니다.
- "이미 /deep-plan에서 C6 보안 검증을 통과했으므로 중복 검사입니다" → /deep-plan은 계획 단계 검증이고, /security-check는 구현된 코드 검증입니다. 관점이 다릅니다.

단계를 건너뛸 유일한 방법: 사용자가 명시적으로 "보안 검사 건너뛰어" 지시
