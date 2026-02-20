# [프로젝트명] CLAUDE.md 템플릿

> **사용법**: 이 파일을 프로젝트 루트에 `CLAUDE.md`로 복사한 후, `[대괄호]` 안의 내용을 실제 프로젝트 정보로 교체하세요.

---

<!-- JINHAK Standard Metadata - 이 메타 정보는 자동 버전 관리에 사용됩니다. 삭제하지 마세요. -->
<!-- jinhak_standard_version: 2.0 -->
<!-- jinhak_standard_repo: [표준 저장소 URL - https://github.com/JinhakStandard/ai-vibecoding 로 교체] -->
<!-- applied_date: [YYYY-MM-DD] -->

# [프로젝트명]

[프로젝트 한 줄 설명]

## 응답 언어

**모든 응답은 한글로 작성합니다.**

---

## 필수 작업 기록 (MANDATORY)

**모든 작업 완료 후 반드시 `.ai/` 폴더의 문서를 업데이트해야 합니다.**

### .ai/ 폴더 구조
```
.ai/
├── SESSION_LOG.md      # 세션별 작업 기록 (필수 업데이트)
├── CURRENT_SPRINT.md   # 현재 진행/대기 작업 현황
├── DECISIONS.md        # 기술 의사결정 기록 (ADR)
├── ARCHITECTURE.md     # 시스템 구조 문서
└── CONVENTIONS.md      # 코딩 컨벤션
```

### 세션 시작 시
1. `.ai/SESSION_LOG.md` 읽어 이전 작업 확인
2. `.ai/CURRENT_SPRINT.md` 읽어 진행 중인 작업 파악
3. Agent Memory가 자동으로 이전 세션 컨텍스트를 로드합니다

### 작업 완료 후 (필수)
1. `.ai/CURRENT_SPRINT.md` 진행 상태 업데이트
2. `.ai/SESSION_LOG.md`에 작업 요약 추가 (상세 내용은 Agent Memory가 관리)
3. 중요 기술 결정 시 `.ai/DECISIONS.md` 업데이트

### SESSION_LOG.md 기록 형식
```markdown
## YYYY-MM-DD

### 세션 요약
- 작업 1 설명
- 작업 2 설명

### 주요 변경
- `파일경로` - 변경 내용

### 커밋
- `해시` 커밋 메시지
```

---

## 프로젝트 구조

```
[프로젝트 폴더 구조를 여기에 작성]
```

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| **프레임워크** | [React / Next.js / Express / NestJS 등] |
| **언어** | [JavaScript / TypeScript] |
| **패키지 매니저** | [pnpm / npm / yarn] |
| **상태관리** | [Zustand / Redux 등] |
| **스타일링** | [Tailwind CSS / CSS Modules 등] |
| **데이터베이스** | [PostgreSQL / MySQL / MongoDB 등] |
| **ORM** | [Prisma / Drizzle / TypeORM 등] |
| **빌드 도구** | [Vite / Webpack / Turbopack 등] |

---

## 주요 명령어

```bash
# 의존성 설치
[pnpm install]

# 개발 서버 실행
[pnpm dev]

# 빌드
[pnpm build]

# 테스트
[pnpm test]

# 타입 체크 (TypeScript)
[pnpm typecheck]

# 린트
[pnpm lint]
```

---

## 개발 규칙

### 1. 공통 규칙
- 커밋 메시지는 `type: subject` 형식 (feat, fix, docs, refactor, test, chore)
- `.env` 파일은 절대 커밋 금지
- 코드 리뷰 없이 main/master 직접 push 금지

### 2. HTTP API 규칙
- GET, POST만 사용 (PUT, PATCH, DELETE 사용 안 함)
- POST 요청에 action 필드로 동작 구분

### 3. 네이밍 컨벤션
| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `UserCard.jsx` |
| 함수/변수 | camelCase | `handleSubmit` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY` |
| ID 값 | prefix + 고유값 | `user-001` |

### 4. 임포트 순서
```
1. React 및 외부 라이브러리
2. 아이콘 (lucide-react)
3. UI 컴포넌트 (공유 UI)
4. 앱 전용 컴포넌트
5. 스토어
6. 유틸리티/데이터
```

### 5. [프로젝트 특화 규칙]
- [규칙 1 설명]
- [규칙 2 설명]
- [규칙 3 설명]

---

## 비밀키 관리

> **모든 Private Key, API Key, 인증 정보는 Vault를 통해 관리합니다.**

```env
# .env에는 Vault 접속 정보와 비민감 설정만 보관 (커밋 금지)
VAULT_ADDR=http://vault.internal:8200
VAULT_TOKEN=
NODE_ENV=development
PORT=3000
```

---

## AI 보안 가이드레일 (v2.0)

> 상세 내용: 표준 저장소의 `security/` 폴더 참조

### 보안 등급별 행동
- **BLOCK**: 시크릿 유출, 프로덕션 DB 접근, 개인정보 하드코딩 → 즉시 중단
- **WARN**: 의심스러운 패키지, 보안 민감 영역 수정 → 경고 + 확인
- **LOG**: 일반 보안 규칙 준수 현황 → 기록만

### 금지 코드 패턴 (핵심)
- `eval()`, SQL 문자열 연결, `cors({ origin: '*' })`, `crypto.createHash('md5')` 등 12개 패턴
- 상세: `security/FORBIDDEN_PATTERNS.md`

### 보안 점검
```
/security-check    # 변경사항 보안 스캔
```

---

## 금지 사항

1. `any` 타입 사용 금지 (TypeScript)
2. `console.log` 프로덕션 코드 사용 금지
3. 하드코딩된 URL/포트/비밀키 사용 금지
4. `git push --force` 금지
5. 주석 처리된 코드 방치 금지

> **참고**: 위 금지 사항 중 위험 명령(`push --force`, `reset --hard`, `--no-verify` 등)은 `.claude/settings.json`의 `deny` 규칙으로 **물리적으로 차단**됩니다. 이 규칙은 프로젝트 전체에 강제 적용되며, 개인 설정으로 우회할 수 없습니다.

---

## AI 안티패턴 금지

Claude에게 다음 요청은 금지되며, 감지 시 경고 후 대안이 제시됩니다:

- `push --force`, `reset --hard`, `--no-verify` 등 위험 명령 요청
- 프롬프트에 비밀번호, API Key, 개인정보 포함
- `.env` 파일 내용 공유 또는 커밋 요청
- 파일 전체 재작성 요청 (부분 수정으로 대체)

---

## 로컬 오버라이드

개인 개발 환경에 맞는 설정이 필요하면 프로젝트 루트에 `CLAUDE.local.md`를 생성하세요.

- `CLAUDE.local.md`와 `.claude/settings.local.json`은 `.gitignore`에 포함되어 커밋되지 않음
- 보안 규칙 및 핵심 품질 규칙은 오버라이드 불가
- 작성 가이드: 표준 저장소의 `templates/claude-local-template.md` 참고

---

## 트러블슈팅

### 빌드 오류 시
```bash
rm -rf dist node_modules
[pnpm install]
[pnpm build]
```

### 모듈 오류 시
```bash
rm -rf node_modules [apps/*/node_modules packages/*/node_modules]
[pnpm install]
```

---

> **참고**: JINHAK 전사 AI 개발 표준은 이 프로젝트의 메타 정보(`jinhak_standard_repo`)에 기록된 저장소를 참조하세요.
>
> 세션 시작 시(`/session-start`) 표준 버전이 자동으로 체크되며, 업데이트가 있으면 안내됩니다.
