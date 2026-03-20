# SoulHub Agent 包 COS 管理方案

> 文档版本：v1.0  
> 创建时间：2026-03-12  
> 状态：方案设计

---

## 一、现状分析

### 1. 当前架构总览

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  soulhub (Next.js 网站)  │     │  soulhub-cli (CLI 工具)  │
│                         │     │                         │
│  registry/              │     │  soulhub install <name> │
│  ├── agents/            │◄────│  soulhub search <query> │
│  ├── recipes/           │     │                         │
│  ├── index.json         │     │  从 soulhub.store 下载   │
│  └── scripts/           │     │  散装 .md 文件           │
└─────────────────────────┘     └─────────────────────────┘
```

### 2. 当前单 Agent 安装流程

1. CLI 调用 `fetchIndex()` → `GET http://soulhub.store/index.json` 获取全局索引
2. 在 index 中查找目标 agent
3. 逐个下载文件：
   - `GET /agents/{name}/IDENTITY.md`
   - `GET /agents/{name}/SOUL.md`
   - `GET /agents/{name}/USER.md.template`（可选）
   - `GET /agents/{name}/TOOLS.md.template`（可选）
   - `GET /agents/{name}/manifest.yaml`
4. 写入本地 `~/.openclaw/workspace/` 目录
5. 更新 `openclaw.json` 配置
6. 重启 OpenClaw Gateway

### 3. 当前多 Agent（Team）安装流程

1. CLI 调用 `fetchIndex()` 获取索引，匹配 recipe
2. 下载 `GET /recipes/{name}/soulhub.yaml` 获取团队配置
3. 解析 `soulhub.yaml`，获取 dispatcher + workers 列表
4. 备份存量子 agent（mv 方式）
5. 安装 dispatcher：从 registry 下载 IDENTITY.md / SOUL.md 到 `~/.openclaw/workspace/`
6. 逐个安装 worker agents：从 registry 下载文件到 `~/.openclaw/workspace-{id}/`
7. 配置多 agent 通信（修改 `openclaw.json` 的 `subagents`、`agentToAgent`）
8. 重启 OpenClaw Gateway

### 4. 当前存在的问题

| 问题 | 说明 |
|---|---|
| **Registry 耦合在网站中** | agent 文件放在 `soulhub` Next.js 项目的 `registry/` 目录，Docker 镜像也要打包 registry 数据 |
| **无版本化包管理** | agent 文件是散装的 `.md` 文件，没有打包成独立的分发单元 |
| **无 CDN 加速** | agent 文件从 Next.js 服务器直接下载，没有 CDN |
| **逐文件下载不可靠** | 多次 HTTP 请求存在部分下载失败的风险 |
| **CLI 二进制已用 COS** | `release.yml` 已在用腾讯云 COS 分发 CLI 二进制（`soulhub-1251783334`），但 agent 包还没有 |

---

## 二、方案设计

### 1. 设计原则

- **Agent 是最小原子单元**：每个 agent 独立打包为 `.tar.gz`，Team 只是原子 agent 的组合描述
- **通过 PR 发布**：新增 agent 的唯一方式是 PR git 仓库，不提供 CLI publish 上传能力
- **COS 直连**：CLI 直接从 COS 下载，不经过网站中转，不需要向后兼容旧接口
- **复用已有基础设施**：使用已有的 COS Bucket `soulhub-1251783334`

### 2. 整体架构

```
┌────────────────────────┐
│  开发者                 │
│  提交 PR 到 soulhub     │
│  registry/agents/xxx/  │
│  registry/recipes/xxx/ │
└──────────┬─────────────┘
           │ PR merge → main
           ▼
┌────────────────────────────────────────────────────────┐
│  GitHub Actions (publish-registry.yml)                 │
│                                                        │
│  1. validate → build-index.js → index.json             │
│  2. package.js → agents/{name}/{version}.tar.gz        │
│  3. coscmd upload → COS                                │
└──────────┬─────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────┐
│  腾讯云 COS (soulhub-1251783334)                       │
│                                                        │
│  registry/                                             │
│  ├── index.json                 ← 全局索引              │
│  ├── agents/{name}/{ver}.tar.gz ← 单 Agent 包          │
│  └── recipes/{name}/{ver}.yaml  ← Team 描述文件         │
│                                                        │
│  releases/  ← CLI 二进制（已有）                         │
│  install.sh ← CLI 安装脚本（已有）                       │
└──────────┬─────────────────────────────────────────────┘
           │ CDN 全球加速
           ▼
┌────────────────────────────────────────────────────────┐
│  soulhub-cli                                           │
│                                                        │
│  soulhub install writer-wechat                         │
│    → 下载 index.json                                    │
│    → 下载 agents/writer-wechat/1.0.0.tar.gz            │
│    → 解压到 ~/.openclaw/workspace/                      │
│                                                        │
│  soulhub install dev-squad                             │
│    → 下载 index.json                                    │
│    → 下载 recipes/dev-squad/1.0.0.yaml (Team 描述)      │
│    → 逐个下载 agents/{worker}/{ver}.tar.gz              │
│    → 解压到各 workspace-{id}/                            │
└────────────────────────────────────────────────────────┘
```

