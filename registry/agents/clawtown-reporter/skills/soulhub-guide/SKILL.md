---
name: soulhub-guide
description: Guide for using the SoulHub platform to install the SoulHub CLI and manage AI Agent persona templates. This skill should be used when users mention SoulHub, soulhub CLI, installing agents, agent persona templates, IDENTITY.md, SOUL.md, or OpenClaw agent management. It covers CLI installation, agent searching, installing, updating, uninstalling, team deployment, and agent template creation/publishing.
---

# SoulHub Platform Guide

SoulHub is an open-source AI Agent persona template community — "Just like GitHub stores code, SoulHub stores well-tuned Agent souls." It provides a CLI tool (`soulhub`) to search, install, update, and manage Agent templates that deploy into an OpenClaw runtime environment.

## Execution Rules

**The CLI is interactive by default.** Follow these rules to ensure non-interactive execution:

1. **Always use `--role <main|worker>`** to skip role selection prompt.
2. **Always use `--claw-type <type>`** to skip claw selection prompt. Only `OpenClaw` or `LightClaw` is supported (case-insensitive).
3. **Always use `-y`** to skip confirmation prompts.
4. Without `--role` and `--claw-type`, the CLI enters interactive mode which will hang in non-interactive terminals.

## Claw Type Auto-Detection

The claw type (OpenClaw or LightClaw) can be determined by inspecting the current working directory path:

| Working Directory Pattern | Claw Type | `--claw-type` Value |
|---------------------------|-----------|---------------------|
| `~/.lightclaw/workspace*` | LightClaw | `LightClaw` |
| `~/.openclaw/workspace*` | OpenClaw | `OpenClaw` |
| Contains `lightclaw` in path | LightClaw | `LightClaw` |
| Contains `openclaw` in path | OpenClaw | `OpenClaw` |

**Detection logic**: Check if the current working directory (`pwd`) is under a claw installation directory. For example:
- If `pwd` = `~/.lightclaw/workspace` → claw type is `lightclaw`, use `--claw-type LightClaw`
- If `pwd` = `~/.openclaw/workspace-python` → claw type is `openclaw`, use `--claw-type OpenClaw`
- If `pwd` = `/home/user/.lightclaw/workspace` → claw type is `lightclaw`, use `--claw-type LightClaw`

**Fallback priority** (if working directory detection fails):
1. `OPENCLAW_HOME` or `LIGHTCLAW_HOME` environment variable
2. Check if `~/.openclaw` exists
3. Check if `~/.lightclaw` exists

## Core Concepts

- **Agent Template**: A persona definition consisting of `manifest.yaml` + `IDENTITY.md` + `SOUL.md` + optional `skills/` directory
- **IDENTITY.md**: Defines **who** the Agent is — role, expertise, design principles, output expectations
- **SOUL.md**: Defines **how** the Agent behaves — core principles, boundaries, tone, communication style
- **manifest.yaml**: Metadata — name, displayName, description, category, tags, version, author
- **Team (soulhub.yaml)**: Multi-agent orchestration using a Dispatcher + Worker architecture
- **OpenClaw / LightClaw**: The AI Gateway runtime that executes deployed Agents across 25+ messaging channels

For detailed reference on Agent template structure, team orchestration format, and the full CLI command reference, load `references/cli_reference.md` and `references/agent_template_reference.md`.

## SoulHub CLI Installation

### Method 1: curl One-liner (Recommended)

```bash
curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash
```

### Method 2: npm Global Install

```bash
npm install -g soulhubcli
```

### Method 3: npx (No Install)

```bash
npx soulhubcli <command>
```

After installation, verify with:

```bash
soulhub --version
```

## Installing an Agent

### Step 1: Search for Available Agents

```bash
# Search by keyword
soulhub search <keyword>

# Filter by category
soulhub search -c development
soulhub search -c content
soulhub search -c operations
soulhub search -c support
soulhub search -c education
soulhub search -c dispatch

# Limit results
soulhub search <keyword> -n 5
```

### Step 2: View Agent Details

```bash
# Basic info
soulhub info <agent-name>

# View IDENTITY.md content
soulhub info <agent-name> --identity

# View SOUL.md content
soulhub info <agent-name> --soul
```

### Step 3: Install the Agent

**Default behavior**: Interactive — prompts for role (main/worker) and claw directory selection. To skip interaction, always pass `--role` and `--claw-type`.

Install from SoulHub Registry:

```bash
# Interactive install (prompts for role & claw selection)
soulhub install <agent-name>

# Install as worker (skip role prompt)
soulhub install <agent-name> --role worker --claw-type <claw-type>

# Install as main Agent (skip role prompt, -y skips confirmation)
soulhub install <agent-name> --role main --claw-type <claw-type> -y
```

Install from local source:

```bash
# From local directory
soulhub install --from ./my-agent/ --role worker --claw-type OpenClaw

# From ZIP file
soulhub install --from ./agent.zip --role worker --claw-type LightClaw

# From URL
soulhub install --from https://example.com/agent.zip --role worker --claw-type OpenClaw
```

Advanced options:

```bash
# Specify custom target directory (bypasses claw detection)
soulhub install <agent-name> --role worker --dir ./custom-path

# Fully non-interactive install with -y
soulhub install <agent-name> --role main --claw-type LightClaw -y
```

### Step 4: Verify Installation

```bash
# List all installed agents
soulhub list
# or
soulhub ls
```

### Install Behavior Summary

