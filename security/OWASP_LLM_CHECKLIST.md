# OWASP LLM Top 10 (2025) + Web Top 10 교차 체크리스트

<!-- jinhak_standard_version: 2.0 -->
<!-- document_type: security-checklist -->
<!-- last_updated: 2026-02-20 -->

---

## 1. 개요

이 문서는 **OWASP LLM Top 10 (2025)**과 **OWASP Web Top 10**을 교차 매핑하여, AI 코드 생성 환경에서 적용해야 할 보안 체크리스트를 제공합니다.

**목적:**
- AI(Claude Code)가 생성하는 코드에서 OWASP 기반 보안 취약점을 사전 방지
- 웹 애플리케이션 보안과 LLM 보안의 교차 영역을 체계적으로 관리
- 분기별 보안 점검의 기준 문서로 활용

**적용 대상:**
- AI가 생성하는 모든 웹 애플리케이션 코드
- AI 협업 환경 자체의 보안 설정
- AI가 추천하는 아키텍처 및 기술 선택

---

## 2. OWASP LLM Top 10 (2025)

### LLM01: Prompt Injection

**설명:** 악의적인 입력을 통해 LLM의 동작을 의도치 않게 변경하는 공격.

**위험:**
- 시스템 프롬프트 무시 또는 우회
- 금지된 작업 수행 유도
- 민감 정보 추출

**대응:** 시스템 프롬프트와 사용자 입력의 명확한 분리, 입력 검증, settings.json deny 규칙 적용

### LLM02: Sensitive Information Disclosure

**설명:** LLM이 학습 데이터 또는 컨텍스트에 포함된 민감 정보를 노출하는 위협.

**위험:**
- API Key, 비밀번호 등의 노출
- 개인정보(수험생 데이터)의 의도치 않은 출력
- 시스템 내부 구조 노출

**대응:** 민감 데이터 컨텍스트 제외, 출력 필터링, 데이터 분류 정책 적용

### LLM03: Supply Chain Vulnerabilities

**설명:** LLM 생태계의 공급망(패키지, 플러그인, 모델)을 통한 보안 위협.

**위험:**
- AI가 추천하는 악성/취약 패키지
- 존재하지 않는 패키지명 환각(hallucination)
- 의존성 혼동 공격(dependency confusion)

**대응:** 패키지 검증 기준 적용, npm audit 필수, lock 파일 보호

### LLM04: Data and Model Poisoning

**설명:** 학습 데이터나 컨텍스트 데이터를 오염시켜 LLM의 출력을 조작하는 공격.

**위험:**
- 악성 코드가 포함된 컨텍스트 주입
- 잘못된 코딩 패턴 학습 유도
- 보안 규칙 무력화

**대응:** 컨텍스트 무결성 검증, 신뢰할 수 있는 소스만 참조, CLAUDE.md 변조 감지

### LLM05: Improper Output Handling

**설명:** LLM의 출력을 적절히 검증하지 않고 사용하여 발생하는 보안 위협.

**위험:**
- AI 생성 코드에 보안 취약점 포함
- XSS, SQL Injection 등의 취약한 코드 자동 적용
- 검증 없이 AI 출력을 프로덕션에 배포

**대응:** 코드 리뷰 의무화, SAST 스캔, Human-in-the-Loop 필수 영역 지정

### LLM06: Excessive Agency

**설명:** LLM에 과도한 권한을 부여하여 의도치 않은 작업을 수행하는 위협.

**위험:**
- 파일 시스템 무제한 접근
- 위험한 시스템 명령 실행
- 프로덕션 환경 직접 조작

**대응:** 최소 권한 원칙, settings.json allow/deny 규칙, 프로덕션 접근 차단

### LLM07: System Prompt Leakage

**설명:** 시스템 프롬프트(CLAUDE.md 등)의 내용이 외부에 노출되는 위협.

**위험:**
- 보안 규칙 우회 정보 노출
- 내부 아키텍처 정보 유출
- 조직 내부 정책 노출

**대응:** 시스템 프롬프트에 민감 정보 미포함, 보안 규칙은 코드(settings.json deny)로 강제

### LLM08: Vector and Embedding Weaknesses

