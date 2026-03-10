# 🧠 SoulHub — Open Source Agent Soul Store

<p align="center">
  <strong>Just like GitHub stores code, SoulHub stores well-tuned Agent souls.</strong>
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

[Web Platform](#web-platform) · [CLI Tool](#cli-tool) · [Agent Templates](#agent-registry) · [Composer](#visual-composer) · [Quick Start](#quick-start) · [Local Development](#local-development) · [Docker Deploy](#docker-deployment) · [Contributing](#contributing)

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
- **🎨 Visual Composer** — Drag & drop Agents onto a canvas, auto-generate dispatchers and routing rules, undo/redo/auto-layout.
- **👥 Team Recipes** — Share multi-Agent collaboration architectures (e.g., "Social Media Team of 6", "Dev Squad").
- **🔧 CLI One-Click Install** — `soulhub install writer-xiaohongshu`, one command, ready to go.
- **🌍 Framework Compatible** — Primary support for OpenClaw, designed to adapt to Dify / CrewAI and more.
- **🌓 Theme Switching** — System / Light / Dark mode.
- **🐳 Docker One-Click Deploy** — `make deploy-docker`, build image + start service in one step.

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
   │  Platform (SSR)  │◄──│ 21 Agent Templs  │──►│   CI Validate    │
   │                  │   │  3 Team Recipes  │   │   + Build        │
   │  Browse/Search   │   │                  │   └──────────────────┘
   │  Composer        │   │  index.json idx  │
   │  Download/Share  │   └──────────────────┘
   └──────────────────┘
              ▲
              │ HTTP (GitHub Raw)
              │
   ┌──────────────────┐
   │   soulhub-cli    │
   │  (separate repo) │
   │                  │
   │  Search/Install  │
   │  Update/Publish  │
   └──────────────────┘
```

---

## Agent Registry

**21 curated templates** across 6 categories:

| Category | Example Agents |
|----------|---------------|
| 🎨 Content Creation | Xiaohongshu Writer, WeChat Author, Zhihu Creator, Twitter Writer |
| 💻 Development | Full-Stack Engineer, Python Expert, Code Reviewer, System Architect |
| 📈 Operations | Data Analyst, SEO Specialist, Growth Hacker |
| 🎧 Customer Service | Frontline Support, Technical Support, Escalation Dispatcher |
| 📚 Education | Programming Tutor, English Teacher |
| 🎯 Orchestration | Master Dispatcher (multi-Agent coordination) |

**3 Team Recipes**: Social Media Team, Dev Squad, Customer Service Center.

Each Agent template consists of:

```
registry/agents/your-agent-name/
├── manifest.yaml      # Metadata: name, category, tags, version
├── IDENTITY.md        # Identity: role, responsibilities, capabilities
└── SOUL.md            # Behavior: personality, style, workflow
```

---

## Quick Start

### Option 1: CLI One-Line Install

Runtime: **Node ≥ 18**

```bash
# Install CLI globally
npm install -g soulhub

# Search for Agents
soulhub search writer

# Install to current directory
soulhub install writer-xiaohongshu

# Install to a specific directory
soulhub install coder-fullstack --dir ./my-agents

# Install a Team Recipe (multiple Agents at once)
soulhub install --recipe self-media-team
```

### Option 2: Browse on Web Platform

1. Visit the Web platform, browse or search for Agents
2. View IDENTITY.md / SOUL.md on the detail page
3. Click **Download ZIP** or copy the install command

### Option 3: Assemble with Composer

1. Go to the `/composer` page
2. Drag & drop Agents from the left panel onto the canvas
3. The system auto-creates a dispatcher node and generates routing rules
4. Click **Export** to download ZIP or generate a share link

---

## Web Platform

| Feature | Description |
|---------|-------------|
| **Agent Browsing** | Filter by category, keyword search, multi-dimension sorting (popularity/stars/latest) |
| **Agent Detail** | View IDENTITY.md / SOUL.md, file list, one-click copy install command, ZIP download |
| **Visual Composer** | Drag & drop Agents onto canvas, auto-generate dispatchers and routing rules, undo/redo/auto-layout |
| **Team Export** | Export assembled Agent teams as ZIP or share links |
| **Theme Switching** | System / Light / Dark mode |
| **Landing Page** | Project intro, pain points, feature showcase, quick start guide |

---

## Visual Composer

Composer is SoulHub's core innovation — visually drag & drop to assemble Agents and auto-generate multi-Agent collaboration architectures:

- Drag any Agent from the left panel onto the canvas
- System auto-creates a Dispatcher node
- Auto-generates routing rules connecting all Agents
- Supports undo/redo and auto-layout
- One-click export as ZIP or shareable link

---

## CLI Tool

Separate repo: [soulhub-cli](https://github.com/lndyzwdxhs/soulhub-cli)

```bash
npm install -g soulhub
```

| Command | Description |
|---------|-------------|
| `soulhub search [query]` | Search Agent templates |
| `soulhub info <name>` | View Agent details |
| `soulhub install <name>` | Install Agent template locally |
| `soulhub list` | List installed Agents |
| `soulhub update [name]` | Update installed Agents |
| `soulhub uninstall <name>` | Uninstall an Agent |
| `soulhub publish [dir]` | Publish an Agent to the community |

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
| `make build` | Production build |
| `make build-index` | Build registry index |
| `make validate` | Validate registry template format |
| `make lint` | ESLint check |
| `make typecheck` | TypeScript type check |
| `make check` | lint + typecheck full check |

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
|-------|-----------|
| **Web Platform** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion |
| **Visual Orchestration** | React Flow (@xyflow/react v12) |
| **Theme System** | next-themes (System / Light / Dark) |
| **CLI Tool** | Node.js, Commander, Chalk, Ora, JSZip |
| **Template Format** | YAML manifest + Markdown (IDENTITY.md, SOUL.md) |
| **Containerization** | Docker multi-stage build (Node 18 Alpine) |
| **CI/CD** | GitHub Actions + Vercel |

---

## Project Structure

```
soulhub/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── agents/           # Agent browsing + detail pages
│   │   ├── composer/         # Visual Composer
│   │   ├── api/compose/      # Share API
│   │   └── c/[id]/           # Share link redirect
│   ├── components/
│   │   ├── landing/          # Landing components (Hero, Features, etc.)
│   │   ├── agents/           # Agent list, cards, detail
│   │   ├── composer/         # Composer canvas, nodes, panels
│   │   └── ui/               # Common UI (Navbar, ThemeToggle, etc.)
│   └── lib/                  # Utilities, types, data loading
├── registry/
│   ├── agents/               # 21 Agent templates
│   ├── recipes/              # 3 Team Recipes
│   ├── categories.yaml       # Category definitions
│   ├── index.json            # Build artifact (search index)
│   └── scripts/              # Build + validation scripts
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
minClawVersion: "0.1.0"
```

### IDENTITY.md — Defines Who the Agent Is

Role positioning, core responsibilities, skill boundaries.

### SOUL.md — Defines How the Agent Behaves

Personality traits, communication style, workflow, decision principles.

---

## Contributing

### Contribute an Agent Template

1. Fork this repository
2. Create your Agent directory under `registry/agents/`
3. Write `manifest.yaml`, `IDENTITY.md`, `SOUL.md`
4. Run validation: `npm run validate`
5. Submit a Pull Request

### Contribute a Team Recipe

Create a recipe directory under `registry/recipes/`, including `manifest.yaml`, `topology.yaml`, and `README.md`.

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
