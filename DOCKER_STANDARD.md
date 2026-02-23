# Docker 빌드 및 배포 표준

> jinhak_standard_version: 1.0.0
> 최종 수정일: 2026-02-23

이 문서는 JINHAK 전사 프로젝트의 Docker 이미지 빌드 및 배포에 대한 표준을 정의합니다.

---

## 1. 적용 범위

- JABIS 전체 프로젝트 (API Gateway, ApplyNova, Template 등)
- K3S 클러스터 배포 대상 모든 서비스

---

## 2. 필수 원칙 (MUST)

### 2.1 멀티스테이지 빌드 필수

- 최소 3단계: dependencies → builder → production
- production 스테이지에는 devDependencies 포함 금지
- 빌드 아티팩트만 최종 이미지에 포함

```dockerfile
# 예시: 3단계 빌드
FROM node:20-alpine AS deps        # 1단계: production 의존성만
FROM node:20-alpine AS builder     # 2단계: 전체 의존성 + 빌드
FROM node:20-alpine AS production  # 3단계: 실행에 필요한 것만
```

### 2.2 chown 최적화

- **금지**: `RUN chown -R user:group /path`
- **필수**: `COPY --chown=user:group` 사용
- 이유: `chown -R`은 모든 파일을 재복사하여 빌드 시간 30초+ 증가

```dockerfile
# 금지
COPY --from=deps /app/node_modules ./node_modules
RUN chown -R nodejs:nodejs /app

# 필수
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
```

### 2.3 캐시 활용

BuildKit 캐시 마운트 필수 적용:

```dockerfile
# npm
RUN --mount=type=cache,target=/root/.npm npm ci

# pnpm
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
```

**레이어 캐시 순서 엄수:**
1. `COPY package.json package-lock.json ./` (lockfile 먼저)
2. `RUN npm ci` (의존성 설치)
3. `COPY . .` (소스 코드 나중에)

### 2.4 의존성 설치 중복 금지

- 동일 패키지 매니저의 install 명령은 Dockerfile 내에서 1회만 실행
- production deps와 dev deps가 모두 필요하면 deps 스테이지 분리

### 2.5 non-root 유저 실행

production 스테이지에서 반드시 non-root 유저로 실행:

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs
```

---

## 3. 권장 사항 (SHOULD)

### 3.1 정적 파일 서빙

- React/Vue SPA는 `nginx:alpine` 사용 (이미지 크기 ~40MB)
- **지양**: `npm install -g serve` (이미지 크기 ~900MB)

### 3.2 이미지 태깅

```
형식: {서비스명}:v{버전}-{환경}.{빌드번호}
예시: jabis-api-gateway:v1.0.0-prod.98
```

### 3.3 .dockerignore 필수 항목

```
node_modules, .git, dist, *.log, .env*, coverage, .nyc_output
```

> 표준 `.dockerignore`는 `templates/docker/.dockerignore`를 참조하세요.

### 3.4 빌드 시간 기준

| 조건 | 목표 시간 |
|------|----------|
| 초회 빌드 | 2분 이내 |
| 소스 변경 재빌드 | 30초 이내 |
| 의존성 변경 없는 재빌드 | 15초 이내 |

### 3.5 deprecated 옵션 사용 금지

| 금지 | 대체 |
|------|------|
| `npm ci --only=production` | `npm ci --omit=dev` |
| `npm install -g` (production) | 멀티스테이지로 분리 |

---

## 4. 보안 (SECURITY_ISMS.md 연계)

### 4.1 이미지 보안

- alpine 기반 이미지 사용 (공격 표면 최소화)
- `npm audit` 경고가 critical이면 빌드 전 해결 필수
- 환경변수로 시크릿 전달 시 빌드 타임이 아닌 런타임에 주입

### 4.2 레이어 보안

- `.env` 파일 COPY 금지 (`.dockerignore`에 포함)
- 빌드 시크릿은 `--mount=type=secret` 사용

```dockerfile
# 금지: .env를 이미지에 포함
COPY .env ./

# 필수: 런타임 환경변수 또는 Vault로 주입
```

---

## 5. 프로젝트 유형별 가이드

| 유형 | 베이스 이미지 | 패키지 매니저 | 템플릿 |
|------|-------------|-------------|--------|
| Node.js API | `node:20-alpine` | npm | `templates/docker/node-api.Dockerfile` |
| React SPA | `nginx:alpine` (prod) | pnpm | `templates/docker/react-spa.Dockerfile` |
| 모노레포 | `node:20-alpine` | pnpm | `templates/docker/monorepo.Dockerfile` |

---

## 6. CI/CD 연계

- Bitbucket Pipeline에서 `DOCKER_BUILDKIT=1` 환경변수 설정
- 캐시 볼륨을 파이프라인 간 공유하도록 설정
- ArgoCD 배포 시 이미지 태그 자동 업데이트

---

## 7. 체크리스트 (PR 리뷰 시 확인)

- [ ] 멀티스테이지 빌드 사용
- [ ] `RUN chown -R` 미사용
- [ ] `COPY --chown` 적용
- [ ] BuildKit 캐시 마운트 적용
- [ ] `npm ci` / `pnpm install` 중복 실행 없음
- [ ] non-root 유저로 실행
- [ ] `.dockerignore` 존재 및 적절한 내용
- [ ] SPA인 경우 nginx 사용
- [ ] deprecated 옵션 미사용
- [ ] 시크릿이 빌드 레이어에 포함되지 않음

---

*이 문서는 [JINHAK 전사 AI 개발 표준](./CLAUDE.md)의 상세 문서입니다.*
