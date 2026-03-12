# 🦞 SoulHub — 开源 Agent 灵魂商店

<p align="center">
  <strong>像 GitHub 存储代码一样，SoulHub 存储调教好的 Agent 灵魂。</strong>
</p>

<p align="center">
  <em>每只龙虾都有灵魂 🦞</em>
</p>

<p align="center">
  <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/lndyzwdxhs/soulhub/actions"><img src="https://img.shields.io/github/actions/workflow/status/lndyzwdxhs/soulhub/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/lndyzwdxhs/soulhub/releases"><img src="https://img.shields.io/github/v/release/lndyzwdxhs/soulhub?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/lndyzwdxhs/soulhub/stargazers"><img src="https://img.shields.io/github/stars/lndyzwdxhs/soulhub?style=for-the-badge" alt="Stars"></a>
</p>

**SoulHub** 是一个 _开源的 Agent 人格模板社区_ —— 分享、发现、一键部署调教好的 AI Agent。
它提供 Web 平台浏览和可视化编排，CLI 工具一行命令安装，以及团队配方（Recipe）批量部署多 Agent 协作架构。

不是分享代码或工作流，而是分享 Agent 的 **人格、技能、行为模式**。

[Web 平台](#web-平台功能) · [CLI 工具](#cli-工具) · [Agent 模板](#agent-registry) · [Fusion 编排](#fusion-编排台) · [快速上手](#quick-start) · [本地开发](#本地开发) · [Docker 部署](#docker-部署) · [参与贡献](#参与贡献)

---

## 为什么需要 SoulHub？

在 [OpenClaw](https://github.com/openclaw) 多 Agent 架构的搭建过程中，我们发现：精心调教好的 Agent（IDENTITY.md + SOUL.md）具备极强的复用性和分享价值。然而——

| 痛点 | 现状 |
|------|------|
| **封闭性** | GPT Store、Coze 商店、Character.AI 等平台的 Agent 无法导出、迁移 |
| **粒度不匹配** | PromptBase 只卖单条 Prompt，Dify 侧重完整工作流，缺少"Agent 人格"这个中间层 |
| **缺乏团队视角** | 几乎没有平台关注多 Agent 协作团队的模板分享 |

SoulHub 的答案：**用 Markdown 定义 Agent 灵魂，用开源社区分享它们。**

---

## Highlights

- **🧠 灵魂优先** —— 不是代码或工作流，是 Agent 的人格、技能、行为模式（IDENTITY.md + SOUL.md）。
- **📝 Markdown 原生** —— 人类可读可编辑，版本控制友好，无厂商锁定。
- **🎨 Fusion 编排台** —— 拖拽 Agent 到画布，自动生成调度器和路由规则，撤销/重做/自动布局。
- **👥 团队配方（Recipe）** —— 分享多 Agent 协作架构（如"自媒体运营团队"、"研发小队"）。
- **🔧 CLI 一键安装** —— `soulhub install writer-xiaohongshu`，一行命令，开盖即用。
- **🌍 框架兼容** —— 优先支持 OpenClaw，格式设计上考虑适配 Dify / CrewAI 等框架。
- **🌓 主题切换** —— 跟随系统 / 亮色 / 暗色三种模式。
- **🐳 Docker 一键部署** —— `make deploy-docker`，构建镜像 + 启动服务，一步到位。
- **📖 文档中心** —— 快速开始、Soul 规范、CLI 指南、社区贡献指引。

---

## How it works

```
                         ┌──────────────────────────┐
                         │      soulhub (本仓库)      │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │   Next.js Web    │   │    Registry      │   │   GitHub Actions │
   │   平台 (SSR/SSG) │◄──│  21 Agent 模板   │──►│   CI 校验 + 构建  │
   │                  │   │   3 团队配方      │   │                  │
   │  /souls  浏览    │   │                  │   └──────────────────┘
   │  /fusion 编排    │   │  index.json 索引 │
   │  /docs   文档    │   └──────────────────┘
   └──────────────────┘
              ▲
              │ HTTP (GitHub Raw)
              │
   ┌──────────────────┐
   │   soulhub-cli    │
   │   (独立仓库)      │
   │                  │
   │  搜索 / 安装     │
   │  更新 / 发布     │
   └──────────────────┘
```

---

## Agent Registry

**21 个精选模板**，覆盖 6 大分类：

| 分类 | 示例 Agent |
|------|-----------:|
| 🎨 自媒体 | 小红书写手、微信公众号作者、知乎创作者、Twitter 写手、热点追踪分析师、发布排期官 |
| 💻 开发 | 全栈工程师、Python 专家、代码审查员、系统架构师、K8s 运维专家 |
| 📈 运营 | 数据分析师、SEO 优化师、增长黑客、杂务管家 |
| 🎧 客服 | 一线客服、技术支持、问题升级协调员 |
| 📚 教育 | 编程导师、英语教师 |
| 🎯 调度 | 总调度中心（多 Agent 协调） |

**3 个团队配方（Recipes）**：自媒体运营团队、研发小队、客服中心。

每个 Agent 模板由以下文件组成：

```
registry/agents/your-agent-name/
├── manifest.yaml      # 元数据：名称、分类、标签、版本
├── IDENTITY.md        # 身份定义：角色、职责、能力
└── SOUL.md            # 行为模式：性格、风格、工作方式
```

---

## Quick Start

### 方式一：CLI 一行安装

Runtime: **Node ≥ 18**

```bash
# 全局安装 CLI
npm install -g soulhub

# 搜索 Agent
soulhub search writer

# 安装到当前目录
soulhub install writer-xiaohongshu

# 安装到指定目录
soulhub install coder-fullstack --dir ./my-agents

# 安装团队配方（一次安装多个 Agent）
soulhub install --recipe self-media-team
```

### 方式二：Web 平台浏览

1. 访问 Web 平台，进入 `/souls` 页面浏览或搜索感兴趣的 Agent
2. 进入详情页，查看 IDENTITY.md / SOUL.md 内容
3. 点击 **Download ZIP** 下载，或复制安装命令

### 方式三：Fusion 编排组装团队

1. 进入 `/fusion` 页面
2. 从左侧面板拖拽 Agent 到画布
3. 系统自动创建调度器节点并生成路由规则
4. 点击 **Export** 导出 ZIP 或生成分享链接

---

## Web 平台功能

| 功能 | 说明 |
|------|------|
| **Soul 浏览** (`/souls`) | 按分类筛选、关键词搜索、多维度排序（热度/星标/最新） |
| **Soul 详情** (`/souls/[name]`) | 查看 IDENTITY.md / SOUL.md、文件列表、一键复制安装命令、ZIP 下载 |
| **Fusion 编排台** (`/fusion`) | 拖拽 Agent 到画布，自动生成调度器和路由规则，撤销/重做/自动布局 |
| **团队导出** | 将组装的 Agent 团队导出为 ZIP 或分享链接 |
| **文档中心** (`/docs`) | 快速开始、Soul 规范、CLI 工具、Fusion 编排、API 参考、社区贡献 |
| **主题切换** | 跟随系统 / 亮色 / 暗色三种模式 |
| **首页** (`/`) | 项目介绍、痛点分析、功能展示、快速上手指引 |

---

## Fusion 编排台

Fusion 是 SoulHub 的核心创新功能——在可视化画布上拖拽组合 Agent，自动生成多 Agent 协作架构：

- 从左侧面板拖拽任意 Agent 到画布
- 系统自动创建调度器（Dispatcher）节点
- 自动生成路由规则，连接各 Agent
- 支持撤销/重做、自动布局
- 属性面板支持编辑 Agent 和路由详情
- 一键导出 ZIP 或生成可分享链接

---

## CLI 工具

独立仓库：[soulhub-cli](https://github.com/lndyzwdxhs/soulhub-cli)

```bash
npm install -g soulhub
```

| 命令 | 说明 |
|------|------|
| `soulhub search [query]` | 搜索 Agent 模板 |
| `soulhub info <name>` | 查看 Agent 详细信息 |
| `soulhub install <name>` | 安装 Agent 模板到本地 |
| `soulhub list` | 列出已安装的 Agent |
| `soulhub update [name]` | 更新已安装的 Agent |
| `soulhub uninstall <name>` | 卸载 Agent |
| `soulhub publish [dir]` | 发布 Agent 到社区 |

---

## 本地开发

Runtime: **Node ≥ 18**

```bash
git clone https://github.com/lndyzwdxhs/soulhub.git
cd soulhub

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 或使用 Makefile
make dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `make dev` | 启动开发服务器 |
| `make dev-turbo` | Turbopack 加速开发 |
| `make dev-debug` | 启动开发服务器（开启 Node.js 调试模式，端口 9229） |
| `make build` | 构建生产版本 |
| `make start` | 启动生产服务（需先执行 build） |
| `make build-index` | 构建 registry 索引 |
| `make validate` | 校验 registry 模板格式 |
| `make lint` | ESLint 检查 |
| `make typecheck` | TypeScript 类型检查 |
| `make check` | lint + typecheck 全量检查 |
| `make clean` | 清理构建产物 |
| `make clean-all` | 深度清理（包括 node_modules） |
| `make reinstall` | 清理后重新安装依赖 |

---

## Docker 部署

基于 Next.js standalone 模式的多阶段构建，镜像体积小、启动快。

```bash
# 一键部署（构建镜像 + 后台启动），服务暴露在 80 端口
make deploy-docker

# 或分步操作
make docker-build     # 构建镜像
make docker-run-d     # 后台运行
make docker-logs      # 查看日志
make docker-stop      # 停止容器
make docker-shell     # 进入容器 Shell
```

### Vercel 部署

```bash
# 生产部署
make deploy-vercel

# 预览环境
make deploy-vercel-preview
```

---

## 技术栈

| 层级 | 技术 |
|------|-----:|
| **Web 平台** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion |
| **Fusion 编排** | React Flow (@xyflow/react v12) |
| **主题系统** | next-themes（跟随系统 / 亮色 / 暗色） |
| **CLI 工具** | Node.js, Commander, Chalk, Ora, JSZip |
| **模板格式** | YAML manifest + Markdown (IDENTITY.md, SOUL.md) |
| **容器化** | Docker 多阶段构建 (Node 18 Alpine) |
| **CI/CD** | GitHub Actions + Vercel |

---

## 项目结构

```
soulhub/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── page.tsx          # 首页（Landing）
│   │   ├── souls/            # Soul 浏览 + 详情页
│   │   ├── fusion/           # Fusion 编排台（可视化拖拽）
│   │   ├── docs/             # 文档中心
│   │   ├── api/compose/      # 分享 API
│   │   ├── c/[id]/           # 分享链接重定向
│   │   └── index.json/       # Registry 索引 API
│   ├── components/
│   │   ├── landing/          # 首页组件（Hero, Features, PainPoints, etc.）
│   │   ├── agents/           # Agent 列表、卡片、详情
│   │   ├── composer/         # Fusion 画布、节点、面板、导出
│   │   └── ui/               # 通用 UI（Navbar, ThemeToggle, CopyButton, etc.）
│   └── lib/                  # 工具函数、类型定义、数据加载
├── registry/
│   ├── agents/               # 21 个 Agent 模板
│   ├── recipes/              # 3 个团队配方
│   ├── categories.yaml       # 分类定义（6 个分类）
│   ├── index.json            # 构建产物（搜索索引）
│   ├── manifest.schema.json  # Manifest 校验 schema
│   └── scripts/              # 构建 + 校验脚本
├── .github/workflows/        # CI（构建 + 校验 + 索引）
├── Dockerfile                # Docker 多阶段构建
├── Makefile                  # 快速命令入口
├── package.json
├── vercel.json
└── tailwind.config.ts
```

---

## Agent 模板格式

### manifest.yaml

```yaml
name: writer-xiaohongshu
displayName: 小红书创作专家
description: 专注于小红书平台的内容创作，擅长种草文、测评、生活分享
category: self-media
tags: [小红书, 内容创作, 种草, 社交媒体]
version: "1.0.0"
author: soulhub
minClawVersion: "2026.3.0"
```

### IDENTITY.md — 定义 Agent 是谁

角色定位、核心职责、技能边界。

### SOUL.md — 定义 Agent 怎么做

性格特征、沟通风格、工作流程、决策原则。

---

## 参与贡献

### 贡献一个 Agent 模板

1. Fork 本仓库
2. 在 `registry/agents/` 下创建你的 Agent 目录
3. 编写 `manifest.yaml`、`IDENTITY.md`、`SOUL.md`
4. 运行校验：`npm run validate`
5. 提交 Pull Request

### 贡献一个团队配方

在 `registry/recipes/` 下创建配方目录，包含 `manifest.yaml`、`soulhub.yaml` 和 `README.md`。

---

## 设计理念

1. **灵魂优先** —— 不是分享代码或工作流，而是分享 Agent 的人格、技能、行为模式
2. **Markdown 原生** —— 以 IDENTITY.md + SOUL.md 为标准格式，人类可读可编辑
3. **团队配方** —— 支持分享多 Agent 协作架构
4. **框架兼容** —— 优先支持 OpenClaw，格式上考虑适配 Dify / CrewAI 等
5. **开源驱动** —— GitHub PR 贡献模式，社区共建

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lndyzwdxhs/soulhub&type=date)](https://star-history.com/#lndyzwdxhs/soulhub&Date)

---

## License

[MIT](LICENSE)
