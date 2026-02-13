# JINHAK 전사 AI 개발 표준 v1.8

이 문서는 JINHAK의 모든 프로젝트에서 AI(Claude Code / Claude.ai)와 협업할 때 따라야 하는 전사 표준입니다.

---

## 응답 언어

**모든 응답은 한글로 작성합니다.**

---

## 1. 회사 기술 스택 개요

### 프론트엔드
| 항목 | 표준 기술 |
|------|----------|
| 프레임워크 | React 18+ / Next.js |
| 빌드 도구 | Vite |
| 언어 | JavaScript (JSX) 또는 TypeScript (TSX) |
| 상태관리 | Zustand |
| 라우팅 | React Router v6 / Next.js App Router |
| 스타일링 | Tailwind CSS + CVA (Class Variance Authority) |
| 아이콘 | Lucide React |

### 백엔드
| 항목 | 표준 기술 |
|------|----------|
| 런타임 | Node.js 20+ |
| 언어 | TypeScript (strict mode) |
| 프레임워크 | Express / Fastify / NestJS |
| ORM | Prisma / Drizzle |
| API 문서 | Swagger / OpenAPI |

### 데이터베이스
| 조건 | 표준 DB |
|------|---------|
| 신규 프로젝트 | PostgreSQL |
| 대형 프로젝트 또는 기존 프로젝트 | MSSQL (SQL Server) |

### 보안/인프라
| 항목 | 표준 기술 |
|------|----------|
| 비밀키 관리 | **Vault** (모든 Private Key, 인증 정보, API Key 등) |
| 버전관리 | Git (GitHub) |
| CI/CD | GitHub Actions |
| 컨테이너 | Docker |
| 모니터링 | 프로젝트별 선택 |

---

## 2. AI 협업 핵심 원칙

### 2.1 프로젝트 설정 필수 구조

모든 프로젝트는 AI와의 효과적인 협업을 위해 다음 구조를 갖추어야 합니다.

```
프로젝트루트/
├── CLAUDE.md              # Claude Code 메인 설정 파일 (필수)
├── CLAUDE.local.md        # 로컬 개발자 설정 (git 제외, 선택사항)
├── .claude/               # Claude Code 설정 폴더
│   ├── settings.json      # 권한, 환경변수, 훅 설정
│   ├── scripts/           # Hook 실행 스크립트
│   │   └── session-briefing.js  # 세션 시작 시 자동 브리핑
│   └── skills/            # 슬래시 명령어 (Skills) 정의
│       ├── apply-standard/SKILL.md  # 표준 적용/업데이트
│       ├── commit/SKILL.md          # 커밋 생성
│       ├── review-pr/SKILL.md       # PR 리뷰
│       ├── session-start/SKILL.md   # 세션 시작
│       └── test/SKILL.md            # 테스트 실행
└── .ai/                   # 프로젝트 문서화 폴더
    ├── SESSION_LOG.md     # 세션별 작업 기록
    ├── CURRENT_SPRINT.md  # 현재 진행/대기 작업 현황
    ├── DECISIONS.md       # 기술 의사결정 기록 (ADR)
    ├── ARCHITECTURE.md    # 시스템 아키텍처 문서
    └── CONVENTIONS.md     # 코딩 컨벤션
```

#### 2.1.1 CLAUDE.local.md 오버라이드

`CLAUDE.local.md`는 개인 개발자가 로컬 환경에 맞게 Claude Code 동작을 조정하기 위한 파일입니다.

**오버라이드 우선순위:**
```
CLAUDE.md (전사 표준) < 프로젝트 CLAUDE.md < CLAUDE.local.md
```

**규칙:**
- `.gitignore`에 반드시 포함 (커밋 금지): `CLAUDE.local.md`, `.claude/settings.local.json`
- 보안 규칙 및 핵심 품질 규칙은 오버라이드 불가 (보안 정책, `any` 타입, `console.log` 등)
- 로컬 환경 정보, 개인 작업 스타일, 실험적 규칙 등을 기록
- 상세 가이드: [templates/claude-local-template.md](./templates/claude-local-template.md)

### 2.2 세션 관리 규칙

> **Agent Memory 활용**: Claude Code는 `memory: project` 설정을 통해 프로젝트별 메모리를 자동으로 기록/회상합니다. `.ai/` 파일은 Agent Memory의 보조 수단으로, 팀원 간 공유와 Git 추적이 필요한 핵심 사항만 기록합니다.

