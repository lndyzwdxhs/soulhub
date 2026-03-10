# ============================================================
# SoulHub Dockerfile
# 基于 Next.js standalone 模式的多阶段构建
# ============================================================

# ---------- 阶段 1: 依赖安装 ----------
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------- 阶段 2: 构建 ----------
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建 registry 索引（如有需要）
RUN npm run build:index || true

# 构建 Next.js 应用
RUN npm run build

# ---------- 阶段 3: 运行 ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制 standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

# 复制 registry 数据（运行时可能需要读取）
COPY --from=builder /app/registry ./registry

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
