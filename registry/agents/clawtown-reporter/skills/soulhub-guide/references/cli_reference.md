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
- `-n, --limit <number>`: Maximum number of results to show
- `--json`: Output results in JSON format

**Examples:**
```bash
soulhub search python
soulhub search -c development
soulhub search writer -n 3
```

---

### `soulhub info <name>`

View detailed information about an Agent template.

**Arguments:**
- `name` (required): Agent template name

**Options:**
- `--identity`: Display IDENTITY.md content
- `--soul`: Display SOUL.md content
- `--json`: Output results in JSON format

**Examples:**
```bash
soulhub info coder-fullstack
soulhub info coder-fullstack --identity
soulhub info coder-fullstack --soul
```

---

### `soulhub install [name]`

Install an Agent or Team from the registry or local source.

**Default behavior**: Interactive — prompts for role (main/worker) and claw directory selection.

**Arguments:**
- `name` (optional): Agent/Team name from registry. Omit when using `--from`

**Options:**
- `--from <source>`: Install from local directory, ZIP file, or URL instead of registry
- `-r, --role <role>`: Install role: `main` or `worker` (skip role selection prompt)
- `--dir <path>`: Custom target directory for installation
- `--claw-type <type>`: Specify claw type: OpenClaw or LightClaw (case-insensitive). Install to that claw only
- `-y, --yes`: Skip all confirmation prompts (auto-confirm)

**Behavior:**
- Automatically detects package type (`kind: agent` or `kind: team`)
- Without `--role` and `--claw-type`: enters interactive mode (prompts for selection)
- For teams: installs dispatcher as main, workers into separate workspaces
- Creates automatic backup before installation (supports rollback)
- Use `--claw-type` to target a specific claw

**Examples:**
```bash
# Interactive install (prompts for role & claw selection)
soulhub install coder-python

# Install as main agent (skip role selection)
soulhub install coder-python --role main

# Install as worker to a specific claw
soulhub install coder-python --role worker --claw-type LightClaw

# Fully non-interactive install (skip all prompts)
soulhub install coder-python --role main --claw-type OpenClaw -y

# Install team (role auto-assigned)
soulhub install dev-squad

# Install from local source
soulhub install --from ./my-custom-agent/ --role worker --claw-type OpenClaw

# Install from ZIP to a specific claw
soulhub install --from ./team-export.zip --role worker --claw-type OpenClaw
```

---

### `soulhub list` (alias: `ls`)

List all installed Agent templates.

**Options:**
- `--json`: Output results in JSON format

**Examples:**
```bash
soulhub list
soulhub ls
soulhub list --json
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
- `-y, --yes`: Skip confirmation prompts

**Examples:**
```bash
soulhub uninstall coder-python -y
soulhub rm coder-python -y
soulhub uninstall coder-python --keep-files -y
```

---

### `soulhub rollback`

Rollback to a previous installation state using automatic backups.

**Options:**
- `--list`: Show available backup records
- `--id <backup-id>`: Rollback to a specific backup by ID
- `--last <n>`: Rollback the Nth most recent installation (1 = latest)
- `--claw-type <type>`: Specify claw type for rollback
- `-y, --yes`: Skip confirmation prompts

**Examples:**
```bash
soulhub rollback --list
soulhub rollback --last 1 -y
soulhub rollback --id abc123 -y
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

1. `--claw-type` CLI flag (ALWAYS prefer this in non-interactive mode)
2. `OPENCLAW_HOME` or `LIGHTCLAW_HOME` environment variable
3. `~/.openclaw` or `~/.lightclaw` default paths
4. `$(pwd)/.openclaw` or `$(pwd)/.lightclaw`

**NOTE**: Without `--claw-type`, the CLI enters interactive claw selection. Use `--claw-type` to skip the prompt.

### Claw Type Detection from Working Directory

| Working Directory | Detected Claw Type | `--claw-type` Value |
|-------------------|--------------------|--------------------|
| `~/.lightclaw/workspace` | LightClaw | `LightClaw` |
| `~/.lightclaw/workspace-xxx` | LightClaw | `LightClaw` |
| `~/.openclaw/workspace` | OpenClaw | `OpenClaw` |
| `~/.openclaw/workspace-xxx` | OpenClaw | `OpenClaw` |
