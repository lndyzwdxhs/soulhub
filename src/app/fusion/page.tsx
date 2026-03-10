import { getAgentIndex } from "@/lib/data-server";
import { Navbar } from "@/components/ui/navbar";
import { ComposerClient } from "@/components/composer/composer-client";

export const metadata = {
  title: "🦞 Fusion 编排台 - SoulHub",
  description:
    "可视化多 Agent 灵魂融合编排器。拖拽灵魂、自动生成调度中心、一键导出团队配置。",
};

export default async function ComposerPage() {
  const index = await getAgentIndex();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <ComposerClient agents={index.agents} />
      </div>
    </main>
  );
}
