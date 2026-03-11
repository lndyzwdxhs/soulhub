import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/compose
 * 
 * 保存 composer 配置用于分享。
 * 前端在导出对话框打开时调用此 API，获取真实的 shareId 和安装链接。
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证配置格式 — 支持新格式（包含 dispatcher + agents + routingRules）
    if (!body.agents || !Array.isArray(body.agents)) {
      return NextResponse.json(
        { error: "Invalid configuration: agents array is required" },
        { status: 400 }
      );
    }

    // 生成唯一分享 ID
    const id = generateShareId();

    // 保存完整配置（含 dispatcher、agents、routingRules）
    await saveConfig(id, body);

    // 构建分享 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://soulhub.store";
    const shareUrl = `${baseUrl}/c/${id}`;
    const installCommand = `soulhub install --from ${shareUrl}`;

    return NextResponse.json({
      id,
      shareUrl,
      installCommand,
      expiresAt: null, // MVP: 不过期
    });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

/**
 * 生成 URL 安全的短 ID（8 位）
 */
function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * 保存配置到本地缓存或 GitHub Gist
 */
async function saveConfig(
  id: string,
  config: Record<string, unknown>
): Promise<void> {
  const token = process.env.GITHUB_GIST_TOKEN;

  // 始终保存到本地缓存
  const fs = await import("node:fs");
  const path = await import("node:path");
  const storageDir = path.join(process.cwd(), ".compose-cache");

  try {
    fs.mkdirSync(storageDir, { recursive: true });
  } catch (mkdirErr) {
    console.error(`Failed to create cache directory ${storageDir}:`, mkdirErr);
    throw new Error(`Cannot create cache directory: ${storageDir}`);
  }

  if (!token) {
    // 无 Gist Token，仅保存到本地
    console.warn("GITHUB_GIST_TOKEN not set, using local storage only");
    fs.writeFileSync(
      path.join(storageDir, `${id}.json`),
      JSON.stringify(config, null, 2)
    );
    return;
  }

  // 同时保存到 GitHub Gist
  try {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        description: `SoulHub Compose - ${id}`,
        public: false,
        files: {
          "compose.json": {
            content: JSON.stringify(config, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Gist API error: ${response.statusText}`);
    }

    const gist = (await response.json()) as { html_url: string; id: string };

    // 本地存储：映射 shareId → gistId + config
    fs.writeFileSync(
      path.join(storageDir, `${id}.json`),
      JSON.stringify({
        gistId: gist.id,
        gistUrl: gist.html_url,
        config,
      })
    );
  } catch (err) {
    console.error("Gist save failed, using local only:", err);
    // 降级：仅本地保存
    fs.writeFileSync(
      path.join(storageDir, `${id}.json`),
      JSON.stringify(config, null, 2)
    );
  }
}


