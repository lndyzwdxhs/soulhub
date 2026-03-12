import { notFound } from "next/navigation";
import { getAgentIndex } from "@/lib/data-server";
import { AgentDetailClient } from "@/components/agents/agent-detail-client";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";

interface PageProps {
  params: { name: string };
}

export async function generateStaticParams() {
  const index = await getAgentIndex();
  return index.agents.map((a) => ({ name: a.name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const index = await getAgentIndex();
  const agent = index.agents.find((a) => a.name === params.name);

  if (!agent) {
    return { title: "灵魂未找到 | SoulHub" };
  }

  return {
    title: `${agent.displayName} | SoulHub`,
    description: agent.description,
  };
}

export default async function AgentDetailPage({ params }: PageProps) {
  const index = await getAgentIndex();
  const agent = index.agents.find((a) => a.name === params.name);

  if (!agent) {
    notFound();
  }

  // Read markdown files from registry
  const registryPath = path.join(
    process.cwd(),
    "registry",
    "agents",
    params.name
  );

  let identity = "";
  let soul = "";

  try {
    identity = fs.readFileSync(
      path.join(registryPath, "IDENTITY.md"),
      "utf-8"
    );
  } catch {
    identity = "*IDENTITY.md not found.*";
  }

  try {
    soul = fs.readFileSync(path.join(registryPath, "SOUL.md"), "utf-8");
  } catch {
    soul = "*SOUL.md not found.*";
  }

  // Find related agents (same category, excluding current)
  const relatedAgents = index.agents
    .filter((a) => a.category === agent.category && a.name !== agent.name)
    .slice(0, 3);

  // Read skills directories and their skill.md content
  const skillsPath = path.join(registryPath, "skills");
  let skillsData: { name: string; content: string }[] = [];
  try {
    if (fs.existsSync(skillsPath)) {
      const skillDirs = fs.readdirSync(skillsPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();
      skillsData = skillDirs.map((skillName) => {
        let content = "";
        try {
          content = fs.readFileSync(
            path.join(skillsPath, skillName, "skill.md"),
            "utf-8"
          );
        } catch {
          content = "*skill.md not found.*";
        }
        return { name: skillName, content };
      });
    }
  } catch {
    skillsData = [];
  }

  return (
    <AgentDetailClient
      agent={agent}
      identity={identity}
      soul={soul}
      skills={skillsData}
      relatedAgents={relatedAgents}
    />
  );
}
