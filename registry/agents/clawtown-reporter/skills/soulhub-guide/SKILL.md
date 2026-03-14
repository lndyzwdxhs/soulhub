---
name: soulhub-guide
description: Guide for using the SoulHub platform to install the SoulHub CLI and manage AI Agent persona templates. This skill should be used when users mention SoulHub, soulhub CLI, installing agents, agent persona templates, IDENTITY.md, SOUL.md, or OpenClaw agent management. It covers CLI installation, agent searching, installing, updating, uninstalling, team deployment, and agent template creation/publishing.
---

# SoulHub Platform Guide

SoulHub is an open-source AI Agent persona template community — "Just like GitHub stores code, SoulHub stores well-tuned Agent souls." It provides a CLI tool (`soulhub`) to search, install, update, and manage Agent templates that deploy into an OpenClaw runtime environment.

## CRITICAL: Non-Interactive Execution Rules

**All CLI commands MUST be executed in non-interactive mode to avoid blocking the agent.** Follow these mandatory rules:

1. **ALWAYS specify `--worker` or `--main` flag** when running `soulhub install` — NEVER run `soulhub install <name>` without a role flag, as it triggers an interactive prompt that will hang.
2. **Single agent defaults to `--worker` (sub-agent)** — unless the user explicitly requests main agent installation, always use `--worker`.
3. **ALWAYS specify `--claw-dir`** to avoid the multi-directory selection prompt — auto-detect the claw type from the current working directory (see Claw Type Auto-Detection below).

## Claw Type Auto-Detection

The claw type (OpenClaw or LightClaw) can be determined by inspecting the current working directory path:

| Working Directory Pattern | Claw Type | `--claw-dir` Value |
|---------------------------|-----------|---------------------|
| `~/.lightclaw/workspace*` | LightClaw | `~/.lightclaw` |
| `~/.openclaw/workspace*` | OpenClaw | `~/.openclaw` |
| Contains `lightclaw` in path | LightClaw | Extract the claw root from path |
| Contains `openclaw` in path | OpenClaw | Extract the claw root from path |

**Detection logic**: Check if the current working directory (`pwd`) is under a claw installation directory. For example:
- If `pwd` = `~/.lightclaw/workspace` → claw type is `lightclaw`, use `--claw-dir ~/.lightclaw`
- If `pwd` = `~/.openclaw/workspace-python` → claw type is `openclaw`, use `--claw-dir ~/.openclaw`
- If `pwd` = `/home/user/.lightclaw/workspace` → claw type is `lightclaw`, use `--claw-dir /home/user/.lightclaw`

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
soulhub search <keyword> -l 5
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

### Step 3: Install the Agent (Non-Interactive)

**IMPORTANT**: Always use `--worker` or `--main` flag. Default is `--worker` (sub-agent).

First, auto-detect the claw directory from the current working directory:

```bash
# Detect claw dir from pwd (example logic):
# pwd = ~/.lightclaw/workspace → CLAW_DIR=~/.lightclaw
# pwd = ~/.openclaw/workspace-python → CLAW_DIR=~/.openclaw
```

Install from SoulHub Registry:

```bash
# Install as sub-agent/worker (DEFAULT for single agent)
soulhub install <agent-name> --worker --claw-dir <detected-claw-dir>

# Install as main Agent ONLY when explicitly requested
soulhub install <agent-name> --main --claw-dir <detected-claw-dir>
```

Install from local source:

```bash
# From local directory
soulhub install --from ./my-agent/ --worker --claw-dir <detected-claw-dir>

# From ZIP file
soulhub install --from ./agent.zip --worker --claw-dir <detected-claw-dir>

# From URL
soulhub install --from https://example.com/agent.zip --worker --claw-dir <detected-claw-dir>
```

Advanced options:

```bash
# Specify custom target directory
soulhub install <agent-name> --worker --dir ./custom-path --claw-dir <detected-claw-dir>
```

### Step 4: Verify Installation

```bash
# List all installed agents
soulhub list
# or
soulhub ls
```

### Non-Interactive Checklist

Before executing any `soulhub install` command, verify:
- [ ] `--worker` or `--main` flag is present (prevents role selection prompt)
- [ ] `--claw-dir` is specified OR only one claw installation exists on the system (prevents directory selection prompt)
- [ ] The claw directory was auto-detected from the working directory path or environment variables

## Installing a Team (Multi-Agent)

Teams use the Dispatcher + Worker pattern. The CLI automatically detects `kind: team` and handles role assignment (dispatcher → main, workers → worker) — **no interactive prompts are triggered for team installs**.

```bash
# From registry (team install is already non-interactive for role assignment)
soulhub install dev-squad --claw-dir <detected-claw-dir>

# From local ZIP (e.g., exported from SoulHub Fusion editor)
soulhub install --from ./team-export.zip --claw-dir <detected-claw-dir>
```

The CLI automatically installs the dispatcher as the main Agent and workers into their respective workspace directories.

## Managing Installed Agents

```bash
# Update a specific agent
soulhub update <agent-name>

# Update all agents
soulhub update

# Uninstall an agent
soulhub uninstall <agent-name>
# or
soulhub rm <agent-name>

# Uninstall but keep files
soulhub uninstall <agent-name> --keep-files

# View rollback history
soulhub rollback --list

# Rollback to previous state
soulhub rollback

# Rollback to specific backup
soulhub rollback --id <backup-id>
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
- **Claw directory discovery priority**: `--claw-dir` flag > `OPENCLAW_HOME` / `LIGHTCLAW_HOME` env vars > `~/.openclaw` / `~/.lightclaw`

## Common Workflows

### Quick Start: Install Your First Agent

```bash
# 1. Install CLI
curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash

# 2. Browse available agents
soulhub search

# 3. Pick one and view details
soulhub info coder-fullstack --identity

# 4. Auto-detect claw dir from working directory
#    e.g., pwd = ~/.lightclaw/workspace → CLAW_DIR=~/.lightclaw

# 5. Install as sub-agent (non-interactive, default)
soulhub install coder-fullstack --worker --claw-dir ~/.lightclaw

# 6. Verify
soulhub list
```

### Deploy a Dev Team

```bash
# Install the pre-built dev squad team (non-interactive, team auto-assigns roles)
soulhub install dev-squad --claw-dir ~/.lightclaw

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
soulhub rollback
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
