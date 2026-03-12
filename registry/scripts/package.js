#!/usr/bin/env node

/**
 * package.js - 将 registry 中的 agent 打包为 .tar.gz，recipe 复制为 .yaml
 * 输出到 registry/dist/ 目录，供 GitHub Actions 上传到 COS
 *
 * 输出结构：
 *   dist/
 *   ├── index.json
 *   ├── agents/{name}/{version}.tar.gz
 *   ├── agents/{name}/latest.tar.gz
 *   ├── recipes/{name}/{version}.yaml
 *   └── recipes/{name}/latest.yaml
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { execSync } = require("child_process");

const REGISTRY_DIR = path.join(__dirname, "..");
const AGENTS_DIR = path.join(REGISTRY_DIR, "agents");
const RECIPES_DIR = path.join(REGISTRY_DIR, "recipes");
const INDEX_FILE = path.join(REGISTRY_DIR, "index.json");
const DIST_DIR = path.join(REGISTRY_DIR, "dist");

// 需要打包进 agent tar.gz 的文件列表
const AGENT_FILES = [
  "manifest.yaml",
  "IDENTITY.md",
  "SOUL.md",
  "USER.md",
  "USER.md.template",
  "TOOLS.md",
  "TOOLS.md.template",
  "AGENTS.md",
  "HEARTBEAT.md",
];

/**
 * 从 manifest.yaml 中读取版本号
 */
function getVersion(dir) {
  const manifestPath = path.join(dir, "manifest.yaml");
  if (!fs.existsSync(manifestPath)) return "1.0.0";
  try {
    const manifest = yaml.load(fs.readFileSync(manifestPath, "utf-8"));
    return manifest.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

/**
 * 打包单个 agent 为 .tar.gz
 * 使用系统 tar 命令，将 agent 目录中的有效文件打包
 */
function packageAgent(agentDir, agentName) {
  const version = getVersion(agentDir);
  const outputDir = path.join(DIST_DIR, "agents", agentName);
  fs.mkdirSync(outputDir, { recursive: true });

  // 收集需要打包的文件
  const filesToPack = AGENT_FILES.filter((f) =>
    fs.existsSync(path.join(agentDir, f))
  );

  // 检查是否有 skills 目录（且包含子目录）
  const skillsDir = path.join(agentDir, "skills");
  let hasSkills = false;
  if (fs.existsSync(skillsDir)) {
    const skillEntries = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    if (skillEntries.length > 0) {
      hasSkills = true;
    }
  }

  if (filesToPack.length === 0 && !hasSkills) {
    console.log(`  [SKIP] ${agentName}: 没有可打包的文件`);
    return null;
  }

  // 使用 tar 命令打包
  const versionTarPath = path.join(outputDir, `${version}.tar.gz`);
  const latestTarPath = path.join(outputDir, "latest.tar.gz");

  try {
    // 构建打包列表：普通文件 + skills 目录
    const packItems = [...filesToPack];
    if (hasSkills) {
      packItems.push("skills");
    }
    const fileList = packItems.join(" ");
    execSync(`tar -czf "${versionTarPath}" ${fileList}`, {
      cwd: agentDir,
      stdio: "pipe",
    });

    // 复制一份为 latest.tar.gz
    fs.copyFileSync(versionTarPath, latestTarPath);

    const size = fs.statSync(versionTarPath).size;
    const skillsInfo = hasSkills ? ` + skills/` : "";
    console.log(
      `  [OK] ${agentName}@${version} → ${filesToPack.length} 个文件${skillsInfo}, ${(size / 1024).toFixed(1)}KB`
    );
    return { name: agentName, version, files: filesToPack.length, size };
  } catch (err) {
    console.error(`  [FAIL] ${agentName}: 打包失败 - ${err.message}`);
    return null;
  }
}

/**
 * 复制 recipe 的 soulhub.yaml 为版本化 .yaml 文件
 */
function packageRecipe(recipeDir, recipeName) {
  const manifestPath = path.join(recipeDir, "manifest.yaml");
  const soulhubYamlPath = path.join(recipeDir, "soulhub.yaml");

  if (!fs.existsSync(soulhubYamlPath)) {
    console.log(`  [SKIP] ${recipeName}: 缺少 soulhub.yaml`);
    return null;
  }

  const version = getVersion(recipeDir);
  const outputDir = path.join(DIST_DIR, "recipes", recipeName);
  fs.mkdirSync(outputDir, { recursive: true });

  // 读取 soulhub.yaml 并确保包含 version 字段
  let yamlContent = fs.readFileSync(soulhubYamlPath, "utf-8");
  let parsed = yaml.load(yamlContent);

  // 如果 soulhub.yaml 中没有 version，从 manifest.yaml 补充
  if (!parsed.version && fs.existsSync(manifestPath)) {
    const manifest = yaml.load(fs.readFileSync(manifestPath, "utf-8"));
    parsed.version = manifest.version || version;
    yamlContent = yaml.dump(parsed, { lineWidth: -1 });
  }

  // 写入版本化文件和 latest 文件
  const versionYamlPath = path.join(outputDir, `${version}.yaml`);
  const latestYamlPath = path.join(outputDir, "latest.yaml");

  fs.writeFileSync(versionYamlPath, yamlContent);
  fs.writeFileSync(latestYamlPath, yamlContent);

  console.log(`  [OK] ${recipeName}@${version} → recipe yaml`);
  return { name: recipeName, version };
}

function main() {
  console.log("📦 开始打包 Registry...\n");

  // 清理 dist 目录
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 1. 复制 index.json
  if (fs.existsSync(INDEX_FILE)) {
    fs.copyFileSync(INDEX_FILE, path.join(DIST_DIR, "index.json"));
    console.log("✅ index.json 已复制\n");
  } else {
    console.error("❌ index.json 不存在，请先运行 build-index.js");
    process.exit(1);
  }

  // 2. 打包 agents
  const agentResults = [];
  if (fs.existsSync(AGENTS_DIR)) {
    console.log("📁 打包 Agents:");
    const dirs = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const result = packageAgent(
        path.join(AGENTS_DIR, d.name),
        d.name
      );
      if (result) agentResults.push(result);
    }
    console.log();
  }

  // 3. 打包 recipes
  const recipeResults = [];
  if (fs.existsSync(RECIPES_DIR)) {
    console.log("📁 打包 Recipes:");
    const dirs = fs.readdirSync(RECIPES_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const result = packageRecipe(
        path.join(RECIPES_DIR, d.name),
        d.name
      );
      if (result) recipeResults.push(result);
    }
    console.log();
  }

  // 4. 输出统计
  const totalSize = agentResults.reduce((sum, r) => sum + (r.size || 0), 0);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    `✅ 打包完成: ${agentResults.length} 个 agents, ${recipeResults.length} 个 recipes`
  );
  console.log(`   总大小: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`   输出目录: ${DIST_DIR}`);
}

main();
