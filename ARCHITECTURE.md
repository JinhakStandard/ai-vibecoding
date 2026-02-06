# JINHAK 아키텍처 원칙 및 패턴

이 문서는 JINHAK 전사 프로젝트의 아키텍처 설계 원칙과 표준 패턴을 정의합니다.

---

## 1. 아키텍처 핵심 원칙

### 1.1 설계 철학

1. **단순함 우선 (Simplicity First)**: 복잡한 솔루션보다 이해하기 쉬운 구조를 선택
2. **관심사 분리 (Separation of Concerns)**: 각 모듈은 하나의 책임만 담당
3. **점진적 확장 (Progressive Enhancement)**: 현재 필요에 맞게 설계하고, 필요 시 확장
4. **일관성 (Consistency)**: 같은 문제에는 같은 패턴으로 해결

### 1.2 금지하는 설계 패턴

- **과도한 추상화**: 한 번만 사용되는 코드에 인터페이스/팩토리 패턴 적용 금지
- **가설 기반 설계**: 아직 존재하지 않는 요구사항을 위한 코드 작성 금지
- **골든 해머**: 특정 패턴을 모든 문제에 적용하려는 시도 금지

---

## 2. 프론트엔드 아키텍처

### 2.1 프론트엔드 표준 기술

| 항목 | 표준 기술 |
|------|----------|
| 프레임워크 | React 18+ / Next.js |
| 빌드 도구 | Vite |
| 상태관리 | Zustand |
| 스타일링 | Tailwind CSS + CVA |

### 2.2 컴포넌트 계층 구조

```
UI 기본 컴포넌트 (공유 UI 라이브러리 - 프로젝트별 구성)
    └── 앱 공통 컴포넌트 (src/components/common)
        └── 도메인 컴포넌트 (src/components/[도메인])
            └── 페이지 컴포넌트 (src/pages)
```

| 계층 | 위치 | 설명 |
|------|------|------|
| UI 기본 | 공유 UI 라이브러리 | Button, Card, Dialog 등 재사용 UI |
| 앱 공통 | `src/components/common/` | PageHeader, DataTable 등 |
| 도메인 | `src/components/[도메인]/` | GoalCard, OrgChart 등 |
| 페이지 | `src/pages/` | 각 URL에 대응하는 페이지 |

**핵심 규칙:**
- 기본 UI 컴포넌트는 공유 UI 라이브러리에서 관리
- 2개 이상의 앱에서 사용되는 컴포넌트는 공유 라이브러리로 승격
- 도메인 컴포넌트는 해당 도메인 폴더 밖에서 import 금지

### 2.3 상태 관리 아키텍처

```
                   ┌─────────────┐
                   │   Zustand   │
                   │   Store     │
                   └──────┬──────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
     ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
     │ Component │ │ Component │ │ Component │
     │     A     │ │     B     │ │     C     │
     └───────────┘ └───────────┘ └───────────┘
```

**상태 배치 원칙:**
- **전역 상태** (Zustand): 여러 컴포넌트에서 공유하는 데이터, 다이얼로그 상태
- **로컬 상태** (useState): 해당 컴포넌트에서만 사용하는 UI 상태
- **URL 상태** (React Router): 페이지 간 공유해야 하는 필터/탭 상태
- **서버 상태** (향후 React Query): API 응답 데이터 캐싱

### 2.4 라우팅 패턴

