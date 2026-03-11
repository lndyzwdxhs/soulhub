import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// 允许访问的文件白名单
const ALLOWED_FILES = [
  "manifest.yaml",
  "topology.yaml",
  "README.md",
];

/**
 * GET /recipes/[name]/[file]
 * 返回指定 recipe 的文件内容，供 CLI 下载 recipe 配置
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string; file: string }> }
) {
  const { name, file: fileName } = await params;

  // 安全检查：防止路径遍历
  if (name.includes("..") || fileName.includes("..")) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400 }
    );
  }

  // 白名单检查
  if (!ALLOWED_FILES.includes(fileName)) {
    return NextResponse.json(
      { error: "File not allowed" },
      { status: 403 }
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "registry",
      "recipes",
      name,
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${fileName}` },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, "utf-8");

    const contentType = fileName.endsWith(".json")
      ? "application/json"
      : fileName.endsWith(".yaml")
      ? "text/yaml"
      : "text/plain; charset=utf-8";

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read file" },
      { status: 500 }
    );
  }
}
