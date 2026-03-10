import { getAgentIndex } from "@/lib/data-server";
import { AgentsPageClient } from "@/components/agents/agents-page-client";

export const metadata = {
  title: "Agent Templates - SoulHub",
  description:
    "Discover and install curated AI agent persona templates for OpenClaw.",
};

export default async function AgentsPage() {
  const { agents } = await getAgentIndex();

  return <AgentsPageClient agents={agents} />;
}