**세션 시작 시:**
1. `.ai/CURRENT_SPRINT.md` 읽어 진행 중인 작업 파악
2. `.ai/SESSION_LOG.md`에서 최근 작업 확인 (필요 시)

**작업 완료 후 (필수):**
1. `.ai/CURRENT_SPRINT.md` 진행 상태 업데이트
2. 중요 기술 결정 시 `.ai/DECISIONS.md` 업데이트
3. `.ai/SESSION_LOG.md`에 요약 기록 (핵심 변경사항 위주)

**SESSION_LOG.md 기록 형식:**
```markdown
## YYYY-MM-DD

### 세션 작업 요약
- 작업 1 설명
- 작업 2 설명

### 주요 변경
- `파일경로` - 변경 내용

### 커밋
- `해시` 커밋 메시지
```

### 2.3 AI에게 기대하는 행동

1. **코드를 읽기 전에 수정하지 않는다** - 반드시 기존 코드를 먼저 이해한 후 변경 제안
2. **과도한 엔지니어링을 피한다** - 요청된 범위 내에서만 작업, 불필요한 추상화 금지
3. **보안을 최우선으로 한다** - XSS, SQL Injection, 커맨드 인젝션 등 OWASP Top 10 취약점 방지
4. **기존 패턴을 따른다** - 프로젝트의 기존 컨벤션과 패턴을 존중
5. **한국어로 소통한다** - 모든 응답, 주석 설명, 커밋 메시지는 한국어 사용

### 2.4 AI 안티패턴 자동 감지

Claude는 다음 안티패턴을 감지하면 **즉시 경고하고 대안을 제시**해야 합니다.

| 분류 | 안티패턴 | Claude 대응 |
|------|---------|------------|
| 위험한 요청 | `push --force`, `reset --hard`, `--no-verify` 등 위험 명령 | 실행 거부 + 안전한 대안 제시 |
| 위험한 요청 | 프로덕션 DB 직접 조작 요청 | 거부 + 스테이징 환경 사용 안내 |
| 민감 정보 노출 | 프롬프트에 비밀번호, API Key, 개인정보 포함 | 경고 + 마스킹/가명화 요청 |
| 민감 정보 노출 | `.env` 파일 내용 공유 요청 | 거부 + Vault 사용 안내 |
| 품질 저하 | "전체를 처음부터 다시 작성해줘" | 부분 수정 제안 |
| 품질 저하 | 순차 의존성 있는 5개 이상 기능 동시 요청 | 단계별 분할 제안 (독립 작업은 Agent Teams 활용 가능) |

**3중 방어 구조:**

1. **CLAUDE.md 규칙 (자연어 감지)**: 이 테이블을 기반으로 프롬프트 해석 시 안티패턴을 감지하여 경고 + 대안 제시
2. **settings.json deny 규칙 (하드 블로킹)**: `--no-verify`, `push --force` 등 위험 명령어 물리적 차단
3. **hooks 보조 경고 (소프트 알림)**: PreToolUse hook으로 파일 수정 전 보안 경고 주입

> 상세 안티패턴 목록과 대화 예시는 [VIBE_CODING_GUIDE.md](./VIBE_CODING_GUIDE.md) 섹션 6.4~6.5를 참조하세요.

### 2.5 Hook 크로스 플랫폼 원칙

**모든 Hook 명령은 Node.js 기반으로 작성**하여 OS(Windows/macOS/Linux)에 관계없이 동일하게 동작하도록 합니다. Claude Code는 Node.js를 필수 의존성으로 요구하므로, `node` 명령은 모든 환경에서 사용 가능합니다.

**필수 규칙:**
- Hook command는 `node` 또는 `node -e` 로 시작할 것
- `echo`, `cat`, `head`, `sed`, `powershell` 등 OS 종속 명령을 Hook에서 사용하지 말 것
- 출력 리다이렉션(`> nul`, `2>/dev/null`) 대신 Node.js 내부에서 에러를 처리할 것
- 파일 경로는 `path.join()`으로 생성하고 슬래시(`/`)로 통일할 것

