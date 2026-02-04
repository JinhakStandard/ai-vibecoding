# JINHAK 코딩 컨벤션

이 문서는 JINHAK 전사 프로젝트에서 따라야 하는 코딩 컨벤션을 정의합니다.
JavaScript/TypeScript 기반 프로젝트에 적용됩니다.

---

## 1. 언어 및 설정

### 1.1 TypeScript 프로젝트 필수 설정

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  }
}
```

### 1.2 JavaScript 프로젝트

- TypeScript를 사용하지 않는 프로젝트에서는 **JSDoc 타입 주석**으로 타입 정보를 제공합니다.

```jsx
/**
 * 사용자 프로필 카드
 *
 * @param {React.ReactNode} icon - 아이콘 컴포넌트
 * @param {string} title - 제목
 * @param {string} description - 설명 (선택)
 * @param {React.ReactNode} actions - 액션 버튼들 (선택)
 * @param {string} className - 추가 CSS 클래스 (선택)
 */
export default function ProfileCard({ icon: Icon, title, description, actions, className }) {
  // ...
}
```

---

## 2. 네이밍 컨벤션

### 2.1 파일/폴더 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `DashboardLayout.jsx`, `PageHeader.tsx` |
| 커스텀 훅 | camelCase + use 접두사 | `useAuth.js`, `useDashboard.ts` |
| 유틸리티 | camelCase | `formatDate.js`, `validators.ts` |
| 스토어 | camelCase + Store | `dashboardStore.js`, `authStore.ts` |
| 데이터/상수 | camelCase | `organization.js`, `constants.ts` |
| 테스트 | 원본파일명 + .test | `UserCard.test.tsx`, `authStore.test.ts` |
| 스타일 | 원본파일명 + .module | `Dashboard.module.css` (필요 시) |

### 2.2 코드 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `DashboardGrid`, `OrgChartView` |
| 함수 | camelCase | `setViewMode`, `handleSubmit` |
| 변수 | camelCase | `isLoading`, `userData` |
| 상수 | UPPER_SNAKE_CASE | `STORAGE_KEY`, `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `ApiResponse` |
| 열거형 | PascalCase (멤버도) | `Status.Active`, `Role.Admin` |
| 불리언 | is/has/can/should 접두사 | `isVisible`, `hasPermission`, `canEdit` |
| 이벤트 핸들러 | handle 접두사 | `handleClick`, `handleSubmit` |
| 콜백 props | on 접두사 | `onClick`, `onSubmit`, `onChange` |

### 2.3 ID 형식

```javascript
// prefix + 고유값 형식으로 통일
{
  id: 'dept-001',
  userId: 'user-ceo',
  goalId: 'goal-2024-001',
}
```

---

## 3. 임포트 순서

모든 파일에서 import 순서를 통일합니다. 각 그룹 사이에 빈 줄을 넣습니다.

```jsx
// 1. React 및 외부 라이브러리
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// 2. 아이콘
import { LayoutDashboard, Users, Plus } from 'lucide-react'

// 3. UI 컴포넌트 (프로젝트 공유 UI)
import { Button, Card, CardHeader, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

// 4. 앱 전용 컴포넌트
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'

// 5. 스토어
import { useDashboardStore } from '@/stores/dashboardStore'

// 6. 유틸리티/데이터/타입
import { departments } from '@/data/organization'
import { formatDate } from '@/utils/date'
```

**이유:** 일관된 import 순서는 코드의 의존성을 한눈에 파악할 수 있게 하고, 병합 충돌을 줄여줍니다.

---

## 4. 컴포넌트 작성 규칙

### 4.1 기본 컴포넌트 구조

```jsx
import React from 'react'
import { IconName } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 컴포넌트 설명
 *
 * @param {React.ReactNode} icon - 아이콘 컴포넌트
 * @param {string} title - 제목
 * @param {string} className - 추가 클래스 (선택)
 */
export default function ComponentName({ icon: Icon, title, className }) {
  // 1. hooks
  const [isOpen, setIsOpen] = useState(false)

  // 2. effects
  useEffect(() => {
    // ...
  }, [])

  // 3. handlers
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  // 4. render
  return (
    <div className={cn("base-classes", className)}>
      {Icon && <Icon className="h-5 w-5" />}
      <span>{title}</span>
    </div>
  )
}
```

