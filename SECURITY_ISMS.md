# JINHAK ISMS 보안 가이드 (AI 개발)

이 문서는 ISMS(정보보호 관리체계) 인증 기준에 맞는 AI 개발 보안 가이드입니다.
Vault 중심의 비밀키 관리는 [ARCHITECTURE.md](./ARCHITECTURE.md) 섹션 5를 참조하고, 이 문서에서는 개인정보 보호, 접근 통제, 감사 로깅, 암호화, AI 특화 보안 규칙을 다룹니다.

---

## 1. 개요

### 1.1 목적

JINHAK 전사 프로젝트에서 AI(Claude Code / Claude.ai)를 활용한 개발 시, ISMS 인증 기준을 충족하는 보안 수준을 유지하기 위한 가이드를 제공합니다.

### 1.2 적용 범위

- AI를 활용한 모든 코드 생성 및 리뷰 작업
- AI에게 제공하는 프롬프트 및 컨텍스트 데이터
- AI가 생성한 코드의 보안 검증
- 개발 환경에서의 접근 통제 및 감사 로깅

### 1.3 관련 문서

| 문서 | 관계 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 전사 AI 개발 표준 (상위 문서) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 보안 아키텍처, Vault 관리 (섹션 5) |
| [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md) | 코드 품질 및 보안 코딩 규칙 |

---

## 2. 개인정보 보호

### 2.1 AI 프롬프트 개인정보 포함 금지

AI에게 전달하는 프롬프트, 코드 스니펫, 데이터 샘플에 **개인정보를 포함해서는 안 됩니다**.

**금지 항목:**

| 항목 | 예시 | 대체 방법 |
|------|------|----------|
| 실명 | `홍길동` | `사용자A`, `user-001` |
| 주민등록번호 | `900101-1234567` | `000000-0000000` |
| 전화번호 | `010-1234-5678` | `010-0000-0000` |
| 이메일 (실제) | `hong@jinhak.com` | `test@example.com` |
| 주소 | 실제 주소 | `서울시 OO구` |
| 계좌번호 | 실제 번호 | `000-000000-00-000` |
| 비밀번호 | 실제 비밀번호 | `P@ssw0rd_example` |

### 2.2 마스킹 및 가명화 규칙

코드에서 개인정보를 처리해야 하는 경우, 반드시 마스킹 또는 가명화를 적용합니다.

```typescript
// 마스킹 유틸리티 예시
function maskName(name: string): string {
  if (name.length <= 1) return '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3')
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  return local.slice(0, 2) + '***@' + domain
}
```

### 2.3 AI 생성 코드의 개인정보 처리 규칙

AI가 생성한 코드에서 개인정보를 처리하는 부분은 반드시 다음을 확인합니다:

1. **수집 최소화**: 필요한 개인정보만 수집
2. **목적 외 사용 금지**: 수집 목적 외의 용도로 사용하지 않음
3. **보관 기한 설정**: 보관 기한이 지난 데이터는 자동 삭제
4. **접근 로깅**: 개인정보 접근 시 감사 로그 기록

---

## 3. 접근 통제

### 3.1 역할 기반 접근 통제 (RBAC)

모든 시스템은 RBAC 기반으로 접근을 통제합니다.

```typescript
// 역할 정의 예시
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
} as const

// 권한 매핑 예시
const PERMISSIONS: Record<string, string[]> = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  manager: ['read', 'write', 'delete'],
  developer: ['read', 'write'],
  viewer: ['read'],
}
```

**규칙:**
- 최소 권한 원칙: 필요한 최소한의 권한만 부여
- 역할 분리: 운영자와 개발자 역할 분리
- 정기 검토: 분기별 접근 권한 리뷰

### 3.2 API 인증 및 인가

| 항목 | 규칙 |
|------|------|
| 인증 방식 | JWT 또는 세션 기반 인증 |
| 토큰 저장 | httpOnly 쿠키 (localStorage 사용 금지) |
| 토큰 만료 | Access Token: 30분, Refresh Token: 7일 |
| API 키 관리 | Vault에서 관리 (하드코딩 금지) |
| CORS | 허용 도메인 명시적 설정 (와일드카드 금지) |

### 3.3 Claude Code 권한 설정

`.claude/settings.json`의 권한 설정으로 AI가 실행할 수 있는 명령을 통제합니다.

**필수 deny 규칙:**

```json
{
  "deny": [
    "Bash(rm -rf *)",
    "Bash(git push --force*)",
    "Bash(git reset --hard*)",
    "Bash(git clean -f*)",
    "Bash(git config *)",
    "Bash(*--no-verify*)"
  ]
}
```

---

## 4. 감사 로깅

### 4.1 필수 로깅 항목

| 이벤트 | 필수 기록 항목 |
|--------|---------------|
| 사용자 로그인/로그아웃 | 사용자 ID, 시간, IP, 성공/실패 |
| 데이터 조회 (민감) | 사용자 ID, 대상 데이터, 시간 |
| 데이터 생성/수정/삭제 | 사용자 ID, 대상, 변경 내용, 시간 |
| 권한 변경 | 변경자 ID, 대상 사용자, 변경 전후 권한 |
| API 호출 (외부) | 호출자, 대상 API, 요청/응답 상태 |