**Windows `nul` 파일 방지:**
- `> nul`, `2>nul` 사용 금지 (예약 디바이스 이름 충돌로 `nul` 파일 생성)
- `settings.local.json`의 PostToolUse Hook으로 도구 실행 후 `nul` 파일 자동 삭제

### 2.6 Windows 개발 환경 규칙

JINHAK 개발팀은 주로 Windows 환경에서 Claude Code를 사용합니다. Windows 환경에서 자주 실패하는 명령과 대체 방법을 숙지하세요.

**개발 환경:**
- OS: Windows (PowerShell / Git Bash)
- 쉘: Git Bash (MINGW64) 사용
- 경로 형식: `/d/Apply/...` 대신 `D:/Apply/...` 또는 `//d/Apply/...` 사용

#### 2.6.1 경로 규칙

| 금지 | 사용 | 이유 |
|------|------|------|
| `cd /d/path` | `cd D:/Apply/path` | MSYS 경로는 일부 도구에서 인식 불가 |
| `C:\Users\name\file` | `C:/Users/name/file` | 백슬래시는 이스케이프 문자로 해석될 수 있음 |
| 따옴표 없는 한글/공백 경로 | `"D:/프로젝트/My App"` | 공백/한글 경로는 반드시 따옴표로 감싸기 |
| `/tmp/some-path` | `$TEMP/some-path` 또는 `os.tmpdir()` | Windows에 `/tmp/` 경로 없음 |

#### 2.6.2 명령어 호환성

**Windows에서 실패하는 Unix 명령과 대체 방법:**

| Unix 명령 | Windows 대체 (Git Bash) | Windows 대체 (PowerShell) | 비고 |
|-----------|------------------------|--------------------------|------|
| `cat file` | `cat file` (사용 가능) | `Get-Content file` | Git Bash에서는 동작 |
| `head -n 10` | `head -n 10` (사용 가능) | `Get-Content -Head 10` | Git Bash에서는 동작 |
| `tail -n 10` | `tail -n 10` (사용 가능) | `Get-Content -Tail 10` | Git Bash에서는 동작 |
| `grep pattern` | `grep pattern` | `Select-String -Pattern pattern` | 명시적으로 구분 |
| `touch file` | `touch file` (사용 가능) | `New-Item file -ItemType File` | |
| `rm -rf dir` | 사용 금지 (deny 규칙) | `Remove-Item -Recurse -Force` | deny로 차단됨 |
| `chmod +x file` | 무시됨 (효과 없음) | - | Windows에서 실행 권한 불필요 |
| `which command` | `which command` | `Get-Command command` | |
| `ln -s target link` | 관리자 권한 필요 | `New-Item -ItemType SymbolicLink` | 심볼릭 링크 제한 |
| `sed 's/a/b/g'` | `sed 's/a/b/g'` (Git Bash) | - | PowerShell에서 사용 불가 |
| `awk '{print $1}'` | `awk '{print $1}'` (Git Bash) | - | PowerShell에서 사용 불가 |
| `wc -l file` | `wc -l file` (Git Bash) | `(Get-Content file).Count` | |
| `mktemp` | `mktemp` (Git Bash) | `[System.IO.Path]::GetTempFileName()` | |
| `xargs` | `xargs` (Git Bash) | `ForEach-Object` | |
| `2>/dev/null` | `2>/dev/null` (Git Bash) | `2>$null` 또는 `-ErrorAction SilentlyContinue` | Git Bash에서만 사용 |

#### 2.6.3 명령 체이닝 규칙

```bash
# 금지: && 체이닝 시 경로 형식 혼용
cd /d/Apply && npm install

# 권장: 각 명령이 독립적으로 실행 가능한지 확인
cd D:/Apply && npm install

# 금지: PowerShell 5.x에서 && 사용 (7.0+ 에서만 지원)
Get-ChildItem && Write-Host "done"

# 권장: PowerShell에서는 ; 또는 별도 명령 사용
Get-ChildItem; Write-Host "done"
```

#### 2.6.4 자주 발생하는 Windows 실패 패턴

