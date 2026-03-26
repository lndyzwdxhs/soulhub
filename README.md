# 🦞 SoulHub — Open Source Agent Soul Store

<p align="center">
  <strong>Just like GitHub stores code, SoulHub stores well-tuned Agent souls.</strong>
</p>

<p align="center">
  <em>Every Agent Deserves a Soul 🦞</em>
</p>

<p align="center">
  <a href="./README_zh.md">中文文档</a>
</p>

<p align="center">
  <a href="https://github.com/lndyzwdxhs/soulhub/actions"><img src="https://img.shields.io/github/actions/workflow/status/lndyzwdxhs/soulhub/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/lndyzwdxhs/soulhub/releases"><img src="https://img.shields.io/github/v/release/lndyzwdxhs/soulhub?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://github.com/lndyzwdxhs/soulhub/stargazers"><img src="https://img.shields.io/github/stars/lndyzwdxhs/soulhub?style=for-the-badge" alt="Stars"></a>
</p>

**SoulHub** is an _open-source Agent persona template community_ — share, discover, and deploy well-tuned AI Agents with one click.
It provides a Web platform for browsing and visual orchestration, a CLI tool for one-command installation, and Team Recipes for batch-deploying multi-Agent collaboration architectures.

Not sharing code or workflows, but sharing Agent **personas, skills, and behavior patterns**.

