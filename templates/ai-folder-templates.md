# .ai/ 폴더 파일 템플릿

이 문서는 프로젝트의 `.ai/` 폴더에 생성할 파일들의 초기 템플릿입니다.
`/apply-standard` 스킬이 표준을 적용할 때 이 템플릿을 참고하여 파일을 생성합니다.

---

## 1. SESSION_LOG.md

```markdown
# 세션 작업 기록

> 이 문서는 각 세션에서 수행한 작업을 기록합니다.
> 세션 종료 시 반드시 업데이트하세요.

---

## YYYY-MM-DD

### 세션 작업 내용
-

### 변경 파일
-

### 커밋
-

---
```

---

## 2. CURRENT_SPRINT.md

```markdown
# 현재 진행 중인 작업

> 마지막 업데이트: YYYY-MM-DD

---

## 진행 중 (In Progress)

### [작업명]
- **상태**: 진행 중
- **파일**: `파일경로`
- **설명**: 작업 설명

---

## 대기 중 (Pending)

### 우선순위 1: [작업명]
- [ ] 세부 작업 1
- [ ] 세부 작업 2

### 우선순위 2: [작업명]
- [ ] 세부 작업 1

---

## 최근 완료

### YYYY-MM-DD
- [x] 완료된 작업 1
- [x] 완료된 작업 2

---

## 구현 상태 요약

| 영역 | 완성도 | 상태 |
|------|--------|------|
| [영역명] | 0% | 시작 전 |

---

## 다음 세션 시작 시

1. 이 파일 확인하여 진행 중인 작업 파악
2. 우선순위에 따라 작업 선택
3. 완료 후 이 파일 업데이트
```

---

## 3. DECISIONS.md

```markdown
# 아키텍처 의사결정 기록 (ADR)

이 문서는 프로젝트의 주요 기술 의사결정을 ADR(Architecture Decision Record) 형식으로 기록합니다.

---

## ADR-001: [의사결정 제목]

### 상태
승인됨 (YYYY-MM)

### 컨텍스트
- 배경 설명 1
- 배경 설명 2

### 결정
결정 내용 상세 설명

### 대안
- 대안 1: 설명
- 대안 2: 설명

### 결과
- (+) 장점 1
- (+) 장점 2
- (-) 단점 1

---

## 의사결정 변경 이력

| 날짜 | ADR | 변경 내용 |
|------|-----|----------|
| YYYY-MM | ADR-001 | 초기 작성 |
```

---

## 4. ARCHITECTURE.md

```markdown
# [프로젝트명] 시스템 아키텍처

> [프로젝트 한 줄 설명]

## 핵심 철학

[프로젝트의 핵심 설계 원칙 설명]

---

## 프로젝트 구조

```
[폴더 구조]
```

---

## 기술 스택

### 프론트엔드
- **프레임워크**:
- **UI**:
- **상태관리**:

### 백엔드
- **런타임**:
- **프레임워크**:
- **인증**:

### 데이터베이스
- **DBMS**:

### 빌드 & 개발
- **패키지 관리**:
- **빌드 도구**:

---

## 데이터 흐름

```
[데이터 흐름 다이어그램]
```

---

## 주요 테이블/모델

| 테이블 | 설명 | 주요 필드 |
|--------|------|----------|
| | | |
```

---

## 5. CONVENTIONS.md

```markdown
# [프로젝트명] 코딩 컨벤션

이 문서는 프로젝트의 코딩 규칙과 네이밍 규칙을 정의합니다.
JINHAK 전사 표준을 기반으로 프로젝트 특화 규칙을 추가합니다.

---

## 네이밍 규칙

### 파일/폴더
| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `MyComponent.tsx` |
| 훅 | camelCase (use 접두사) | `useMyHook.ts` |
| 스토어 | camelCase + Store | `authStore.ts` |
| 유틸리티 | camelCase | `formatDate.ts` |

### 코드
| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `MyComponent` |
| 함수/변수 | camelCase | `handleSubmit` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile` |
| ID | prefix + 고유값 | `user-001` |

---

## 컴포넌트 구조

```typescript
// 1. imports (외부 → 아이콘 → UI → 컴포넌트 → 스토어 → 유틸)
import { useState } from 'react';

// 2. types (TypeScript)
interface Props {
  // ...
}

// 3. component
export function MyComponent({ prop }: Props) {
  // 3.1 hooks
  // 3.2 effects
  // 3.3 handlers
  // 3.4 render
  return <div />;
}
```

---

## Git 커밋 규칙

| Type | 설명 |
|------|------|
| feat | 새 기능 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| style | 코드 포맷팅 |
| refactor | 리팩토링 |
| test | 테스트 |
| chore | 빌드/설정 |

---

## 프로젝트 특화 규칙

[프로젝트에 맞는 추가 규칙 작성]

---

## 금지 사항

1. `any` 타입 사용 금지 (TypeScript)
2. `console.log` 프로덕션 코드 사용 금지
3. 하드코딩된 URL/포트/비밀키 사용 금지
4. PUT/PATCH/DELETE HTTP 메서드 사용 금지
5. 주석 처리된 코드 방치 금지
```

---

*이 문서는 [JINHAK 전사 AI 개발 표준](../CLAUDE.md)의 부속 문서입니다.*
