import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * GET /c/[id] - 分享链接路由
 *
 * 根据请求来源返回不同的响应：
 * - CLI 请求（User-Agent 包含 soulhub-cli、或 Accept 不含 text/html）：返回 ZIP 文件
 * - 浏览器请求：重定向到 fusion 编辑页
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  const accept = (request.headers.get("accept") || "").toLowerCase();

  // 判断是否是 CLI 请求
  const isCLI =
    userAgent.includes("soulhub") ||
    userAgent.includes("node-fetch") ||
    userAgent.includes("node") ||
    userAgent.includes("undici") ||
    (!accept.includes("text/html") && !accept.includes("*/*"));

  if (!isCLI) {
    // 浏览器请求：重定向到 fusion 编辑页
    return NextResponse.redirect(new URL(`/fusion?load=${id}`, request.url));
  }

  // CLI 请求：加载配置并返回 ZIP
  try {
    const config = await loadComposeConfig(id);
    if (!config) {
      return new NextResponse("Composition not found", { status: 404 });
    }

    const zipBuffer = await generateZipFromConfig(config);
    // Buffer → Uint8Array，避免 TS 类型不兼容
    const body = new Uint8Array(zipBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${id}-team.zip"`,
        "Content-Length": zipBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("CLI download error:", error);
    return new NextResponse("Failed to generate package", { status: 500 });
  }
}

/**
 * 从本地缓存加载 compose 配置
 */
async function loadComposeConfig(id: string): Promise<Record<string, unknown> | null> {
  const storageDir = path.join(process.cwd(), ".compose-cache");
  const localPath = path.join(storageDir, `${id}.json`);

  if (fs.existsSync(localPath)) {
    const data = JSON.parse(fs.readFileSync(localPath, "utf-8"));
    // 如果是带 gist 映射的结构，返回其中的 config
    if (data.config) return data.config;
    return data;
  }

  return null;
}

/**
 * 根据保存的配置生成 ZIP 包（与前端 downloadZip 逻辑一致）
 *
 * ZIP 结构：
 * ├── soulhub.yaml
 * ├── INSTALL.md
 * ├── <dispatcher-name>/
 * │   ├── IDENTITY.md
 * │   └── SOUL.md
 * └── <worker-name>/
 *     ├── IDENTITY.md
 *     └── SOUL.md
 */
async function generateZipFromConfig(config: Record<string, unknown>): Promise<Buffer> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const dispatcherName = (config.dispatcherName as string) || "dispatcher";
  const agents = (config.agents as Array<Record<string, unknown>>) || [];
  const routingRules = (config.routingRules as Array<Record<string, unknown>>) || [];
  const dispatcher = config.dispatcher as Record<string, unknown> | undefined;

  // Dispatcher 目录
  const dispatcherDir = zip.folder(dispatcherName);
  if (dispatcherDir && dispatcher) {
    dispatcherDir.file("IDENTITY.md", (dispatcher.identity as string) || `# ${dispatcherName}\n\nDispatcher agent.`);
    dispatcherDir.file("SOUL.md", (dispatcher.soul as string) || `# ${dispatcherName} Soul\n\n// TODO`);
  }

  // Worker agent 目录
  for (const agent of agents) {
    const name = agent.name as string;
    const displayName = agent.displayName as string || name;
    const description = agent.description as string || "";
    const category = agent.category as string || "";
    const tags = (agent.tags as string[]) || [];

    const agentDir = zip.folder(name);
    if (agentDir) {
      agentDir.file(
        "IDENTITY.md",
        `# ${displayName}\n\n${description}\n\nCategory: ${category}\nTags: ${tags.join(", ")}\n`
      );
      agentDir.file("SOUL.md", `# ${displayName} Soul\n\n// TODO: Configure soul for ${name}\n`);
    }
  }

  // soulhub.yaml
  const soulhubYaml = {
    apiVersion: "v1",
    kind: "team",
    name: `${dispatcherName.toLowerCase().replace(/\s+/g, "-")}-team`,
    version: "1.0.0",
    description: `${dispatcherName} 团队`,
    dispatcher: {
      name: dispatcherName,
      dir: dispatcherName,
    },
    agents: agents.map((a) => ({
      name: a.name,
      dir: a.name,
      role: "worker",
      displayName: a.displayName,
    })),
    routing: routingRules.map((r) => ({
      keywords: r.keywords,
      target: r.targetAgent,
    })),
    metadata: {
      author: "soulhub",
      exportedAt: new Date().toISOString(),
    },
  };
  zip.file("soulhub.yaml", toYaml(soulhubYaml));

  // INSTALL.md
  zip.file(
    "INSTALL.md",
    `# Installation\n\n## Using SoulHub CLI\n\n\`\`\`bash\nsoulhub install --from <share-url>\n\`\`\`\n\n## Manual Installation\n\n1. Copy each agent directory to your OpenClaw agents folder\n2. Configure the dispatcher as your main entry point\n3. Each agent directory contains IDENTITY.md and SOUL.md\n`
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  return buffer;
}

/**
 * 简单的对象 → YAML 序列化（避免引入 js-yaml 的类型声明问题）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toYaml(obj: Record<string, any>, indent = 0): string {
  const pad = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result += `${pad}${key}:\n`;
    } else if (Array.isArray(value)) {
      result += `${pad}${key}:\n`;
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          const lines = toYaml(item, 0).split("\n").filter(Boolean);
          result += `${pad}- ${lines[0]}\n`;
          for (let i = 1; i < lines.length; i++) {
            result += `${pad}  ${lines[i]}\n`;
          }
        } else {
          result += `${pad}- ${formatYamlValue(item)}\n`;
        }
      }
    } else if (typeof value === "object") {
      result += `${pad}${key}:\n`;
      result += toYaml(value, indent + 1);
    } else {
      result += `${pad}${key}: ${formatYamlValue(value)}\n`;
    }
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatYamlValue(value: any): string {
  if (typeof value === "string") {
    // 含特殊字符时加引号
    if (/[:#\[\]{}&*!|>'"%@`\n]/.test(value) || value === "" || value.trim() !== value) {
      return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  return String(value);
}
