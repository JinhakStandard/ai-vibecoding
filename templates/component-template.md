# 컴포넌트 생성 템플릿

이 문서는 새로운 React 컴포넌트를 만들 때 사용하는 표준 템플릿입니다.
AI(Claude)에게 컴포넌트 생성을 요청할 때 이 템플릿을 참고하면 일관된 품질의 코드를 얻을 수 있습니다.

---

## 1. 기본 UI 컴포넌트

> 여러 페이지/프로젝트에서 재사용하는 범용 컴포넌트

### 파일 위치
`src/components/ui/[component-name].jsx`

### 템플릿

```jsx
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../lib/utils"

const componentVariants = cva(
  "기본 클래스",
  {
    variants: {
      variant: {
        default: "기본 변형 클래스",
        secondary: "보조 변형 클래스",
      },
      size: {
        default: "기본 크기 클래스",
        sm: "작은 크기 클래스",
        lg: "큰 크기 클래스",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ComponentName = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
ComponentName.displayName = "ComponentName"

export { ComponentName, componentVariants }
```

### 사용 시 import

```javascript
import { ComponentName } from '@/components/ui/component-name'
```

---

## 2. 앱 공통 컴포넌트 (common)

> 앱 내 여러 페이지에서 사용하는 컴포넌트

### 파일 위치
`apps/[앱]/src/components/common/[ComponentName].jsx`

### 템플릿

```jsx
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * [컴포넌트 설명]
 *
 * @param {string} title - 제목
 * @param {string} description - 설명 (선택)
 * @param {React.ReactNode} children - 자식 요소
 * @param {string} className - 추가 CSS 클래스 (선택)
 */
export default function ComponentName({ title, description, children, className }) {
  return (
    <div className={cn("기본 클래스", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}
```

---

## 3. 도메인 컴포넌트

> 특정 비즈니스 도메인에 속하는 컴포넌트

### 파일 위치
`apps/[앱]/src/components/[도메인]/[ComponentName].jsx`

### 템플릿

```jsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * [도메인] [컴포넌트 설명]
 *
 * @param {Object} data - [도메인] 데이터 객체
 * @param {Function} onEdit - 수정 핸들러 (선택)
 * @param {Function} onDelete - 삭제 핸들러 (선택)
 * @param {string} className - 추가 CSS 클래스 (선택)
 */
export default function DomainCard({ data, onEdit, onDelete, className }) {
  const { id, title, status, description } = data

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                수정
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
                삭제
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 4. 페이지 컴포넌트

> URL에 대응하는 최상위 페이지 컴포넌트

### 파일 위치
`apps/[앱]/src/pages/[역할]/[PageName].jsx`

### 템플릿

```jsx
import React, { useState } from 'react'
import { IconName } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'

export default function PageName() {
  // 1. 스토어/라우터 훅
  // const data = useFeatureStore((s) => s.data)
  // const navigate = useNavigate()

  // 2. 로컬 상태
  const [isLoading, setIsLoading] = useState(false)

  // 3. 이펙트
  // useEffect(() => { ... }, [])

  // 4. 핸들러
  const handleAction = () => {
    // ...
  }

  // 5. 렌더
  return (
    <DashboardLayout role="[역할]" showNotifications={true}>
      <div className="h-full flex flex-col">
        {/* 페이지 헤더 */}
        <PageHeader
          icon={IconName}
          title="페이지 제목"
          description="페이지 설명"
          actions={
            <Button onClick={handleAction}>
              액션 버튼
            </Button>
          }
        />

        {/* 페이지 본문 */}
        <div className="flex-1 overflow-auto p-4">
          {/* 통계 카드 영역 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* StatCards */}
          </div>

          {/* 메인 컨텐츠 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* 테이블, 카드 리스트 등 */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

## 5. 위젯 컴포넌트

> 대시보드에 배치되는 독립적인 위젯

### 파일 위치
`apps/[앱]/src/components/widgets/[WidgetName].jsx`

### 템플릿

```jsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * [위젯 설명]
 *
 * @param {Object} data - 위젯 데이터
 * @param {string} className - 추가 CSS 클래스 (선택)
 */
export default function WidgetName({ data, className }) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          위젯 제목
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {data.description}
        </p>
      </CardContent>
    </Card>
  )
}
```

---

## 6. 컴포넌트 생성 프롬프트 예시

AI에게 컴포넌트를 요청할 때 사용할 수 있는 프롬프트 예시입니다.

### 기본 UI 컴포넌트

```
"src/components/ui/에 StatusBadge 컴포넌트를 만들어줘.
CVA를 사용하고, variant로 success/warning/error/info를 지원해."
```

### 도메인 컴포넌트

```
"apps/prototype/src/components/goals/에 GoalProgressCard를 만들어줘.
Card 컴포넌트를 기반으로 하고, 목표명, 진행률(Progress), 담당자, D-day를 표시해.
진행률 80% 이상이면 초록색, 50% 이상이면 노란색, 그 아래는 빨간색으로."
```

### 페이지 컴포넌트

```
"apps/prototype/src/pages/teamlead/에 TeamGoalPage.jsx를 만들어줘.
DashboardLayout(role='teamlead')으로 감싸고,
PageHeader에 Target 아이콘과 '팀 목표 관리' 제목을 넣어.
goalStore에서 데이터를 가져와서 GoalCard 리스트를 표시해줘."
```

---

## 7. 체크리스트

새 컴포넌트를 만든 후 확인할 사항:

- [ ] 적절한 폴더에 위치하는가?
- [ ] JSDoc 주석이 작성되었는가?
- [ ] `className` prop을 지원하는가?
- [ ] `cn()` 유틸리티를 사용하는가?
- [ ] import 순서가 올바른가?
- [ ] UI 기본 컴포넌트는 `src/components/ui/`에 위치하는가?
- [ ] 네이밍이 컨벤션에 맞는가? (PascalCase)

---

*이 문서는 [JINHAK 전사 AI 개발 표준](../CLAUDE.md)의 부속 문서입니다.*
