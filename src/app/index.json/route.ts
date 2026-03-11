import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * GET /index.json
 * 返回 registry 的索引数据，供 CLI 获取 agent/recipe 列表
 */
export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), "registry", "index.json");

    if (!fs.existsSync(indexPath)) {
      return NextResponse.json(
        { error: "Registry index not found" },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read registry index" },
      { status: 500 }
    );
  }
}
