# AI 금지 코드 패턴 카탈로그

<!-- jinhak_standard_version: 2.0 -->
<!-- document_type: security-forbidden-patterns -->
<!-- last_updated: 2026-02-20 -->

---

## 1. 개요

이 문서는 AI(Claude Code)가 **절대 생성해서는 안 되는 12개 금지 코드 패턴**을 정의합니다.

**목적:**
- AI가 보안 취약점을 포함한 코드를 생성하는 것을 사전 차단
- 각 금지 패턴에 대한 안전한 대안을 명확히 제시
- ESLint/Semgrep 등 자동 탐지 도구와의 매핑 제공

**적용 범위:**
- AI가 생성하는 모든 JavaScript/TypeScript 코드
- AI가 제안하는 코드 수정, 리팩토링
- NightBuilder 자동 생성 코드

**등급 기준:**
| 위험도 | 설명 | Claude 행동 |
|--------|------|------------|
| CRITICAL | 즉시 보안 침해 가능 | BLOCK (생성 즉시 중단) |
| HIGH | 심각한 보안 위험 | BLOCK (생성 즉시 중단) |
| MEDIUM | 잠재적 보안 위험 | WARN (경고 + 대안 제시) |

---

## 2. 금지 패턴 상세

### 패턴 1: 동적 코드 실행

| 항목 | 내용 |
|------|------|
| **패턴명** | eval(), Function(), new Function() |
| **위험도** | CRITICAL |
| **설명** | 문자열을 코드로 실행하여 임의 코드 실행(RCE) 취약점 발생. 공격자가 입력값을 통해 서버 측 코드를 실행할 수 있음. |
| **OWASP** | Web A03 (Injection), LLM01 (Prompt Injection) |

**금지 코드:**
```javascript
// 절대 금지
eval(userInput);
const fn = new Function('return ' + userInput);
setTimeout(userInput, 0);  // 문자열 인자 시 eval과 동일
setInterval(userInput, 1000);
```

**안전한 대안:**
```javascript
// JSON 파싱이 필요한 경우
const data = JSON.parse(userInput);

// 동적 함수 호출이 필요한 경우
const allowedActions = { create: handleCreate, update: handleUpdate };
const action = allowedActions[userInput];
if (action) action();

// 템플릿 처리가 필요한 경우
const template = (name) => `안녕하세요, ${name}님`;
```

---

### 패턴 2: 커맨드 인젝션

| 항목 | 내용 |
|------|------|
| **패턴명** | child_process.exec() with 사용자 입력 |
| **위험도** | CRITICAL |
| **설명** | 사용자 입력을 OS 명령어에 직접 삽입하여 임의 명령 실행 가능. 서버 전체가 공격자에게 노출될 수 있음. |
| **OWASP** | Web A03 (Injection), LLM06 (Excessive Agency) |

**금지 코드:**
```javascript
// 절대 금지
const { exec } = require('child_process');
exec(`ls ${userInput}`);
exec('cat ' + filePath);
```

**안전한 대안:**
```javascript
// execFile 또는 spawn 사용 (쉘 해석 없음)
const { execFile } = require('child_process');
execFile('ls', [validatedPath], (error, stdout) => { /* ... */ });

// 또는 spawn 사용
const { spawn } = require('child_process');
const ls = spawn('ls', [validatedPath]);
```

---

### 패턴 3: Path Traversal

| 항목 | 내용 |
|------|------|
| **패턴명** | fs.readFile/writeFile with 사용자 제공 경로 (검증 없이) |
| **위험도** | HIGH |
| **설명** | 사용자가 `../../../etc/passwd` 같은 경로를 제공하여 시스템 파일에 접근 가능. |
| **OWASP** | Web A01 (Broken Access Control), LLM06 (Excessive Agency) |

**금지 코드:**
```javascript
// 절대 금지
const filePath = req.query.file;
fs.readFileSync(filePath);
fs.writeFileSync(req.body.path, data);
```

**안전한 대안:**
```javascript
const path = require('path');

// 기본 디렉토리 고정 + 경로 정규화 + 검증
const BASE_DIR = path.resolve('/app/uploads');
const requestedPath = path.resolve(BASE_DIR, req.query.file);

// 기본 디렉토리를 벗어나는지 확인
if (!requestedPath.startsWith(BASE_DIR)) {
  throw new Error('접근이 거부되었습니다.');
}

const data = fs.readFileSync(requestedPath);
```

