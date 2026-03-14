# SoulHub CLI Complete Command Reference

## Global Options

| Option | Description |
|--------|-------------|
| `--version`, `-V` | Show CLI version |
| `--help`, `-h` | Show help information |

## Commands

### `soulhub search [query]`

Search for Agent templates by keyword.

**Arguments:**
- `query` (optional): Search keyword, matches against name, description, and tags

**Options:**
- `-c, --category <category>`: Filter by category (development, content, operations, support, education, dispatch)
- `-l, --limit <number>`: Maximum number of results to show

**Examples:**
```bash
soulhub search python
soulhub search -c development
soulhub search writer -l 3
```

---

### `soulhub info <name>`

View detailed information about an Agent template.

**Arguments:**
- `name` (required): Agent template name

**Options:**
- `--identity`: Display IDENTITY.md content
- `--soul`: Display SOUL.md content

**Examples:**
```bash
soulhub info coder-fullstack
soulhub info coder-fullstack --identity
soulhub info coder-fullstack --soul
```

---

### `soulhub install [name]`

Install an Agent or Team from the registry or local source.

**CRITICAL: Non-Interactive Usage Required**

To prevent interactive prompts that block execution, you MUST:
1. Always specify `--worker` or `--main` (single agent defaults to `--worker`)
2. Always specify `--claw-dir` or ensure only one claw installation exists

**Arguments:**
- `name` (optional): Agent/Team name from registry. Omit when using `--from`

**Options:**
- `--from <source>`: Install from local directory, ZIP file, or URL instead of registry
- `--main`: Install as main Agent (deploys to `workspace/`) — use only when explicitly requested
- `--worker`: Install as worker/sub-agent (deploys to `workspace-<agentId>/`) — **DEFAULT for single agent**
- `--dir <path>`: Custom target directory for installation
- `--claw-dir <path>`: Specify claw installation directory — **ALWAYS specify to avoid interactive prompt**

**Behavior:**
- Automatically detects package type (`kind: agent` or `kind: team`)
- For teams: installs dispatcher as main, workers into separate workspaces (no role prompt triggered)
- Creates automatic backup before installation (supports rollback)
- **Without `--main` or `--worker`: triggers interactive prompt — NEVER do this**

**Interactive Prompts to Avoid:**
| Prompt | Trigger Condition | Prevention |
|--------|-------------------|------------|
| Role selection | Neither `--main` nor `--worker` specified | Always add `--worker` (default) or `--main` |
| Directory selection | Multiple claw dirs found, no `--claw-dir` | Always add `--claw-dir <path>` |

**Claw Directory Auto-Detection from Working Directory:**
```
pwd = ~/.lightclaw/workspace       → --claw-dir ~/.lightclaw
pwd = ~/.openclaw/workspace-python → --claw-dir ~/.openclaw
pwd = /path/to/.lightclaw/...      → --claw-dir /path/to/.lightclaw
```

**Examples (all non-interactive):**
```bash
# Install as sub-agent (DEFAULT)
soulhub install coder-python --worker --claw-dir ~/.lightclaw

# Install as main agent (only when explicitly requested)
soulhub install coder-python --main --claw-dir ~/.openclaw

# Install team (role auto-assigned, just need --claw-dir)
soulhub install dev-squad --claw-dir ~/.lightclaw

# Install from local source as sub-agent
soulhub install --from ./my-custom-agent/ --worker --claw-dir ~/.lightclaw

# Install from ZIP
soulhub install --from ./team-export.zip --claw-dir ~/.openclaw
```

---

### `soulhub list` (alias: `ls`)

List all installed Agent templates.

**Examples:**
```bash
soulhub list
soulhub ls
```

---

### `soulhub update [name]`

Update installed Agent templates to the latest version.

**Arguments:**
- `name` (optional): Specific agent to update. Omit to update all

**Examples:**
```bash
soulhub update coder-python
soulhub update
```

---

### `soulhub uninstall <name>` (alias: `rm`)

Uninstall an Agent template.

**Arguments:**
- `name` (required): Agent name to uninstall

**Options:**
- `--keep-files`: Remove from registry tracking but keep files on disk

**Examples:**
```bash
soulhub uninstall coder-python
soulhub rm coder-python
soulhub uninstall coder-python --keep-files
```

---

### `soulhub rollback`

Rollback to a previous installation state using automatic backups.

**Options:**
- `--list`: Show available backup records
- `--id <backup-id>`: Rollback to a specific backup by ID

**Examples:**
```bash
soulhub rollback --list
soulhub rollback
soulhub rollback --id abc123
```

---

### `soulhub publish [dir]`

Validate an Agent template and guide through community publishing.

**Arguments:**
- `dir` (optional): Path to agent template directory (defaults to current directory)

**Examples:**
```bash
soulhub publish ./my-agent/
soulhub publish
```

## Configuration

### Config File Location

`~/.soulhub/config.json`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SOULHUB_REGISTRY_URL` | Custom registry URL |
| `OPENCLAW_HOME` | OpenClaw installation directory |
| `LIGHTCLAW_HOME` | LightClaw installation directory (alternative brand) |

### Claw Directory Discovery Priority

1. `--claw-dir` CLI flag (ALWAYS prefer this in non-interactive mode)
2. `OPENCLAW_HOME` or `LIGHTCLAW_HOME` environment variable
3. `~/.openclaw` or `~/.lightclaw` default paths
4. `$(pwd)/.openclaw` or `$(pwd)/.lightclaw`

**NOTE**: If multiple claw installations are found and `--claw-dir` is not specified, an interactive directory selection prompt is triggered — this MUST be avoided.

### Claw Type Detection from Working Directory

| Working Directory | Detected Claw Type | `--claw-dir` Value |
|-------------------|--------------------|--------------------|
| `~/.lightclaw/workspace` | LightClaw | `~/.lightclaw` |
| `~/.lightclaw/workspace-xxx` | LightClaw | `~/.lightclaw` |
| `~/.openclaw/workspace` | OpenClaw | `~/.openclaw` |
| `~/.openclaw/workspace-xxx` | OpenClaw | `~/.openclaw` |
| `/custom/path/.lightclaw/workspace` | LightClaw | `/custom/path/.lightclaw` |
