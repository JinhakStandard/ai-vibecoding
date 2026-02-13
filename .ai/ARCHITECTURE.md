# JabisStandard 시스템 아키텍처

> JINHAK 전사 AI 개발 표준 저장소 - 모든 프로젝트에 적용되는 Claude Code 설정 및 가이드

## 핵심 철학

1. **표준화**: 모든 프로젝트에서 일관된 AI 협업 환경 제공
2. **자동화**: Hook, Skill, 스크립트를 통한 반복 작업 자동화
3. **크로스 플랫폼**: Windows/macOS/Linux 어디서든 동일 동작
4. **보안 우선**: deny 규칙, ISMS 가이드로 위험 명령 차단

---

## 프로젝트 구조

```
JabisStandard/
├── CLAUDE.md                    # 전사 표준 메인 문서 (v1.8)
├── CHANGELOG.md                 # 버전별 변경 이력
├── .ai/                         # 프로젝트 문서화
├── .claude/
│   ├── settings.json            # 권한, Hook 설정
│   ├── scripts/
│   │   └── session-briefing.js  # 세션 브리핑 자동화
│   └── skills/                  # 슬래시 명령어
│       ├── apply-standard/
│       ├── commit/
│       ├── review-pr/
│       ├── session-start/
│       └── test/
├── scripts/                     # 유틸리티 스크립트
│   ├── install-global-hook.js   # 글로벌 Hook 설치
│   └── batch-apply.js           # 일괄 표준 적용
└── templates/                   # 프로젝트 템플릿
    ├── project-claude.md
    ├── component-template.md
    ├── ai-folder-templates.md
    └── claude-local-template.md
```

---

## 배포 흐름

```
JabisStandard (표준 저장소)
    ↓ /apply-standard 또는 batch-apply.js
대상 프로젝트
    ├── CLAUDE.md (메타 태그 + 프로젝트 규칙)
    ├── .claude/settings.json (권한 + Hook)
    ├── .claude/scripts/session-briefing.js
    └── .ai/ (세션 기록, 스프린트, 의사결정)
```

---

## 주요 구성 요소

| 구성 요소 | 설명 |
|-----------|------|
| CLAUDE.md | 전사 표준 문서 (프로젝트별 커스터마이징) |
| settings.json | deny 규칙(강제), allow 규칙, Hook 설정 |
| session-briefing.js | 세션 시작 시 컨텍스트 자동 로드 |
| Skills | /commit, /review-pr 등 반복 작업 자동화 |
| 글로벌 Hook | 모든 프로젝트에서 표준 적용 여부 자동 감지 |