**규칙:**
- 컴포넌트 내부 코드는 hooks → effects → handlers → render 순서로 작성
- `className` prop을 지원하여 외부에서 스타일 확장 가능하게 함
- `cn()` 유틸리티로 조건부 클래스를 처리

### 4.2 페이지 컴포넌트 패턴

```jsx
import { Button } from '@/components/ui'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'

export default function RoleDashboard() {
  return (
    <DashboardLayout role="role-name" showNotifications={true}>
      <div className="h-full flex flex-col">
        <PageHeader
          icon={IconComponent}
          title="페이지 제목"
          description="페이지 설명"
          actions={<Button>액션</Button>}
        />
        <div className="flex-1 overflow-auto p-4">
          {/* 페이지 컨텐츠 */}
        </div>
      </div>
    </DashboardLayout>
  )
}
```

**이유:** 모든 페이지가 동일한 레이아웃 구조를 따르면 사용자 경험이 일관되고, 새 페이지 추가 시 빠르게 작업할 수 있습니다.

### 4.3 조건부 렌더링

```jsx
// 단순 조건: && 연산자
{isVisible && <Component />}

// 양자택일: 삼항 연산자
{isLoading ? <Spinner /> : <Content />}

// 복잡한 조건: 조기 반환
if (!data) return <EmptyState />
if (error) return <ErrorState error={error} />
return <DataView data={data} />
```

---

## 5. 상태 관리 (Zustand)

### 5.1 스토어 기본 구조

```javascript
import { create } from 'zustand'

const STORAGE_KEY = 'feature_state'

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.warn('Failed to load from storage')
    return null
  }
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save to storage')
  }
}

export const useFeatureStore = create((set, get) => ({
  // ======== 상태 ========
  data: loadFromStorage() || initialData,
  isLoading: false,
  selectedId: null,

  // ======== Setter 액션 ========
  setSelectedId: (id) => set({ selectedId: id }),
  setLoading: (loading) => set({ isLoading: loading }),

  // ======== Getter 메서드 ========
  getItemById: (id) => {
    const state = get()
    return state.data.find(item => item.id === id)
  },

  // ======== 데이터 조작 액션 ========
  addItem: (newItem) => set((state) => {
    const newData = [...state.data, newItem]
    saveToStorage(newData)
    return { data: newData }
  }),

  updateItem: (id, updates) => set((state) => {
    const newData = state.data.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    saveToStorage(newData)
    return { data: newData }
  }),

  deleteItem: (id) => set((state) => {
    const newData = state.data.filter(item => item.id !== id)
    saveToStorage(newData)
    return { data: newData }
  }),

  // ======== 다이얼로그 상태 ========
  dialogs: {
    form: { open: false, mode: 'create', data: null },
    delete: { open: false, id: null },
  },

  openDialog: (name, payload = {}) => set((state) => ({
    dialogs: {
      ...state.dialogs,
      [name]: { open: true, ...payload },
    },
  })),

  closeDialog: (name) => set((state) => ({
    dialogs: {
      ...state.dialogs,
      [name]: { ...state.dialogs[name], open: false },
    },
  })),
}))
```

**이유:** 이 패턴은 상태/setter/getter/CRUD/다이얼로그를 명확히 구분하여, 스토어가 커져도 유지보수가 용이합니다.

### 5.2 스토어 액션 네이밍 규칙

| 유형 | 패턴 | 예시 |
|------|------|------|
| 단순 설정 | `set` + 상태명 | `setEditMode`, `setViewMode` |
| 데이터 조회 | `get` + 데이터명 | `getLayout`, `getItemById` |
| 토글 | `toggle` + 상태명 | `toggleExpanded`, `toggleSidebar` |
| 추가 | `add` + 엔터티명 | `addItem`, `addComment` |
| 수정 | `update` + 엔터티명 | `updateItem`, `updateProfile` |
| 삭제 | `delete` + 엔터티명 | `deleteItem`, `deleteComment` |
| 다이얼로그 | `openDialog`, `closeDialog` | `openDialog('form', { mode: 'edit' })` |

### 5.3 스토어 사용 최적화

```jsx
// 개별 상태 선택 (리렌더링 최적화)
const data = useFeatureStore((state) => state.data)
const addItem = useFeatureStore((state) => state.addItem)

// 여러 상태를 한번에 (간단한 컴포넌트에서만)
const { data, isLoading, addItem } = useFeatureStore()
```

**이유:** 개별 선택(selector)을 사용하면 해당 상태가 변경될 때만 컴포넌트가 리렌더링됩니다.

