# 🛡️ AI 보안 가이드레일 설계 및 ai-vibecoding Repo 업데이트 계획서

> **작성일**: 2025-02-19  
> **대상 Repo**: `JinhakStandard/ai-vibecoding`  
> **현행 버전 기반**: master branch (3 commits)

---

## 1. 현황 분석

### 1.1 현재 Repo 구조

```
ai-vibecoding/
├── .claude/                    # Claude Code 설정
├── templates/                  # 프로젝트 템플릿
├── ARCHITECTURE.md             # 아키텍처 가이드
├── CHANGELOG.md                # 변경 이력
├── CLAUDE.md                   # AI 설정 파일
├── CODING_CONVENTIONS.md       # 코딩 컨벤션
├── PROJECT_STRUCTURE.md        # 프로젝트 구조 가이드
├── README.md                   # 사용 가이드
├── SECURITY_ISMS.md            # 보안/ISMS 가이드 (기존)
└── VIBE_CODING_GUIDE.md        # Vibe Coding 가이드
```

### 1.2 Gap 분석

| 영역 | 현재 상태 | 필요한 보강 |
|------|-----------|-------------|
| ISMS 보안 | `SECURITY_ISMS.md` 존재 | AI 특화 보안 규칙 대폭 확장 필요 |
| AI 코드 생성 보안 | 미비 | OWASP LLM Top 10 기반 가드레일 필요 |
| 입력 검증 | 미비 | Prompt Injection 방어, Input Sanitization 필요 |
| 출력 검증 | 미비 | AI 생성 코드 자동 보안 스캔 파이프라인 필요 |
| 시크릿 보호 | 부분적 | AI 컨텍스트 내 시크릿 유출 방지 체계 필요 |
| 의존성 관리 | 미비 | AI 추천 패키지 보안 검증 프로세스 필요 |
| 감사 추적 | 미비 | AI 생성 코드 추적·식별 체계 필요 |
| Claude Code Hooks | `.claude/` 존재 | 보안 Hook 강화 필요 |
| ISMS-P 연계 | 부분적 | 대학 입시 개인정보 특화 AI 보안 규칙 필요 |

---

## 2. AI 보안 가이드레일 설계 (7개 레이어)

OWASP Top 10 for LLM Applications 2025와 OpenSSF AI Code Security 가이드를 기반으로, 진학어플라이 환경에 맞춘 **7-Layer Defense** 아키텍처를 제안합니다.

### 2.1 Layer 1: 입력 보안 (Input Security)

**목적**: AI에게 전달되는 모든 입력에서 악의적/위험한 내용 차단

#### 2.1.1 Prompt Injection 방어
- **직접 주입 방어**: 사용자 입력에서 시스템 프롬프트 탈취·우회 시도 탐지
- **간접 주입 방어**: 외부 데이터(DB, 파일, 웹)를 통한 간접 프롬프트 주입 탐지
- **금지 패턴 목록**: `ignore previous instructions`, `system prompt`, `you are now` 등의 패턴 필터링 규칙

#### 2.1.2 컨텍스트 보안
- **민감 파일 제외 목록**: `.env`, `*secret*`, `*credential*`, `*password*`, 인증서 파일, SSH 키 등
- **개인정보 마스킹**: 수험번호, 주민등록번호, 연락처, 이메일 등 자동 마스킹 후 AI 전달
- **컨텍스트 크기 제한**: 한 번에 전달되는 코드/데이터 범위 제한으로 과도한 정보 노출 방지

#### 2.1.3 CLAUDE.md 입력 보안 규칙
```markdown
## 🚫 절대 금지 (NEVER)
- .env, .env.*, secrets.*, credentials.* 파일을 읽거나 내용을 출력하지 마세요
- 개인정보(주민등록번호, 수험번호, 연락처)를 코드에 하드코딩하지 마세요
- 프로덕션 DB 접속 정보를 코드 어디에도 포함하지 마세요
- API 키, 토큰, 비밀번호를 소스 코드에 직접 넣지 마세요
```

### 2.2 Layer 2: 코드 생성 보안 (Code Generation Security)