| Command | Behavior |
|---------|----------|
| `soulhub install <name>` | Interactive — prompts for role & claw selection |
| `soulhub install <name> --role worker --claw-type <type>` | Install as worker to **specific** claw (non-interactive) |
| `soulhub install <name> --role main --claw-type <type> -y` | Install as main to **specific** claw (fully non-interactive) |

## Installing a Team (Multi-Agent)

Teams use the Dispatcher + Worker pattern. The CLI automatically detects `kind: team` and handles role assignment (dispatcher → main, workers → worker).

```bash
# From registry (interactive claw selection)
soulhub install dev-squad

# From registry to a specific claw
soulhub install dev-squad --claw-type LightClaw

# From local ZIP
soulhub install --from ./team-export.zip --claw-type OpenClaw
```

The CLI automatically installs the dispatcher as the main Agent and workers into their respective workspace directories.

## Managing Installed Agents

```bash
# Update a specific agent
soulhub update <agent-name>

# Update all agents
soulhub update

# Uninstall an agent (-y to skip confirmation)
soulhub uninstall <agent-name> -y
# or
soulhub rm <agent-name> -y

# Uninstall but keep files
soulhub uninstall <agent-name> --keep-files -y

# View rollback history
soulhub rollback --list

# Rollback the most recent install (-y to skip confirmation)
soulhub rollback --last 1 -y

# Rollback to specific backup
soulhub rollback --id <backup-id> -y
```

## Creating and Publishing an Agent Template

### Agent Template Directory Structure

```
my-agent/
├── manifest.yaml      # Required: metadata
├── IDENTITY.md        # Required: who the agent is
├── SOUL.md            # Required: how the agent behaves
└── skills/            # Optional: skill modules
    └── my-skill.md
```

### manifest.yaml Format

```yaml
name: my-agent-name
displayName: "My Agent Display Name"
description: "Brief description of what this agent does"
category: development  # development | content | operations | support | education | dispatch
tags:
  - tag1
  - tag2
version: "1.0.0"
author: your-name
minClawVersion: "2025.1.0"
```

### IDENTITY.md Format

```markdown
# Agent Name

**Emoji**: 🤖
**Creature**: (optional mascot/animal)
**Vibe**: (one-line personality summary)

## 我是谁

(Core role positioning — 2-3 sentences)

## 我的专业领域

- Domain expertise 1
- Domain expertise 2
- ...

## 我的设计原则

- Principle 1
- Principle 2
- ...

## 我的工作输出

- Output type 1
- Output type 2
- ...
```

### SOUL.md Format

```markdown
# Soul of [Agent Name]

## 核心原则

- Guiding principle 1
- Guiding principle 2

## 边界

- What the agent will NOT do
- Explicit limitations

## 语气与风格

- Communication style description
- Tone guidelines

---

*这份灵魂会随着我的成长而进化。*
```

### Validate and Publish

```bash
# Validate template format
soulhub publish ./my-agent/

# Follow the interactive prompts to submit to the community
```

## Team Orchestration (soulhub.yaml)

For multi-agent teams, create a `soulhub.yaml`:

```yaml
apiVersion: v1
kind: team
name: my-team
version: "1.0.0"
description: "Team description"

dispatcher:
  name: "dispatcher-main"
  dir: "dispatcher-main"

agents:
  - name: worker-1
    dir: agent-dir-1
    role: worker
    displayName: "Worker 1 Name"
  - name: worker-2
    dir: agent-dir-2
    role: worker
    displayName: "Worker 2 Name"

metadata:
  author: your-name
```

## Configuration

- **Config file**: `~/.soulhub/config.json`
- **Custom registry**: Set `SOULHUB_REGISTRY_URL` environment variable
- **Claw directory discovery priority**: `--claw-type` flag (single claw) > `OPENCLAW_HOME` / `LIGHTCLAW_HOME` env vars > interactive selection from detected: `~/.openclaw` + `~/.lightclaw`

## Common Workflows

### Quick Start: Install Your First Agent

```bash
# 1. Install CLI
curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash

# 2. Browse available agents
soulhub search

# 3. Pick one and view details
soulhub info coder-fullstack --identity

# 4. Install as worker to detected claw
soulhub install coder-fullstack --role worker --claw-type OpenClaw

# 5. Verify
soulhub list
```

### Deploy a Dev Team

```bash
# Install the pre-built dev squad team
soulhub install dev-squad --claw-type OpenClaw

# This installs:
#   - dispatcher-main as the main agent
#   - coder-python as worker
#   - coder-fullstack as worker
#   - coder-reviewer as worker
```

### Recover from a Bad Install

```bash
# Check available backups
soulhub rollback --list

# Rollback to the previous state
soulhub rollback --last 1 -y
```

## Available Agent Categories

| Category | Examples |
|----------|----------|
| **development** | architect-system, coder-fullstack, coder-python, coder-reviewer, devops-k8s |
| **content** | writer-twitter, writer-wechat, writer-xiaohongshu, writer-zhihu |
| **operations** | publisher-multi-platform, publisher-scheduler, growth-hacker, seo-optimizer |
| **support** | support-tier1, support-technical, support-escalation |
| **education** | tutor-english, tutor-programming |
| **dispatch** | dispatcher-main |

## Available Team Recipes

| Team | Description |
|------|-------------|
| **dev-squad** | Python backend, fullstack dev, and code review |
| **self-media-team** | Multi-platform content creation and operations |
| **support-center** | Tiered customer support |
