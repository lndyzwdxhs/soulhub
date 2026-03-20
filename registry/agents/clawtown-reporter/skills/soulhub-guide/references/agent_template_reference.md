# Agent Template Structure Reference

## Single Agent Template

### Directory Structure

```
agent-name/
├── manifest.yaml      # Required: metadata and configuration
├── IDENTITY.md        # Required: role and capability definition
├── SOUL.md            # Required: behavior and personality rules
└── skills/            # Optional: additional skill modules
    ├── skill-1.md
    └── skill-2.md
```

### manifest.yaml Schema

```yaml
# Required fields
name: string           # Unique identifier, lowercase with hyphens (e.g., "coder-python")
displayName: string    # Human-readable display name (e.g., "Python 专家")
description: string    # Brief description of the agent's purpose
category: string       # One of: development, content, operations, support, education, dispatch
tags: string[]         # Array of keyword tags for searchability
version: string        # Semantic version (e.g., "1.0.0")
author: string         # Author name or identifier

# Optional fields
minClawVersion: string # Minimum compatible OpenClaw version
```

**Category Values:**
| Category | Description |
|----------|-------------|
| `development` | Software development, architecture, DevOps |
| `content` | Content creation, writing, social media |
| `operations` | Publishing, marketing, growth, SEO |
| `support` | Customer service, technical support |
| `education` | Tutoring, training, learning |
| `dispatch` | Task routing and orchestration |

### IDENTITY.md Structure

IDENTITY.md defines **who** the agent is. It establishes the agent's role, expertise, and boundaries.

Recommended sections:

```markdown
# [Agent Display Name]

**Emoji**: [Representative emoji]
**Creature**: [Optional mascot or spirit animal]
**Vibe**: [One-line personality/vibe summary]

## 我是谁

[2-3 sentences describing the core role and positioning]

## 我的专业领域

- [Domain expertise 1]
- [Domain expertise 2]
- [Domain expertise 3]

## 我的设计原则

- [Guiding principle 1]
- [Guiding principle 2]
- [Guiding principle 3]

## 我的工作输出

- [Output type 1: description]
- [Output type 2: description]
```

### SOUL.md Structure

SOUL.md defines **how** the agent behaves. It establishes personality, communication style, and decision-making principles.

Recommended sections:

```markdown
# Soul of [Agent Name]

## 核心原则

- [Fundamental principle 1]
- [Fundamental principle 2]

## 边界

- [What the agent will NOT do]
- [Explicit scope limitations]

## 语气与风格

[Description of communication tone, formality level, and interaction patterns]

## 工作流程

1. [Step 1 of typical workflow]
2. [Step 2]
3. [Step 3]

## 决策原则

- [Decision-making guideline 1]
- [Decision-making guideline 2]

---

*这份灵魂会随着我的成长而进化。*
```

---

## Team Template (Multi-Agent)

### Directory Structure

```
team-name/
├── manifest.yaml      # Team metadata
├── soulhub.yaml       # Team orchestration definition (core)
├── README.md          # Team documentation
└── agents/            # Optional: bundled agent directories
    ├── agent-1/
    │   ├── manifest.yaml
    │   ├── IDENTITY.md
    │   └── SOUL.md
    └── agent-2/
        ├── manifest.yaml
        ├── IDENTITY.md
        └── SOUL.md
```

### soulhub.yaml Schema

```yaml
apiVersion: v1          # API version, always "v1"
kind: team              # Package type, "team" for multi-agent
name: string            # Team unique identifier
version: string         # Team version
description: string     # Team description

dispatcher:             # Main dispatcher agent
  name: string          # Dispatcher agent name (from registry)
  dir: string           # Directory name for the dispatcher

agents:                 # Worker agent list
  - name: string        # Worker identifier within the team
    dir: string         # Agent directory name (from registry or bundled)
    role: worker        # Always "worker"
    displayName: string # Human-readable name for this worker

routing:                # Optional: custom routing rules
  rules: []             # Routing rule definitions

metadata:
  author: string        # Team author
```

### Architecture Pattern: Dispatcher + Workers

Teams use a hierarchical architecture:

```
User Message
    ↓
[Dispatcher (Main Agent)]
    ↓ routes to appropriate worker
[Worker Agent 1] [Worker Agent 2] [Worker Agent 3]
    ↓
Response back through Dispatcher
```

- **Dispatcher**: Installed as the main agent (`workspace/`), responsible for analyzing incoming messages and routing to the appropriate worker
- **Workers**: Installed in separate workspaces (`workspace-<name>/`), each specialized in a specific domain

### Example Team Configurations

**Dev Squad:**
```yaml
apiVersion: v1
kind: team
name: dev-squad
version: "1.0.0"
description: "精干的软件开发团队"
dispatcher:
  name: "dispatcher-main"
  dir: "dispatcher-main"
agents:
  - name: python
    dir: coder-python
    role: worker
    displayName: "Python专家"
  - name: fullstack
    dir: coder-fullstack
    role: worker
    displayName: "全栈工程师"
  - name: reviewer
    dir: coder-reviewer
    role: worker
    displayName: "代码审查员"
```

**Self-Media Team:**
```yaml
apiVersion: v1
kind: team
name: self-media-team
version: "1.0.0"
description: "全平台自媒体内容创作与运营团队"
dispatcher:
  name: "dispatcher-main"
  dir: "dispatcher-main"
agents:
  - name: wechat
    dir: writer-wechat
    role: worker
    displayName: "公众号作家"
  - name: xiaohongshu
    dir: writer-xiaohongshu
    role: worker
    displayName: "小红书创作者"
  - name: zhihu
    dir: writer-zhihu
    role: worker
    displayName: "知乎答主"
  - name: twitter
    dir: writer-twitter
    role: worker
    displayName: "推特运营"
  - name: publisher
    dir: publisher-multi-platform
    role: worker
    displayName: "多平台发布员"
```

---

## Deployment Layout in OpenClaw/LightClaw

After installation via `soulhub install`, agents are deployed to the claw runtime directory:

```
~/.lightclaw/                   # or ~/.openclaw, or LIGHTCLAW_HOME/OPENCLAW_HOME
├── lightclaw.json              # Main configuration (or openclaw.json)
├── .env                        # Environment variables
├── workspace/                  # Main agent (dispatcher)
│   ├── IDENTITY.md
│   ├── SOUL.md
│   └── skills/
├── workspace-python/           # Worker/sub-agent: Python expert
│   ├── IDENTITY.md
│   ├── SOUL.md
│   └── skills/
├── workspace-fullstack/        # Worker/sub-agent: Fullstack engineer
│   ├── IDENTITY.md
│   ├── SOUL.md
│   └── skills/
└── workspace-reviewer/         # Worker/sub-agent: Code reviewer
    ├── IDENTITY.md
    ├── SOUL.md
    └── skills/
```

**Note**: Single agent install with `--role worker` deploys to `workspace-<agentId>/` as a sub-agent. Only `--role main` deploys to `workspace/`.

The Gateway automatically discovers and loads agents from these workspace directories.