**목적**: AI가 생성하는 코드 자체의 보안 품질 보장

#### 2.2.1 보안 코딩 표준 (CLAUDE.md에 주입)
```markdown
## 🔒 보안 코딩 필수 규칙

### SQL Injection 방어
- 모든 DB 쿼리는 반드시 Prisma ORM 또는 파라미터화된 쿼리 사용
- 문자열 연결(concatenation)으로 쿼리를 생성하는 것은 절대 금지
- Raw query 사용 시 반드시 $queryRaw`...` 템플릿 리터럴 사용

### XSS 방어
- React의 dangerouslySetInnerHTML 사용 금지 (예외: 승인된 리치 텍스트)
- 사용자 입력값은 반드시 DOMPurify 등으로 sanitize 후 렌더링
- URL 파라미터를 직접 DOM에 삽입 금지

### 인증/인가
- JWT 토큰은 httpOnly + Secure + SameSite=Strict 쿠키로만 전달
- 모든 API 엔드포인트에 인증 미들웨어 적용 필수
- 역할 기반 접근 제어(RBAC) 패턴 준수
- 비밀번호는 bcrypt(saltRounds >= 12) 사용 필수

### 입력 검증
- 모든 API 입력값은 Zod 또는 Joi 스키마로 검증
- 파일 업로드: 확장자 화이트리스트 + MIME 타입 검증 + 크기 제한
- 정수형 ID는 반드시 parseInt + 범위 검증

### 에러 처리
- 프로덕션 환경에서 스택 트레이스 노출 금지
- 에러 메시지에 내부 시스템 정보(DB 구조, 서버 경로) 포함 금지
- 구조화된 에러 로깅 (Winston/Pino) + 사용자에게는 일반적 메시지만 반환
```

#### 2.2.2 OWASP Top 10 Web + LLM 매핑 체크리스트
| OWASP Web | OWASP LLM 2025 | AI 코드 생성 시 적용 규칙 |
|-----------|----------------|--------------------------|
| A01: Broken Access Control | LLM06: Excessive Agency | AI에 최소 권한 원칙 적용, 파일 시스템·네트워크 접근 제한 |
| A02: Cryptographic Failures | LLM02: Sensitive Info Disclosure | 암호화 관련 코드는 반드시 검증된 라이브러리 사용 |
| A03: Injection | LLM01: Prompt Injection | 파라미터화 쿼리 강제, 입력 검증 필수 |
| A04: Insecure Design | LLM05: Improper Output Handling | AI 출력 코드 보안 리뷰 의무화 |
| A05: Security Misconfiguration | LLM07: System Prompt Leakage | 설정 파일 보안, 시스템 프롬프트 보호 |
| A06: Vulnerable Components | LLM03: Supply Chain | AI 추천 패키지 보안 검증 자동화 |
| A07: Auth Failures | LLM02: Sensitive Info Disclosure | 인증 로직은 AI 생성 금지, 검증된 패턴만 사용 |
| A08: Data Integrity Failures | LLM04: Data/Model Poisoning | AI 학습 데이터·컨텍스트 무결성 검증 |
| A09: Logging Failures | LLM10: Unbounded Consumption | AI 작업 로깅 필수, 리소스 사용량 모니터링 |
| A10: SSRF | LLM05: Improper Output Handling | AI 생성 URL/네트워크 호출 코드 검증 |

#### 2.2.3 금지 코드 패턴 (Anti-patterns)
```markdown
## ⛔ AI가 절대 생성하면 안 되는 코드 패턴

1. eval(), Function(), new Function() - 동적 코드 실행
2. child_process.exec() with 사용자 입력 - 커맨드 인젝션
3. fs.readFile/writeFile with 사용자 제공 경로 (검증 없이) - Path Traversal
4. crypto.createHash('md5'/'sha1') - 취약한 해시 알고리즘
5. http:// (비암호화 통신) - 평문 전송
6. cors({ origin: '*' }) in 프로덕션 - 무제한 CORS
7. console.log(password/token/secret) - 민감정보 로깅
8. SELECT * FROM ... WHERE id = '${userId}' - SQL Injection
9. res.send(error.stack) - 스택 트레이스 노출
10. jwt.verify() without algorithm 지정 - 알고리즘 혼동 공격
11. Math.random() for 보안 목적 - 예측 가능한 난수
12. 하드코딩된 IP/포트/도메인 in 소스 코드
```