| 실패 패턴 | 원인 | 해결 방법 |
|-----------|------|----------|
| `ENOENT: no such file or directory` | 백슬래시 경로 또는 MSYS 경로 사용 | 슬래시(`/`) 경로로 통일 |
| `nul` 파일 생성 | `> nul` 리다이렉션 사용 | `> /dev/null 2>&1` 사용 (Git Bash) |
| `Permission denied` | 파일이 다른 프로세스에 의해 잠김 | 에디터/서버 종료 후 재시도 |
| `EPERM: operation not permitted` | 심볼릭 링크 생성 시 관리자 권한 부족 | 관리자 권한 터미널 사용 또는 복사로 대체 |
| `'command' is not recognized` | Unix 전용 명령 사용 | Git Bash에서 실행하거나 PowerShell 대체 명령 사용 |
| `line ending` 경고 | CRLF/LF 불일치 | `.gitattributes`에 `* text=auto` 설정 |
| `The filename, directory name, or volume label syntax is incorrect` | 경로에 특수문자 또는 예약어 포함 | 경로 따옴표 감싸기, 예약어(`con`, `nul`, `aux`) 회피 |
| `ENAMETOOLONG` | `node_modules` 등 깊은 경로 | 프로젝트를 드라이브 루트에 가깝게 배치 |

#### 2.6.5 환경 변수

```bash
# Git Bash
export NODE_ENV=production
echo $NODE_ENV

# PowerShell
$env:NODE_ENV = "production"
echo $env:NODE_ENV

# 크로스 플랫폼 (package.json scripts)
# cross-env 패키지 사용 권장
"scripts": {
  "build": "cross-env NODE_ENV=production node build.js"
}
```

---

## 3. 코드 품질 기준

### 3.1 필수 준수 사항

- **단일 책임 원칙**: 한 컴포넌트/함수는 한 가지 일만 수행
- **DRY 원칙**: 3회 이상 반복되는 코드는 공통 모듈로 추출
- **네이밍**: 의도가 드러나는 명확한 이름 사용 (축약어 지양)
- **에러 처리**: 시스템 경계(사용자 입력, 외부 API)에서만 검증, 내부 코드는 프레임워크 보장을 신뢰
- **비밀정보 관리**: 모든 Private Key, API Key, 인증 정보는 **Vault**를 통해 관리. `.env` 파일은 절대 커밋 금지
- **ISMS 보안 준수**: 개인정보 보호, 접근 통제, 감사 로깅, 암호화 규칙은 [SECURITY_ISMS.md](./SECURITY_ISMS.md) 참조

### 3.2 금지 사항

```
- any 타입 사용 금지 (TypeScript 프로젝트)
- console.log 프로덕션 코드 사용 금지
- 하드코딩된 URL/포트/비밀키 사용 금지
- 미사용 import/변수 방치 금지
- 주석 처리된 코드 방치 금지
```

