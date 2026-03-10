import { getAgentIndex } from "@/lib/data-server";
import { AgentsPageClient } from "@/components/agents/agents-page-client";

export const metadata = {
  title: "Soul 市集 - SoulHub",
  description:
    "发现、安装和分享社区调教好的 Agent 灵魂，一行命令即可拥有。",
};

export default async function AgentsPage() {
  const { agents } = await getAgentIndex();

  return <AgentsPageClient agents={agents} />;
}
