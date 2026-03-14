#!/usr/bin/env node

/**
 * Build index.json from registry/agents/ directory.
 * Reads each agent's manifest.yaml and generates a searchable index.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const AGENTS_DIR = path.join(__dirname, "..", "agents");
const RECIPES_DIR = path.join(__dirname, "..", "recipes");
const OUTPUT = path.join(__dirname, "..", "index.json");

function readManifest(dir) {
  const manifestPath = path.join(dir, "manifest.yaml");
  if (!fs.existsSync(manifestPath)) return null;
  const raw = fs.readFileSync(manifestPath, "utf-8");
  return yaml.load(raw);
}

function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

function getSkills(agentDir) {
  const skillsDir = path.join(agentDir, "skills");
  if (!fs.existsSync(skillsDir)) return [];
  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function buildAgentEntry(agentDir, name) {
  const manifest = readManifest(agentDir);
  if (!manifest) return null;

  const files = {};
  for (const f of ["IDENTITY.md", "SOUL.md", "HEARTBEAT.md", "USER.md.template", "TOOLS.md.template"]) {
    const fp = path.join(agentDir, f);
    if (fs.existsSync(fp)) {
      files[f] = getFileSize(fp);
    }
  }

  const skills = getSkills(agentDir);

  return {
    name: manifest.name || name,
    displayName: manifest.displayName || name,
    description: manifest.description || "",
    category: manifest.category || "operations",
    tags: manifest.tags || [],
    version: manifest.version || "1.0.0",
    author: manifest.author || "community",
    minClawVersion: manifest.minClawVersion || "2026.3.0",
    files,
    skills,
    downloads: 0,
    stars: 0,
  };
}

function buildRecipeEntry(recipeDir, name) {
  const manifest = readManifest(recipeDir);
  if (!manifest) return null;

  const soulhubYamlPath = path.join(recipeDir, "soulhub.yaml");
  let agents = [];
  if (fs.existsSync(soulhubYamlPath)) {
    const pkg = yaml.load(fs.readFileSync(soulhubYamlPath, "utf-8"));
    agents = (pkg.agents || []).map((a) => a.dir || a.name);
  }

  return {
    name: manifest.name || name,
    displayName: manifest.displayName || name,
    description: manifest.description || "",
    agents,
    version: manifest.version || "1.0.0",
    author: manifest.author || "community",
    downloads: 0,
    stars: 0,
  };
}

function main() {
  const index = { agents: [], recipes: [], buildTime: new Date().toISOString() };

  // Build agents index
  if (fs.existsSync(AGENTS_DIR)) {
    const dirs = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const entry = buildAgentEntry(path.join(AGENTS_DIR, d.name), d.name);
      if (entry) index.agents.push(entry);
    }
  }

  // Build recipes index
  if (fs.existsSync(RECIPES_DIR)) {
    const dirs = fs.readdirSync(RECIPES_DIR, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const entry = buildRecipeEntry(path.join(RECIPES_DIR, d.name), d.name);
      if (entry) index.recipes.push(entry);
    }
  }

  // Sort by name
  index.agents.sort((a, b) => a.name.localeCompare(b.name));
  index.recipes.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
  console.log(
    `Built index: ${index.agents.length} agents, ${index.recipes.length} recipes`
  );
}

main();
