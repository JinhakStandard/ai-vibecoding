# 단위 테스트 생성

## 컨텍스트

주어진 함수/모듈에 대한 Vitest 또는 Jest 단위 테스트를 체계적으로 생성합니다. 정상 케이스, 경계값, 에러 케이스를 포함하여 높은 커버리지를 달성합니다.

- **대상**: 테스트가 필요한 함수, 유틸리티, 서비스 모듈
- **전제 조건**: Vitest 또는 Jest가 프로젝트에 설정되어 있을 것
- **기대 결과**: describe/it 구조의 완성된 테스트 파일

## 프롬프트

```
다음 코드에 대한 단위 테스트를 작성해주세요.

## 테스트 프레임워크
{vitest 또는 jest}

## 테스트 대상 코드
{여기에 테스트할 함수/모듈 코드를 붙여넣기}

## 테스트 작성 규칙
1. **구조**: describe로 함수/모듈 단위 그룹핑, it으로 개별 케이스
2. **네이밍**: it 설명은 한국어로 작성 (예: "빈 배열을 전달하면 빈 배열을 반환한다")
3. **AAA 패턴**: Arrange(준비) → Act(실행) → Assert(검증) 순서
4. **커버리지 대상**:
   - 정상 입력 케이스 (happy path)
   - 경계값 (빈 값, 0, null, undefined, 최대값)
   - 에러/예외 케이스 (잘못된 입력, 네트워크 실패 등)
   - 엣지 케이스 (동시성, 타이밍 등 해당되는 경우)
5. **모킹**: 외부 의존성(API, DB)은 vi.mock() 또는 jest.mock()으로 격리
6. **단언**: toBe, toEqual, toThrow 등 의미에 맞는 matcher 사용

## 추가 요구사항
{추가 요구사항이 있으면 여기에 작성, 없으면 "없음"}
```

## 사용 예시

### 예시 1: 유틸리티 함수 테스트

**입력:**
```
## 테스트 프레임워크
vitest

## 테스트 대상 코드
export function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

## 추가 요구사항
없음
```

**기대 출력 요약:**
- `describe('formatCurrency', ...)` 블록
- 정상값 테스트 (1000 → "₩1,000")
- 경계값 테스트 (0, 음수, 매우 큰 수)
- 소수점 처리 테스트

## 변형

| 변형 | 설명 | 변경 포인트 |
|------|------|------------|
| React 컴포넌트용 | @testing-library/react | render, screen, fireEvent 사용 |
| API 핸들러용 | supertest 통합 | HTTP 요청/응답 테스트 포함 |
| 스냅샷 포함 | 스냅샷 테스트 추가 | toMatchSnapshot() 단언 추가 |
