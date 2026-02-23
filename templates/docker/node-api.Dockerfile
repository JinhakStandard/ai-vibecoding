# ============================================================
# JABIS Standard - Node.js API Server Dockerfile
# 표준 버전: 1.0.0
# 용도: TypeScript API 서버 (Express, Fastify, NestJS 등)
# ============================================================

# --- Stage 1: Dependencies (production only) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# --- Stage 2: Builder (full deps + compile) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 3: Production ---
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

USER nodejs
EXPOSE 3000

CMD ["node", "dist/main.js"]
