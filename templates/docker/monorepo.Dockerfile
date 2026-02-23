# ============================================================
# JABIS Standard - pnpm Monorepo Dockerfile
# 표준 버전: 1.0.0
# 용도: pnpm workspace 모노레포에서 특정 앱 빌드
# 사용법: docker build --build-arg APP_NAME=my-app -f monorepo.Dockerfile .
# ============================================================

ARG APP_NAME

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- Stage 2: Builder ---
FROM node:20-alpine AS builder
ARG APP_NAME
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY --from=deps /app/apps/*/node_modules ./apps/
COPY . .
RUN pnpm --filter ${APP_NAME} build

# --- Stage 3: Production ---
FROM node:20-alpine AS production
ARG APP_NAME
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/apps/${APP_NAME}/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/${APP_NAME}/package.json ./
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs
EXPOSE 3000

CMD ["node", "dist/main.js"]