---

### 패턴 4: 취약한 해시 알고리즘

| 항목 | 내용 |
|------|------|
| **패턴명** | crypto.createHash('md5') / crypto.createHash('sha1') |
| **위험도** | HIGH |
| **설명** | MD5와 SHA1은 충돌 공격(collision attack)이 입증된 취약한 해시 알고리즘. 비밀번호 해싱, 데이터 무결성 검증에 부적합. |
| **OWASP** | Web A02 (Cryptographic Failures), LLM02 (Sensitive Info Disclosure) |

**금지 코드:**
```javascript
// 절대 금지
const hash = crypto.createHash('md5').update(password).digest('hex');
const hash = crypto.createHash('sha1').update(data).digest('hex');
```

**안전한 대안:**
```javascript
// 비밀번호 해싱: bcrypt 사용
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);

// 데이터 무결성 검증: SHA-256 이상 사용
const hash = crypto.createHash('sha256').update(data).digest('hex');

// HMAC 기반 검증
const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');
```

---

### 패턴 5: 비암호화 통신

| 항목 | 내용 |
|------|------|
| **패턴명** | http:// (비암호화 통신) |
| **위험도** | HIGH |
| **설명** | HTTP 평문 통신은 중간자 공격(MITM)에 취약. 전송 중 데이터가 도청/변조될 수 있음. |
| **OWASP** | Web A02 (Cryptographic Failures), LLM02 (Sensitive Info Disclosure) |

**금지 코드:**
```javascript
// 절대 금지 (프로덕션)
fetch('http://api.example.com/users');
axios.get('http://internal-service/data');
const API_URL = 'http://example.com';
```

**안전한 대안:**
```javascript
// HTTPS 사용
fetch('https://api.example.com/users');
axios.get('https://internal-service/data');
const API_URL = process.env.API_URL; // 환경 변수에서 관리

// 로컬 개발 환경 예외 (localhost만 허용)
const isDev = process.env.NODE_ENV === 'development';
const baseUrl = isDev ? 'http://localhost:3000' : process.env.API_URL;
```

---

### 패턴 6: 무제한 CORS

| 항목 | 내용 |
|------|------|
| **패턴명** | cors({ origin: '*' }) in 프로덕션 |
| **위험도** | MEDIUM |
| **설명** | 모든 도메인에서의 요청을 허용하면 CSRF, 데이터 탈취 등의 공격에 노출. |
| **OWASP** | Web A05 (Security Misconfiguration), LLM07 (System Prompt Leakage) |

**금지 코드:**
```javascript
// 프로덕션에서 금지
app.use(cors({ origin: '*' }));
app.use(cors()); // 기본값이 *
res.setHeader('Access-Control-Allow-Origin', '*');
```

**안전한 대안:**
```javascript
// 허용 도메인 화이트리스트 설정
const allowedOrigins = [
  'https://www.jinhak.com',
  'https://admin.jinhak.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true,
}));
```

---

### 패턴 7: 민감정보 로깅

| 항목 | 내용 |
|------|------|
| **패턴명** | console.log(password/token/secret) |
| **위험도** | HIGH |
| **설명** | 비밀번호, 토큰, API Key 등 민감 정보가 로그에 기록되면 로그 파일을 통해 유출 가능. |
| **OWASP** | Web A09 (Logging Failures), LLM02 (Sensitive Info Disclosure) |

**금지 코드:**
```javascript
// 절대 금지
console.log('사용자 비밀번호:', password);
console.log('토큰:', token);
console.log('API Key:', process.env.API_KEY);
logger.info({ password, token, apiKey });
```

**안전한 대안:**
```javascript
// 민감 정보는 마스킹하여 로깅
const maskSensitive = (value) => value ? `${value.substring(0, 3)}***` : '[EMPTY]';

logger.info('인증 시도', { userId, tokenPrefix: maskSensitive(token) });

// 구조화된 로거 사용 (민감 필드 자동 제거)
const logger = createLogger({
  redactFields: ['password', 'token', 'apiKey', 'secret', 'authorization'],
});
```

---

### 패턴 8: SQL Injection

| 항목 | 내용 |
|------|------|
| **패턴명** | SQL 문자열 보간 (Template Literal / 문자열 연결) |
| **위험도** | CRITICAL |
| **설명** | 사용자 입력을 SQL 쿼리에 직접 삽입하면 데이터베이스 전체가 공격자에게 노출됨. |
| **OWASP** | Web A03 (Injection), LLM01 (Prompt Injection) |

