# JINHAK 표준 프로젝트 구조

이 문서는 JINHAK 프로젝트의 표준 디렉토리 구조와 파일 배치 규칙을 정의합니다.

---

## 1. 프로젝트 루트 구조

모든 JINHAK 프로젝트는 다음 루트 구조를 따릅니다.

```
project-root/
├── CLAUDE.md                    # [필수] AI 메인 설정 파일
├── .claude/                     # [필수] Claude Code 설정
│   ├── settings.json            #   권한, hooks 설정
│   └── skills/                  #   슬래시 명령어
│       ├── commit/SKILL.md
│       └── review-pr/SKILL.md
├── .ai/                         # [필수] 프로젝트 문서화
│   ├── SESSION_LOG.md           #   세션별 작업 기록
│   ├── CURRENT_SPRINT.md        #   현재 작업 현황
│   ├── DECISIONS.md             #   기술 의사결정 (ADR)
│   ├── ARCHITECTURE.md          #   시스템 아키텍처
│   └── CONVENTIONS.md           #   코딩 컨벤션
├── .gitignore                   # Git 무시 파일
├── package.json                 # 루트 패키지 설정
├── pnpm-workspace.yaml          # 워크스페이스 설정 (모노레포)
└── README.md                    # 프로젝트 소개
```

---

## 2. 프론트엔드 프로젝트

> **표준 기술**: React / Next.js + Vite

### 2.1 전체 구조

```
project-root/
├── src/
│   ├── components/              # 컴포넌트
│   │   ├── ui/                  #   기본 UI (Button, Card, Dialog 등)
│   │   ├── common/              #   공통 (PageHeader, DataTable)
│   │   ├── layout/              #   레이아웃 (Header, Sidebar)
│   │   ├── widgets/             #   대시보드 위젯
│   │   └── [도메인]/            #   도메인별 컴포넌트
│   ├── pages/                   # 페이지 컴포넌트
│   │   ├── [역할]/              #   역할별 페이지
│   │   └── shared/              #   공유 페이지
│   ├── stores/                  # Zustand 스토어
│   │   ├── authStore.js
│   │   ├── dashboardStore.js
│   │   └── [도메인]Store.js
│   ├── data/                    # 상수, 모의 데이터
│   │   ├── constants.js         #   상수 정의
│   │   └── [도메인].js          #   도메인 데이터
│   ├── hooks/                   # 커스텀 훅
│   │   └── useAuth.js
│   ├── lib/                     # 유틸리티
│   │   └── utils.js             #   cn() 등
│   ├── App.jsx                  # 메인 앱 (라우팅)
│   └── main.jsx                 # 진입점
├── public/                      # 정적 파일
├── tailwind.config.js           # Tailwind 설정
├── vite.config.js               # Vite 설정
└── package.json
```

> **모노레포가 필요한 경우** pnpm workspace를 사용하여 `packages/`, `apps/` 구조로 확장합니다. 프로젝트 CLAUDE.md에 모노레포 구조를 명시하세요.

### 2.2 각 폴더의 역할

| 폴더 | 역할 | 파일 예시 |
|------|------|----------|
| `src/components/ui/` | 재사용 기본 UI 컴포넌트 | Button, Card, Dialog |
| `src/components/common/` | 앱 내 공통 컴포넌트 | PageHeader, SearchBar |
| `src/components/layout/` | 레이아웃 관련 컴포넌트 | DashboardLayout, Sidebar |
| `src/components/widgets/` | 대시보드 위젯 | StatCard, ChartWidget |
| `src/components/[도메인]/` | 특정 도메인 컴포넌트 | GoalCard, OrgChartNode |
| `src/pages/` | URL에 대응하는 페이지 | DeveloperDashboard |
| `src/stores/` | Zustand 상태 관리 | goalStore, authStore |
| `src/data/` | 상수, 모의 데이터 | constants, organizations |
| `src/hooks/` | 커스텀 React 훅 | useAuth, useMediaQuery |
| `src/lib/` | 유틸리티 함수 | utils (cn), formatDate |

### 2.3 파일 배치 규칙

**새 파일을 어디에 놓을지 결정하는 흐름:**

```
Q: 이 컴포넌트가 여러 프로젝트에서 재사용 가능한가?
├─ Yes → src/components/ui/ (또는 공유 UI 패키지)
└─ No
    Q: 이 컴포넌트가 여러 페이지에서 사용되는가?
    ├─ Yes
    │   Q: 레이아웃 관련인가?
    │   ├─ Yes → apps/[앱]/src/components/layout/
    │   └─ No  → apps/[앱]/src/components/common/
    └─ No
        Q: 특정 도메인에 속하는가?
        ├─ Yes → apps/[앱]/src/components/[도메인]/
        └─ No  → 해당 페이지 파일 내에 인라인 정의
```