[Web Platform](#web-platform) · [CLI Tool](#cli-tool) · [Agent Registry](#agent-registry) · [Fusion Orchestrator](#fusion-orchestrator) · [Quick Start](#quick-start) · [Local Development](#local-development) · [Docker Deploy](#docker-deployment) · [Contributing](#contributing)

---

## Why SoulHub?

While building multi-Agent architectures with [OpenClaw](https://github.com/openclaw), we discovered that well-tuned Agents (IDENTITY.md + SOUL.md) have tremendous reuse and sharing value. However —

| Pain Point | Current State |
|------------|---------------|
| **Closed Ecosystem** | Agents on GPT Store, Coze Store, Character.AI, etc. cannot be exported or migrated |
| **Granularity Mismatch** | PromptBase sells single prompts, Dify focuses on full workflows — missing the "Agent persona" middle layer |
| **No Team Perspective** | Almost no platform addresses sharing templates for multi-Agent collaboration teams |

SoulHub's answer: **Define Agent souls in Markdown, share them through open source.**

---

## Highlights

- **🧠 Soul-First** — Not code or workflows, but Agent personas, skills, and behavior patterns (IDENTITY.md + SOUL.md).
- **📝 Markdown Native** — Human-readable and editable, version-control friendly, no vendor lock-in.
- **🎨 Fusion Orchestrator** — Drag & drop Agents onto a canvas, auto-generate dispatchers and routing rules, undo/redo/auto-layout.
- **👥 Team Recipes** — Share multi-Agent collaboration architectures (e.g., "Social Media Team", "Dev Squad").
- **🔧 CLI One-Click Install** — `soulhub install writer-xiaohongshu`, one command, ready to go.
- **🌍 Framework Compatible** — Primary support for OpenClaw, designed to adapt to Dify / CrewAI and more.
- **🌓 Theme Switching** — System / Light / Dark mode.
- **🐳 Docker One-Click Deploy** — `make deploy-docker`, build image + start service in one step.
- **📖 Docs Center** — Getting started guide, Soul spec reference, community contribution guide.

---

## How It Works

```
                         ┌──────────────────────────┐
                         │    soulhub (this repo)    │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │   Next.js Web    │   │    Registry      │   │   GitHub Actions │
   │  Platform (SSR)  │◄──│ 32 Agent Templs  │──►│   CI Validate    │
   │                  │   │  3 Team Recipes  │   │   + Build        │
   │  /souls  Browse  │   │                  │   └──────────────────┘
   │  /fusion Orch.   │   │  index.json idx  │
   │  /docs   Docs    │   └──────────────────┘
   └──────────────────┘
              ▲
              │ HTTP (GitHub Raw)
              │
   ┌──────────────────┐
   │   soulhub-cli    │
   │  (separate repo) │
   │                  │
   │  Search/Install  │
   │  Update/Rollback │
   └──────────────────┘
```

---

## Agent Registry

**32 curated templates** across 7 categories:

| Category | Example Agents |
|----------|---------------|
| 🎨 Self Media | Xiaohongshu Writer, WeChat Author, Zhihu Creator, Twitter Writer, Trending Researcher, Publish Scheduler |
| 💻 Development | Full-Stack Engineer, Python Expert, Code Reviewer, System Architect, K8s DevOps |
| 📈 Operations | Data Analyst, SEO Specialist, Growth Hacker, Ops Assistant |
| 🎧 Support | Frontline Support, Technical Support, Escalation Dispatcher |
| 📚 Education | Programming Tutor, English Teacher |
| 🎯 Dispatcher | Master Dispatcher (multi-Agent coordination) |

**3 Team Recipes**: Social Media Team, Dev Squad, Support Center.

Each Agent template consists of:

```
registry/agents/your-agent-name/
├── manifest.yaml      # Metadata: name, category, tags, version
├── IDENTITY.md        # Identity: role, responsibilities, capabilities
├── SOUL.md            # Behavior: personality, style, workflow
├── HEARTBEAT.md       # (Optional) Heartbeat: daily routines, status updates
└── skills/            # (Optional) Skill modules: domain-specific abilities
```

---

## Quick Start

### Option 1: CLI One-Line Install

Runtime: **Node ≥ 18**

```bash
# Install CLI (recommended: curl one-line install)
curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash

# Or install via npm
npm install -g soulhubcli

# Search for Agents
soulhub search writer

# Interactive install (prompts for role & claw selection)
soulhub install writer-xiaohongshu

# Install as main agent (skip role prompt)
soulhub install writer-xiaohongshu --role main

# Install as worker agent (skip role prompt)
soulhub install writer-xiaohongshu --role worker

# Specify claw type (skip claw prompt)
soulhub install coder-fullstack --claw-type LightClaw

# Install to a custom directory
soulhub install coder-fullstack --dir ./my-agents

# Install a Team Recipe (multiple Agents at once)
soulhub install --recipe self-media-team

# Rollback to a previous installation state
soulhub rollback
```

### Option 2: Browse on Web Platform

1. Visit the Web platform, go to `/souls` to browse or search for Agents
2. View IDENTITY.md / SOUL.md on the detail page
3. Click **Download ZIP** or copy the install command

### Option 3: Assemble with Fusion

1. Go to the `/fusion` page
2. Drag & drop Agents from the left panel onto the canvas
3. The system auto-creates a dispatcher node and generates routing rules
4. Click **Export** to download ZIP or generate a share link

---

## Web Platform

| Feature | Description |
|---------|-------------|
| **Soul Browsing** (`/souls`) | Filter by category, keyword search, multi-dimension sorting (popularity/stars/latest) |
| **Soul Detail** (`/souls/[name]`) | View IDENTITY.md / SOUL.md, file list, one-click copy install command, ZIP download |
| **Fusion Orchestrator** (`/fusion`) | Drag & drop Agents onto canvas, auto-generate dispatchers and routing rules, undo/redo/auto-layout |
| **Team Export** | Export assembled Agent teams as ZIP or share links |
| **Docs Center** (`/docs`) | Getting started, Soul spec, CLI guide, Fusion orchestration, API reference, community guide |
| **Theme Switching** | System / Light / Dark mode |
| **Landing Page** (`/`) | Project intro, pain points, feature showcase, quick start guide |

---

## Fusion Orchestrator

Fusion is SoulHub's core innovation — visually drag & drop to assemble Agents and auto-generate multi-Agent collaboration architectures:

- Drag any Agent from the left panel onto the canvas
- System auto-creates a Dispatcher node
- Auto-generates routing rules connecting all Agents
- Supports undo/redo and auto-layout
- Properties panel for editing Agent and routing details
- One-click export as ZIP or shareable link

---

## CLI Tool

Separate repo: [soulhub-cli](https://github.com/lndyzwdxhs/soulhub-cli)

```bash
npm install -g soulhubcli
```

| Command | Description |
|---------|-------------|
| `soulhub search [query]` | Search Agent templates |
| `soulhub search -c <category>` | Filter search by category |
| `soulhub search -n <number>` | Limit search results |
| `soulhub search --json` | Output search results in JSON format |
| `soulhub info <name>` | View Agent details (identity, soul, skills, etc.) |
| `soulhub info <name> --identity` | Show IDENTITY.md content |
| `soulhub info <name> --soul` | Show SOUL.md content |
| `soulhub info <name> --json` | Output Agent details in JSON format |
| `soulhub install <name>` | Install Agent (interactive: select role & target claw) |
| `soulhub install <name> --role main` | Install as main Agent (skip role selection) |
| `soulhub install <name> --role worker` | Install as worker Agent (skip role selection) |
| `soulhub install <name> --claw-type <type>` | Specify target claw type (skip claw selection) |
| `soulhub install <name> --dir <path>` | Install to a custom directory |
| `soulhub install <name> -y` | Skip all confirmation prompts |
| `soulhub install --from <source>` | Install from local directory, ZIP, or URL |
| `soulhub list` | List installed Agents |
| `soulhub list --json` | Output installed Agents in JSON format |
| `soulhub update [name]` | Update installed Agents (auto-backup before update) |
| `soulhub uninstall <name>` | Uninstall an Agent (also deletes related backups) |
| `soulhub uninstall <name> --keep-files` | Uninstall but keep workspace files |
| `soulhub uninstall <name> -y` | Skip uninstall confirmation |
| `soulhub rollback` | Interactive rollback to a previous installation state |
| `soulhub rollback --list` | List all available rollback records |
| `soulhub rollback --last <n>` | Rollback the n-th most recent install (1 = latest) |
| `soulhub rollback --id <id>` | Rollback to a specific backup record by ID |
| `soulhub rollback --claw-type <type>` | Specify target claw type for rollback |
| `soulhub rollback -y` | Skip rollback confirmation |

---

## Local Development

Runtime: **Node ≥ 18**

```bash
git clone https://github.com/lndyzwdxhs/soulhub.git
cd soulhub

# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Or use Makefile
make dev
```

### Common Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start dev server |
| `make dev-turbo` | Turbopack accelerated dev |
| `make dev-debug` | Start dev server with Node.js debug mode (port 9229) |
| `make build` | Production build |
| `make start` | Start production server (requires build first) |
| `make build-index` | Build registry index |
| `make validate` | Validate registry template format |
| `make lint` | ESLint check |
| `make typecheck` | TypeScript type check |
| `make check` | lint + typecheck full check |
| `make clean` | Clean build artifacts |
| `make clean-all` | Deep clean (including node_modules) |
| `make reinstall` | Clean and reinstall dependencies |

---

## Docker Deployment

Multi-stage build based on Next.js standalone mode — small image size, fast startup.

```bash
# One-click deploy (build image + start in background), exposed on port 80
make deploy-docker

# Or step by step
make docker-build     # Build image
make docker-run-d     # Run in background
make docker-logs      # View logs
make docker-stop      # Stop container
make docker-shell     # Enter container shell
```

### Vercel Deployment

```bash
# Production deploy
make deploy-vercel

# Preview environment
make deploy-vercel-preview
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------:|
| **Web Platform** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion |
| **Fusion Orchestrator** | React Flow (@xyflow/react v12) |
| **Theme System** | next-themes (System / Light / Dark) |
| **CLI Tool** | Node.js, Commander, Chalk, Ora, JSZip |
| **Template Format** | YAML manifest + Markdown (IDENTITY.md, SOUL.md, HEARTBEAT.md) + Skills |
| **Containerization** | Docker multi-stage build (Node 18 Alpine) |
| **CI/CD** | GitHub Actions + Vercel |

---

## Project Structure

```
soulhub/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── souls/            # Soul browsing + detail pages
│   │   ├── fusion/           # Fusion Orchestrator (visual drag & drop)
│   │   ├── docs/             # Documentation center
│   │   ├── api/compose/      # Share API
│   │   ├── c/[id]/           # Share link redirect
│   │   └── index.json/       # Registry index API
│   ├── components/
│   │   ├── landing/          # Landing components (Hero, Features, Pain Points, etc.)
│   │   ├── agents/           # Agent list, cards, detail
│   │   ├── composer/         # Fusion canvas, nodes, panels, export
│   │   └── ui/               # Common UI (Navbar, ThemeToggle, CopyButton, etc.)
│   └── lib/                  # Utilities, types, data loading
├── registry/
│   ├── agents/               # 32 Agent templates
│   ├── recipes/              # 3 Team Recipes
│   ├── categories.yaml       # Category definitions (7 categories)
│   ├── index.json            # Build artifact (search index)
│   ├── manifest.schema.json  # Manifest validation schema
│   └── scripts/              # Build + validation scripts
├── .github/workflows/        # CI (build + validate + index)
├── Dockerfile                # Docker multi-stage build
├── Makefile                  # Quick command entry
├── package.json
├── vercel.json
└── tailwind.config.ts
```

---

## Agent Template Format

### manifest.yaml

```yaml
name: writer-xiaohongshu
displayName: Xiaohongshu Content Expert
description: Specializes in Xiaohongshu content creation — product reviews, lifestyle sharing, recommendation posts
category: self-media
tags: [xiaohongshu, content-creation, social-media]
version: "1.0.0"
author: soulhub
minClawVersion: "2026.3.0"
```

### IDENTITY.md — Defines Who the Agent Is

Role positioning, core responsibilities, skill boundaries.

### SOUL.md — Defines How the Agent Behaves

Personality traits, communication style, workflow, decision principles.

### HEARTBEAT.md — Defines Agent's Daily Life (Optional)

Daily routines, status updates, activity patterns.

### skills/ — Skill Modules (Optional)

Domain-specific skill packs containing references, templates, and specialized instructions.

---

## Contributing

### Contribute an Agent Template

1. Fork this repository
2. Create your Agent directory under `registry/agents/`
3. Write `manifest.yaml`, `IDENTITY.md`, `SOUL.md`
4. Run validation: `npm run validate`
5. Submit a Pull Request

### Contribute a Team Recipe

Create a recipe directory under `registry/recipes/`, including `manifest.yaml`, `soulhub.yaml`, and `README.md`.

---

## Design Philosophy

1. **Soul-First** — Not sharing code or workflows, but Agent personas, skills, and behavior patterns
2. **Markdown Native** — IDENTITY.md + SOUL.md as standard format, human-readable and editable
3. **Team Recipes** — Support sharing multi-Agent collaboration architectures
4. **Framework Compatible** — Primary support for OpenClaw, designed to adapt to Dify / CrewAI and more
5. **Open Source Driven** — GitHub PR contribution model, community-built

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=lndyzwdxhs/soulhub&type=date)](https://star-history.com/#lndyzwdxhs/soulhub&Date)

---

## License

[MIT](LICENSE)