### 3. COS 存储结构

```
soulhub-1251783334 (Bucket，已有)
│
├── install.sh                              # CLI 安装脚本（已有）
├── releases/                               # CLI 二进制（已有）
│   ├── v0.1.0/
│   └── latest/
│
└── registry/                               # ← 新增：Agent 包仓库
    ├── index.json                          # 全局索引
    │
    ├── agents/                             # 单 Agent 包
    │   ├── writer-wechat/
    │   │   ├── 1.0.0.tar.gz               # 版本化包
    │   │   └── latest.tar.gz              # 最新版（每次发布覆盖）
    │   ├── coder-python/
    │   │   ├── 1.0.0.tar.gz
    │   │   └── latest.tar.gz
    │   ├── dispatcher-main/
    │   │   ├── 1.0.0.tar.gz
    │   │   └── latest.tar.gz
    │   └── ...
    │
    └── recipes/                            # Team 描述文件（不打包，仅 YAML）
        ├── dev-squad/
        │   ├── 1.0.0.yaml                 # 版本化描述文件
        │   └── latest.yaml                # 最新版
        ├── self-media-team/
        │   ├── 1.0.0.yaml
        │   └── latest.yaml
        └── ...
```

### 4. Agent 包格式（`.tar.gz`）

每个单 agent 独立打包为一个 `.tar.gz` 文件：

```
writer-wechat-1.0.0.tar.gz
├── manifest.yaml          # 元数据（name, displayName, version, category, tags...）
├── IDENTITY.md            # 身份定义
├── SOUL.md                # 灵魂定义
├── USER.md                # (可选) 用户配置模板
└── TOOLS.md               # (可选) 工具定义模板
```

> **注意**：Team 包不打成 `.tar.gz`。Team 本质是单 agent 的原子组合，只需要一个 YAML 描述文件说明包含哪些 agent 以及它们之间的关系。安装 Team 时，CLI 逐个下载所需的单 agent 包。

### 5. Team 描述文件格式（`.yaml`）

Team 描述文件沿用当前 `soulhub.yaml` 格式，上传到 COS 时以 `{version}.yaml` 命名：

```yaml
# recipes/dev-squad/1.0.0.yaml
apiVersion: v1
kind: team
name: dev-squad
version: "1.0.0"
description: "精干的软件开发团队，覆盖Python后端、全栈开发与代码审查"

dispatcher:
  name: "dispatcher-main"       # dispatcher 使用的 agent 包名（从 registry 下载）
  dir: "dispatcher-main"

agents:
  - name: python                # agentId（安装后的 workspace-{name}）
    dir: coder-python           # 对应的 agent 包名（从 registry 下载）
    role: worker
    displayName: "Python专家"
  - name: fullstack
    dir: coder-fullstack
    role: worker
    displayName: "全栈工程师"
  - name: reviewer
    dir: coder-reviewer
    role: worker
    displayName: "代码审查专家"

metadata:
  author: soulhub
```

---

## 三、核心改造点

### 1. 新增打包脚本 `registry/scripts/package.js`

负责将 `registry/agents/` 下的每个 agent 打包为 `.tar.gz` 并输出到 `registry/dist/` 目录。

```javascript
// 伪代码
for each agent in registry/agents/:
  read manifest.yaml → 获取 version
  collect files: [manifest.yaml, IDENTITY.md, SOUL.md, USER.md?, TOOLS.md?]
  create tar.gz → dist/agents/{name}/{version}.tar.gz
  copy tar.gz  → dist/agents/{name}/latest.tar.gz

for each recipe in registry/recipes/:
  read manifest.yaml → 获取 version
  copy soulhub.yaml → dist/recipes/{name}/{version}.yaml
  copy soulhub.yaml → dist/recipes/{name}/latest.yaml

copy index.json → dist/index.json
```