### 3.3 네이밍 컨벤션 (공통)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `DashboardLayout.jsx` |
| 컴포넌트명 | PascalCase | `DashboardGrid` |
| 함수/변수 | camelCase | `setViewMode`, `handleSubmit` |
| 상수 | UPPER_SNAKE_CASE | `STORAGE_KEY`, `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `ApiResponse` |
| 훅 | camelCase + use 접두사 | `useAuth`, `useDashboard` |
| 스토어 파일 | camelCase + Store | `dashboardStore.js` |
| CSS 클래스 | Tailwind (kebab-case) | `bg-primary text-white` |
| ID 값 | prefix + 고유값 | `dept-001`, `user-ceo` |

---

## 4. Git 커밋 규칙

### 4.1 커밋 메시지 형식

```
<type>: <subject>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 4.2 Type 분류

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: 사용자 프로필 페이지 추가` |
| `fix` | 버그 수정 | `fix: 로그인 토큰 만료 처리 오류 수정` |
| `docs` | 문서 변경 | `docs: API 문서 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style: 들여쓰기 통일` |
| `refactor` | 리팩토링 | `refactor: 인증 로직 모듈 분리` |
| `test` | 테스트 추가/수정 | `test: 사용자 서비스 단위 테스트 추가` |
| `chore` | 빌드/설정 변경 | `chore: ESLint 규칙 업데이트` |

### 4.3 Git 안전 프로토콜

**절대 하지 말아야 할 것:**
- `git config` 직접 수정 금지
- `git push --force` 금지 (특히 main/master)
- `git reset --hard` 금지 (명시적 요청 없이)
- `--no-verify` 등 hooks 스킵 금지
- `.env`, `credentials.json` 등 시크릿 파일 커밋 금지

**커밋 생성 절차:**
1. `git status`로 변경 파일 확인
2. `git diff`로 변경 내용 분석
3. `git log --oneline -5`로 최근 커밋 스타일 확인
4. 관련 파일만 개별 스테이징 (`git add -A` 지양)
5. HEREDOC 형식으로 커밋 메시지 작성
6. `git status`로 커밋 성공 확인

**pre-commit hook 실패 시:**
- 문제 해결 후 **새 커밋** 생성 (amend 금지)

---

## 5. HTTP API 규칙

> **중요: GET, POST만 사용**

| Method | 용도 | 비고 |
|--------|------|------|
| `GET` | 데이터 조회 | 쿼리 파라미터로 필터링 |
| `POST` | 생성, 수정, 삭제 | `action` 필드로 동작 구분 |

```javascript
// PATCH, PUT, DELETE는 사용하지 않음
// POST + action 패턴으로 대체
POST /api/users
body: { action: 'create', data: {...} }
body: { action: 'update', id: '123', data: {...} }
body: { action: 'delete', id: '123' }
```

---

## 6. Claude Code 설정

### 6.1 Hooks 시스템

`.claude/settings.json`에서 이벤트 기반 자동화를 설정합니다.

**사용 가능한 Hook 이벤트:**

| 이벤트 | 설명 | 주요 변수 | 비고 |
|--------|------|----------|------|
| `UserPromptSubmit` | 사용자 프롬프트 제출 시 | - | `once: true`로 세션 1회 실행 가능 |
| `PreToolUse` | 도구 실행 전 | `${tool}`, `${command}`, `${file}` | `additionalContext` 반환 지원 |
| `PostToolUse` | 도구 실행 후 | `${tool}`, `${file}` | |
| `Stop` | Claude 응답 완료 시 | - | 세션 기록 자동화에 활용 |
| `SubagentStart` | 서브에이전트 생성 시 | - | 보안 규칙 전파에 활용 (v1.3) |
| `TaskCompleted` | Task 완료 시 | - | 작업 추적/알림에 활용 (v1.3) |
| `TeammateIdle` | Agent Teams 팀원 유휴 시 | - | 팀 워크플로우 조정 (v1.3) |

**Hook 옵션:**
- `once: true` - 세션 중 1회만 실행 (반복 실행 방지, 토큰 절약)
- `additionalContext` - PreToolUse에서 추가 컨텍스트를 반환하여 도구 실행에 영향

**설정 예시:**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/session-briefing.js",
            "once": true
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx eslint --fix ${file} 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

> Hook은 Node.js 기반으로 OS에 무관하게 동작합니다. 세션 브리핑, 보안 경고 등 모든 Hook command가 `node`로 시작하도록 작성하세요.

### 6.1.1 글로벌 Hook (자동 표준 감지)

개발자의 `~/.claude/settings.json`에 글로벌 Hook을 설치하면, **모든 프로젝트**에서 Claude Code 세션 시작 시 JINHAK 표준 적용 여부가 자동 감지됩니다.

**설치 방법:**
```bash
# 표준 저장소를 클론한 뒤 설치 스크립트 실행
node /tmp/jinhak-standards/scripts/install-global-hook.js