```jsx
// 역할 기반 라우팅
<Routes>
  <Route path="/" element={<LoginPage />} />

  {/* 역할별 페이지 */}
  <Route path="/developer" element={<DeveloperDashboard />} />
  <Route path="/developer/projects" element={<ProjectPage role="developer" />} />

  <Route path="/teamlead" element={<TeamLeadDashboard />} />
  <Route path="/teamlead/goals" element={<GoalPage role="teamlead" />} />

  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/organization" element={<OrganizationPage role="admin" />} />

  {/* 404 처리 */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**규칙:**
- URL 첫 세그먼트는 역할(role)
- 역할별 대시보드를 기본 페이지로 제공
- 존재하지 않는 경로는 로그인 페이지로 리다이렉트

---

## 3. 백엔드 아키텍처

### 3.1 레이어드 아키텍처

```
┌──────────────────────────────────┐
│          Controller Layer         │ ← HTTP 요청/응답 처리
├──────────────────────────────────┤
│           Service Layer           │ ← 비즈니스 로직
├──────────────────────────────────┤
│         Repository Layer          │ ← 데이터 접근
├──────────────────────────────────┤
│           Database                │ ← 데이터 저장
└──────────────────────────────────┘
```

```
src/
├── controllers/       # HTTP 요청 처리, 유효성 검증
│   └── userController.ts
├── services/          # 비즈니스 로직
│   └── userService.ts
├── repositories/      # DB 접근 (Prisma/Drizzle)
│   └── userRepository.ts
├── models/            # 데이터 모델/타입 정의
│   └── user.ts
├── middlewares/        # 인증, 로깅, 에러 처리
│   ├── auth.ts
│   └── errorHandler.ts
├── utils/             # 공통 유틸리티
│   └── validators.ts
├── config/            # 환경 설정
│   └── database.ts
└── app.ts             # 앱 진입점
```

**규칙:**
- Controller는 Service만 호출 (Repository 직접 접근 금지)
- Service는 비즈니스 로직만 포함 (HTTP 관련 코드 금지)
- Repository는 데이터 접근만 담당 (비즈니스 로직 금지)

### 3.2 API 설계 원칙

#### HTTP 메서드 규칙

| Method | 용도 | 예시 |
|--------|------|------|
| `GET` | 데이터 조회 | `GET /api/users?dept=sales` |
| `POST` | 생성/수정/삭제 | `POST /api/users` + action 필드 |

```javascript
// POST + action 패턴
POST /api/users
body: { action: 'create', data: { name: '홍길동', dept: 'sales' } }
body: { action: 'update', id: 'user-001', data: { name: '변경' } }
body: { action: 'delete', id: 'user-001' }
```

#### API 응답 표준 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다.",
    "details": { ... }  // 개발 환경만
  }
}
```

#### URL 네이밍 규칙

```
GET  /api/users              # 목록 조회
GET  /api/users/:id          # 단건 조회
POST /api/users              # 생성/수정/삭제 (action 구분)
GET  /api/users/:id/goals    # 하위 리소스 조회
POST /api/users/:id/goals    # 하위 리소스 조작
```

- URL은 **복수형 명사** 사용 (`users`, `departments`)
- URL 세그먼트는 **kebab-case** (`goal-plans`, `team-members`)
- 최대 깊이 3단계까지 (`/api/users/:id/goals`)

### 3.3 데이터베이스 선택 기준

| 조건 | 표준 DB | 비고 |
|------|---------|------|
| **신규 프로젝트** | PostgreSQL | 오픈소스, 확장성, JSON 지원 |
| **대형 프로젝트** | MSSQL (SQL Server) | 엔터프라이즈 안정성, 기존 인프라 활용 |
| **기존 프로젝트** | MSSQL (SQL Server) | 기존 DB 유지, 마이그레이션 비용 최소화 |

#### 테이블 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블 | snake_case, 복수형 | `users`, `goal_plans` |
| 컬럼 | snake_case | `created_at`, `user_id` |
| 인덱스 | idx_{테이블}_{컬럼} | `idx_users_email` |
| 외래키 | fk_{테이블}_{참조테이블} | `fk_goals_users` |

#### 공통 컬럼

모든 테이블에 포함되어야 하는 컬럼:

```sql
id          VARCHAR(50)   PRIMARY KEY  -- prefix + 고유값 형식
created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
created_by  VARCHAR(50)   NOT NULL     -- 생성자 ID
updated_by  VARCHAR(50)   NOT NULL     -- 수정자 ID
is_deleted  BOOLEAN       DEFAULT FALSE -- 소프트 삭제
```

