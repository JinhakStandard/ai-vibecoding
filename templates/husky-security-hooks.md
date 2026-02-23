# Husky + lint-staged 기반 Git Hooks 보안 설정 가이드

> JINHAK AI 보안 가이드레일 v2.0

---

## 1. 개요

Git Hooks를 활용하여 **커밋 및 푸시 시점**에 보안 검사를 자동으로 실행합니다.

이 설정은 개발자가 `git commit` / `git push`를 실행할 때 동작하는 **Git 레벨의 Hooks**입니다. Claude Code의 PreToolUse/PostToolUse Hook과는 별개의 계층으로, 두 가지를 함께 사용하면 이중 방어가 가능합니다.

| 구분 | Git Hooks (이 문서) | Claude Code Hooks |
|------|---------------------|-------------------|
| 동작 시점 | `git commit`, `git push` 시 | AI 도구(Read, Write, Bash 등) 실행 시 |
| 설정 위치 | `.husky/`, `package.json` | `.claude/settings.json` |
| 대상 | 모든 개발자 (git 사용 시) | Claude Code 사용 시 |
| 목적 | 커밋/배포 전 최종 보안 게이트 | AI 작업 중 실시간 보안 감시 |

---

## 2. 설치 방법

### 2.1 필수 패키지 설치

```bash
npm install --save-dev husky lint-staged secretlint @secretlint/secretlint-rule-preset-recommend @secretlint/secretlint-rule-pattern
```

### 2.2 Husky 초기화

```bash
npx husky init
```

이 명령은 `.husky/` 디렉토리를 생성하고 `package.json`의 `prepare` 스크립트에 `husky`를 추가합니다.

---

## 3. pre-commit Hook 설정

커밋 시 스테이징된 파일에 대해 다음 검사를 수행합니다.

### 3.1 .husky/pre-commit

```bash
npx lint-staged
```

### 3.2 lint-staged 설정 (package.json)

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "npx eslint --config .eslintrc.security.js --no-error-on-unmatched-pattern",
      "npx secretlint"
    ],
    "*.{json,yml,yaml,env*}": [
      "npx secretlint"
    ],
    "package.json": [
      "npx npm-audit-fix-action || echo '의존성 보안 경고 확인 필요'"
    ]
  }
}
```

**검사 항목:**
1. **secretlint**: 스테이징된 모든 파일에서 시크릿(API 키, 비밀번호, 인증서 등) 유출 탐지
2. **eslint 보안 규칙**: JS/TS 파일에 `eslint-plugin-security` 규칙 적용
3. **npm audit**: `package.json` 변경 시 의존성 취약점 검사

---

## 4. pre-push Hook 설정

푸시 시 전체 소스 코드에 대해 정적 보안 분석(SAST)을 수행합니다.

### 4.1 .husky/pre-push

```bash
# Semgrep SAST 스캔 (설치되어 있는 경우에만 실행)
if command -v semgrep &> /dev/null || npx semgrep --version &> /dev/null 2>&1; then
  npx semgrep --config .semgreprc.yml --error src/ || {
    echo ""
    echo "========================================"
    echo "  [SECURITY] SAST 스캔에서 위반 발견"
    echo "  푸시를 중단합니다. 위반 사항을 수정하세요."
    echo "========================================"
    exit 1
  }
else
  echo "[SECURITY] semgrep이 설치되지 않아 SAST 스캔을 건너뜁니다."
  echo "설치: pip install semgrep 또는 npm install -g semgrep"
fi
```

---

## 5. package.json 전체 설정 예시

```json
{
  "scripts": {
    "prepare": "husky",
    "lint:security": "eslint --config .eslintrc.security.js 'src/**/*.{ts,tsx,js,jsx}'",
    "scan:secrets": "secretlint '**/*'",
    "scan:sast": "semgrep --config .semgreprc.yml src/",
    "audit:deps": "npm audit --audit-level=high",
    "security:all": "npm run lint:security && npm run scan:secrets && npm run audit:deps"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --config .eslintrc.security.js --no-error-on-unmatched-pattern",
      "secretlint"
    ],
    "*.{json,yml,yaml}": [
      "secretlint"
    ]
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-plugin-security": "^1.7.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "secretlint": "^8.0.0",
    "@secretlint/secretlint-rule-preset-recommend": "^8.0.0",
    "@secretlint/secretlint-rule-pattern": "^8.0.0"
  }
}
```

---

## 6. Claude Code Hooks와의 관계

Git Hooks와 Claude Code Hooks는 서로 다른 시점에 동작하므로, 함께 사용하면 **이중 방어 체계**를 구성합니다.

```
개발 흐름:
  ┌─────────────────────────────────────────────────────────┐
  │  Claude Code 세션 중                                     │
  │  ┌────────────────────────────────────┐                  │
  │  │ PreToolUse Hook                    │ ← AI가 파일을    │
  │  │ - 민감 파일 접근 차단               │   읽거나 수정할 때│
  │  │ - 위험 명령 경고                    │   실시간 감시    │
  │  │ (scripts/security-check-hook.cjs)  │                  │
  │  └────────────────────────────────────┘                  │
  │                                                          │
  │  ┌────────────────────────────────────┐                  │
  │  │ PostToolUse Hook                   │ ← AI가 파일을    │
  │  │ - ESLint 자동 수정                  │   수정한 직후    │
  │  └────────────────────────────────────┘                  │
  └─────────────────────────────────────────────────────────┘
                        ↓
  ┌─────────────────────────────────────────────────────────┐
  │  git commit 시                                           │
  │  ┌────────────────────────────────────┐                  │
  │  │ pre-commit Hook (Husky)            │ ← 커밋 직전     │
  │  │ - secretlint 시크릿 스캔            │   최종 보안     │
  │  │ - eslint 보안 규칙 검사             │   게이트        │
  │  │ - npm audit (package.json 변경 시)  │                  │
  │  └────────────────────────────────────┘                  │
  └─────────────────────────────────────────────────────────┘
                        ↓
  ┌─────────────────────────────────────────────────────────┐
  │  git push 시                                             │
  │  ┌────────────────────────────────────┐                  │
  │  │ pre-push Hook (Husky)              │ ← 푸시 직전     │
  │  │ - Semgrep SAST 정적 분석            │   전체 코드     │
  │  └────────────────────────────────────┘   보안 스캔      │
  └─────────────────────────────────────────────────────────┘
                        ↓
  ┌─────────────────────────────────────────────────────────┐
  │  CI/CD (GitHub Actions)                                  │
  │  - npm audit, eslint security, semgrep, secretlint      │
  │  - 최종 배포 전 보안 검증 (3차 방어)                      │
  └─────────────────────────────────────────────────────────┘
```

**핵심 원칙**: Claude Code Hooks는 **AI 작업 중 실시간 감시**, Git Hooks는 **커밋/푸시 시 최종 게이트**, CI/CD는 **배포 전 최종 검증**으로, 3중 방어 체계를 구성합니다.
