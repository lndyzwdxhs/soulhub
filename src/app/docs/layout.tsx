import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "📖 文档中心 - SoulHub",
  description:
    "SoulHub 使用指南、Soul 定义规范、CLI 工具文档与 API 参考。",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
