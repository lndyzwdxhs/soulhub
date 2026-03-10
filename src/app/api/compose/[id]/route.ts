import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * GET /api/compose/[id]
 * 
 * Retrieve a compose configuration by share ID.
 * Used by the CLI: soulhub install --from <url>
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[a-z0-9]{6,12}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid share ID" },
        { status: 400 }
      );
    }

    // Try to load from local cache first
    const storageDir = path.join(process.cwd(), ".compose-cache");
    const localPath = path.join(storageDir, `${id}.json`);

    if (fs.existsSync(localPath)) {
      const data = JSON.parse(fs.readFileSync(localPath, "utf-8"));

      // If stored with gist mapping, return the config
      if (data.config) {
        return NextResponse.json(data.config);
      }

      // Direct config storage (no gist)
      return NextResponse.json(data);
    }

    // Try to load from GitHub Gist
    const token = process.env.GITHUB_GIST_TOKEN;
    if (token) {
      // We'd need to look up the gist ID mapping
      // For MVP, this falls through to 404
    }

    return NextResponse.json(
      { error: "Composition not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Compose GET error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve composition" },
      { status: 500 }
    );
  }
}