# 제거
node /tmp/jinhak-standards/scripts/install-global-hook.js --remove
```

**동작 방식:**
| 상황 | Claude에게 전달되는 컨텍스트 |
|------|---------------------------|
| CLAUDE.md 없음 | `[JINHAK 표준 미적용]` → `/apply-standard` 안내 |
| CLAUDE.md 있으나 메타정보 없음 | `[JINHAK 표준 미적용]` → `/apply-standard` 안내 |
| 표준 적용됨 (버전 감지) | `[JINHAK 표준 v{버전} 감지]` → `/session-start` 안내 |

- `once: true`로 세션당 1회만 실행 (토큰 절약)
- 기존 `~/.claude/settings.json` 설정을 보존하며 추가
- 팀원 온보딩 시 1회 설치하면 이후 모든 프로젝트에서 자동 동작

### 6.2 Skills (슬래시 명령어)

`.claude/skills/` 디렉토리에 반복 작업을 자동화하는 명령어를 정의합니다.

```
.claude/skills/
├── apply-standard/SKILL.md  # /apply-standard - JINHAK 표준 적용/업데이트
├── commit/SKILL.md           # /commit - 커밋 생성
├── review-pr/SKILL.md        # /review-pr - PR 리뷰
├── session-start/SKILL.md    # /session-start - 세션 시작
└── test/SKILL.md             # /test - 테스트 실행
```

| 명령어 | 용도 |
|--------|------|
| `/apply-standard` | 이 표준을 프로젝트에 적용하거나 업데이트 |
| `/session-start` | 세션 시작, 이전 작업 확인, 표준 버전 체크 |
| `/commit` | 변경사항 분석 후 표준에 맞는 커밋 생성 |
| `/review-pr <번호>` | PR을 표준 기준으로 리뷰 |
| `/test` | 테스트 실행 및 결과 분석 |

### 6.3 권한 설정

**권한 강제 메커니즘:**

| 규칙 | 동작 | 강제 여부 |
|------|------|----------|
| `deny` | 해당 명령을 물리적으로 차단 | **프로젝트 전체 강제** - `settings.local.json`이나 `~/.claude/settings.json`으로 우회 불가 |
| `allow` | 해당 명령을 자동 승인 (매번 확인 불필요) | 편의 설정 - 로컬에서 조정 가능 |

> **중요**: `.claude/settings.json`의 `deny` 규칙은 프로젝트에 참여하는 **모든 Claude Code 사용자에게 강제 적용**됩니다. 개인 설정(`settings.local.json`)이나 글로벌 설정(`~/.claude/settings.json`)으로 우회할 수 없으므로, 위험 명령 차단에 가장 확실한 방법입니다.

**표준 권한 설정:**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(pnpm *)",
      "Bash(npx *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git * commit *)",
      "Bash(git commit *)",
      "Bash(git * push *)",
      "Bash(git push *)",
      "Bash(git checkout *)",
      "Bash(git branch *)",
      "Bash(git fetch *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Read", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git clean -f*)",
      "Bash(git config *)",
      "Bash(*--no-verify*)"
    ]
  }
}
```

**deny 규칙 설명:**

| deny 규칙 | 차단 대상 | 이유 |
|-----------|----------|------|
| `rm -rf *` | 재귀 강제 삭제 | 복구 불가능한 파일 손실 |
| `git push --force*` | 강제 푸시 | 원격 히스토리 덮어쓰기, 팀원 작업 손실 |
| `git reset --hard*` | 하드 리셋 | 커밋되지 않은 변경사항 영구 삭제 |
| `git clean -f*` | 추적되지 않는 파일 강제 삭제 | 의도치 않은 파일 삭제 |
| `git config *` | Git 설정 변경 | 사용자 정보, hooks 경로 등 임의 변경 방지 |
| `*--no-verify*` | Hook 건너뛰기 | pre-commit, pre-push 등 품질 검증 우회 방지 |

> `git push *`는 allow에 포함되어 있지만, `git push --force*`는 deny에 있으므로 일반 push는 허용되고 force push만 차단됩니다. **deny가 allow보다 우선**합니다.

### 6.4 Agent Teams (멀티 에이전트 협업)

> Claude Code v2.1.32+에서 **연구 미리보기**로 제공됩니다.

여러 에이전트를 팀으로 구성하여 병렬 작업을 수행할 수 있습니다.

**활성화:**
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**적합한 작업:**
- 코드베이스 전체 리뷰 (독립적인 파일/모듈별 분석)
- 다중 파일 동시 분석/검색
- 독립적인 기능의 병렬 구현
- 대규모 리팩토링의 사전 조사

**부적합한 작업:**
- 순차 의존성이 높은 작업 (A 결과가 B 입력이 되는 경우)
- 같은 파일을 동시에 수정하는 작업
- 단일 파일의 간단한 수정

**팀원 전환:** `Shift+Up/Down` 또는 tmux로 서브에이전트 직접 제어 가능

### 6.5 Adaptive Thinking & Effort 설정

Opus 4.6은 문맥 신호를 감지하여 추론 깊이를 자동 조절하는 **Adaptive Thinking**을 지원합니다.

**Effort 4단계:**

| Effort | 용도 | 비용/속도 |
|--------|------|----------|
| `low` | 간단한 포맷팅, 이름 변경, 오타 수정 | 최저 비용, 최고 속도 |
| `medium` | 일반 CRUD 구현, 단순 컴포넌트 작업 | 균형 |
| `high` (기본) | 복잡한 비즈니스 로직, 버그 분석 | 높은 품질 |
| `max` | 아키텍처 설계, 보안 감사, 복잡한 알고리즘 | 최고 품질 |