**금지 코드:**
```javascript
// 절대 금지
const query = `SELECT * FROM users WHERE id = '${userId}'`;
const query = "SELECT * FROM users WHERE name = '" + userName + "'";
db.query(`DELETE FROM orders WHERE id = ${req.params.id}`);
```

**안전한 대안:**
```javascript
// Prepared Statement (파라미터화 쿼리)
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// ORM 사용 (Prisma)
const user = await prisma.user.findUnique({ where: { id: userId } });

// ORM 사용 (Drizzle)
const user = await db.select().from(users).where(eq(users.id, userId));
```

---

### 패턴 9: 스택 트레이스 노출

| 항목 | 내용 |
|------|------|
| **패턴명** | res.send(error.stack) - 에러 상세 정보 외부 노출 |
| **위험도** | MEDIUM |
| **설명** | 에러 스택 트레이스를 클라이언트에 전송하면 내부 파일 경로, 라이브러리 버전 등 공격에 유용한 정보가 노출됨. |
| **OWASP** | Web A04 (Insecure Design), LLM05 (Improper Output Handling) |

**금지 코드:**
```javascript
// 절대 금지
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});
res.status(500).send(error.toString());
```

**안전한 대안:**
```javascript
// 사용자에게는 일반적인 에러 메시지만 전달
app.use((err, req, res, next) => {
  // 서버 로그에만 상세 정보 기록
  logger.error('서버 오류', {
    message: err.message,
    stack: err.stack,
    requestId: req.id,
  });

  // 클라이언트에는 최소한의 정보만 전달
  res.status(500).json({
    error: '서버 오류가 발생했습니다.',
    requestId: req.id, // 추적용 ID만 제공
  });
});
```

---

### 패턴 10: JWT 알고리즘 혼동

| 항목 | 내용 |
|------|------|
| **패턴명** | jwt.verify() without algorithm 지정 |
| **위험도** | HIGH |
| **설명** | JWT 검증 시 알고리즘을 지정하지 않으면 `alg: none` 공격이나 RS256→HS256 알고리즘 혼동 공격에 취약. |
| **OWASP** | Web A07 (Auth Failures), LLM02 (Sensitive Info Disclosure) |

**금지 코드:**
```javascript
// 절대 금지
const decoded = jwt.verify(token, secret);
const decoded = jwt.verify(token, publicKey);
jwt.decode(token); // 서명 검증 없이 디코딩만
```

**안전한 대안:**
```javascript
// 알고리즘 명시적 지정
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'], // 허용 알고리즘 명시
  issuer: 'jinhak.com',
  audience: 'jinhak-api',
});

// RS256 사용 시
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],
  issuer: 'jinhak.com',
});
```

---

### 패턴 11: 예측 가능한 난수

| 항목 | 내용 |
|------|------|
| **패턴명** | Math.random() for 보안 목적 |
| **위험도** | MEDIUM |
| **설명** | Math.random()은 암호학적으로 안전하지 않은 PRNG를 사용. 토큰, 비밀번호, 세션 ID 생성에 사용 시 예측 가능. |
| **OWASP** | Web A02 (Cryptographic Failures), LLM02 (Sensitive Info Disclosure) |

**금지 코드:**
```javascript
// 보안 목적으로 절대 금지
const token = Math.random().toString(36).substring(2);
const sessionId = 'sess_' + Math.random();
const resetCode = Math.floor(Math.random() * 999999);
```

**안전한 대안:**
```javascript
const crypto = require('crypto');

// 안전한 토큰 생성
const token = crypto.randomBytes(32).toString('hex');

// 안전한 세션 ID
const sessionId = crypto.randomUUID();

// 안전한 인증 코드
const resetCode = crypto.randomInt(100000, 999999);
```

---

### 패턴 12: 하드코딩된 인프라 정보

| 항목 | 내용 |
|------|------|
| **패턴명** | 하드코딩된 IP/포트/도메인 in 소스 코드 |
| **위험도** | MEDIUM |
| **설명** | IP 주소, 포트 번호, 도메인을 소스 코드에 직접 작성하면 환경별 배포가 불가능하고, 내부 인프라 정보가 노출됨. |
| **OWASP** | Web A05 (Security Misconfiguration), LLM07 (System Prompt Leakage) |