### 2.3 Layer 3: 의존성 보안 (Dependency Security)

**목적**: AI가 추천/설치하는 패키지의 안전성 보장

#### 2.3.1 패키지 설치 전 검증 규칙
```markdown
## 📦 의존성 보안 규칙

### AI가 새 패키지를 추천할 때 반드시 확인할 사항
1. npm audit / yarn audit 결과 확인
2. 주간 다운로드 수 10,000 이상 (소규모 패키지는 수동 리뷰)
3. 최근 6개월 이내 업데이트 이력 확인
4. GitHub 스타 수 + 오픈 이슈 비율 확인
5. 알려진 CVE 존재 여부 확인
6. 라이선스 호환성 확인 (GPL 계열 주의)

### 금지 패키지 목록 (Blocklist)
- 보안 취약점이 알려졌으나 패치되지 않은 패키지
- 6개월 이상 유지보수 중단된 패키지
- typosquatting 의심 패키지 (예: lodashs, reacct 등)

### 자동 검증 프로세스
- pre-commit hook: package.json 변경 시 자동 audit
- CI/CD: npm audit --audit-level=high 실패 시 빌드 중단
- Snyk 또는 Socket.dev 연동 (선택적)
```

#### 2.3.2 Lock 파일 보호
```markdown
- package-lock.json / yarn.lock 변경은 반드시 PR 리뷰 필수
- AI가 직접 lock 파일을 수정하는 것은 금지
- lock 파일 충돌 발생 시 AI가 아닌 개발자가 직접 해결
```

### 2.4 Layer 4: 출력 검증 (Output Verification)

**목적**: AI가 생성한 코드가 커밋·배포되기 전 보안 검증

#### 2.4.1 Claude Code Hooks (`.claude/settings.json` 보안 Hook)
```json
{
  "hooks": {
    "pre-commit": [
      {
        "name": "secret-scan",
        "command": "npx secretlint '**/*'",
        "description": "시크릿 유출 검사"
      },
      {
        "name": "eslint-security",
        "command": "npx eslint --config .eslintrc.security.js --no-eslintrc '{src,lib}/**/*.{ts,tsx}'",
        "description": "보안 린트 검사"
      },
      {
        "name": "dependency-check",
        "command": "npm audit --audit-level=high --omit=dev",
        "description": "의존성 취약점 검사"
      }
    ],
    "pre-push": [
      {
        "name": "sast-scan",
        "command": "npx semgrep --config auto --error src/",
        "description": "정적 보안 분석 (SAST)"
      }
    ]
  }
}
```

#### 2.4.2 AI 생성 코드 식별 체계
```markdown
## 🏷️ AI 생성 코드 추적

### 커밋 메시지 규칙
- AI 생성 코드 포함 시: `feat(ai-assisted): 기능 설명`
- AI가 전적으로 생성: `feat(ai-generated): 기능 설명`
- 사람이 AI 코드를 수정: `refactor(ai-reviewed): 수정 설명`

### Git Trailer 추가
모든 AI 관련 커밋에 git trailer 추가:
  AI-Tool: claude-code
  AI-Confidence: high|medium|low
  AI-Review: required|completed|skipped
```

#### 2.4.3 보안 리뷰 필수 영역 (Human-in-the-Loop)
```markdown
## 🔍 AI 코드 수동 리뷰 필수 영역

아래 영역의 코드는 AI가 생성하더라도 반드시 시니어 개발자 리뷰 필요:

1. **인증/인가 로직** - 로그인, JWT, 세션, RBAC
2. **결제/정산 처리** - 수수료 계산, PG 연동, 환불 로직
3. **개인정보 처리** - 수험생 정보, 성적 데이터, 연락처 CRUD
4. **암호화/복호화** - 데이터 암/복호화, 키 관리
5. **API Gateway/라우팅** - 접근 제어, Rate Limiting 설정
6. **데이터 마이그레이션** - 스키마 변경, 데이터 이전 스크립트
7. **인프라 설정** - K3S 설정, Docker 설정, 네트워크 정책
8. **환경 변수/설정** - 프로덕션 설정값, 기능 플래그
```

