# JINHAK AI 개발 표준 (AI Vibe Coding Standards)

JINHAK 전사에서 AI(Claude Code / Claude.ai)와 협업할 때 따라야 하는 개발 표준 문서입니다.

---

## 내 프로젝트에 적용하는 방법

> **이 저장소의 URL을 Claude Code에 알려주기만 하면 됩니다.**

### 1단계: 프로젝트에서 Claude Code 실행

```bash
cd my-project
claude
```

### 2단계: 이 저장소 URL을 주고 적용 요청

```
> https://github.com/JinhakStandard/ai-vibecoding 여기를 참고해서 프로젝트에 적용해줘
```

### 그러면 Claude Code가 자동으로:

| 순서 | 작업 | 설명 |
|------|------|------|
| 1 | **프로젝트 분석** | package.json, tsconfig.json 등을 읽어 기술 스택 파악 |
| 2 | **CLAUDE.md 생성** | 프로젝트 정보가 채워진 AI 설정 파일 생성 |
| 3 | **`.ai/` 폴더 생성** | SESSION_LOG, CURRENT_SPRINT, DECISIONS 등 세션 관리 파일 |
| 4 | **`.claude/` 설정** | settings.json(권한/hooks) + Skills(슬래시 명령어) |
| 5 | **`.gitignore` 업데이트** | CLAUDE.local.md, .env 등 추가 |
| 6 | **버전 메타 정보 기록** | 어떤 버전의 표준이 적용되었는지 추적 |

### 적용 후 사용할 수 있는 명령어

```
/session-start          # 세션 시작 (이전 작업 확인 + 표준 버전 체크)
/commit                 # 표준에 맞는 커밋 생성
/review-pr 123          # PR을 표준 기준으로 리뷰
/test                   # 테스트 실행 및 결과 분석
```

> 기존 프로젝트든 신규 프로젝트든 상관없이 동작합니다.
> 이미 적용된 프로젝트라면 버전을 비교하여 업데이트만 수행합니다.

---

## 표준 버전 업데이트 프로세스

이 표준 저장소가 업데이트되면, 각 프로젝트에 자동으로 반영됩니다.

### 표준 관리자가 할 일 (이 저장소)

```
1. 표준 문서/스킬/설정 수정
2. CHANGELOG.md에 새 버전과 변경 내역 추가
3. CLAUDE.md 하단의 버전 번호 업데이트
4. 커밋 & push
```

### 프로젝트 사용자에게 일어나는 일

```
1. 프로젝트에서 /session-start 실행
2. Claude Code가 표준 저장소의 CHANGELOG.md를 확인
3. 프로젝트에 적용된 버전(jinhak_standard_version)과 비교
4. 새 버전이 있으면 변경 내역을 요약하여 안내
5. 사용자 승인 시 자동 업데이트 적용
```

> 각 프로젝트의 CLAUDE.md에 다음 메타 정보가 기록되어 추적됩니다:
> ```html
> <!-- jinhak_standard_version: 1.1 -->
> <!-- jinhak_standard_repo: https://github.com/JinhakStandard/ai-vibecoding -->
> <!-- applied_date: 2025-02-20 -->
> ```

---

## 이 저장소의 목적

1. **개발 일관성**: 모든 프로젝트에서 동일한 코딩 컨벤션과 아키텍처 패턴 적용
2. **AI 협업 효율화**: Claude와의 협업을 위한 프로젝트 설정 표준 제공
3. **온보딩 가속**: 새로운 팀원이 빠르게 개발 환경에 적응
4. **비개발자 참여**: 기획자, 디자이너도 AI를 활용한 개발 참여 가능

---

## 문서 구조

```
JinhakStandard/
├── README.md                     ← 지금 보고 있는 문서
├── CLAUDE.md                     # 메인 AI 개발 가이드 (핵심 원칙)
├── CHANGELOG.md                  # 버전별 변경 이력
├── CODING_CONVENTIONS.md         # 코딩 컨벤션 상세
├── ARCHITECTURE.md               # 아키텍처 원칙 및 패턴
├── VIBE_CODING_GUIDE.md          # 바이브 코딩 방법론 (비개발자 포함)
├── PROJECT_STRUCTURE.md          # 표준 프로젝트 구조
├── .claude/                      # Claude Code 설정 (표준 템플릿)
│   ├── settings.json             #   권한, hooks 설정
│   └── skills/                   #   슬래시 명령어
│       ├── apply-standard/       #   /apply-standard - 표준 적용
│       ├── commit/               #   /commit - 커밋 생성
│       ├── review-pr/            #   /review-pr - PR 리뷰
│       ├── session-start/        #   /session-start - 세션 시작
│       └── test/                 #   /test - 테스트 실행
└── templates/
    ├── project-claude.md         # 개별 프로젝트용 CLAUDE.md 템플릿
    └── component-template.md     # 컴포넌트 생성 템플릿
```

### 각 문서 설명

