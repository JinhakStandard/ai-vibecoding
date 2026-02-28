# 보안 코드 리뷰

## 컨텍스트

JINHAK AI 보안 가이드레일의 금지 패턴 12종을 기반으로 코드 변경사항을 빠르게 점검합니다. `/security-check` 스킬의 경량 버전으로, Claude.ai에서도 사용할 수 있습니다.

- **대상**: 새로 작성하거나 수정한 코드 파일
- **전제 조건**: 검토할 코드를 프롬프트에 포함하거나 파일 경로를 지정
- **기대 결과**: 금지 패턴 탐지 결과 + 수정 방향 제안

## 프롬프트

```
다음 코드를 JINHAK 보안 표준 기준으로 리뷰해주세요.

## 검사 기준 (금지 패턴 12종)
1. eval(), Function(), new Function() — 동적 코드 실행
2. child_process.exec() + 사용자 입력 — 커맨드 인젝션
3. fs.readFile/writeFile + 미검증 경로 — Path Traversal
4. crypto.createHash('md5'/'sha1') — 취약한 해시
5. http:// (프로덕션) — 평문 전송
6. cors({ origin: '*' }) (프로덕션) — 무제한 CORS
7. console.log(password/token/secret) — 민감정보 로깅
8. SQL 문자열 연결 ("SELECT..." + var) — SQL Injection
9. res.send(error.stack) — 스택 트레이스 노출
10. jwt.verify() 알고리즘 미지정 — 알고리즘 혼동
11. Math.random() 보안 목적 — 예측 가능 난수
12. 하드코딩 IP/포트/도메인 — 환경 의존성

## 추가 검사
- 사용자 입력 검증 여부 (req.body, req.query, req.params)
- 에러 응답에 내부 정보 노출 여부
- 시크릿/API키 하드코딩 여부

## 출력 형식
각 발견 사항을 다음 형식으로 보고:
- ❌ FAIL / ⚠️ WARN / ✅ PASS
- 해당 금지 패턴 번호
- 위치 (파일:라인)
- 안전한 대안 코드

## 리뷰 대상 코드
{여기에 코드를 붙여넣기}
```

## 사용 예시

### 예시 1: Express API 엔드포인트 리뷰

**입력:**
```
다음 코드를 JINHAK 보안 표준 기준으로 리뷰해주세요.

(위 검사 기준 포함)

## 리뷰 대상 코드
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  const result = await db.query(query);
  res.json(result);
});
```

**기대 출력 요약:**
- ❌ FAIL: #8 SQL 문자열 연결 탐지 → 파라미터화 쿼리 제안
- ⚠️ WARN: 입력 검증 부재 → Zod/Joi 스키마 검증 제안

## 변형

| 변형 | 설명 | 변경 포인트 |
|------|------|------------|
| 간소화 버전 | 금지 패턴만 검사 | 추가 검사 섹션 제거 |
| 프론트엔드용 | React/Next.js 코드 | XSS, dangerouslySetInnerHTML, href="javascript:" 검사 추가 |
| 풀 감사 | 전체 보안 감사 | `/security-check` 스킬 사용 권장 |
