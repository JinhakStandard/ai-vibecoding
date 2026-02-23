# JINHAK AI 바이브 코딩 표준 - 빠른 적용 프롬프트

## 사용법

아래 프롬프트를 **Claude Code에 그대로 복사-붙여넣기** 하세요.

- 신규 프로젝트든 기존 프로젝트든 상관없이 **동일한 프롬프트**를 사용합니다.
- 처음 실행하면 표준 레포를 다운로드하고, **두 번째 프로젝트부터는 이미 받아둔 파일을 재사용**하므로 더 빠릅니다.
- 이미 표준이 적용된 프로젝트에서 다시 실행하면, 버전을 비교해서 **업데이트만 수행**합니다.

---

## 프롬프트

```
이 프로젝트에 JINHAK AI 개발 표준을 적용해줘.

표준 저장소: https://github.com/JinhakStandard/ai-vibecoding (master 브랜치)

## 적용 방법

아래 순서대로 진행해줘. 단, 레포의 각 파일을 웹에서 하나씩 가져오지 말고, 먼저 레포 전체를 로컬에 클론한 다음 로컬 파일을 참고해서 작업해.

### 0단계: 표준 레포 로컬 클론
git clone https://github.com/JinhakStandard/ai-vibecoding.git /tmp/jinhak-standards
만약 이미 /tmp/jinhak-standards가 있으면 git pull로 최신화만 해.
참고: /tmp/jinhak-standards는 참고용일 뿐, 현재 프로젝트의 git에 포함시키지 마.

### 1단계: 현재 프로젝트 분석
- package.json, tsconfig.json, build 설정 등을 읽어서 기술 스택 파악
- 이미 CLAUDE.md나 .claude/ 폴더가 있는지 확인
- 이미 적용된 경우 jinhak_standard_version을 비교해서 업데이트만 수행

### 2단계: CLAUDE.md 생성
- /tmp/jinhak-standards/templates/project-claude.md 템플릿을 기반으로 생성
- /tmp/jinhak-standards/CLAUDE.md 의 핵심 원칙을 포함
- 1단계에서 파악한 프로젝트 정보(기술 스택, 주요 경로 등)를 채워넣기
- 하단에 버전 메타 정보 추가:
  <!-- jinhak_standard_version: {CHANGELOG.md의 최신 버전} -->
  <!-- jinhak_standard_repo: https://github.com/JinhakStandard/ai-vibecoding -->
  <!-- applied_date: {오늘 날짜} -->

### 3단계: .ai/ 폴더 생성
mkdir -p .ai
다음 파일들을 생성:
- .ai/SESSION_LOG.md (세션 작업 기록용)
- .ai/CURRENT_SPRINT.md (현재 스프린트 정보)
- .ai/DECISIONS.md (의사결정 기록)
- .ai/ARCHITECTURE.md (프로젝트 아키텍처)
- .ai/CONVENTIONS.md (프로젝트별 컨벤션)

### 4단계: .claude/ 설정 복사
- /tmp/jinhak-standards/.claude/settings.json → .claude/settings.json 으로 복사
- /tmp/jinhak-standards/.claude/skills/ 폴더 전체를 .claude/skills/ 로 복사
  (apply-standard, commit, review-pr, security-check, session-start, test 스킬 포함)

### 4.5단계: 보안 가이드레일 복사 (v2.0)
- /tmp/jinhak-standards/security/ 폴더 전체를 security/ 로 복사
- /tmp/jinhak-standards/scripts/security-check-hook.cjs → scripts/ 로 복사

### 5단계: .gitignore 업데이트
다음 항목이 없으면 추가:
CLAUDE.local.md
.claude/settings.local.json
.env
.env.*
*vibecoding-ref/

### 6단계: 적용 결과 요약
완료 후 다음을 알려줘:
- 파악된 기술 스택
- 생성/수정된 파일 목록
- 적용된 표준 버전
- 사용 가능한 슬래시 명령어 (/session-start, /commit, /review-pr, /security-check, /test)
```

---

## 자주 묻는 질문

### Q: 다른 프로젝트에도 같은 프롬프트를 쓰면 되나요?
**네, 동일한 프롬프트를 그대로 사용하면 됩니다.** 0단계에서 이미 받아둔 표준 레포가 있으면 최신화만 하고, 1단계에서 새 프로젝트의 기술 스택을 자동으로 분석합니다. 두 번째부터는 clone을 건너뛰므로 더 빠릅니다.

### Q: /tmp/jinhak-standards가 프로젝트에 섞이지 않나요?
**아닙니다.** `/tmp/` 폴더는 참고용으로만 사용되며, 프로젝트 git에는 2~5단계에서 생성/복사된 파일들만 추가됩니다. 프롬프트에도 명시적으로 포함하지 말라고 지시되어 있습니다.

### Q: 이미 적용한 프로젝트에서 다시 실행하면?
1단계에서 기존 CLAUDE.md의 `jinhak_standard_version`을 확인하고, 표준 레포의 CHANGELOG.md 최신 버전과 비교합니다. 새 버전이 있으면 변경분만 업데이트합니다.

---

## 기존 방식과의 차이점

| 항목 | 기존 (URL만 전달) | 개선 (이 프롬프트) |
|------|-------------------|-------------------|
| **레포 접근** | 웹 크롤링으로 파일별 fetch | `git clone`으로 한 번에 전체 다운로드 |
| **파일 탐색** | GitHub HTML 파싱 → raw URL 추출 → 재요청 | 로컬 파일 직접 읽기 |
| **권한 처리** | 파일마다 허용 여부 확인 필요 | 로컬이므로 권한 불필요 |
| **작업 지시** | Claude가 README 해석 후 스스로 판단 | 6단계 명시적 지시로 즉시 실행 |
| **재사용** | 매번 전체 크롤링 반복 | 두 번째부터 pull만 하고 바로 적용 |
| **예상 소요** | 3~5분+ | 첫 적용 30초~1분, 이후 더 빠름 |