**설명:** RAG(Retrieval Augmented Generation) 시스템의 벡터 DB/임베딩 취약점.

**위험:**
- 악성 문서를 통한 검색 결과 조작
- 임베딩을 통한 데이터 유출
- 벡터 DB 접근 제어 미흡

**대응:** RAG 사용 시 소스 데이터 검증, 벡터 DB 접근 제어, 검색 결과 필터링

### LLM09: Misinformation

**설명:** LLM이 사실과 다른 정보를 생성하는 위협 (환각, hallucination).

**위험:**
- 존재하지 않는 API/라이브러리 추천
- 잘못된 보안 조언
- 부정확한 설정 값 제공

**대응:** AI 생성 코드의 동작 검증 필수, 보안 관련 조언은 공식 문서와 교차 확인

### LLM10: Unbounded Consumption

**설명:** LLM 리소스의 과도한 사용으로 인한 서비스 거부(DoS) 및 비용 폭증.

**위험:**
- 무한 루프형 프롬프트
- 과도한 토큰 소비
- NightBuilder 비정상 동작으로 인한 비용 증가

**대응:** 세션 타임아웃 설정, 일일 토큰 사용량 모니터링, NightBuilder 실행 제한

---

## 3. OWASP Web Top 10 ↔ LLM Top 10 교차 매핑

| OWASP Web | OWASP LLM 2025 | AI 코드 생성 시 적용 규칙 |
|-----------|----------------|--------------------------|
| A01: Broken Access Control | LLM06: Excessive Agency | AI에 최소 권한 원칙 적용, 파일/네트워크 접근 제한. AI가 생성하는 인가 로직은 반드시 2인 리뷰 |
| A02: Cryptographic Failures | LLM02: Sensitive Info Disclosure | 암호화 관련 코드는 반드시 검증된 라이브러리 사용. MD5/SHA1 금지, AES-256 이상 강제 |
| A03: Injection | LLM01: Prompt Injection | 파라미터화 쿼리 강제, 입력 검증 필수. AI 생성 SQL은 반드시 prepared statement 사용 |
| A04: Insecure Design | LLM05: Improper Output Handling | AI 출력 코드 보안 리뷰 의무화. 아키텍처 결정은 Human-in-the-Loop 필수 |
| A05: Security Misconfiguration | LLM07: System Prompt Leakage | 설정 파일 보안, 시스템 프롬프트 보호. 디폴트 설정 변경 여부 검증 |
| A06: Vulnerable Components | LLM03: Supply Chain | AI 추천 패키지 보안 검증 자동화. 주간 다운로드 수, CVE, 라이선스 확인 |
| A07: Auth Failures | LLM02: Sensitive Info Disclosure | 인증 로직은 검증된 패턴만 사용. AI가 직접 인증 로직을 설계하지 않고 라이브러리 활용 |
| A08: Data Integrity Failures | LLM04: Data/Model Poisoning | AI 학습 데이터 및 컨텍스트 무결성 검증. CLAUDE.md 변조 감지, 서명 기반 검증 |
| A09: Logging Failures | LLM10: Unbounded Consumption | AI 작업 로깅 필수, 리소스 사용량 모니터링. 민감 정보 로깅 금지 |
| A10: SSRF | LLM05: Improper Output Handling | AI 생성 URL/네트워크 호출 코드 검증. 내부 네트워크 주소 참조 금지, 허용 도메인 화이트리스트 |

---

## 4. 보안 체크리스트

### 4.1 입력 보안 (Layer 1)

- [ ] AI에 전달되는 프롬프트에 민감 정보(비밀번호, API Key, 개인정보)가 포함되지 않는가?
- [ ] `.env` 파일 및 시크릿 파일이 AI 컨텍스트에서 제외되어 있는가?
- [ ] 외부 데이터(URL, 파일)를 AI에 전달할 때 신뢰할 수 있는 소스인가?
- [ ] CLAUDE.md 및 settings.json 파일의 무결성이 유지되고 있는가?

### 4.2 코드 생성 보안 (Layer 2)