### 2. 新增 GitHub Actions `publish-registry.yml`

在 `registry/` 目录有变更时触发，打包并上传到 COS。

```yaml
name: Publish Registry to COS

on:
  push:
    branches: [main]
    paths:
      - 'registry/agents/**'
      - 'registry/recipes/**'
      - 'registry/scripts/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 20

      - name: Install dependencies
        run: cd registry && npm install

      - name: Validate templates
        run: node registry/scripts/validate.js

      - name: Build index
        run: node registry/scripts/build-index.js

      - name: Package agents
        run: node registry/scripts/package.js

      - name: Install coscmd
        run: sudo pip install coscmd

      - name: Configure coscmd
        env:
          SECRET_ID: ${{ secrets.COS_SECRET_ID }}
          SECRET_KEY: ${{ secrets.COS_SECRET_KEY }}
          BUCKET: soulhub-1251783334
        run: coscmd config -a $SECRET_ID -s $SECRET_KEY -b $BUCKET -e cos.accelerate.myqcloud.com

      - name: Upload to COS
        run: |
          # 上传 index.json
          coscmd upload registry/dist/index.json registry/index.json

          # 上传所有 agent 包
          for dir in registry/dist/agents/*/; do
            agent_name=$(basename "$dir")
            for file in "$dir"*.tar.gz; do
              [ -f "$file" ] && coscmd upload "$file" "registry/agents/$agent_name/$(basename "$file")"
            done
          done

          # 上传所有 recipe 描述文件
          for dir in registry/dist/recipes/*/; do
            recipe_name=$(basename "$dir")
            for file in "$dir"*.yaml; do
              [ -f "$file" ] && coscmd upload "$file" "registry/recipes/$recipe_name/$(basename "$file")"
            done
          done

          echo "✅ Registry published to COS"
```

### 3. CLI 端 `utils.ts` 改造

将 registry URL 切换为 COS 地址，新增 tar.gz 下载解压能力。

```typescript
// 改造前
const DEFAULT_REGISTRY_URL = "http://soulhub.store";

// 改造后
const DEFAULT_REGISTRY_URL = "https://soulhub-1251783334.cos.accelerate.myqcloud.com/registry";
```

**新增函数：**

```typescript
/**
 * 下载 agent 包（.tar.gz）并解压到临时目录
 */
export async function downloadAgentPackage(
  agentName: string,
  version: string = "latest"
): Promise<string> {
  const url = `${getRegistryUrl()}/agents/${agentName}/${version}.tar.gz`;
  const tmpDir = path.join(os.tmpdir(), '.soulhub', `pkg-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${agentName}@${version}: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await extractTarGz(buffer, tmpDir);  // 使用 tar 库解压

  return tmpDir;
}

/**
 * 下载 Team 描述文件（.yaml）
 */
