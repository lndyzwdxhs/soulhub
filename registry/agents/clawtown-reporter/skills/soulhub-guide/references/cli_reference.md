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

**Default behavior**: Installs as worker (sub-agent) to all detected claw directories.

**Arguments:**
- `name` (optional): Agent/Team name from registry. Omit when using `--from`

**Options:**
- `--from <source>`: Install from local directory, ZIP file, or URL instead of registry
- `--main`: Install as main Agent (deploys to `workspace/`)
- `--dir <path>`: Custom target directory for installation
- `--claw-dir <path>`: Install to a specific claw directory only (instead of all detected ones)

**Behavior:**
- Automatically detects package type (`kind: agent` or `kind: team`)
- Single agent: defaults to worker, installs to all detected claw directories
- For teams: installs dispatcher as main, workers into separate workspaces
- Creates automatic backup before installation (supports rollback)
- Use `--claw-dir` to target a specific claw instead of all

**Examples:**
```bash
# Install as worker to all detected claws (DEFAULT)
soulhub install coder-python

# Install as main agent to all detected claws
soulhub install coder-python --main

# Install to a specific claw only
soulhub install coder-python --claw-dir ~/.lightclaw

# Install as main agent to a specific claw
soulhub install coder-python --main --claw-dir ~/.openclaw

# Install team (role auto-assigned)
soulhub install dev-squad

# Install from local source
soulhub install --from ./my-custom-agent/

# Install from ZIP to a specific claw
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

**NOTE**: Without `--claw-dir`, the CLI installs to **all** detected claw directories. Use `--claw-dir` to target a specific one.

### Claw Type Detection from Working Directory

| Working Directory | Detected Claw Type | `--claw-dir` Value |
|-------------------|--------------------|--------------------|
| `~/.lightclaw/workspace` | LightClaw | `~/.lightclaw` |
| `~/.lightclaw/workspace-xxx` | LightClaw | `~/.lightclaw` |
| `~/.openclaw/workspace` | OpenClaw | `~/.openclaw` |
| `~/.openclaw/workspace-xxx` | OpenClaw | `~/.openclaw` |
| `/custom/path/.lightclaw/workspace` | LightClaw | `/custom/path/.lightclaw` |