---

## 6. 스타일링 규칙

### 6.1 cn() 유틸리티 사용

```jsx
import { cn } from '@/lib/utils'

<div className={cn(
  "flex items-center justify-between px-4 py-2",
  "border-b bg-background",
  isActive && "bg-primary/10",
  className
)}>
```

**이유:** `cn()`은 `clsx` + `tailwind-merge`를 결합한 함수로, 클래스 충돌을 자동 해결합니다.

### 6.2 CVA (Class Variance Authority) 패턴

여러 변형(variant)이 필요한 컴포넌트에 사용합니다.

```jsx
import { cva } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border shadow-sm",  // 기본 클래스
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        outline: "border-2 bg-transparent",
        ghost: "border-none shadow-none",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### 6.3 상태 표시 색상 표준

```javascript
// 승인/진행 상태
const statusColors = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
}

// 시맨틱 색상 (CSS 변수 기반)
"text-success"       // 성공/승인
"text-warning"       // 경고/대기
"text-destructive"   // 오류/삭제/거부
"bg-muted text-muted-foreground"  // 비활성/보조
```

**이유:** 상태 색상을 통일하면 사용자가 앱 전체에서 일관된 시각적 피드백을 받습니다.

---

## 7. 에러 처리 패턴

### 7.1 프론트엔드 에러 처리

```jsx
// API 호출 패턴
const fetchData = async () => {
  try {
    setLoading(true)
    const response = await api.get('/endpoint')
    setData(response.data)
  } catch (error) {
    // 사용자에게 의미 있는 메시지 표시
    toast.error(error.response?.data?.message || '데이터를 불러오는데 실패했습니다.')
  } finally {
    setLoading(false)
  }
}
```

### 7.2 백엔드 에러 처리

```typescript
// 표준 에러 응답 형식
interface ApiError {
  success: false
  error: {
    code: string       // 'VALIDATION_ERROR', 'NOT_FOUND' 등
    message: string    // 사용자 표시용 메시지
    details?: unknown  // 디버깅용 상세 정보 (개발 환경만)
  }
}

// 성공 응답 형식
interface ApiSuccess<T> {
  success: true
  data: T
}
```

### 7.3 에러 처리 원칙

1. **시스템 경계에서만 검증**: 사용자 입력, 외부 API 응답 등 외부 데이터만 검증
2. **내부 코드는 신뢰**: 함수 간 전달되는 내부 데이터에 불필요한 null 체크 금지
3. **의미 있는 에러 메시지**: 기술적 에러를 사용자가 이해할 수 있는 메시지로 변환
4. **에러 전파**: 처리할 수 없는 에러는 상위로 전파, 삼키지(swallow) 않기

---

## 8. 테스트 작성 기준

### 8.1 테스트 파일 위치

```
src/
├── components/
│   ├── UserCard.jsx
│   └── UserCard.test.jsx     # 컴포넌트와 같은 위치
├── stores/
│   ├── authStore.js
│   └── authStore.test.js
└── utils/
    ├── formatDate.js
    └── formatDate.test.js
```

### 8.2 테스트 네이밍

```javascript
describe('UserCard', () => {
  it('사용자 이름을 올바르게 표시한다', () => {
    // ...
  })

  it('권한이 없으면 수정 버튼을 숨긴다', () => {
    // ...
  })

  it('삭제 버튼 클릭 시 확인 다이얼로그를 표시한다', () => {
    // ...
  })
})
```

### 8.3 테스트 우선순위

1. **필수**: 비즈니스 로직 (스토어 액션, 유틸리티 함수)
2. **권장**: 사용자 인터랙션이 복잡한 컴포넌트
3. **선택**: 순수 UI 표시 컴포넌트

---

## 9. 금지 사항 요약

| 항목 | 이유 |
|------|------|
| `any` 타입 (TypeScript) | 타입 안전성 무력화 |
| `console.log` (프로덕션) | 성능 저하 및 정보 노출 |
| 하드코딩된 URL/포트/키 | 환경별 배포 불가 |
| `git add -A` (무분별한 사용) | 의도하지 않은 파일 커밋 위험 |
| PATCH, PUT, DELETE HTTP 메서드 | 회사 API 표준 위반 |
| 주석 처리된 코드 방치 | 코드 가독성 저하 |
| 미사용 import/변수 | 불필요한 번들 크기 증가 |
| `.env` 파일 커밋 | 보안 위험 |

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
