import { getAgentIndex } from "@/lib/data-server";
import { Navbar } from "@/components/ui/navbar";
import { ComposerClient } from "@/components/composer/composer-client";

export const metadata = {
  title: "Composer - SoulHub",
  description:
    "Visual multi-Agent orchestration tool. Drag agents, auto-generate dispatchers, and export configurations.",
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