| 문서 | 대상 | 내용 |
|------|------|------|
| **CLAUDE.md** | 전체 | 전사 AI 개발 표준의 핵심 원칙. 기술 스택, 코드 품질 기준, Git 규칙, API 규칙 등 |
| **CODING_CONVENTIONS.md** | 개발자 | 네이밍 규칙, import 순서, 컴포넌트 구조, 상태 관리 패턴, 에러 처리 등 상세 가이드 |
| **ARCHITECTURE.md** | 개발자/설계자 | 프론트엔드/백엔드 아키텍처, API 설계, DB 선택 기준, Vault 보안, 서비스 간 통신 |
| **VIBE_CODING_GUIDE.md** | 전체 (비개발자 포함) | AI와 협업하는 방법, 프롬프트 작성법, 주의사항, 팀 협업 방법 |
| **PROJECT_STRUCTURE.md** | 개발자 | 표준 디렉토리 구조, 파일 배치 규칙, 초기 설정 스크립트 |

---

## 빠른 시작

> 자동 적용은 위의 "내 프로젝트에 적용하는 방법" 섹션을 참고하세요.

### 수동 적용 (필요 시)

```bash
# 1. 이 저장소를 클론하여 참고
git clone https://github.com/JinhakStandard/ai-vibecoding.git /tmp/jinhak-standards

# 2. CLAUDE.md 템플릿 복사 후 프로젝트 정보 수정
cp /tmp/jinhak-standards/templates/project-claude.md ./CLAUDE.md

# 3. AI 문서화 폴더 및 파일 생성
mkdir -p .ai .claude/skills/commit .claude/skills/review-pr .claude/skills/session-start .claude/skills/test
touch .ai/SESSION_LOG.md .ai/CURRENT_SPRINT.md .ai/DECISIONS.md .ai/ARCHITECTURE.md .ai/CONVENTIONS.md

# 4. 스킬 파일 및 settings.json 복사
cp /tmp/jinhak-standards/.claude/skills/*/SKILL.md 각_스킬_폴더/
cp /tmp/jinhak-standards/.claude/settings.json .claude/

# 5. .gitignore에 추가
echo "CLAUDE.local.md" >> .gitignore
```

### Claude.ai에서 사용하기 (비개발자)

1. [claude.ai](https://claude.ai) 접속
2. 프로젝트 생성
3. 프로젝트 지식(Knowledge)에 `CLAUDE.md`와 `VIBE_CODING_GUIDE.md` 업로드
4. 대화 시작

### Claude Code에서 사용하기 (개발자)

```bash
# 프로젝트 디렉토리에서 Claude Code 실행
cd my-project
claude

# 세션 시작
/session-start

# 작업 수행
> 사용자 프로필 페이지를 추가해줘

# 커밋
/commit
```

---

## 기여 방법

이 표준은 모든 JINHAK 구성원이 함께 개선합니다.

### PR 제출 방법

1. 이 저장소를 fork 또는 branch 생성
2. 문서 수정
3. PR 제출 (제목 형식: `docs: [변경 내용 요약]`)
4. PR 설명에 변경 이유 명시
5. 최소 1명의 리뷰어 승인 후 머지

### 기여 가이드라인

- **실제 프로젝트에서 검증된 패턴만** 표준에 추가
- 변경 시 **왜 그렇게 하는지 이유**를 함께 설명
- 기존 규칙을 변경할 때는 **하위 호환성** 고려
- 비개발자도 이해할 수 있는 **명확한 한국어** 사용

---

## 커스터마이징 가이드

이 표준을 개별 프로젝트에 적용할 때 프로젝트 상황에 맞게 조정이 필요한 부분:

| 항목 | 커스터마이징 내용 |
|------|-----------------|
| 프레임워크 | React / Next.js 중 선택, Vite 빌드 설정 |
| 백엔드 프레임워크 | Express / Fastify / NestJS 중 선택 |
| DB | 신규: PostgreSQL, 대형/기존: MSSQL (전사 표준) |
| 폴더 구조 | 모노레포 여부, 앱 수에 따라 구조 조정 |
| UI 라이브러리 | shadcn/ui 등 UI 라이브러리 구성 방식 |
| 테스트 전략 | 단위/통합/E2E 테스트 범위 결정 |
| CI/CD | GitHub Actions 설정은 프로젝트별 구성 |
| Vault 경로 | 프로젝트별 Vault secret path 설정 |
| Skills | 프로젝트별 추가 슬래시 명령어 정의 |
| 표준 버전 | `/session-start` 시 자동 버전 체크 |

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.1 | 2025-02 | 자동 적용 프로세스, 버전 추적, 스킬 보강 |
| 1.0 | 2025-02 | 초기 버전 - JINHAK Template 프로젝트 기반으로 작성 |

> 상세 변경 이력은 [CHANGELOG.md](./CHANGELOG.md)를 참조하세요.

---

## 라이선스

JINHAK 내부 사용 전용. 외부 공개 시 별도 라이선스 결정 필요.