### 2.5 Layer 5: 런타임 보안 (Runtime Security)

**목적**: AI가 포함된 개발·빌드 환경의 실행 시 보안

#### 2.5.1 Claude Code 실행 환경 격리
```markdown
## 🔐 실행 환경 보안

### 파일 시스템 접근 제한
- 읽기 허용: src/, lib/, tests/, docs/, config/ (비민감)
- 읽기 금지: .env*, secrets/, certs/, keys/, backups/
- 쓰기 허용: src/, tests/, docs/
- 쓰기 금지: node_modules/, dist/, .git/, infra/

### 네트워크 접근 제한
- 허용: npm registry, GitHub API, 내부 Git 서버
- 차단: 프로덕션 DB, 내부 API 서버, 관리자 패널
- 모든 외부 API 호출은 프록시 경유 + 로깅

### 커맨드 실행 제한 (.claude/settings.json)
- 허용: npm test, npm run lint, npm run build, git 명령어
- 금지: rm -rf, sudo, curl | sh, wget | bash, docker 명령어
- 주의: DB 마이그레이션 커맨드 (승인 후 실행)
```

#### 2.5.2 NightBuilder (24/7 AI 개발) 보안
```markdown
## 🌙 NightBuilder 보안 가드레일

### 자동화 실행 제한
- 프로덕션 배포 명령 실행 금지
- DB 스키마 변경 자동 실행 금지 (초안만 생성)
- 환경 변수 변경 금지
- 새로운 외부 API 연동 코드 자동 머지 금지

### 모니터링
- 생성 코드량 일일 상한선 설정 (예: 1000 LOC/세션)
- 비정상 패턴 감지 (동일 파일 반복 수정, 대량 삭제 등)
- 세션 타임아웃 설정 (최대 4시간/세션)

### 결과물 처리
- 모든 결과물은 별도 브랜치(ai/nightbuilder/*)에 생성
- 자동 PR 생성 + 보안 스캔 통과 후에만 리뷰 가능
- 2인 이상 리뷰 승인 필수
```

### 2.6 Layer 6: 데이터 보안 (Data Security)

**목적**: 진학어플라이 특화 - 대학 입시 데이터 보호

#### 2.6.1 개인정보 보호 규칙 (ISMS-P 연계)
```markdown
## 🔏 입시 데이터 보안 특별 규칙

### 절대 AI 컨텍스트에 포함하면 안 되는 데이터
- 수험생 개인정보 (이름, 주민번호, 연락처, 주소)
- 성적 데이터 (수능 점수, 내신 등급, 학생부 내용)
- 지원 이력 (지원 대학, 전형, 합격/불합격 결과)
- 결제 정보 (카드번호, 계좌번호, 결제 이력)
- 대학 관리자 계정 정보

### AI 개발 시 데이터 처리 원칙
1. **가명화**: 실제 데이터 대신 Faker.js로 생성한 가상 데이터 사용
2. **최소 수집**: AI에게 전달하는 데이터는 필요한 스키마 구조만
3. **목적 제한**: 개발·테스트 목적 외 데이터 활용 금지
4. **파기**: AI 세션 종료 시 전달된 데이터 참조 제거

### 테스트 데이터 생성 규칙
- 실제 수험번호 형식이지만 가상의 번호 사용
- 테스트용 대학 코드/전형 코드 별도 관리
- 시드 데이터는 fixtures/ 디렉토리에서 관리
```