#### 소프트 삭제 원칙

- 모든 데이터는 **소프트 삭제** (`is_deleted = true`)
- 물리적 삭제는 배치 작업으로만 수행 (90일 이상 경과 시)
- 조회 시 `WHERE is_deleted = false` 조건 필수

---

## 4. 마이크로서비스 간 통신 규칙

### 4.1 동기 통신 (HTTP)

서비스 간 직접 호출이 필요한 경우:

```typescript
// 서비스 간 HTTP 클라이언트
class ServiceClient {
  private baseUrl: string

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'X-Service-Name': 'caller-service',
        'X-Request-Id': generateRequestId(),
      }
    })
    return response.json()
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'caller-service',
        'X-Request-Id': generateRequestId(),
      },
      body: JSON.stringify(body)
    })
    return response.json()
  }
}
```

### 4.2 비동기 통신 (이벤트)

서비스 간 느슨한 결합이 필요한 경우:

```typescript
// 이벤트 발행
interface DomainEvent {
  eventType: string       // 'user.created', 'goal.updated'
  timestamp: string       // ISO 8601
  source: string          // 발행 서비스명
  data: unknown           // 이벤트 데이터
  correlationId: string   // 추적 ID
}
```

### 4.3 통신 규칙

1. **서비스 간 직접 DB 접근 금지**: 반드시 API를 통해 데이터 교환
2. **타임아웃 설정 필수**: 모든 외부 호출에 타임아웃 (기본 5초)
3. **재시도 정책**: 일시적 오류에 대해 최대 3회 재시도 (exponential backoff)
4. **서킷 브레이커**: 연속 실패 시 일정 시간 호출 차단

---

## 5. 보안 아키텍처

### 5.1 비밀키 관리 - Vault (필수)

모든 Private Key, API Key, 인증 정보, DB 접속 정보 등 민감 정보는 **반드시 Vault를 통해 관리**합니다.

```
┌──────────────┐     ┌──────────┐     ┌──────────────┐
│  Application │────▶│  Vault   │────▶│  Secret      │
│  (서비스)     │◀────│  Server  │◀────│  Storage     │
└──────────────┘     └──────────┘     └──────────────┘
```

#### Vault 사용 원칙

| 항목 | 규칙 |
|------|------|
| DB 접속 정보 | Vault에서 동적으로 발급받아 사용 |
| API Key | Vault KV Secret에 저장, 애플리케이션 시작 시 로드 |
| 인증서/Private Key | Vault PKI로 관리 |
| 환경별 비밀 분리 | Vault path로 환경 구분 (`secret/dev/`, `secret/prod/`) |

#### 사용 패턴

```typescript
// Vault에서 비밀 정보 로드
import { VaultClient } from './config/vault'

const vault = new VaultClient({
  endpoint: process.env.VAULT_ADDR,     // Vault 서버 주소만 환경변수로
  token: process.env.VAULT_TOKEN,       // 또는 AppRole 인증
})

// DB 접속 정보 가져오기
const dbCredentials = await vault.read('secret/data/myapp/database')
const { host, port, username, password } = dbCredentials.data

// API Key 가져오기
const apiKeys = await vault.read('secret/data/myapp/api-keys')
```

#### 금지 사항

```
- 소스 코드에 비밀키 하드코딩 절대 금지
- .env 파일에 프로덕션 비밀키 저장 금지
- 로그에 토큰/비밀번호/API Key 출력 금지
- Vault Token을 소스 코드에 포함 금지
- Slack/메일 등으로 비밀키 공유 금지
```

### 5.2 보안 체크리스트

- [ ] 모든 비밀키는 Vault에서 관리
- [ ] 모든 사용자 입력은 서버에서 검증
- [ ] SQL 쿼리는 파라미터 바인딩 사용 (ORM 권장)
- [ ] XSS 방지를 위한 출력 이스케이프
- [ ] CORS 설정 (허용 도메인만)
- [ ] Rate Limiting 적용
- [ ] 민감 데이터 로그 출력 금지
- [ ] HTTPS 필수 (개발 환경 제외)

