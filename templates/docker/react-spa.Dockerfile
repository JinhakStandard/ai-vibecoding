# ============================================================
# JABIS Standard - React SPA Dockerfile
# 표준 버전: 1.0.0
# 용도: React + Vite 정적 파일 빌드 및 nginx 서빙
# ============================================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Stage 3: Production (nginx) ---
FROM nginx:alpine AS production

# nginx 설정 복사
COPY templates/docker/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물만 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
