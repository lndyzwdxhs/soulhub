# ============================================================
# SoulHub Makefile
# 快速执行常用命令：开发、构建、Docker、部署等
# ============================================================

# ---------- 变量 ----------
APP_NAME     := soulhub
IMAGE_NAME   := $(APP_NAME)
IMAGE_TAG    := latest
PORT         := 3000
DOCKER_PORT  := 80
SSL_CERT_DIR := /etc/ssl/soulhub

# ---------- 帮助 ----------
.PHONY: help
help: ## 显示帮助信息
	@echo ""
	@echo "  SoulHub Makefile 命令列表"
	@echo "  ========================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ---------- 依赖安装 ----------
.PHONY: install
install: ## 安装项目依赖
	npm install

# ---------- 本地开发 ----------
.PHONY: dev
dev: ## 启动本地开发服务（带热更新）
	npm run dev

.PHONY: dev-debug
dev-debug: ## 启动本地开发服务（开启 Node.js 调试模式，端口 9229）
	NODE_OPTIONS='--inspect' npm run dev

.PHONY: dev-turbo
dev-turbo: ## 启动本地开发服务（使用 Turbopack 加速）
	npx next dev --turbo

# ---------- 构建 ----------
.PHONY: build
build: ## 构建生产版本
	npm run build

.PHONY: start
start: ## 启动生产服务（需先执行 build）
	npm run start

.PHONY: start-standalone
start-standalone: ## 以 standalone 模式启动（需先执行 build）
	node .next/standalone/server.js

# ---------- Registry 脚本 ----------
.PHONY: build-index
build-index: ## 构建 registry 索引
	npm run build:index

.PHONY: validate
validate: ## 校验 registry 数据
	npm run validate

.PHONY: gen-seeds
gen-seeds: ## 生成 registry 种子数据
	node registry/scripts/gen-seeds.js

# ---------- 代码质量 ----------
.PHONY: lint
lint: ## 运行 ESLint 检查
	npm run lint

.PHONY: typecheck
typecheck: ## 运行 TypeScript 类型检查
	npx tsc --noEmit

.PHONY: check
check: lint typecheck ## 运行所有代码质量检查（lint + typecheck）

# ---------- Docker（单容器，仅 HTTP） ----------
.PHONY: docker-build
docker-build: ## 构建 Docker 镜像
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

.PHONY: docker-run
docker-run: ## 运行 Docker 容器（仅 HTTP）
	docker run --rm -p $(DOCKER_PORT):$(PORT) --name $(APP_NAME) $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: docker-run-d
docker-run-d: ## 后台运行 Docker 容器（仅 HTTP）
	docker run -d -p $(DOCKER_PORT):$(PORT) --name $(APP_NAME) $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: docker-stop
docker-stop: ## 停止 Docker 容器
	docker stop $(APP_NAME) 2>/dev/null || true
	docker rm $(APP_NAME) 2>/dev/null || true

.PHONY: docker-logs
docker-logs: ## 查看 Docker 容器日志
	docker logs -f $(APP_NAME)

.PHONY: docker-shell
docker-shell: ## 进入 Docker 容器 Shell
	docker exec -it $(APP_NAME) /bin/sh

# ---------- Docker Compose（HTTPS） ----------
.PHONY: compose-up
compose-up: env ## 启动 HTTPS 服务（Nginx + Next.js）
	@echo "\n🔒 检查 SSL 证书..."
	@test -f $(SSL_CERT_DIR)/fullchain.pem || (echo "❌ 未找到 $(SSL_CERT_DIR)/fullchain.pem" && exit 1)
	@test -f $(SSL_CERT_DIR)/privkey.pem || (echo "❌ 未找到 $(SSL_CERT_DIR)/privkey.pem" && exit 1)
	@echo "✅ SSL 证书就绪"
	docker compose up -d --build
	@echo "\n✅ HTTPS 部署完成！访问 https://soulhub.store\n"

.PHONY: compose-down
compose-down: ## 停止 HTTPS 服务
	docker compose down

.PHONY: compose-logs
compose-logs: ## 查看 HTTPS 服务日志
	docker compose logs -f

.PHONY: compose-restart
compose-restart: ## 重启 HTTPS 服务
	docker compose restart

.PHONY: compose-rebuild
compose-rebuild: env compose-down compose-up ## 重新构建并启动 HTTPS 服务

# ---------- 环境准备 ----------
.PHONY: env
env: ## 初始化 .env 文件（若不存在则从 .env.example 复制）
	@if [ ! -f .env ] && [ -f .env.example ]; then \
		cp .env.example .env; \
		echo "📋 已从 .env.example 创建 .env"; \
	else \
		echo "✅ .env 已存在，跳过"; \
	fi

# ---------- 一键部署 ----------
.PHONY: deploy-docker
deploy-docker: env docker-stop docker-build docker-run-d ## 一键 Docker 部署（仅 HTTP）
	@echo "\n✅ 部署完成！访问 http://localhost:$(DOCKER_PORT)\n"

.PHONY: deploy-https
deploy-https: env compose-down compose-up ## 一键 HTTPS 部署（推荐）

.PHONY: deploy-vercel
deploy-vercel: env ## 部署到 Vercel（需要安装 vercel CLI）
	npx vercel --prod

.PHONY: deploy-vercel-preview
deploy-vercel-preview: env ## 部署 Vercel 预览环境
	npx vercel

# ---------- 清理 ----------
.PHONY: clean
clean: ## 清理构建产物
	rm -rf .next dist

.PHONY: clean-all
clean-all: clean ## 深度清理（包括 node_modules）
	rm -rf node_modules
	rm -rf registry/node_modules

.PHONY: reinstall
reinstall: clean-all install ## 重新安装（清理后重新安装依赖）

# ---------- 默认目标 ----------
.DEFAULT_GOAL := help
