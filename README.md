# SoulHub

**开源的 Agent 人格模板社区** —— 分享、发现、一键部署调教好的 AI Agent。

> 像 GitHub 存储代码一样，SoulHub 存储调教好的 Agent 灵魂。

---

## 创意来源

在 [OpenClaw](https://github.com/openclaw) 多 Agent 架构的搭建过程中，我们发现一个现象：精心调教好的 Agent（IDENTITY.md + SOUL.md）具备极强的复用性和分享价值。然而，现有的 AI 平台生态面临几个共同问题：

- **封闭性**：GPT Store、Coze 商店、Character.AI 等平台的 Agent 无法导出、迁移
- **粒度不匹配**：PromptBase 只卖单条 Prompt，Dify 侧重完整工作流，缺少"Agent 人格"这个中间层
- **缺乏团队视角**：几乎没有平台关注多 Agent 协作团队的模板分享

SoulHub 正是为填补这一空白而生。我们的答案是：**用 Markdown 定义 Agent 灵魂，用开源社区分享它们**。

## 项目宗旨

1. **灵魂优先**：不是分享代码或工作流，而是分享 Agent 的人格、技能、行为模式
2. **Markdown 原生**：以 `IDENTITY.md` + `SOUL.md` 为标准格式，人类可读可编辑
3. **团队配方**：支持分享多 Agent 协作架构（如"自媒体 6 人团队"、"研发小队"）
4. **框架兼容**：优先支持 OpenClaw，格式设计上考虑适配 Dify / CrewAI 等框架
5. **开源驱动**：GitHub PR 贡献模式，社区共建

---

## 整体架构

SoulHub 采用**双仓库架构**，Web 平台与 CLI 工具独立维护：

```
┌─────────────────────────────────────────────────────────────┐
│                      soulhub (本仓库)                        │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Next.js    │    │   Registry   │    │  GitHub       │  │
│  │  Web 平台   │◄───│  Agent 模板  │───►│  Actions CI   │  │
│  │             │    │  + Recipes   │    │               │  │
│  └──────┬──────┘    └──────┬───────┘    └───────────────┘  │
│         │                  │                                │
│         │   SSR/SSG        │  index.json                   │
│         │   读取模板        │  构建索引                      │
│         ▼                  ▼                                │
│  ┌─────────────────────────────────┐                       │
│  │        Vercel 部署               │                       │
│  │   浏览 / 搜索 / 下载 / Composer  │                       │
│  └─────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   soulhub-cli (独立仓库)                     │
│                                                             │
│  ┌─────────────┐         ┌──────────────┐                  │
│  │  CLI Tool   │────────►│ Remote       │                  │
│  │  soulhub    │  HTTP   │ Registry     │                  │
│  │             │◄────────│ (GitHub Raw) │                  │
│  └─────────────┘         └──────────────┘                  │
│                                                             │
│  npm install -g soulhub                                     │
│  搜索 / 安装 / 更新 / 卸载 / 发布                             │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 |
|------|------|
| **Web 平台** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion |
| **可视化编排** | React Flow (@xyflow/react v12) |
| **主题系统** | next-themes（跟随系统 / 亮色 / 暗色） |
| **CLI 工具** | Node.js, Commander, Chalk, Ora, JSZip |
| **模板格式** | YAML manifest + Markdown (IDENTITY.md, SOUL.md) |
| **CI/CD** | GitHub Actions + Vercel |

---

## 功能概览

### Web 平台

- **首页**：项目介绍、痛点分析、功能展示、快速上手指引
- **Agent 浏览**：按分类筛选、关键词搜索、多维度排序（热度/星标/最新）
- **Agent 详情**：查看 IDENTITY.md / SOUL.md 内容、文件列表、一键复制安装命令、ZIP 下载
- **可视化 Composer**：拖拽 Agent 到画布，自动生成调度器和路由规则，支持撤销/重做/自动布局
- **团队导出**：将组装的 Agent 团队导出为 ZIP 或分享链接
- **主题切换**：支持跟随系统、亮色、暗色三种模式

### Agent Registry

- **21 个精选模板**，覆盖 6 大分类：

| 分类 | 示例 Agent |
|------|-----------|
| 自媒体 | 小红书写手、微信公众号作者、知乎创作者、Twitter 写手 |
| 开发 | 全栈工程师、Python 专家、代码审查员、系统架构师 |
| 运营 | 数据分析师、SEO 优化师、增长黑客 |
| 客服 | 一线客服、技术支持、升级调度 |
| 教育 | 编程导师、英语教师 |
| 调度 | 主调度器（多 Agent 协调） |

- **3 个团队配方**（Recipes）：自媒体团队、研发小队、客服中心

### CLI 工具

独立仓库：[soulhub-cli](https://github.com/soulhub-community/soulhub-cli)

| 命令 | 说明 |
|------|------|
| `soulhub search [query]` | 搜索 Agent 模板 |
| `soulhub info <name>` | 查看 Agent 详细信息 |
| `soulhub install <name>` | 安装 Agent 模板 |
| `soulhub list` | 列出已安装的 Agent |
| `soulhub update [name]` | 更新已安装的 Agent |
| `soulhub uninstall <name>` | 卸载 Agent |
| `soulhub publish [dir]` | 发布 Agent 到社区 |

---

## Quick Start

### 方式一：通过 CLI 安装 Agent

```bash
# 全局安装 CLI
npm install -g soulhub

# 搜索 Agent
soulhub search writer

# 安装一个 Agent 到当前目录
soulhub install writer-xiaohongshu

# 安装到指定目录
soulhub install coder-fullstack --dir ./my-agents

# 安装团队配方（一次安装多个 Agent）
soulhub install --recipe self-media-team
```

### 方式二：通过 Web 平台浏览和下载

1. 访问 Web 平台，浏览或搜索感兴趣的 Agent
2. 进入 Agent 详情页，查看 IDENTITY.md 和 SOUL.md 内容
3. 点击 **Download ZIP** 下载，或复制安装命令

### 方式三：使用 Composer 组装团队

1. 进入 `/composer` 页面
2. 从左侧面板拖拽 Agent 到画布
3. 系统自动创建调度器节点并生成路由规则
4. 在右侧面板中调整调度器名称和路由规则
5. 点击 **Export** 导出 ZIP 或生成分享链接

---

## Agent 模板格式

每个 Agent 模板由以下文件组成：

```
registry/agents/your-agent-name/
├── manifest.yaml      # 元数据：名称、分类、标签、版本（必需）
├── IDENTITY.md        # 身份定义：角色、职责、能力（必需）
└── SOUL.md            # 行为模式：性格、风格、工作方式（必需）
```

### manifest.yaml 示例

```yaml
name: writer-xiaohongshu
displayName: 小红书创作专家
description: 专注于小红书平台的内容创作，擅长种草文、测评、生活分享
category: self-media
tags: [小红书, 内容创作, 种草, 社交媒体]
version: "1.0.0"
author: soulhub
minClawVersion: "0.1.0"
```

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/soulhub-community/soulhub.git
cd soulhub

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建 registry 索引
npm run build:index

# 校验模板格式
npm run validate

# 生产构建
npm run build
```

## 项目结构

```
soulhub/
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── page.tsx          # 首页（Landing）
│   │   ├── agents/           # Agent 浏览 + 详情页
│   │   ├── composer/         # 可视化 Composer
│   │   ├── api/compose/      # 分享 API
│   │   └── c/[id]/           # 分享链接重定向
│   ├── components/
│   │   ├── landing/          # 首页组件（Hero, Features, etc.）
│   │   ├── agents/           # Agent 列表、卡片、详情
│   │   ├── composer/         # Composer 画布、节点、面板
│   │   └── ui/               # 通用 UI（Navbar, ThemeToggle, etc.）
│   └── lib/                  # 工具函数、类型定义、数据加载
├── registry/
│   ├── agents/               # 21 个 Agent 模板
│   ├── recipes/              # 3 个团队配方
│   ├── categories.yaml       # 分类定义
│   ├── index.json            # 构建产物（搜索索引）
│   └── scripts/              # 构建 + 校验脚本
├── .github/workflows/        # CI（构建 + registry 校验）
├── package.json
├── vercel.json
└── tailwind.config.ts
```

## 参与贡献

### 贡献一个 Agent 模板

1. Fork 本仓库
2. 在 `registry/agents/` 下创建你的 Agent 目录
3. 编写 `manifest.yaml`、`IDENTITY.md`、`SOUL.md`
4. 运行校验：`npm run validate`
5. 提交 Pull Request

### 贡献一个团队配方

在 `registry/recipes/` 下创建配方目录，包含 `manifest.yaml`、`topology.yaml` 和 `README.md`。

---

## License

MIT
