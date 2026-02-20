/**
 * JINHAK AI 보안 ESLint 설정 템플릿
 *
 * 사용법:
 * 1. npm install --save-dev eslint-plugin-security
 * 2. 이 파일을 프로젝트 루트에 .eslintrc.security.js로 복사
 * 3. 기존 ESLint 설정에 extends로 추가하거나 별도 실행
 *
 * 실행: npx eslint --config .eslintrc.security.js "src/"
 *
 * 참고: JINHAK AI 보안 가이드레일 v2.0 / security/FORBIDDEN_PATTERNS.md 기반
 */
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    // === eslint-plugin-security 규칙 ===

    // 동적 객체 키 접근 (프로토타입 오염 위험)
    'security/detect-object-injection': 'warn',

    // 동적 정규식 생성 (ReDoS 위험)
    'security/detect-non-literal-regexp': 'warn',

    // 안전하지 않은 정규식 패턴 (ReDoS)
    'security/detect-unsafe-regex': 'error',

    // Buffer noAssert 플래그 사용 (범위 초과 읽기/쓰기)
    'security/detect-buffer-noassert': 'error',

    // child_process 모듈 사용 (커맨드 인젝션 위험)
    'security/detect-child-process': 'error',

    // Mustache 이스케이프 비활성화 (XSS 위험)
    'security/detect-disable-mustache-escape': 'error',

    // eval() 계열 함수에 변수 전달 (코드 인젝션)
    'security/detect-eval-with-expression': 'error',

    // CSRF 미들웨어 우회 (method-override 전에 CSRF 체크 필요)
    'security/detect-no-csrf-before-method-override': 'error',

    // 동적 파일 시스템 접근 (Path Traversal 위험)
    'security/detect-non-literal-fs-filename': 'warn',

    // 동적 require (악의적 모듈 로드 위험)
    'security/detect-non-literal-require': 'warn',

    // 타이밍 공격 취약 비교 (상수 시간 비교 필요)
    'security/detect-possible-timing-attacks': 'warn',

    // Math.random 대신 crypto.randomBytes 사용 (예측 불가능한 난수 필요)
    'security/detect-pseudoRandomBytes': 'error',

    // === 내장 ESLint 보안 관련 규칙 ===

    // eval() 직접 사용 금지
    'no-eval': 'error',

    // setTimeout(string), setInterval(string) 등 암묵적 eval 금지
    'no-implied-eval': 'error',

    // new Function() 금지 (동적 코드 실행)
    'no-new-func': 'error',

    // with 문 금지 (스코프 혼란)
    'no-with': 'error',

    // __proto__ 직접 접근 금지 (프로토타입 오염)
    'no-proto': 'error',

    // void 연산자 금지 (의도 불명확)
    'no-void': 'warn',

    // alert, confirm, prompt 금지 (프로덕션 부적합)
    'no-alert': 'error',
  },
  overrides: [
    {
      // 테스트 파일에서는 일부 규칙 완화
      files: ['*.test.*', '*.spec.*', 'tests/**/*', '__tests__/**/*', 'fixtures/**/*'],
      rules: {
        'security/detect-object-injection': 'off',
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-non-literal-require': 'off',
        'security/detect-child-process': 'off',
        'no-alert': 'off',
      },
    },
    {
      // 설정 파일에서는 동적 require 허용
      files: ['*.config.js', '*.config.ts', '.eslintrc.*'],
      rules: {
        'security/detect-non-literal-require': 'off',
      },
    },
  ],
};
