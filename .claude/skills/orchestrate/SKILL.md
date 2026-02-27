---
name: orchestrate
description: Agent Teams를 구성하여 복잡한 작업을 병렬/분산 처리
---

Agent Teams를 활용하여 복잡한 작업을 여러 에이전트에게 분산·병렬 처리합니다.

## 인자

$ARGUMENTS - 수행할 작업 설명 (선택사항. 없으면 현재 컨텍스트에서 판단)

## 사용법

```
/orchestrate 코드베이스 전체 보안 감사
/orchestrate 프론트엔드 + 백엔드 API 동시 구현
/orchestrate
```

---

## 실행 절차

### 0단계: 오케스트레이션 적합성 판단

다음 **모든 조건**이 충족될 때만 팀을 구성합니다:

| 적합 | 부적합 |
|------|--------|
| 독립적으로 분리 가능한 작업 2개 이상 | 순차 의존성이 강한 단일 흐름 |
| 각 작업이 10분 이상 소요 예상 | 단순 파일 수정 1~2개 |
| 병렬 처리 시 실질적인 시간 단축 효과 | 같은 파일을 동시에 수정하는 작업 |

부적합하면 단일 에이전트로 처리하고 사용자에게 이유를 설명합니다.

---

### 1단계: 작업 분해

전체 작업을 독립적인 서브태스크로 분해합니다:

1. **의존성 파악**: 어떤 작업이 다른 작업의 결과를 필요로 하는지 확인
2. **병렬 그룹**: 동시에 실행 가능한 작업 그룹 정의
3. **에이전트 유형 결정**: 각 작업에 적합한 에이전트 타입 선택
   - `general-purpose`: 코드 작성/수정이 필요한 작업 (Edit, Write, Bash 포함)
   - `Explore`: 탐색/분석만 필요한 작업 (읽기 전용)

---

### 2단계: 팀 구성

```
TeamCreate({
  team_name: "작업-이름",
  description: "팀 목적 설명"
})
```

TaskCreate로 태스크 목록 생성:
```
TaskCreate({ subject: "태스크 제목", description: "상세 설명", activeForm: "진행형 설명" })
```

의존성 있는 태스크는 blockedBy 설정:
```
TaskUpdate({ taskId: "3", addBlockedBy: ["1", "2"] })
```

---

### 3단계: 팀원 스폰 및 작업 할당

```
Task({
  subagent_type: "general-purpose",
  name: "에이전트-이름",
  team_name: "작업-이름",
  prompt: "작업 상세 지시사항. 완료 시 TaskUpdate로 완료 표시 후 SendMessage로 결과 보고."
})
```

**팀원 지시 시 필수 포함 내용:**
- 담당 태스크 ID 명시 (`TaskUpdate({ taskId: "N", status: "in_progress" })` 먼저 실행)
- 완료 조건 명확화
- 팀 리더(나)에게 결과 보고 방법: `SendMessage({ type: "message", recipient: "리더이름", ... })`
- JSON 형식 메시지 금지, 일반 텍스트로 소통

---

### 4단계: 모니터링 및 조율

**팀원 메시지 자동 수신** → 폴링/체크 불필요

팀원 idle 알림은 정상 동작이므로 특별히 반응하지 않아도 됩니다.
단, 새 작업 할당이 필요하면 `SendMessage`로 지시:
```
SendMessage({
  type: "message",
  recipient: "에이전트-이름",
  content: "다음 태스크 N을 진행해주세요: ...",
  summary: "다음 태스크 할당"
})
```

블로킹 이슈 발생 시 `broadcast`로 팀 전체에 공지:
```
SendMessage({
  type: "broadcast",
  content: "중요: ... 이슈 발견. 현재 작업 일시 중단하고 확인해주세요.",
  summary: "블로킹 이슈 발생"
})
```

---

### 5단계: 결과 통합

모든 팀원 작업 완료 확인:
```
TaskList()  // 모든 태스크 completed 확인
```

결과 통합 및 검증:
- 각 팀원이 보고한 결과 취합
- 충돌/불일치 사항 해결
- 전체 동작 검증

---

### 6단계: 팀 종료

```
// 각 팀원에게 종료 요청
SendMessage({ type: "shutdown_request", recipient: "에이전트-이름", content: "작업 완료" })

// 모든 팀원 종료 확인 후
TeamDelete()
```

---

## 오케스트레이션 패턴 예시

### 패턴 1: 전체 코드베이스 분석
```
팀: [분석가-1: 프론트엔드] [분석가-2: 백엔드] [분석가-3: DB]
→ 각 영역 병렬 분석 → 결과 통합 리포트
```

### 패턴 2: 풀스택 기능 구현
```
팀: [백엔드-에이전트: API + DB] [프론트엔드-에이전트: UI + 상태관리]
→ API 스펙 먼저 확정(의존성) → 병렬 구현
```

### 패턴 3: 대규모 리팩토링
```
팀: [탐색-에이전트(Explore): 현황 파악] → [리팩터-에이전트들: 모듈별 병렬 처리]
isolation: "worktree" 활용으로 안전한 격리 환경에서 실행
```

---

## 주의사항

- `/orchestrate` 후 팀원들이 같은 파일을 동시에 수정하지 않도록 작업 범위를 명확히 분리
- 팀원은 `target_agent_id`가 아닌 **name**으로 참조 (`~/.claude/teams/{team-name}/config.json` 확인)
- 팀원에게 JSON 상태 메시지 전송 금지 → 일반 텍스트로 소통
- 전체 작업 완료 전 `TeamDelete` 호출 금지 (활성 팀원 있으면 실패)