### 4.2 로깅 구현 패턴

```typescript
// 감사 로그 인터페이스
interface AuditLog {
  eventType: string        // 'login', 'data_access', 'data_modify'
  userId: string           // 수행자 ID
  targetResource: string   // 대상 리소스
  action: string           // 수행 행위
  timestamp: string        // ISO 8601
  ipAddress: string        // 요청 IP
  result: 'success' | 'failure'
  details?: Record<string, unknown>
}

// 사용 예시
async function auditLog(log: AuditLog): Promise<void> {
  // 감사 로그는 별도 저장소에 기록 (변조 방지)
  await auditLogRepository.save(log)
}
```

### 4.3 로그 보안

- **로그에 민감 정보 포함 금지**: 비밀번호, 토큰, API Key, 개인정보 등
- **로그 변조 방지**: 감사 로그는 별도 저장소에 기록, 삭제/수정 권한 제한
- **로그 보관 기간**: 최소 1년 (법적 요구사항에 따라 연장)
- **로그 접근 권한**: 보안 담당자와 시스템 관리자만 접근 가능

---

## 5. 암호화

### 5.1 전송 구간 암호화 (TLS)

| 항목 | 규칙 |
|------|------|
| 프로토콜 | TLS 1.2 이상 필수 |
| 인증서 | 신뢰할 수 있는 CA 발급 인증서 사용 |
| HTTP → HTTPS | 프로덕션 환경에서 HTTP 강제 리다이렉트 |
| 내부 통신 | 서비스 간 통신도 TLS 적용 |

### 5.2 저장 구간 암호화

| 대상 | 알고리즘 | 비고 |
|------|---------|------|
| 민감 데이터 | AES-256 | 주민번호, 계좌번호 등 |
| 비밀번호 | bcrypt / Argon2 | 해시 후 저장 (복호화 불가) |
| 암호화 키 | Vault 관리 | 소스 코드에 포함 금지 |

```typescript
// 비밀번호 해싱 예시
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### 5.3 암호화 금지 사항

```
- 자체 암호화 알고리즘 구현 금지 (검증된 라이브러리만 사용)
- MD5, SHA-1 등 취약한 해시 알고리즘 사용 금지
- 암호화 키를 소스 코드나 환경 변수에 직접 저장 금지
- 암호화된 데이터와 키를 같은 저장소에 보관 금지
```

---

## 6. 취약점 관리

### 6.1 OWASP Top 10 대응

| 순위 | 취약점 | 대응 방안 |
|------|--------|----------|
| A01 | 접근 통제 취약점 | RBAC 적용, API별 권한 검증 |
| A02 | 암호화 실패 | TLS 1.2+, AES-256, bcrypt |
| A03 | 인젝션 | ORM 사용, 파라미터 바인딩, 입력 검증 |
| A04 | 불안전한 설계 | 위협 모델링, 설계 리뷰 |
| A05 | 보안 설정 오류 | 보안 헤더 설정, CORS 명시적 설정 |
| A06 | 취약한 컴포넌트 | 의존성 정기 업데이트, npm audit |
| A07 | 인증/식별 실패 | 강력한 비밀번호 정책, MFA |
| A08 | 무결성 검증 실패 | 서브리소스 무결성(SRI), 의존성 잠금 |
| A09 | 로깅/모니터링 실패 | 감사 로그 필수, 이상 행위 알림 |
| A10 | SSRF | 외부 URL 허용 목록 관리, 내부망 접근 차단 |

### 6.2 의존성 보안

```bash
# 의존성 취약점 점검 (정기 수행)
npm audit
pnpm audit