### 5.3 환경 변수 관리

```
.env                  # 로컬 개발용 (git 제외, Vault 접속 정보만)
.env.example          # 환경 변수 목록 (git 포함, 값은 비움)
```

**로컬 개발 시 `.env`에 포함할 수 있는 항목:**
```env
# Vault 접속 정보만 .env에 보관
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-only-token

# 기타 비민감 설정
NODE_ENV=development
PORT=3000
```

**절대 하지 말 것:**
- `.env` 파일을 git에 커밋
- `.env`에 DB 비밀번호, API Key 등 직접 저장 (Vault 사용)
- 소스 코드에 비밀키 하드코딩
- 로그에 토큰/비밀번호 출력

> ISMS 인증 기준에 맞는 개인정보 보호, 접근 통제, 감사 로깅, 암호화, AI 특화 보안 규칙은 [SECURITY_ISMS.md](./SECURITY_ISMS.md)를 참조하세요.

---

## 6. 의사결정 기록 (ADR)

중요한 아키텍처 결정은 `.ai/DECISIONS.md`에 ADR 형식으로 기록합니다.

```markdown
## ADR-001: GET/POST만 사용하는 HTTP API 설계

### 상태
승인됨 (2024-01)

### 컨텍스트
- 일부 프록시/방화벽이 PUT/DELETE를 차단하는 환경이 있음
- action 필드로 의도를 명확히 전달할 수 있음
- 프론트엔드에서 HTTP 메서드 관리가 단순해짐

### 결정
모든 API에서 GET(조회)과 POST(변경) 두 가지 메서드만 사용한다.
POST 요청에는 action 필드로 생성/수정/삭제를 구분한다.

### 결과
- (+) 프록시/방화벽 호환성 향상
- (+) 프론트엔드 API 클라이언트 단순화
- (-) REST 표준과 다르므로 외부 개발자에게 설명 필요
```

---

## 7. AI 협업 아키텍처 고려사항

### 7.1 대규모 코드베이스 분석 전략 (1M 컨텍스트)

Opus 4.6의 1M 토큰 컨텍스트 윈도우를 활용하여 대규모 코드베이스를 효과적으로 분석할 수 있습니다.

**활용 시나리오:**

| 시나리오 | 접근법 |
|----------|--------|
| 아키텍처 리뷰 | 핵심 파일(진입점, 라우터, 설정) → 레이어별 대표 파일 순으로 로드 |
| 크로스커팅 리팩토링 | 관련 모듈 전체를 컨텍스트에 로드하여 일관된 변경 수행 |
| 레거시 코드 이해 | 의존성 그래프를 따라 관련 파일을 단계적으로 탐색 |
| 버그 추적 | 콜스택을 따라 Controller → Service → Repository 전체를 한 번에 분석 |

**컨텍스트 효율화 원칙:**
- 긴 세션에서는 Context Compaction이 자동으로 이전 대화를 요약
- 불필요한 파일을 반복 로드하지 않도록 탐색 순서를 계획
- Agent Memory가 세션 간 핵심 정보를 자동으로 이월

### 7.2 Agent Teams 아키텍처 패턴

멀티 에이전트 협업 시 다음 패턴을 권장합니다:

```
  메인 에이전트 (오케스트레이터)
      │
      ├── 서브에이전트 A: 코드 탐색/분석
      ├── 서브에이전트 B: 테스트 실행/검증
      └── 서브에이전트 C: 문서 작성
```

**적합한 작업 분배:**
- 독립적인 모듈의 병렬 리팩토링
- 테스트 실행과 코드 분석 동시 수행
- 프론트엔드/백엔드 독립 작업

**주의사항:**
- 같은 파일을 여러 에이전트가 동시에 수정하지 않도록 조율
- 서브에이전트의 작업 결과는 메인 에이전트가 검증 후 반영
- deny 규칙은 자동 상속되므로 보안 규칙 일관성 보장

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