---

## 3. 백엔드 프로젝트

### 3.1 전체 구조

```
project-root/
├── src/
│   ├── controllers/             # HTTP 요청 처리
│   │   ├── userController.ts
│   │   └── goalController.ts
│   ├── services/                # 비즈니스 로직
│   │   ├── userService.ts
│   │   └── goalService.ts
│   ├── repositories/            # 데이터 접근
│   │   ├── userRepository.ts
│   │   └── goalRepository.ts
│   ├── models/                  # 타입/모델 정의
│   │   ├── user.ts
│   │   └── goal.ts
│   ├── middlewares/             # 미들웨어
│   │   ├── auth.ts              #   인증 미들웨어
│   │   ├── errorHandler.ts      #   에러 처리
│   │   ├── validator.ts         #   입력 검증
│   │   └── logger.ts            #   로깅
│   ├── utils/                   # 유틸리티
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── config/                  # 환경 설정
│   │   ├── database.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── routes/                  # 라우트 정의
│   │   ├── userRoutes.ts
│   │   └── index.ts
│   └── app.ts                   # 앱 진입점
├── prisma/                      # Prisma 스키마 (ORM 사용 시)
│   ├── schema.prisma
│   └── migrations/
├── tests/                       # 테스트
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example                 # 환경 변수 목록
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 3.2 각 폴더의 역할

| 폴더 | 역할 | 의존 가능 대상 |
|------|------|--------------|
| `controllers/` | HTTP 요청/응답 처리, 입력 검증 | services, middlewares |
| `services/` | 비즈니스 로직 실행 | repositories, models |
| `repositories/` | DB 접근 (CRUD) | models, config |
| `models/` | 데이터 타입/스키마 정의 | (없음) |
| `middlewares/` | 요청 전처리 (인증, 로깅, 검증) | config, utils |
| `utils/` | 순수 유틸리티 함수 | (없음) |
| `config/` | 환경 설정 로드 | (없음) |
| `routes/` | URL ↔ Controller 매핑 | controllers |

---

## 4. AI 관련 폴더 상세

### 4.1 .ai/ 폴더

| 파일 | 목적 | 업데이트 빈도 |
|------|------|--------------|
| `SESSION_LOG.md` | 작업 이력 추적 | 매 세션 완료 시 |
| `CURRENT_SPRINT.md` | 진행 상태 파악 | 매 작업 완료 시 |
| `DECISIONS.md` | 의사결정 기록 | 중요 결정 시 |
| `ARCHITECTURE.md` | 시스템 이해 | 구조 변경 시 |
| `CONVENTIONS.md` | 일관성 유지 | 규칙 변경 시 |

### 4.2 .claude/ 폴더

```
.claude/
├── settings.json              # 권한, hooks, 환경변수
└── skills/                    # 슬래시 명령어
    ├── apply-standard/
    │   └── SKILL.md           # /apply-standard 명령어
    ├── commit/
    │   └── SKILL.md           # /commit 명령어
    ├── review-pr/
    │   └── SKILL.md           # /review-pr 명령어
    ├── test/
    │   └── SKILL.md           # /test 명령어
    └── session-start/
        └── SKILL.md           # /session-start 명령어
```

---

## 5. .gitignore 표준

```gitignore
# 의존성
node_modules/
.pnpm-store/

# 빌드 출력
dist/
build/
.next/

# 환경 변수
.env
.env.local
.env.*.local

# Claude Code 로컬 설정
CLAUDE.local.md

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 로그
logs/
*.log
npm-debug.log*

# 테스트
coverage/
```

---

## 6. 새 프로젝트 설정 스크립트

### Bash (macOS/Linux)

```bash
#!/bin/bash
# JINHAK 프로젝트 초기 구조 생성 스크립트
# 권장: Claude Code에서 /apply-standard 스킬을 사용하면 자동으로 적용됩니다.

STANDARD_REPO="${1:-}"  # 첫 번째 인자: 표준 저장소 로컬 경로 (선택)

# .ai 폴더 생성
mkdir -p .ai
touch .ai/SESSION_LOG.md
touch .ai/CURRENT_SPRINT.md
touch .ai/DECISIONS.md
touch .ai/ARCHITECTURE.md
touch .ai/CONVENTIONS.md