- [ ] AI가 생성한 코드에 [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md)의 금지 패턴이 포함되지 않는가?
- [ ] 모든 외부 입력에 대한 검증/새니타이징이 적용되어 있는가?
- [ ] SQL 쿼리가 파라미터화(Prepared Statement)로 구현되어 있는가?
- [ ] 인증/암호화 로직이 검증된 라이브러리를 사용하는가?
- [ ] 에러 메시지에 스택 트레이스, 내부 경로 등이 노출되지 않는가?
- [ ] CORS, CSP 등 보안 헤더가 적절히 설정되어 있는가?

### 4.3 의존성 보안 (Layer 3)

- [ ] AI가 추천한 패키지가 npm 레지스트리에 실제 존재하는가?
- [ ] 패키지의 주간 다운로드 수가 10,000회 이상인가?
- [ ] `npm audit` 결과 Critical/High 취약점이 0건인가?
- [ ] 라이선스가 허용 목록(MIT, Apache 2.0, ISC)에 포함되는가?
- [ ] lock 파일 변경사항이 의도된 것인가?

### 4.4 출력 검증 (Layer 4)

- [ ] AI가 생성한 코드에 대한 코드 리뷰가 수행되었는가?
- [ ] Human-in-the-Loop 필수 영역(인증, 결제, DB 마이그레이션, 개인정보)의 코드가 사람에 의해 검토되었는가?
- [ ] 커밋 메시지에 `Co-Authored-By` 태그가 포함되어 있는가?
- [ ] SAST/보안 스캔이 통과되었는가?

### 4.5 런타임 보안 (Layer 5)

- [ ] AI 세션의 파일 시스템 접근 범위가 프로젝트 디렉토리로 제한되어 있는가?
- [ ] settings.json의 deny 규칙이 올바르게 설정되어 있는가?
- [ ] 프로덕션 환경에 대한 AI 직접 접근이 차단되어 있는가?
- [ ] NightBuilder 사용 시 [NIGHTBUILDER_SECURITY.md](./NIGHTBUILDER_SECURITY.md) 규칙이 적용되어 있는가?

### 4.6 데이터 보안 (Layer 6)

- [ ] [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) 기준에 따라 데이터가 분류되어 있는가?
- [ ] 극비/대외비 데이터가 AI 컨텍스트에 포함되지 않는가?
- [ ] 테스트 데이터가 실제 데이터가 아닌 가명화된 데이터인가?
- [ ] AI 작업 로그가 적절히 기록되고, 민감 정보는 제외되어 있는가?
- [ ] 로그 보존 기간 정책이 준수되고 있는가?

### 4.7 거버넌스 (Layer 7)

- [ ] AI 보안 규칙 월간 리뷰가 수행되었는가?
- [ ] 금지 패턴 목록이 최신 상태인가? (분기별 업데이트)
- [ ] 팀원 대상 AI 보안 교육이 반기 내에 실시되었는가?
- [ ] 인시던트 대응 절차([INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md))가 팀원에게 공유되었는가?
- [ ] 모의 인시던트 훈련이 연 1회 이상 실시되었는가?

---

## 5. 관련 문서 참조

| 문서 | 설명 |
|------|------|
| [AI_SECURITY_GUARDRAILS.md](./AI_SECURITY_GUARDRAILS.md) | 7-Layer Defense 마스터 문서 |
| [FORBIDDEN_PATTERNS.md](./FORBIDDEN_PATTERNS.md) | AI 금지 코드 패턴 12종 카탈로그 |
| [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) | 데이터 분류 및 처리 기준 |
| [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) | 인시던트 대응 가이드 |
| [NIGHTBUILDER_SECURITY.md](./NIGHTBUILDER_SECURITY.md) | NightBuilder 보안 규칙 |
| [../SECURITY_ISMS.md](../SECURITY_ISMS.md) | ISMS 보안 가이드 |

**외부 참조:**
- [OWASP LLM Top 10 2025](https://genai.owasp.org/llm-top-10/)
- [OWASP Web Top 10 2021](https://owasp.org/www-project-top-ten/)

---

*이 문서는 [JINHAK 전사 AI 개발 표준](../CLAUDE.md) v2.0의 보안 상세 문서입니다.*
