import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/compose
 * 
 * Upload a composer configuration to GitHub Gist for sharing.
 * Returns a share ID that can be used to retrieve the config.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the compose config
    if (!body.agents || !Array.isArray(body.agents) || body.agents.length === 0) {
      return NextResponse.json(
        { error: "Invalid configuration: agents array is required" },
        { status: 400 }
      );
    }

    // Generate a unique ID for this composition
    const id = generateShareId();

    // Create a GitHub Gist with the configuration
    const gistUrl = await createGist(id, body);

    // Build the share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://soulhub.dev";
    const shareUrl = `${baseUrl}/c/${id}`;
    const installCommand = `npx soulhub install --from ${shareUrl}`;

    return NextResponse.json({
      id,
      shareUrl,
      installCommand,
      gistUrl,
      expiresAt: null, // MVP: no expiration
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
 * Generate a short, URL-safe share ID
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
 * Create a GitHub Gist with the compose configuration
 */
async function createGist(
  id: string,
  config: Record<string, unknown>
): Promise<string> {
  const token = process.env.GITHUB_GIST_TOKEN;

  // If no token configured, store locally (development fallback)
  if (!token) {
    console.warn(
      "GITHUB_GIST_TOKEN not set, using local storage fallback"
    );
    // In production, this would be stored in a KV store
    // For MVP, we'll store in a local JSON file
    const fs = await import("node:fs");
    const path = await import("node:path");
    const storageDir = path.join(process.cwd(), ".compose-cache");
    fs.mkdirSync(storageDir, { recursive: true });
    fs.writeFileSync(
      path.join(storageDir, `${id}.json`),
      JSON.stringify(config, null, 2)
    );
    return `local://${id}`;
  }

  // Create anonymous Gist via GitHub API
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
        "metadata.json": {
          content: JSON.stringify({
            id,
            createdAt: new Date().toISOString(),
            version: "1",
            agentCount: (config.agents as unknown[]).length,
          }),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub Gist API error: ${response.statusText}`);
  }

  const gist = (await response.json()) as { html_url: string; id: string };

  // Store the mapping: shareId → gistId
  // In production, use a KV store. For MVP, use local file.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const storageDir = path.join(process.cwd(), ".compose-cache");
  fs.mkdirSync(storageDir, { recursive: true });
  fs.writeFileSync(
    path.join(storageDir, `${id}.json`),
    JSON.stringify({
      gistId: gist.id,
      gistUrl: gist.html_url,
      config,
    })
  );

  return gist.html_url;
}