#### 2.6.2 로그 보안
```markdown
## 📋 AI 관련 로그 보안

### 로깅 필수 항목
- AI 세션 시작/종료 시간
- AI가 접근한 파일 목록
- AI가 수행한 커맨드 목록
- 생성/수정/삭제된 파일 목록
- 보안 스캔 결과 (통과/실패)

### 로그 금지 항목
- AI에 전달된 프롬프트 전문 (요약만 기록)
- 소스 코드 전체 내용
- 환경 변수 값
- 인증 토큰/세션 정보

### 로그 보존
- AI 개발 로그: 90일 보존 후 자동 삭제
- 보안 이벤트 로그: 1년 보존
- ISMS 감사 로그: 관련 법령에 따른 보존 기간 준수
```

### 2.7 Layer 7: 거버넌스 (Governance & Compliance)

**목적**: 조직 차원의 AI 보안 정책·프로세스 관리

#### 2.7.1 AI 개발 보안 정책
```markdown
## 📜 AI 개발 보안 거버넌스

### 역할과 책임
| 역할 | AI 보안 책임 |
|------|-------------|
| 개발자 | AI 생성 코드 1차 리뷰, 보안 규칙 준수, 이상 패턴 보고 |
| 팀 리드 | AI 코드 2차 리뷰, 보안 리뷰 영역 판단, 도구 설정 관리 |
| 보안 담당 | 가드레일 정책 수립/갱신, 보안 사고 대응, ISMS 감사 |
| CTO/부장 | AI 보안 전략 수립, 도구 선정, 전사 정책 승인 |

### 정기 활동
- 주간: AI 생성 코드 보안 메트릭 리뷰
- 월간: 가드레일 정책 업데이트 검토, 새로운 위협 분석
- 분기: 전사 AI 보안 교육, Red Team 테스트
- 연간: ISMS-P 인증 심사 대응, 가드레일 전면 개정
```

#### 2.7.2 인시던트 대응 체계
```markdown
## 🚨 AI 보안 인시던트 대응

### 심각도 분류
| Level | 설명 | 대응 SLA | 예시 |
|-------|------|---------|------|
| P1-Critical | 개인정보 유출, 프로덕션 침해 | 즉시 (1시간) | AI가 실제 수험생 데이터를 외부로 전송 |
| P2-High | 보안 취약점 배포, 시크릿 노출 | 4시간 | AI 생성 코드에 SQL Injection 존재한 채 배포 |
| P3-Medium | 보안 규칙 위반, 미승인 접근 | 24시간 | AI가 금지된 파일에 접근 시도 |
| P4-Low | 경미한 규칙 위반 | 다음 스프린트 | AI 커밋 메시지 규칙 미준수 |

### 대응 절차
1. 탐지 → 2. 격리 (AI 세션 즉시 종료) → 3. 분석 → 4. 복구 → 5. 사후 검토
```

---

## 3. Repo 업데이트 계획

### 3.1 제안 파일 구조 (변경 후)

```
ai-vibecoding/
├── .claude/
│   ├── settings.json              # ✏️ 보안 Hook 대폭 강화
│   └── skills/
│       ├── (기존 스킬들)
│       └── security-check.md      # 🆕 보안 점검 슬래시 명령어
├── templates/
│   ├── (기존 템플릿들)
│   ├── .eslintrc.security.js      # 🆕 보안 ESLint 설정 템플릿
│   ├── .secretlintrc.json         # 🆕 시크릿 스캔 설정 템플릿
│   └── .semgreprc.yml             # 🆕 SAST 설정 템플릿
├── security/                       # 🆕 보안 전용 디렉토리
│   ├── AI_SECURITY_GUARDRAILS.md  # 🆕 AI 보안 가드레일 마스터 문서
│   ├── OWASP_LLM_CHECKLIST.md    # 🆕 OWASP LLM Top 10 체크리스트
│   ├── FORBIDDEN_PATTERNS.md      # 🆕 금지 코드 패턴 카탈로그
│   ├── INCIDENT_RESPONSE.md       # 🆕 AI 보안 인시던트 대응 가이드
│   ├── DATA_CLASSIFICATION.md     # 🆕 데이터 분류 및 처리 기준
│   └── NIGHTBUILDER_SECURITY.md   # 🆕 NightBuilder 보안 규칙
├── ARCHITECTURE.md
├── CHANGELOG.md                    # ✏️ v2.0 보안 업데이트 기록
├── CLAUDE.md                       # ✏️ 보안 규칙 섹션 대폭 추가
├── CODING_CONVENTIONS.md           # ✏️ 보안 코딩 규칙 통합
├── PROJECT_STRUCTURE.md            # ✏️ security/ 디렉토리 추가 반영
├── README.md                       # ✏️ 보안 가이드 섹션 추가
├── SECURITY_ISMS.md                # ✏️ AI 보안 연계 내용 강화
└── VIBE_CODING_GUIDE.md            # ✏️ 보안 체크 단계 추가
```

