# JINHAK 표준 React 컴포넌트 생성

## 컨텍스트

JINHAK 프론트엔드 기술 스택(React 18+ / Tailwind CSS / CVA / Lucide React / Zustand)에 맞는 컴포넌트를 생성합니다. 네이밍 컨벤션, 폴더 배치, 스타일링 규칙을 자동으로 적용합니다.

- **대상**: 새로운 React 컴포넌트 생성
- **전제 조건**: React + Tailwind CSS + CVA 프로젝트
- **기대 결과**: 컨벤션을 준수하는 완성된 컴포넌트 파일

## 프롬프트

```
다음 요구사항에 맞는 React 컴포넌트를 JINHAK 표준에 따라 생성해주세요.

## 컴포넌트 정보
- 이름: {ComponentName}
- 용도: {컴포넌트의 역할과 사용 위치}
- 배치: {ui / common / layout / widgets / [도메인]}

## JINHAK 프론트엔드 규칙
1. **네이밍**: 파일명 PascalCase ({ComponentName}.jsx), 컴포넌트명 PascalCase
2. **스타일링**: Tailwind CSS + CVA (Class Variance Authority) 사용
   - 변형(variants)이 있으면 CVA로 정의
   - cn() 유틸리티로 클래스 병합
3. **아이콘**: Lucide React에서 import
4. **상태관리**: 전역 상태는 Zustand 스토어, 로컬 상태는 useState
5. **Props**: 구조 분해 할당으로 받기, 기본값은 매개변수에서 지정
6. **export**: named export 사용 (default export 지양)

## 코드 구조
- import 순서: React → 외부 라이브러리 → 내부 모듈 → 스타일/상수
- JSX 반환 전에 훅/이벤트 핸들러 정의
- 컴포넌트 내부에서만 사용하는 상수는 컴포넌트 외부 상단에 정의

## 추가 요구사항
{추가 요구사항이 있으면 여기에 작성, 없으면 "없음"}
```

## 사용 예시

### 예시 1: 통계 카드 위젯

**입력:**
```
- 이름: StatCard
- 용도: 대시보드에서 핵심 지표를 표시하는 카드 위젯
- 배치: widgets
- 추가 요구사항: 증감 표시(상승/하락 아이콘), 3가지 크기 변형(sm/md/lg)
```

**기대 출력 요약:**
- `src/components/widgets/StatCard.jsx` 파일 생성
- CVA로 크기 변형 정의 (`sm`, `md`, `lg`)
- Lucide React의 `TrendingUp`, `TrendingDown` 아이콘 사용
- `cn()` 유틸리티로 조건부 스타일 적용

### 예시 2: 페이지 헤더

**입력:**
```
- 이름: PageHeader
- 용도: 각 페이지 상단에 표시되는 제목 + 액션 버튼 영역
- 배치: common
- 추가 요구사항: breadcrumb 옵션, 액션 버튼 슬롯(children)
```

**기대 출력 요약:**
- `src/components/common/PageHeader.jsx` 파일 생성
- breadcrumb 배열 props 옵션 처리
- children으로 액션 버튼 영역 제공

## 변형

| 변형 | 설명 | 변경 포인트 |
|------|------|------------|
| TypeScript 버전 | TSX + 인터페이스 | 확장자 `.tsx`, Props 인터페이스 추가 |
| Next.js 서버 컴포넌트 | RSC 대응 | `'use client'` 디렉티브, 데이터 페칭 분리 |
| 테스트 포함 | 테스트 파일 동시 생성 | `{ComponentName}.test.jsx` 추가 |
