# JABIS API Gateway 매뉴얼

> **다른 프로젝트에서 JABIS API Gateway를 참고하거나 연동할 때 사용하는 종합 가이드**
>
> 최종 업데이트: 2026-02-23

---

## 목차

1. [개요](#1-개요)
2. [API 문서 확인 방법](#2-api-문서-확인-방법)
3. [인증 체계](#3-인증-체계)
4. [API 설계 규칙](#4-api-설계-규칙)
5. [전체 엔드포인트 목록](#5-전체-엔드포인트-목록)
6. [주요 API 상세](#6-주요-api-상세)
7. [에러 응답 형식](#7-에러-응답-형식)
8. [외부 프로젝트 연동 가이드](#8-외부-프로젝트-연동-가이드)
9. [개발 환경 설정](#9-개발-환경-설정)

---

## 1. 개요

JABIS API Gateway는 **쿼리 기반 동적 API Gateway**로, JABIS 시스템의 모든 API를 단일 진입점으로 제공합니다.

| 항목 | 내용 |
|------|------|
| **기술 스택** | Fastify + TypeScript + PostgreSQL + Redis |
| **기본 포트** | `3100` |
| **로컬 주소** | `http://localhost:3100` |
| **운영 주소** | `https://jabis-gateway.jinhakapply.com` |

### 주요 기능

- **AI Orchestra** — AI 세션 이벤트 수신 및 분석 데이터 동기화
- **Night Builder** — 기능 요청 및 디버그 작업 관리
- **Dev Tasks** — 프로젝트 간 API 개발 작업 큐 시스템
- **API Tasks** — 사용자/역할 단위 API 요청 관리
- **동적 엔드포인트** — DB에 등록된 SQL 쿼리 기반 API 자동 생성
- **대시보드 API** — Orchestra, Night Builder 대시보드용 API
- **성능 모니터링** — 응답시간, 병목, 알림 관리
- **Legacy Analyzer** — 레거시 시스템 분석 대시보드

---

## 2. API 문서 확인 방법

### Swagger UI (인터랙티브 문서)

브라우저에서 아래 URL로 접속하면 모든 API를 확인하고 직접 테스트할 수 있습니다.

| 환경 | URL |
|------|-----|
| 로컬 개발 | `http://localhost:3100/api-docs` |
| 운영 서버 | `https://jabis-gateway.jinhakapply.com/api-docs` |
| JabisLab 프록시 | `http://localhost:5173/api-docs` (Vite 프록시 경유) |

### Swagger UI 주요 기능

- **Try it out** — 각 엔드포인트를 직접 호출하여 테스트
- **필터** — 상단 검색창에서 엔드포인트 검색
- **태그별 분류** — Health, AI Orchestra, Night Builder 등 태그로 그룹화
- **인증 설정** — 상단 `Authorize` 버튼으로 JWT 토큰 또는 API Key 입력

### OpenAPI 명세 파일 직접 접근

| URL | 형식 | 용도 |
|-----|------|------|
| `/api-docs/openapi.yaml` | YAML | 원본 명세 다운로드 |
| `/api-docs/openapi.json` | JSON | 코드 생성, 클라이언트 SDK 생성 등 |

### 로컬에서 명세 관리

```bash
# 명세 문법 검증
npm run openapi:lint

# 단일 YAML 번들링
npm run openapi:bundle

# JSON 변환 포함 번들링
npm run openapi:bundle:json

# Redocly 프리뷰 서버
npm run openapi:preview
```

---

## 3. 인증 체계

Gateway는 **3가지 인증 방식**을 사용합니다.

### 3-1. Bearer JWT (jabis-cert)

대부분의 API에서 사용하는 기본 인증 방식입니다.

```
Authorization: Bearer {JWT_TOKEN}
```

- JWT는 **jabis-cert** 서비스에서 발급
- Gateway가 jabis-cert에 토큰 검증 요청 → 사용자 정보(id, email, name, roles) 획득
- 역할(roles) 기반 접근 제어: `producer`, `developer`, `admin`, `superadmin`

**인증 테스트 엔드포인트:**
```bash
curl -H "Authorization: Bearer {TOKEN}" http://localhost:3100/api/test/auth-check
```

### 3-2. X-Dev-Tasks-Key (Dev Tasks 전용)

Dev Tasks API에서 사용하는 프로젝트별 API Key 인증입니다.

```
X-Dev-Tasks-Key: dtk-{프로젝트명}-{키}
```

- Gateway 환경변수 `DEV_TASKS_API_KEYS`에 `프로젝트명:키` 형식으로 등록
- 키에 바인딩된 프로젝트명과 요청의 `sourceProject`가 일치해야 함

### 3-3. X-Legacy-Analyzer-Key (Legacy Analyzer 전용)

Legacy Analyzer StatusPusher에서 사용하는 API Key 인증입니다.

```
X-Legacy-Analyzer-Key: {키}
```

- Gateway 환경변수 `LEGACY_ANALYZER_API_KEY`에 등록

### 3-4. 인증 불필요 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /health` | 헬스체크 |
| `GET /health/ready` | K8S Readiness Probe |
| `GET /metrics` | Prometheus 메트릭 |

---

## 4. API 설계 규칙

### HTTP 메서드

> **GET과 POST만 사용합니다.** PUT, PATCH, DELETE, OPTIONS는 사용하지 않습니다.

| 메서드 | 용도 |
|--------|------|
| **GET** | 데이터 조회 (쿼리 파라미터로 필터링) |
| **POST** | 생성, 수정, 삭제 (`action` 필드 또는 URL 패턴으로 구분) |

**삭제 예시:**
```
POST /api/requests/{requestId}/delete   ← 삭제도 POST
POST /api/endpoints/:id                 ← body에 { "action": "delete" }
```

### 페이지네이션

목록 API는 공통 페이지네이션을 지원합니다.

| 파라미터 | 기본값 | 설명 |
|---------|--------|------|
| `page` | 1 | 페이지 번호 (1부터 시작) |
| `pageSize` | 20 | 페이지 크기 (최대 100) |
| `sort` | API마다 다름 | 정렬 기준 |
| `order` | `desc` | 정렬 방향 (`asc` / `desc`) |

### 응답 형식

```json
// 성공 (일반)
{
  "success": true,
  "data": { ... },
  "rowCount": 10,
  "requestId": "req-xxxx"
}

// 성공 (목록)
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}

// 에러
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Missing required field: title"
  }
}
```

---

## 5. 전체 엔드포인트 목록

### Health & Monitoring

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/health` | 없음 | 기본 헬스체크 |
| GET | `/health/ready` | 없음 | K8S Readiness (DB, Redis 체크) |
| GET | `/metrics` | 없음 | Prometheus 메트릭 |

### Authentication

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/test/auth-check` | Bearer JWT | 토큰 검증 테스트 |

### AI Orchestra

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/v1/orchestra/events` | - | 세션 이벤트 수신 (session_start/update/end) |
| POST | `/api/v1/orchestra/sync` | - | 분석 데이터 동기화 |

### Night Builder

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/requests` | - | 기능 요청 목록 (status 필수) |
| POST | `/api/requests` | - | 기능 요청 생성 |
| GET | `/api/requests/:requestId` | - | 요청 단건 조회 (plan 포함) |
| POST | `/api/requests/:requestId/status` | - | 요청 상태 변경 |
| POST | `/api/requests/:requestId/plan` | - | 실행 계획 제출 |
| POST | `/api/requests/:requestId/logs` | - | 실행 로그 전송 |
| POST | `/api/requests/:requestId/delete` | - | 요청 삭제 |
| GET | `/api/debug-tasks` | - | 디버그 작업 목록 (status 필수) |
| POST | `/api/debug-tasks/:taskId/status` | - | 디버그 작업 상태 변경 |
| POST | `/api/nbuilder/activities` | - | 활동 로그 배치 기록 |

### Dev Tasks (프로젝트 간 개발 작업 큐)

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/dev-tasks` | X-Dev-Tasks-Key | 작업 목록 조회 |
| POST | `/api/dev-tasks` | X-Dev-Tasks-Key | 작업 생성 (명세 제출) |
| GET | `/api/dev-tasks/:taskId` | X-Dev-Tasks-Key | 작업 단건 조회 |
| POST | `/api/dev-tasks/:taskId/status` | X-Dev-Tasks-Key | 상태 변경 |
| POST | `/api/dev-tasks/:taskId/verify` | X-Dev-Tasks-Key | 엔드포인트 검증 |
| POST | `/api/dev-tasks/:taskId/delete` | X-Dev-Tasks-Key | 작업 삭제 |

### API Tasks (사용자/역할 단위 API 요청)

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/api-tasks` | Bearer JWT | 작업 목록 조회 |
| POST | `/api/api-tasks` | Bearer JWT | 작업 생성 |
| GET | `/api/api-tasks/:taskId` | Bearer JWT | 작업 단건 조회 |
| POST | `/api/api-tasks/:taskId/status` | Bearer JWT | 상태 변경 |
| POST | `/api/api-tasks/:taskId/delete` | Bearer JWT | 작업 삭제 |

### 엔드포인트 관리

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/endpoints` | Bearer JWT | 엔드포인트 목록 |
| GET | `/api/endpoints/:id` | Bearer JWT | 엔드포인트 단건 조회 |
| POST | `/api/endpoints` | Bearer JWT | 엔드포인트 생성 |
| POST | `/api/endpoints/:id` | Bearer JWT | 수정/삭제 (action 패턴) |
| POST | `/api/endpoints/:id/test` | Bearer JWT | 쿼리 테스트 실행 |

### Dashboard - Orchestra

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/dashboard/orchestra/sessions` | - | 세션 목록 |
| GET | `/api/dashboard/orchestra/sessions/:sessionId` | - | 세션 상세 |
| GET | `/api/dashboard/orchestra/sessions/:sessionId/events` | - | 세션 이벤트 |
| POST | `/api/dashboard/orchestra/sessions/:sessionId/delete` | - | 세션 삭제 |
| GET | `/api/dashboard/orchestra/instances` | - | 인스턴스 목록 |
| GET | `/api/dashboard/orchestra/developers` | - | 개발자 목록 |
| GET | `/api/dashboard/orchestra/developers/:developerId` | - | 개발자 상세 |
| GET | `/api/dashboard/orchestra/machines` | - | 머신 목록 |
| GET | `/api/dashboard/orchestra/errors` | - | 에러 목록 |
| GET | `/api/dashboard/orchestra/tasks` | - | 작업 목록 |
| GET | `/api/dashboard/orchestra/stats` | - | 통계 |

### Dashboard - Night Builder

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/dashboard/nbuilder/requests` | - | 요청 목록 |
| GET | `/api/dashboard/nbuilder/requests/:requestId` | - | 요청 상세 |
| GET | `/api/dashboard/nbuilder/debug-tasks` | - | 디버그 작업 목록 |
| GET | `/api/dashboard/nbuilder/debug-tasks/:taskId` | - | 디버그 작업 상세 |
| GET | `/api/dashboard/nbuilder/stats` | - | 통계 |

### Performance

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/performance/stats` | - | 성능 통계 |
| GET | `/performance/bottlenecks` | - | 병목 분석 |
| GET | `/performance/alerts` | - | 알림 조회 |
| GET | `/performance/dashboard` | - | 대시보드 데이터 |
| POST | `/performance/thresholds` | - | 임계값 설정 |

### Admin - IP Management

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/admin/ip/blocked` | - | 차단 IP 목록 |
| POST | `/api/admin/ip/unblock` | - | IP 차단 해제 |
| POST | `/api/admin/ip/unblock-all` | - | 전체 차단 해제 |
| GET | `/api/admin/ip/check/:ip` | - | IP 화이트리스트 확인 |
| GET | `/api/admin/ip/my-ip` | - | 내 IP 확인 |

### 동적 엔드포인트 (와일드카드)

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/*` | 선택적 | DB에 등록된 쿼리 기반 동적 API |
| POST | `/*` | 선택적 | DB에 등록된 쿼리 기반 동적 API |

> 동적 엔드포인트는 DB `gateway.api_endpoints` 테이블에 등록된 경로 패턴과 매칭됩니다.
> 명시적 라우트와 매칭되지 않는 요청만 와일드카드 핸들러로 처리됩니다.

---

## 6. 주요 API 상세

### 6-1. Dev Tasks API (프로젝트 간 작업 큐)

외부 프로젝트에서 Gateway에 API 구현 작업을 제출하고, 완료 후 자동 검증까지 수행하는 시스템입니다.

**플로우:**
```
1. POST /api/dev-tasks (명세 제출) → taskId 획득
2. GET /api/dev-tasks/{taskId} (상태 폴링) → completed 대기
3. POST /api/dev-tasks/{taskId}/verify (검증) → verified로 완료
```

**상태 흐름:**
```
pending → in_progress → completed → verified
                ↑             ↓
              pending ← (검증실패/재작업)
                ↑
rejected ← (반려)
```

**작업 생성 예시:**
```bash
curl -X POST http://localhost:3100/api/dev-tasks \
  -H "Content-Type: application/json" \
  -H "X-Dev-Tasks-Key: dtk-myproject-xxxxxxxx" \
  -d '{
    "title": "사용자 목록 API 추가",
    "spec": "## 요구사항\n\nGET /api/users 엔드포인트 추가...",
    "sourceProject": "myproject",
    "endpoints": [
      {"method": "GET", "path": "/api/users", "description": "사용자 목록"}
    ],
    "priority": 10
  }'
```

> 상세 가이드: [`docs/DEV_TASKS_API_GUIDE.md`](./DEV_TASKS_API_GUIDE.md)

### 6-2. AI Orchestra API

AI 세션 이벤트를 수신하고 분석 데이터를 동기화합니다.

**이벤트 전송:**
```bash
curl -X POST http://localhost:3100/api/v1/orchestra/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "session_start",
    "source": { "instanceId": "inst-001" },
    "data": { ... }
  }'
```

- `type`: `session_start`, `session_update`, `session_end`
- `source.instanceId`: 필수

**동기화:**
```bash
curl -X POST http://localhost:3100/api/v1/orchestra/sync \
  -H "Content-Type: application/json" \
  -d '{ "instanceId": "inst-001" }'
```

### 6-3. Night Builder API

기능 요청 생성 및 상태 관리, 디버그 작업 관리 시스템입니다.

**요청 생성:**
```bash
curl -X POST http://localhost:3100/api/requests \
  -H "Content-Type: application/json" \
  -d '{ "prompt": "사용자 로그인 기능 구현" }'
```

**요청 목록 조회 (status 파라미터 필수):**
```bash
curl "http://localhost:3100/api/requests?status=pending&sort=priority&order=desc"
```

### 6-4. 동적 엔드포인트 시스템

Gateway의 핵심 기능으로, DB에 SQL 쿼리를 등록하면 자동으로 API 엔드포인트가 생성됩니다.

**엔드포인트 생성:**
```bash
curl -X POST http://localhost:3100/api/endpoints \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "사용자 목록",
    "method": "GET",
    "pathPattern": "/api/users",
    "query": "SELECT id, name, email FROM users WHERE status = :status",
    "parameters": [
      {"name": "status", "type": "string", "required": false, "default": "active"}
    ],
    "authRequired": true
  }'
```

**제약 사항:**
- SQL은 `SELECT` 또는 `WITH`로 시작해야 함 (읽기 전용)
- `INSERT`, `UPDATE`, `DELETE`, `DROP` 등 DML/DDL 키워드 차단
- 다중 쿼리(세미콜론 분리) 차단

---

## 7. 에러 응답 형식

모든 에러는 동일한 형식으로 반환됩니다.

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 상세 메시지"
  }
}
```

| HTTP 코드 | code | 의미 |
|-----------|------|------|
| 400 | `BAD_REQUEST` | 필수 필드 누락, 잘못된 파라미터 |
| 401 | `UNAUTHORIZED` | 인증 헤더 누락 |
| 403 | `FORBIDDEN` | 잘못된 키, 권한 부족 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 상태 충돌 (잘못된 상태 전이 등) |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 8. 외부 프로젝트 연동 가이드

### 8-1. API 문서 확인부터 시작

1. Swagger UI(`/api-docs`)에서 필요한 API 확인
2. "Try it out"으로 직접 테스트
3. 필요한 엔드포인트가 없으면 Dev Tasks API로 구현 요청

### 8-2. 인증 토큰 발급

jabis-cert에서 JWT 토큰을 발급받아 사용합니다.

```bash
# 토큰 발급 (jabis-cert)
curl -X POST https://jabis-cert.jinhakapply.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "...", "password": "..." }'

# Gateway API 호출
curl -H "Authorization: Bearer {TOKEN}" http://localhost:3100/api/endpoints
```

### 8-3. Dev Tasks API Key 발급

Dev Tasks API를 사용하려면 별도의 API Key가 필요합니다.

1. Gateway 관리자에게 API Key 발급 요청
2. 발급 형식: `dtk-{프로젝트명}-{랜덤키}`
3. 프로젝트 `.env`에 키 저장

```env
GATEWAY_DEV_TASKS_KEY=dtk-myproject-xxxxxxxx
```

### 8-4. CLAUDE.md에 추가할 연동 설정

외부 프로젝트에서 AI 에이전트를 통해 Gateway를 활용하려면 해당 프로젝트의 `CLAUDE.md`에 다음을 추가하세요.

```markdown
## Gateway API 연동

### 접속 정보
- **Gateway 주소**: http://localhost:3100 (개발) / https://jabis-gateway.jinhakapply.com (운영)
- **Swagger UI**: {Gateway주소}/api-docs
- **OpenAPI 명세**: {Gateway주소}/api-docs/openapi.json

### 인증
- JWT 토큰: `Authorization: Bearer {TOKEN}` (jabis-cert 발급)
- Dev Tasks Key: `X-Dev-Tasks-Key: {키}` (별도 발급)

### API 설계 규칙
- HTTP 메서드는 GET, POST만 사용
- 삭제는 `POST /.../delete` 패턴
- 수정은 `POST ...` + body에 `action: "update"` 패턴
- 에러 형식: `{ error: { code, message } }`

### Gateway에 새 API 구현 요청 시
1. `POST /api/dev-tasks`로 명세 제출
2. `GET /api/dev-tasks/{taskId}`로 상태 폴링
3. `POST /api/dev-tasks/{taskId}/verify`로 검증
```

---

## 9. 개발 환경 설정

### 필수 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | O | PostgreSQL 연결 문자열 |
| `REDIS_URL` | O | Redis 연결 문자열 |
| `PORT` | - | 서버 포트 (기본 3100) |
| `NODE_ENV` | - | `development` / `production` / `test` |
| `CERT_SERVER_URL` | - | jabis-cert 서비스 URL |
| `CERT_CLIENT_ID` | - | jabis-cert 클라이언트 ID |
| `CERT_CLIENT_SECRET` | - | jabis-cert 클라이언트 시크릿 |
| `DEV_TASKS_API_KEYS` | - | Dev Tasks API 키 (`project:key,project:key`) |
| `LEGACY_ANALYZER_API_KEY` | - | Legacy Analyzer API 키 |

### 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 (핫 리로드)
npm run dev

# 빌드
npm run build

# 테스트
npm test
```

### 미들웨어 스택

Gateway 요청은 다음 순서로 처리됩니다:

```
요청 수신
  → Request ID 생성
  → Content-Length 검증
  → XSS 보호 (입력 정화)
  → 요청 검증 (스키마, 크기 제한)
  → Request 로거
  → Rate Limiter
  → 라우트 매칭 → 핸들러 실행
  → 응답 로거
```

### 보안 설정

- **Helmet** — 보안 헤더 자동 설정
- **CORS** — `GET`, `POST` 허용, 커스텀 헤더 포함
- **Rate Limiter** — IP 기반 요청 제한
- **XSS Protection** — 요청 데이터 자동 정화
- **SQL Injection 방어** — 동적 엔드포인트 쿼리 파라미터 바인딩
- **요청 크기 제한** — Body 최대 10MB

---

## 부록: 프로젝트 구조

```
jabis-api-gateway/
├── src/
│   ├── app.ts              # Fastify 앱 구성
│   ├── server.ts           # 서버 시작점
│   ├── config/             # 환경설정
│   ├── middleware/          # 인증, 보안, 로깅 미들웨어
│   ├── routes/             # API 라우트 핸들러
│   ├── services/           # 비즈니스 로직
│   ├── repositories/       # DB 접근 계층
│   ├── types/              # TypeScript 타입 정의
│   ├── schemas/            # 요청/응답 스키마
│   └── utils/              # 유틸리티 (로거, Vault 등)
├── docs/
│   └── openapi/            # OpenAPI 명세 (YAML)
│       ├── openapi.yaml    # 메인 명세 파일
│       ├── paths/          # 경로별 명세
│       └── components/     # 스키마, 파라미터, 응답 정의
└── .ai/                    # AI 작업 기록
```
