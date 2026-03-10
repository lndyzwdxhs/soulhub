"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Star,
  Terminal,
  FileText,
  Package,
  User,
  Tag,
  Cpu,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CopyButton } from "@/components/ui/copy-button";
import { AgentCard } from "@/components/agents/agent-card";
import { Navbar } from "@/components/ui/navbar";
import type { Agent } from "@/lib/types";

interface AgentDetailClientProps {
  agent: Agent;
  identity: string;
  soul: string;
  relatedAgents: Agent[];
}

const tabs = [
  { id: "overview", label: "概览", icon: Package },
  { id: "identity", label: "IDENTITY.md", icon: FileText },
  { id: "soul", label: "SOUL.md", icon: FileText },
  { id: "files", label: "文件列表", icon: Archive },
] as const;

type TabId = (typeof tabs)[number]["id"];

const categoryColors: Record<string, string> = {
  "self-media": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  development: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  operations: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  support: "text-green-400 bg-green-400/10 border-green-400/20",
  education: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  dispatcher: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AgentDetailClient({
  agent,
  identity,
  soul,
  relatedAgents,
}: AgentDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const Icon = getCategoryIcon(agent.category);
  const categoryLabel = getCategoryLabel(agent.category);
  const colorClass =
    categoryColors[agent.category] ||
    "text-muted-foreground bg-[hsl(var(--glass-bg)/0.05)] border-[hsl(var(--glass-border)/0.1)]";
  const installCommand = `npx soulhub install ${agent.name}`;

  const handleDownloadZip = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const fileSaverModule = await import("file-saver");
    const saveAs = fileSaverModule.saveAs || fileSaverModule.default;

    const zip = new JSZip();
    const folder = zip.folder(agent.name);
    if (!folder) return;

    // Add the markdown content as files
    folder.file("IDENTITY.md", identity);
    folder.file("SOUL.md", soul);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${agent.name}.zip`);
  }, [agent.name, identity, soul]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Link
            href="/souls"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            返回 Soul 市集
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full border",
                  colorClass
                )}
              >
                {categoryLabel}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
              {agent.displayName}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mb-5">
              {agent.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {agent.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-md bg-[hsl(var(--glass-bg)/0.05)] text-muted-foreground border border-[hsl(var(--glass-border)/0.05)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Meta info row */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                v{agent.version}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {agent.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                Claw {agent.minClawVersion}+
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                {agent.downloads} 次安装
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                {agent.stars} 收藏
              </span>
            </div>
          </motion.div>

          {/* CLI Install Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative rounded-xl p-[1px] bg-gradient-to-r from-blue-400/50 via-violet-400/50 to-cyan-400/50 glow">
              <div className="rounded-xl bg-background/95 backdrop-blur-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium text-foreground">
                    一行命令安装灵魂
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono bg-[hsl(var(--glass-bg)/0.05)] rounded-lg px-4 py-2.5 text-green-700 dark:text-green-300/90 border border-[hsl(var(--glass-border)/0.05)]">
                    {installCommand}
                  </code>
                  <CopyButton text={installCommand} />
                </div>
              </div>
            </div>

            {/* ZIP Download button */}
            <button
              onClick={handleDownloadZip}
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-[hsl(var(--glass-bg)/0.05)] border border-transparent hover:border-[hsl(var(--glass-border)/0.1)]"
            >
              <Archive className="h-4 w-4" />
              下载 ZIP 压缩包
            </button>
          </motion.div>

          {/* Tab Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Tab headers */}
            <div className="flex items-center gap-1 border-b border-[hsl(var(--glass-border)/0.1)] mb-6 overflow-x-auto">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground/70"
                    )}
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        灵魂简介
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        详细信息
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">版本</dt>
                          <dd className="text-foreground font-mono">
                            {agent.version}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">作者</dt>
                          <dd className="text-foreground">{agent.author}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">最低 Claw 版本</dt>
                          <dd className="text-foreground font-mono">
                            {agent.minClawVersion}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">分类</dt>
                          <dd className="text-foreground">{categoryLabel}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">文件数</dt>
                          <dd className="text-foreground">
                            {Object.keys(agent.files).length}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="glass rounded-xl p-5 md:col-span-2">
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        标签
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {agent.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "text-xs font-medium px-3 py-1.5 rounded-full border",
                              colorClass
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "identity" && (
                  <div className="glass rounded-xl p-6">
                    <MarkdownRenderer content={identity} />
                  </div>
                )}

                {activeTab === "soul" && (
                  <div className="glass rounded-xl p-6">
                    <MarkdownRenderer content={soul} />
                  </div>
                )}

                {activeTab === "files" && (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="divide-y divide-[hsl(var(--glass-border)/0.05)]">
                      {Object.entries(agent.files).map(([filename, size]) => (
                        <div
                          key={filename}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[hsl(var(--glass-bg)/0.05)] transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <span className="text-sm font-mono text-foreground">
                              {filename}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground/60 font-mono">
                            {formatBytes(size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Related Agents */}
          {relatedAgents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-xl font-semibold text-foreground mb-6">
                🦞 相关灵魂推荐
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedAgents.map((related, idx) => (
                  <AgentCard key={related.name} agent={related} index={idx} />
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>
      </main>
    </div>
  );
}