# 의존성 업데이트
npm update
pnpm update
```

**규칙:**
- **주간**: `npm audit` 실행 및 취약점 확인
- **월간**: 주요 의존성 버전 업데이트 검토
- **긴급**: Critical/High 취약점 발견 시 즉시 패치
- **lock 파일**: `package-lock.json` 또는 `pnpm-lock.yaml` 반드시 커밋

---

## 7. AI 개발 특화 보안 규칙

### 7.1 AI에게 전달 금지 항목

AI(Claude Code, Claude.ai) 프롬프트에 **절대 포함하지 말아야 할 정보:**

| 분류 | 금지 항목 |
|------|----------|
| 인증 정보 | 비밀번호, API Key, 토큰, 인증서 Private Key |
| 접속 정보 | 프로덕션 DB 접속 정보, 내부 서버 IP/포트 |
| 개인정보 | 실명, 주민번호, 전화번호, 주소, 계좌번호 |
| 사업 기밀 | 미공개 사업 계획, 계약 조건, 재무 데이터 |
| 보안 설정 | 방화벽 규칙, 보안 그룹 설정, Vault 경로 상세 |

### 7.2 AI 생성 코드 보안 검증

AI가 생성한 코드는 반드시 다음 보안 검증을 수행합니다:

**필수 검증 체크리스트:**

- [ ] SQL Injection 방지: ORM 또는 파라미터 바인딩 사용 여부
- [ ] XSS 방지: 사용자 입력의 이스케이프 처리 여부
- [ ] 인증/인가: API 엔드포인트에 적절한 권한 검증 존재 여부
- [ ] 입력 검증: 시스템 경계에서 사용자 입력 검증 여부
- [ ] 에러 처리: 민감 정보가 에러 응답에 노출되지 않는지
- [ ] 하드코딩: URL, 포트, 비밀키가 하드코딩되지 않았는지
- [ ] 로깅: 민감 정보가 로그에 출력되지 않는지
- [ ] 의존성: 알려진 취약점이 있는 라이브러리를 사용하지 않는지

### 7.3 Agent Teams (멀티 에이전트) 보안

Agent Teams를 사용할 때 다음 보안 규칙을 준수합니다:

| 항목 | 규칙 |
|------|------|
| deny 규칙 상속 | 서브에이전트는 메인 에이전트의 deny 규칙을 상속받음 (자동) |
| SubagentStart 알림 | 서브에이전트 시작 시 보안 규칙 전파 확인 hook 설정 |
| 데이터 격리 | 서브에이전트 간 민감 데이터 직접 전달 금지, 파일 시스템을 통해 교환 |
| 병렬 작업 범위 | 서브에이전트에게 프로덕션 환경 접근 명령 위임 금지 |
| 감사 추적 | 서브에이전트가 수행한 파일 변경도 동일한 감사 기준 적용 |

### 7.4 디버그 로그 보안

개발 과정에서 생성되는 디버그 로그에 민감 정보가 노출되지 않도록 합니다:

```typescript
// 금지: 토큰/키를 로그에 출력
console.log('API response:', response)  // response에 토큰 포함 가능
console.log('Auth header:', headers.authorization)  // 토큰 직접 노출

// 권장: 민감 필드 마스킹 후 출력
console.log('API response status:', response.status)
console.log('Auth header:', headers.authorization ? '[MASKED]' : 'none')
```

**주의 항목:**
- OAuth 토큰, Refresh Token이 에러 응답에 포함되지 않는지 확인
- API Key가 요청/응답 로깅에 노출되지 않는지 확인
- Stack trace에 환경 변수 값이 포함되지 않는지 확인

### 7.5 Claude Code 보안 설정 권장사항

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git clean -f*)",
      "Bash(git config *)",
      "Bash(*--no-verify*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo [SECURITY] 파일 수정 감지: ${file}"
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo [SECURITY] 서브에이전트 시작 - deny 규칙이 상속됩니다"
          }
        ]
      }
    ]
  }
}
```

---

## 8. ISMS 보안 체크리스트

프로젝트 배포 전 반드시 확인해야 하는 보안 체크리스트입니다.

### 8.1 개인정보 보호

- [ ] 개인정보 수집 항목이 최소화되었는가
- [ ] 개인정보 처리 동의를 받고 있는가
- [ ] 개인정보 마스킹/가명화가 적용되었는가
- [ ] 개인정보 보관 기한이 설정되었는가
- [ ] AI 프롬프트에 개인정보가 포함되지 않는가

### 8.2 접근 통제

- [ ] RBAC 기반 접근 통제가 적용되었는가
- [ ] API 인증/인가가 구현되었는가
- [ ] 최소 권한 원칙이 적용되었는가
- [ ] 관리자 계정에 MFA가 적용되었는가

### 8.3 암호화

- [ ] HTTPS(TLS 1.2+)가 적용되었는가
- [ ] 민감 데이터가 AES-256으로 암호화되었는가
- [ ] 비밀번호가 bcrypt/Argon2로 해시되었는가
- [ ] 암호화 키가 Vault에서 관리되고 있는가

### 8.4 감사 로깅

- [ ] 로그인/로그아웃 이벤트가 기록되는가
- [ ] 데이터 접근/수정 이벤트가 기록되는가
- [ ] 로그에 민감 정보가 포함되지 않는가
- [ ] 로그 변조 방지 조치가 되어 있는가

### 8.5 취약점 관리

- [ ] OWASP Top 10 대응이 되어 있는가
- [ ] 의존성 취약점 점검이 수행되었는가
- [ ] 보안 헤더가 설정되었는가 (CSP, X-Frame-Options 등)
- [ ] Rate Limiting이 적용되었는가

### 8.6 AI 개발 보안

- [ ] AI 생성 코드에 보안 검증이 수행되었는가
- [ ] AI에게 민감 정보를 전달하지 않았는가
- [ ] Claude Code deny 규칙이 설정되어 있는가
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가
- [ ] Agent Teams 사용 시 SubagentStart hook이 설정되어 있는가
- [ ] 디버그 로그에 OAuth 토큰, API Key 등 민감 정보가 노출되지 않는가

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