**금지 코드:**
```javascript
// 절대 금지
const DB_HOST = '192.168.1.100';
const API_URL = 'https://api.jinhak.com:8443';
const REDIS_URL = 'redis://10.0.0.5:6379';
fetch('http://172.16.0.1:3000/api/users');
```

**안전한 대안:**
```javascript
// 환경 변수 사용
const DB_HOST = process.env.DB_HOST;
const API_URL = process.env.API_URL;
const REDIS_URL = process.env.REDIS_URL;

// 설정 모듈 사용
const config = require('./config');
const dbClient = createClient(config.database);

// Vault에서 동적 조회
const credentials = await vault.read('secret/data/database');
```

---

## 3. ESLint/Semgrep 탐지 규칙 매핑

각 금지 패턴은 정적 분석 도구로 자동 탐지할 수 있습니다.

| # | 패턴 | ESLint 규칙 | Semgrep 규칙 |
|---|------|------------|-------------|
| 1 | eval/Function | `no-eval`, `no-new-func`, `no-implied-eval` | `javascript.lang.security.audit.detect-eval` |
| 2 | 커맨드 인젝션 | `security/detect-child-process` | `javascript.lang.security.audit.detect-child-process` |
| 3 | Path Traversal | `security/detect-non-literal-fs-filename` | `javascript.lang.security.audit.path-traversal` |
| 4 | 취약한 해시 | 커스텀 규칙 | `javascript.lang.security.audit.detect-insecure-hash` |
| 5 | 비암호화 통신 | 커스텀 규칙 (URL 패턴 검사) | `javascript.lang.security.audit.detect-http-urls` |
| 6 | 무제한 CORS | 커스텀 규칙 | `javascript.express.security.audit.cors-misconfiguration` |
| 7 | 민감정보 로깅 | `no-console` (프로덕션) | `javascript.lang.security.audit.detect-secret-logging` |
| 8 | SQL Injection | `security/detect-sql-injection` | `javascript.lang.security.audit.detect-sql-injection` |
| 9 | 스택 트레이스 노출 | 커스텀 규칙 | `javascript.express.security.audit.error-disclosure` |
| 10 | JWT 알고리즘 혼동 | 커스텀 규칙 | `javascript.jwt.security.audit.jwt-alg-none` |
| 11 | 예측 가능한 난수 | `security/detect-insecure-randomness` | `javascript.lang.security.audit.insecure-random` |
| 12 | 하드코딩 인프라 | `no-hardcoded-credentials` | `generic.secrets.security.detected-hardcoded-ip` |

> ESLint 보안 관련 규칙은 `eslint-plugin-security` 패키지를 설치하여 사용합니다.

---

## 4. 요약 테이블

| # | 패턴명 | 위험도 | OWASP Web | OWASP LLM | 탐지 도구 |
|---|--------|--------|-----------|-----------|----------|
| 1 | eval/Function/new Function | CRITICAL | A03 | LLM01 | ESLint + Semgrep |
| 2 | child_process.exec + 사용자 입력 | CRITICAL | A03 | LLM06 | ESLint + Semgrep |
| 3 | fs 경로 검증 없는 파일 접근 | HIGH | A01 | LLM06 | ESLint + Semgrep |
| 4 | MD5/SHA1 해시 | HIGH | A02 | LLM02 | Semgrep |
| 5 | HTTP 평문 통신 | HIGH | A02 | LLM02 | Semgrep |
| 6 | CORS origin: * (프로덕션) | MEDIUM | A05 | LLM07 | Semgrep |
| 7 | 민감정보 console.log | HIGH | A09 | LLM02 | ESLint + Semgrep |
| 8 | SQL 문자열 보간 | CRITICAL | A03 | LLM01 | ESLint + Semgrep |
| 9 | 에러 스택 트레이스 노출 | MEDIUM | A04 | LLM05 | Semgrep |
| 10 | JWT 알고리즘 미지정 | HIGH | A07 | LLM02 | Semgrep |
| 11 | Math.random 보안 목적 사용 | MEDIUM | A02 | LLM02 | ESLint + Semgrep |
| 12 | 하드코딩 IP/포트/도메인 | MEDIUM | A05 | LLM07 | Semgrep |

---

*이 문서는 [JINHAK 전사 AI 개발 표준](../CLAUDE.md) v2.0의 보안 상세 문서입니다.*