### 3.2 작업 단계별 로드맵

#### Phase 1: 핵심 보안 문서 생성 (1~2일)

| # | 작업 | 산출물 | 우선순위 |
|---|------|--------|---------|
| 1-1 | AI 보안 가드레일 마스터 문서 작성 | `security/AI_SECURITY_GUARDRAILS.md` | 🔴 Critical |
| 1-2 | OWASP LLM Top 10 체크리스트 작성 | `security/OWASP_LLM_CHECKLIST.md` | 🔴 Critical |
| 1-3 | 금지 코드 패턴 카탈로그 작성 | `security/FORBIDDEN_PATTERNS.md` | 🔴 Critical |
| 1-4 | 데이터 분류 기준서 작성 | `security/DATA_CLASSIFICATION.md` | 🟠 High |

#### Phase 2: 기존 문서 보안 강화 (1~2일)

| # | 작업 | 대상 파일 | 우선순위 |
|---|------|-----------|---------|
| 2-1 | CLAUDE.md에 보안 규칙 섹션 추가 | `CLAUDE.md` | 🔴 Critical |
| 2-2 | SECURITY_ISMS.md AI 보안 연계 강화 | `SECURITY_ISMS.md` | 🔴 Critical |
| 2-3 | CODING_CONVENTIONS.md 보안 코딩 통합 | `CODING_CONVENTIONS.md` | 🟠 High |
| 2-4 | VIBE_CODING_GUIDE.md 보안 체크 추가 | `VIBE_CODING_GUIDE.md` | 🟠 High |

#### Phase 3: 자동화 도구 설정 (2~3일)

| # | 작업 | 산출물 | 우선순위 |
|---|------|--------|---------|
| 3-1 | Claude Code 보안 Hook 설정 | `.claude/settings.json` 업데이트 | 🔴 Critical |
| 3-2 | 보안 점검 슬래시 명령어 추가 | `.claude/skills/security-check.md` | 🟠 High |
| 3-3 | ESLint 보안 규칙 템플릿 작성 | `templates/.eslintrc.security.js` | 🟠 High |
| 3-4 | Secretlint 설정 템플릿 작성 | `templates/.secretlintrc.json` | 🟠 High |
| 3-5 | Semgrep SAST 규칙 템플릿 작성 | `templates/.semgreprc.yml` | 🟡 Medium |

#### Phase 4: 운영 프로세스 문서 (1일)

| # | 작업 | 산출물 | 우선순위 |
|---|------|--------|---------|
| 4-1 | AI 보안 인시던트 대응 가이드 작성 | `security/INCIDENT_RESPONSE.md` | 🟠 High |
| 4-2 | NightBuilder 보안 규칙 작성 | `security/NIGHTBUILDER_SECURITY.md` | 🟠 High |
| 4-3 | README.md 보안 가이드 섹션 추가 | `README.md` 업데이트 | 🟡 Medium |
| 4-4 | CHANGELOG.md v2.0 기록 | `CHANGELOG.md` 업데이트 | 🟡 Medium |

### 3.3 CLAUDE.md 보안 섹션 추가 내용 (요약)

기존 CLAUDE.md에 아래 섹션들을 추가합니다:

```markdown
# 🛡️ 보안 가이드레일

## 보안 등급별 행동 규칙
- 🔴 BLOCK: 즉시 중단 + 개발자 알림 (시크릿 유출, 프로덕션 DB 접근)
- 🟠 WARN: 경고 표시 + 개발자 확인 요청 (의심스러운 패키지, 보안 민감 영역)
- 🟡 LOG: 기록만 (일반 보안 규칙 준수 현황)

## 보안 체크 슬래시 명령어
/security-scan     # 현재 변경사항 보안 스캔
/audit-deps        # 의존성 보안 감사
/check-secrets     # 시크릿 유출 검사
/review-security   # AI 생성 코드 보안 리뷰 요청
```

### 3.4 슬래시 명령어 `/security-scan` 구현 명세

```markdown
# /security-scan 명령어

## 실행 시 체크 항목
1. [시크릿 스캔] 변경된 파일에서 API 키, 토큰, 비밀번호 패턴 탐지
2. [금지 패턴] FORBIDDEN_PATTERNS.md 기반 위험 코드 패턴 탐지
3. [입력 검증] 사용자 입력을 처리하는 새 코드에 검증 로직 존재 확인
4. [SQL 안전성] 새로운 DB 쿼리가 파라미터화되었는지 확인
5. [의존성] 새로 추가된 패키지의 보안 상태 확인
6. [CORS/헤더] 보안 헤더 설정 적절성 확인
7. [에러 처리] 에러 응답에 민감 정보 미포함 확인

## 출력 형식
✅ PASS: {항목} - {설명}
⚠️ WARN: {항목} - {설명} → 권장 조치
❌ FAIL: {항목} - {설명} → 필수 수정 사항

## 종합 점수
Security Score: {점수}/100
```

---

## 4. 구현 우선순위 매트릭스

```
                    높은 영향도
                        │
         Phase 1        │        Phase 3
    (핵심 보안 문서)     │    (자동화 도구)
    - 가드레일 마스터    │    - Claude Hooks
    - OWASP 체크리스트   │    - 보안 스캔 명령어
    - 금지 패턴 카탈로그  │    - ESLint Security
                        │
   ─────────────────────┼─────────────────────
     빠른 실행           │         느린 실행
                        │
         Phase 2        │        Phase 4
    (기존 문서 강화)     │    (운영 프로세스)
    - CLAUDE.md 보안     │    - 인시던트 대응
    - SECURITY_ISMS.md   │    - NightBuilder 보안
    - 코딩 컨벤션 보강   │    - README 업데이트
                        │
                    낮은 영향도
```

**권장 실행 순서**: Phase 1 → Phase 2 → Phase 3 → Phase 4 (총 5~8일)

---

## 5. 성공 지표 (KPI)

| 지표 | 현재 (추정) | 목표 | 측정 방법 |
|------|-------------|------|-----------|
| AI 생성 코드 보안 스캔 커버리지 | 0% | 100% | Hook 실행률 |
| 시크릿 유출 사고 | 추적 불가 | 0건/분기 | Secretlint 탐지 로그 |
| AI 코드 보안 리뷰율 (민감 영역) | 추적 불가 | 100% | PR 리뷰 기록 |
| 의존성 취약점 (High 이상) | 추적 불가 | 0건 | npm audit |
| AI 보안 규칙 위반 탐지율 | 0% | 95%+ | ESLint + Semgrep |
| 개발자 AI 보안 교육 이수율 | 0% | 100% | 분기별 교육 기록 |

---

## 6. 다음 단계

이 계획이 승인되면 아래 순서로 진행합니다:

1. **Phase 1 문서 작성** — `security/AI_SECURITY_GUARDRAILS.md` 등 핵심 문서를 바로 생성할 수 있습니다
2. **CLAUDE.md 보안 섹션 작성** — 현재 CLAUDE.md를 가져와서 보안 규칙을 주입합니다
3. **자동화 설정 파일 생성** — `.eslintrc.security.js`, `.secretlintrc.json` 등 바로 사용 가능한 설정 파일을 만듭니다
4. **슬래시 명령어 구현** — `/security-scan`, `/audit-deps` 등 보안 관련 스킬 파일을 작성합니다

> 어떤 Phase부터 착수할지, 또는 특정 레이어를 더 깊이 파고들지 알려주세요!