# .claude 폴더 및 skills 생성
mkdir -p .claude/skills/commit
mkdir -p .claude/skills/review-pr
mkdir -p .claude/skills/session-start
mkdir -p .claude/skills/test
mkdir -p .claude/skills/apply-standard

# 표준 저장소에서 스킬 파일 복사 (경로가 주어진 경우)
if [ -n "$STANDARD_REPO" ] && [ -d "$STANDARD_REPO/.claude/skills" ]; then
  cp "$STANDARD_REPO/.claude/skills/commit/SKILL.md" .claude/skills/commit/
  cp "$STANDARD_REPO/.claude/skills/review-pr/SKILL.md" .claude/skills/review-pr/
  cp "$STANDARD_REPO/.claude/skills/session-start/SKILL.md" .claude/skills/session-start/
  cp "$STANDARD_REPO/.claude/skills/test/SKILL.md" .claude/skills/test/
  cp "$STANDARD_REPO/.claude/skills/apply-standard/SKILL.md" .claude/skills/apply-standard/
  echo "스킬 파일이 표준 저장소에서 복사되었습니다."
fi

# settings.json 생성
cat > .claude/settings.json << 'EOF'
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
      "Bash(git commit *)",
      "Read", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git config *)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "command": "cat .ai/CURRENT_SPRINT.md 2>/dev/null | head -50 || echo ''"
      }
    ]
  }
}
EOF

# .gitignore에 추가
grep -qxF 'CLAUDE.local.md' .gitignore 2>/dev/null || echo 'CLAUDE.local.md' >> .gitignore
grep -qxF '.env' .gitignore 2>/dev/null || echo '.env' >> .gitignore
grep -qxF '.env.local' .gitignore 2>/dev/null || echo '.env.local' >> .gitignore

echo "JINHAK 프로젝트 구조가 생성되었습니다!"
echo "CLAUDE.md를 작성하세요. (templates/project-claude.md 참고)"
echo ""
echo "또는 Claude Code에서 /apply-standard 를 실행하면 자동으로 적용됩니다."
```

### PowerShell (Windows)

```powershell
# JINHAK 프로젝트 초기 구조 생성 스크립트
# 권장: Claude Code에서 /apply-standard 스킬을 사용하면 자동으로 적용됩니다.

param(
  [string]$StandardRepo = ""  # 표준 저장소 로컬 경로 (선택)
)

# .ai 폴더 생성
New-Item -ItemType Directory -Force -Path .ai
@("SESSION_LOG.md","CURRENT_SPRINT.md","DECISIONS.md","ARCHITECTURE.md","CONVENTIONS.md") |
  ForEach-Object { New-Item -ItemType File -Force -Path ".ai\$_" }

# .claude 폴더 및 skills 생성
$skillDirs = @("commit","review-pr","session-start","test","apply-standard")
foreach ($skill in $skillDirs) {
  New-Item -ItemType Directory -Force -Path ".claude\skills\$skill"
}

# 표준 저장소에서 스킬 파일 복사 (경로가 주어진 경우)
if ($StandardRepo -and (Test-Path "$StandardRepo\.claude\skills")) {
  foreach ($skill in $skillDirs) {
    $src = "$StandardRepo\.claude\skills\$skill\SKILL.md"
    if (Test-Path $src) {
      Copy-Item $src ".claude\skills\$skill\SKILL.md" -Force
    }
  }
  Write-Host "스킬 파일이 표준 저장소에서 복사되었습니다."
}

# settings.json 생성
@'
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
      "Bash(git commit *)",
      "Read", "Glob", "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(git config *)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "command": "powershell -Command \"if (Test-Path .ai\\CURRENT_SPRINT.md) { Get-Content .ai\\CURRENT_SPRINT.md -Head 50 } else { Write-Output '' }\""
      }
    ]
  }
}
'@ | Out-File -FilePath .claude\settings.json -Encoding utf8

# .gitignore에 추가
$gitignoreEntries = @("CLAUDE.local.md", ".env", ".env.local")
foreach ($entry in $gitignoreEntries) {
  if (!(Test-Path .gitignore) -or !(Get-Content .gitignore -ErrorAction SilentlyContinue | Select-String -SimpleMatch $entry -Quiet)) {
    Add-Content .gitignore $entry
  }
}

Write-Host "JINHAK 프로젝트 구조가 생성되었습니다!"
Write-Host "CLAUDE.md를 작성하세요. (templates/project-claude.md 참고)"
Write-Host ""
Write-Host "또는 Claude Code에서 /apply-standard 를 실행하면 자동으로 적용됩니다."
```

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
