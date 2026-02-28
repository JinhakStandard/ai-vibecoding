# 현재 진행 중인 작업

> 마지막 업데이트: 2026-02-28

---

## 진행 중 (In Progress)

없음

---

## 대기 중 (Pending)

없음

---

## 최근 완료

### 2026-02-28
- [x] JINHAK 표준 v2.3 릴리스 (11개 개선사항)
  - [x] 개선 1-5: deep-plan 적응적 추천 모델 (가중치 비평, C6 Hard Gate, NightBuilder 비동기 위임, 사후 검증)
  - [x] 개선 6: /orchestrate Two-Stage Review
  - [x] 개선 7: /test Red-Green 검증
  - [x] 개선 8: /debug 신규 스킬 (4단계 체계적 디버깅)
  - [x] 개선 9: 스킬 토큰 최적화 가이드
  - [x] 개선 10: Anti-Rationalization 패턴 전사 적용
  - [x] 개선 11: Skill TDD 가이드 (skill-testing-guide.md)
  - [x] session-briefing PENDING_PLANS 감지, session-end-reminder README 경고
- [x] JINHAK 표준 v2.2 릴리스
  - [x] /deep-plan 스킬 생성 (Planner-Critic 듀얼 에이전트)
  - [x] Auto Memory 보강 (session-briefing, session-end, memory-templates)
  - [x] VIBE_CODING_GUIDE 섹션 6.8 계획 수립 프레임워크 추가
  - [x] apply-standard v2.2 검증 항목 추가
  - [x] CLAUDE.md/CHANGELOG v2.2 갱신
- [x] GitHub remote 추가 (Bitbucket + GitHub 이중 push)

### 2026-02-20
- [x] JINHAK 표준 v1.8 → v2.0 메이저 업그레이드
  - [x] security/ 폴더 6개 보안 문서 생성 (AI_SECURITY_GUARDRAILS, OWASP_LLM_CHECKLIST, FORBIDDEN_PATTERNS, DATA_CLASSIFICATION, INCIDENT_RESPONSE, NIGHTBUILDER_SECURITY)
  - [x] 자동화 도구 생성 (security-check-hook.js, /security-check 스킬, ESLint/Secretlint/Semgrep 템플릿, husky 가이드)
  - [x] 기존 문서 보안 강화 (CLAUDE.md, SECURITY_ISMS.md, CODING_CONVENTIONS.md, VIBE_CODING_GUIDE.md)
  - [x] settings.json 보안 강화 (deny 3개 추가, PreToolUse/PostToolUse Hook 추가)
  - [x] 스킬/템플릿 업데이트 (apply-standard, review-pr, session-start, project-claude.md)
  - [x] CHANGELOG v2.0 작성 (Migration Guide 포함)
  - [x] README, PROJECT_STRUCTURE, QUICK_START_PROMPT 업데이트
  - [x] 통합 검증 (JSON 파싱, Hook node 기반, 버전 메타, 줄 수 확인)

### 2026-02-13
- [x] JINHAK 표준 v1.8 일괄 정비 (5개 프로젝트)
  - [x] JabisStandard 메타 태그 추가, .ai/ 폴더 생성
  - [x] 섹션 7.2 예시 버전 수정, 템플릿 메타 버전 수정
  - [x] batch-apply.js 일괄 적용 스크립트 작성 및 실행
  - [x] 외부 4개 프로젝트 업데이트 (JabisTemplate, jabis-api-gateway, jabis-lab, JabisCert)
  - [x] 전 프로젝트 커밋 & 푸시 완료
- [x] 글로벌 Hook Node.js 크로스 플랫폼 전환
  - [x] ~/.claude/settings.json sed/tr → check-standard.js 방식 교체
  - [x] install-global-hook.js 레거시 자동 업그레이드 기능 추가

---

## 구현 상태 요약

| 영역 | 완성도 | 상태 |
|------|--------|------|
| v2.3 적응적 추천 + 스킬 품질 강화 | 100% | 완료 |
| v2.2 /deep-plan + Auto Memory 보강 | 100% | 완료 |
| v2.0 보안 가이드레일 도입 | 100% | 완료 |
| JabisStandard 자체 정비 | 100% | 완료 |
| 외부 프로젝트 일괄 정비 | 100% | 완료 |
| 글로벌 Hook 크로스 플랫폼 전환 | 100% | 완료 |

---

## 다음 세션 시작 시

1. 이 파일 확인하여 진행 중인 작업 파악
2. 우선순위에 따라 작업 선택
3. 완료 후 이 파일 업데이트