export async function fetchRecipeYaml(
  recipeName: string,
  version: string = "latest"
): Promise<string> {
  const url = `${getRegistryUrl()}/recipes/${recipeName}/${version}.yaml`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch recipe ${recipeName}@${version}: ${response.statusText}`);
  }
  return await response.text();
}
```

**删除旧函数：**

```typescript
// 以下函数将被删除，不再需要逐文件下载
export async function fetchAgentFile(agentName: string, fileName: string): Promise<string> { ... }
export async function fetchRecipeFile(recipeName: string, fileName: string): Promise<string> { ... }
```

### 4. CLI 端 `install.ts` 改造

**单 Agent 安装改造：**

```typescript
// 改造前：逐文件下载
await downloadAgentFiles(agentName, workspaceDir, spinner);
await saveAgentManifest(agentName, agent, workspaceDir);

// 改造后：下载 tar.gz 包 → 解压 → 复制到 workspace
const pkgDir = await downloadAgentPackage(agentName, agent.version);
copyAgentFilesFromDir(pkgDir, workspaceDir);
fs.rmSync(pkgDir, { recursive: true, force: true }); // 清理临时目录
```

**多 Agent Team 安装改造：**

```typescript
// 改造前：从网站下载 soulhub.yaml
const soulhubYamlContent = await fetchRecipeFile(name, "soulhub.yaml");

// 改造后：从 COS 下载 recipe yaml 描述文件
const soulhubYamlContent = await fetchRecipeYaml(name, recipe.version);

// 改造前：逐文件下载每个 worker
await downloadAgentFiles(agentName, workerDir, spinner);

// 改造后：下载每个 worker 的 tar.gz 包
const pkgDir = await downloadAgentPackage(agentName);
copyAgentFilesFromDir(pkgDir, workerDir);
fs.rmSync(pkgDir, { recursive: true, force: true });
```

### 5. CLI 端 `publish.ts` 改造

**publish 命令已从 CLI 对外注册中移除**（在 `index.ts` 中注释掉），暂不对外开放，待 registry 审核流程和权限体系就绪后再启用。代码保留但不暴露给用户。

当前发布 Agent 的唯一方式是通过 PR 提交到 soulhub 仓库。

### 6. `index.json` 格式变更

在现有字段基础上，为每个 agent 和 recipe 增加 `version` 字段（已有），CLI 用它来拼接下载 URL。

```jsonc
{
  "agents": [
    {
      "name": "writer-wechat",
      "displayName": "公众号创作者",
      "description": "...",
      "category": "self-media",
      "tags": ["微信公众号", "长文", "深度内容"],
      "version": "1.0.0",     // ← CLI 用此版本号拼接下载 URL
      "author": "soulhub",
      "minClawVersion": "2026.3.0",
      "files": { ... },
      "downloads": 0,
      "stars": 0
    }
  ],
  "recipes": [
    {
      "name": "dev-squad",
      "displayName": "开发小队",
      "description": "...",
      "agents": ["coder-python", "coder-fullstack", "coder-reviewer"],
      "version": "1.0.0",    // ← CLI 用此版本号拼接下载 URL
      "author": "soulhub"
    }
  ]
}
```

---

## 四、安装流程（改造后）

### 1. 单 Agent 安装流程

```
soulhub install writer-wechat
    │
    ▼
┌── 1. GET /registry/index.json （从 COS）
│       解析得到 writer-wechat version=1.0.0
│
├── 2. 交互式选择安装角色（main / worker）
│       --role main 或 --role worker 可跳过此步
│       安装为 main 时提示覆盖警告，需用户确认（-y 可跳过）
│
├── 3. 交互式多选目标 claw 目录（OpenClaw / LightClaw）
│       --claw-type 可跳过此步
│
├── 4. GET /registry/agents/writer-wechat/1.0.0.tar.gz （从 COS）
│       下载到临时目录（多个 claw 共用同一份包）
│
├── 5. 解压 tar.gz
│       得到 IDENTITY.md, SOUL.md, manifest.yaml 等
│
├── 6. 备份已有内容到 ~/.soulhub/backups/<claw>/
│
├── 7. 逐个 claw 目录：复制文件 + 注册 agent + 重启 Gateway
│
└── 8. 清理临时包目录
```

### 2. 多 Agent Team 安装流程

```
soulhub install dev-squad
    │
    ▼
┌── 1. GET /registry/index.json （从 COS）
│       匹配到 recipe: dev-squad, version=1.0.0
│
├── 2. GET /registry/recipes/dev-squad/1.0.0.yaml （从 COS）
│       解析 YAML → dispatcher: dispatcher-main
│                 → workers: [python→coder-python, fullstack→coder-fullstack, reviewer→coder-reviewer]
│
├── 3. 备份存量子 agent（mv 方式）
│
├── 4. 安装 dispatcher
│       GET /registry/agents/dispatcher-main/1.0.0.tar.gz
│       解压 → 复制到 ~/.openclaw/workspace/
│       更新 openclaw.json 注册主 agent
│
├── 5. 逐个安装 worker agents
│       GET /registry/agents/coder-python/1.0.0.tar.gz → ~/.openclaw/workspace-python/
│       GET /registry/agents/coder-fullstack/1.0.0.tar.gz → ~/.openclaw/workspace-fullstack/
│       GET /registry/agents/coder-reviewer/1.0.0.tar.gz → ~/.openclaw/workspace-reviewer/
│
├── 6. 配置多 agent 通信
│       openclaw.json → subagents.allowAgents, tools.agentToAgent
│
└── 7. 重启 OpenClaw Gateway
```

---

## 五、发布流程

### 新增 Agent 的发布流程

```
开发者
  │
  ├── 1. 本地创建 agent 目录
  │       registry/agents/my-agent/
  │       ├── manifest.yaml
  │       ├── IDENTITY.md
  │       └── SOUL.md
  │
  ├── 2. 本地验证
  │       soulhub publish ./registry/agents/my-agent/
  │       （仅验证文件和字段合法性，不上传）
  │
  ├── 3. 提交 PR 到 soulhub 仓库
  │
  ├── 4. PR CI 自动运行
  │       validate.js → 验证所有 agent 模板
  │       build-index.js → 重建 index.json
  │
  ├── 5. PR 审核通过 → Merge 到 main
  │
  └── 6. GitHub Actions 自动触发 publish-registry.yml
          build-index → package → upload to COS
```

### 新增 Team 的发布流程

```
开发者
  │
  ├── 1. 确保所需的单 agent 已存在于 registry/agents/
  │
  ├── 2. 创建 recipe 目录
  │       registry/recipes/my-team/
  │       ├── manifest.yaml
  │       └── soulhub.yaml     # Team 描述（引用已有的 agent 包名）
  │
  ├── 3. 提交 PR → 审核 → Merge
  │
  └── 4. GitHub Actions 自动打包上传
          soulhub.yaml → recipes/my-team/1.0.0.yaml
```

---

## 六、涉及的文件改动清单

### soulhub 仓库（服务端）

| 文件 | 操作 | 说明 |
|---|---|---|
| `registry/scripts/package.js` | 新增 | 打包脚本，将 agents 打包为 `.tar.gz`，recipes 复制为 `.yaml` |
| `.github/workflows/publish-registry.yml` | 新增 | CI 流水线，打包 + 上传 COS |
| `.github/workflows/build-index.yml` | 修改 | 合并到 `publish-registry.yml` 中，或保留用于 PR 校验 |
| `registry/scripts/build-index.js` | 保留 | 索引构建逻辑不变 |

### soulhub-cli 仓库（客户端）

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/utils.ts` | 修改 | `DEFAULT_REGISTRY_URL` 改为 COS 地址；新增 `downloadAgentPackage()`、`fetchRecipeYaml()`；删除 `fetchAgentFile()`、`fetchRecipeFile()` |
| `src/commands/install.ts` | 修改 | 单 agent 和 team 安装逻辑改为下载 `.tar.gz` 包 |
| `src/commands/publish.ts` | 保留（已隐藏） | 代码保留但已从 CLI 注册中注释掉，暂不对外开放 |
| `package.json` | 修改 | 新增 `tar` 依赖（用于解压 `.tar.gz`） |

---

## 七、优势总结

| 能力 | 说明 |
|---|---|
| **COS CDN 全球加速** | 利用 `cos.accelerate.myqcloud.com`，国内外下载都快 |
| **原子化包分发** | 每个 agent 是一个 `.tar.gz`，下载即完整，不存在文件下载不完整的问题 |
| **版本化管理** | 每个 agent 可以有多个版本，未来可支持 `soulhub install writer-wechat@1.0.0` |
| **Team 轻量化** | Team 只是一个 YAML 描述文件，不重复打包 agent 文件，保持 agent 原子性 |
| **复用已有 COS Bucket** | 与 CLI 二进制分发共用 `soulhub-1251783334`，无需额外申请资源 |
| **Registry 解耦** | 网站不再需要提供 agent 文件的静态服务，Docker 镜像体积减小 |
| **发布流程自动化** | PR merge 后 CI 自动打包上传，无需手动操作 |
| **低成本** | COS 存储+CDN 带宽成本远低于 VPS 直接提供文件服务 |
| **通过 PR 管控质量** | 所有 agent 通过 PR 审核发布，保证质量和安全性 |

---

## 八、实施步骤

### Phase 1：发布端搭建

1. 编写 `registry/scripts/package.js` 打包脚本
2. 新增 `.github/workflows/publish-registry.yml`
3. 配置 GitHub Secrets：`COS_SECRET_ID`、`COS_SECRET_KEY`（复用 soulhub-cli 仓库已有的）
4. 手动触发一次，验证 COS 上传成功

### Phase 2：CLI 改造

1. 修改 `src/utils.ts`：Registry URL 切到 COS，新增 tar.gz 下载解压函数
2. 修改 `src/commands/install.ts`：单 agent 和 team 安装改为包下载模式
3. 新增 `tar` 依赖
4. 本地测试安装流程

### Phase 3：上线发布

1. 发布 CLI 新版本
2. 确认 COS 上所有 agent 包和 recipe 描述文件就绪
3. 更新网站文档