> 기본값은 `high`이며, 대부분의 작업에 적합합니다. `max`는 비용이 높으므로 핵심 설계/보안 작업에만 사용하세요.

### 6.6 컨텍스트 & 출력 사양

| 항목 | Opus 4.6 사양 | 활용 |
|------|--------------|------|
| 컨텍스트 윈도우 | **1M 토큰** (100만) | 대규모 코드베이스를 한 세션에서 분석 가능 |
| 최대 출력 | **128K 토큰** | 대규모 코드 생성을 분할 없이 처리 |
| Context Compaction | 자동 문맥 압축 | 장시간 세션에서 이전 대화를 자동 요약 |

**활용 가이드:**
- 1M 컨텍스트로 프로젝트 전체 구조를 한 번에 파악 가능 → 세션 초반에 주요 파일을 한꺼번에 읽기
- 128K 출력으로 대규모 리팩토링이나 전체 모듈 생성을 한 번에 요청 가능
- 장시간 세션 시 Context Compaction이 자동 작동하여 컨텍스트 초과 방지

### 6.7 Plan 모드 & Task 관리

**Plan 모드:**
복잡한 구현 전에 Plan 모드를 활용하여 설계를 먼저 검토합니다.
- 3개 이상 파일 수정이 예상되는 작업
- 아키텍처 결정이 필요한 신규 기능
- `.ai/DECISIONS.md`에 기록할 수준의 기술 결정

**Task 관리 시스템:**
Claude Code 내장 Task 시스템으로 복잡한 작업을 추적합니다.
- 종속성 추적: 작업 간 선후 관계 설정
- `.ai/CURRENT_SPRINT.md`와 연계하여 진행 상황 관리
- `--from-pr` 옵션으로 PR 기반 세션 직접 재개 가능

---

## 7. 표준 적용 프로세스

### 7.1 다른 프로젝트에 이 표준을 적용하는 방법

**방법 1: 빠른 적용 프롬프트 (권장)**

[QUICK_START_PROMPT.md](./QUICK_START_PROMPT.md)의 프롬프트를 Claude Code에 복사-붙여넣기합니다. 표준 레포를 로컬에 클론한 뒤 자동으로 적용됩니다.

**방법 2: URL 전달 방식**

사용자가 이 저장소의 URL을 제공하며 "여기를 참고해서 프로젝트에 적용해줘"라고 요청하면, 다음 절차를 따릅니다:

0. **표준 저장소 로컬 클론**: `git clone`으로 `/tmp/jinhak-standards`에 전체 다운로드 (이미 있으면 `git pull`로 최신화)
1. **현재 프로젝트 분석**: package.json, tsconfig.json 등을 읽어 기술 스택을 파악합니다.
2. **표준 적용**: `/apply-standard` 스킬의 절차에 따라 로컬 파일을 참고하여 생성/수정합니다.
3. **결과 보고**: 생성/수정된 파일 목록과 다음 단계를 안내합니다.

> Claude Code에서 `/apply-standard` 명령을 사용하면 이 과정이 자동으로 실행됩니다.
> `/tmp/jinhak-standards`는 참고용일 뿐, 현재 프로젝트의 git에 포함시키지 않습니다.

### 7.2 버전 추적

각 프로젝트의 CLAUDE.md에 다음 메타 정보가 HTML 주석으로 포함됩니다:

```html
<!-- jinhak_standard_version: 1.3 -->
<!-- jinhak_standard_repo: [저장소 URL] -->
<!-- applied_date: 2026-02-06 -->
```

**세션 시작 시 (`/session-start`):**
1. 프로젝트 CLAUDE.md의 `jinhak_standard_version` 확인
2. 표준 저장소의 CHANGELOG.md에서 최신 버전 확인
3. 업데이트가 있으면 변경 내역을 요약하여 사용자에게 안내
4. 사용자 승인 시 업데이트 적용

### 7.3 기존 프로젝트 업데이트

이미 표준이 적용된 프로젝트에서 표준 버전이 올라간 경우:

