import { readFileSync } from "fs";
import { join } from "path";
import type { AgentIndex } from "./types";

/**
 * Server-only data loading utilities.
 * These use Node.js fs and must NOT be imported from client components.
 */

export async function getAgentIndex(): Promise<AgentIndex> {
  const registryPath = join(process.cwd(), "registry", "index.json");
  const raw = readFileSync(registryPath, "utf-8");
  return JSON.parse(raw) as AgentIndex;
}
