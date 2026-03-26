#!/usr/bin/env node

/**
 * Validate agent templates in registry/agents/.
 * Checks: manifest.yaml exists, required fields, required files.
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const AGENTS_DIR = path.join(__dirname, "..", "agents");
const REQUIRED_FIELDS = ["name", "displayName", "description", "category", "version", "author"];
const REQUIRED_FILES = ["IDENTITY.md", "SOUL.md"];
const VALID_CATEGORIES = ["self-media", "development", "education", "dispatcher", "design", "product", "security", "research"];

let errors = 0;

function validate(agentDir, name) {
  const manifestPath = path.join(agentDir, "manifest.yaml");
  if (!fs.existsSync(manifestPath)) {
    console.error(`  [FAIL] ${name}: missing manifest.yaml`);
    errors++;
    return;
  }

  let manifest;
  try {
    manifest = yaml.load(fs.readFileSync(manifestPath, "utf-8"));
  } catch (e) {
    console.error(`  [FAIL] ${name}: invalid YAML - ${e.message}`);
    errors++;
    return;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!manifest[field]) {
      console.error(`  [FAIL] ${name}: missing field '${field}'`);
      errors++;
    }
  }

  if (manifest.category && !VALID_CATEGORIES.includes(manifest.category)) {
    console.error(`  [FAIL] ${name}: invalid category '${manifest.category}'`);
    errors++;
  }

  for (const file of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(agentDir, file))) {
      console.error(`  [FAIL] ${name}: missing ${file}`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`  [OK] ${name}`);
  }
}

function main() {
  console.log("Validating agent templates...\n");

  if (!fs.existsSync(AGENTS_DIR)) {
    console.log("No agents directory found. Nothing to validate.");
    return;
  }

  const dirs = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
  let count = 0;
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    validate(path.join(AGENTS_DIR, d.name), d.name);
    count++;
  }

  console.log(`\nValidated ${count} agents, ${errors} error(s).`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