1. CHANGELOG.md에서 현재 버전과 최신 버전 사이의 변경 사항 확인
2. 변경 사항을 사용자에게 요약 보고
3. 승인 후 다음을 업데이트:
   - CLAUDE.md의 변경된 규칙 반영
   - 새로 추가된 스킬 파일 복사
   - settings.json 규칙 업데이트
   - `jinhak_standard_version` 메타 정보 업데이트

---

## 8. 날짜 및 데이터 형식

```javascript
// 날짜: ISO 형식 또는 YYYY-MM-DD
{
  createdAt: '2024-01-15',
  updatedAt: new Date().toISOString().split('T')[0],
}

// ID: prefix + 고유값
{
  id: 'dept-001',
  userId: 'user-ceo',
  goalId: 'goal-2024-001',
}

// 통화: Intl.NumberFormat 사용
new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
}).format(amount)
```

---

## 9. 상세 문서 참조

이 문서는 핵심 원칙만 다룹니다. 상세한 가이드는 아래 문서를 참조하세요.

| 문서 | 내용 |
|------|------|
| [QUICK_START_PROMPT.md](./QUICK_START_PROMPT.md) | 빠른 적용 프롬프트 (복사-붙여넣기용) |
| [CODING_CONVENTIONS.md](./CODING_CONVENTIONS.md) | 코딩 컨벤션 상세 가이드 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 아키텍처 원칙 및 패턴 |
| [VIBE_CODING_GUIDE.md](./VIBE_CODING_GUIDE.md) | 바이브 코딩 방법론 |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 표준 프로젝트 구조 |
| [templates/project-claude.md](./templates/project-claude.md) | 개별 프로젝트용 CLAUDE.md 템플릿 |
| [templates/component-template.md](./templates/component-template.md) | 컴포넌트 생성 템플릿 |
| [templates/ai-folder-templates.md](./templates/ai-folder-templates.md) | .ai/ 폴더 파일 초기 템플릿 |
| [templates/claude-local-template.md](./templates/claude-local-template.md) | CLAUDE.local.md 가이드 및 템플릿 |
| [SECURITY_ISMS.md](./SECURITY_ISMS.md) | ISMS 보안 가이드 (AI 개발) |
| [CHANGELOG.md](./CHANGELOG.md) | 버전별 변경 이력 |

---

## 10. 빠른 시작 체크리스트

새 프로젝트에서 AI 개발 환경을 설정할 때:

**글로벌 Hook 설치 (최초 1회, 권장):**
```bash
node /tmp/jinhak-standards/scripts/install-global-hook.js
```
> 설치 후 모든 프로젝트에서 Claude Code 시작 시 표준 적용 여부가 자동 감지됩니다.

**자동 적용 (권장):**
1. [QUICK_START_PROMPT.md](./QUICK_START_PROMPT.md)의 프롬프트를 Claude Code에 복사-붙여넣기 (가장 빠름)
2. 또는 이 표준 저장소 URL을 주며 "적용해줘"라고 요청
3. 또는 `/apply-standard` 실행

**수동 적용:**
- [ ] `CLAUDE.md` 생성 (templates/project-claude.md 참고, 메타 정보 포함)
- [ ] `.ai/` 폴더 및 하위 문서 생성 (SESSION_LOG, CURRENT_SPRINT, DECISIONS, ARCHITECTURE, CONVENTIONS)
- [ ] `.claude/settings.json` 생성 (권한, hooks, deny 규칙 포함)
- [ ] `.claude/skills/` 스킬 파일 생성 (commit, review-pr, session-start, test)
- [ ] `.gitignore`에 `CLAUDE.local.md`, `.claude/settings.local.json`, `.env`, `*vibecoding-ref/` 추가
- [ ] `CLAUDE.local.md` 필요 시 생성 (templates/claude-local-template.md 참고)
- [ ] ISMS 보안 체크리스트 확인 (SECURITY_ISMS.md 섹션 8)
- [ ] 팀원에게 이 표준 문서 공유

---

## 부록: 이 표준의 기여 방법

이 표준은 GitHub Public Repo(https://github.com/JinhakStandard/ai-vibecoding)에서 관리됩니다.

1. 개선 사항이 있으면 PR로 제출
2. PR 제목 형식: `docs: [변경 내용 요약]`
3. 변경 이유를 PR 설명에 명시
4. 최소 1명의 리뷰어 승인 후 머지

---

*마지막 업데이트: 2026-02*
*버전: 1.8*
