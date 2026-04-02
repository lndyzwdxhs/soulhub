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
  Zap,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CopyButton } from "@/components/ui/copy-button";
import { AgentCard } from "@/components/agents/agent-card";
import { Navbar } from "@/components/ui/navbar";
import type { Agent } from "@/lib/types";

interface SkillData {
  name: string;
  content: string;
}

interface AgentDetailClientProps {
  agent: Agent;
  identity: string;
  soul: string;
  heartbeat: string;
  skills: SkillData[];
  relatedAgents: Agent[];
}

type TabId = "overview" | "identity" | "soul" | "heartbeat" | "skills" | "files";

const categoryColors: Record<string, string> = {
  "self-media": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  development: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  education: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  design: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  product: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  security: "text-red-400 bg-red-400/10 border-red-400/20",
  dispatcher: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  research: "text-teal-400 bg-teal-400/10 border-teal-400/20",
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
  heartbeat,
  skills,
  relatedAgents,
}: AgentDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [installTab, setInstallTab] = useState<"prompt" | "sub-prompt" | "cli">("prompt");

  // 动态构建 tabs，当有 skills 时才显示 Skills 页签
  const tabs: { id: TabId; label: string; icon: typeof Package }[] = [
    { id: "overview", label: "概览", icon: Package },
    { id: "identity", label: "IDENTITY.md", icon: FileText },
    { id: "soul", label: "SOUL.md", icon: FileText },
    ...(heartbeat
      ? [{ id: "heartbeat" as TabId, label: "HEARTBEAT.md", icon: FileText }]
      : []),
    ...(skills.length > 0
      ? [{ id: "skills" as TabId, label: `Skills (${skills.length})`, icon: Zap }]
      : []),
    { id: "files", label: "文件列表", icon: Archive },
  ];

  const Icon = getCategoryIcon(agent.category);
  const categoryLabel = getCategoryLabel(agent.category);
  const colorClass =
    categoryColors[agent.category] ||
    "text-muted-foreground bg-[hsl(var(--glass-bg)/0.05)] border-[hsl(var(--glass-border)/0.1)]";
  const installCommand = `soulhub install ${agent.name}`;
  const installPrompt = `请帮我安装 ${agent.name} 这个 Agent 作为主角色。按以下步骤执行：

1. 执行 \`which soulhub\`，如果输出为空或报错，先执行：
   curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash
   安装后执行 \`hash -r\`，再执行 \`soulhub --version\` 确认成功。

2. 执行 \`pwd\`，根据路径判断 claw 类型：
   - 路径含 .openclaw 或 OpenClaw → 类型为 OpenClaw
   - 路径含 .lightclaw 或 LightClaw → 类型为 LightClaw

3. 执行安装命令（必须带全参数，不能遗漏任何一个）：
   soulhub install ${agent.name} --role main --claw-type <上一步判断的类型> -y

注意：第3步的 --role main、--claw-type、-y 三个参数缺一不可，否则会卡住。`;

  const installSubPrompt = `请帮我安装 ${agent.name} 这个 Agent 作为子角色（subagent）。按以下步骤执行：

1. 执行 \`which soulhub\`，如果输出为空或报错，先执行：
   curl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash
   安装后执行 \`hash -r\`，再执行 \`soulhub --version\` 确认成功。

2. 执行 \`pwd\`，根据路径判断 claw 类型：
   - 路径含 .openclaw 或 OpenClaw → 类型为 OpenClaw
   - 路径含 .lightclaw 或 LightClaw → 类型为 LightClaw

3. 执行安装命令（必须带全参数，不能遗漏任何一个）：
   soulhub install ${agent.name} --role worker --claw-type <上一步判断的类型> -y

注意：第3步的 --role worker、--claw-type、-y 三个参数缺一不可，否则会卡住。`;

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

          {/* Install Section - 终端风格页签切换 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-cyan-400/50 via-blue-500/50 to-violet-500/50 glow">
              <div className="rounded-xl bg-gray-50 dark:bg-[hsl(220,15%,8%)] overflow-hidden">
                {/* 终端标题栏 */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-[hsl(220,15%,12%)] border-b border-black/[0.06] dark:border-white/[0.06]">
                  {/* 红黄绿三点 */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>

                  {/* 页签 */}
                  <div className="flex items-center gap-0.5 ml-2">
                    <button
                      onClick={() => setInstallTab("prompt")}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                        installTab === "prompt"
                          ? "bg-black/[0.07] dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Prompt（安装为主Agent）
                      {installTab === "prompt" && (
                        <span className="ml-1 text-[9px] font-bold uppercase tracking-wider px-1 py-px rounded bg-cyan-600/15 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-400">
                          推荐
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setInstallTab("sub-prompt")}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                        installTab === "sub-prompt"
                          ? "bg-black/[0.07] dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Prompt（安装为SubAgent）
                    </button>
                    <button
                      onClick={() => setInstallTab("cli")}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                        installTab === "cli"
                          ? "bg-black/[0.07] dark:bg-white/[0.1] text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      使用 CLI 安装
                    </button>
                  </div>

                  {/* 右侧复制按钮 */}
                  <div className="ml-auto">
                    <CopyButton
                      text={installTab === "prompt" ? installPrompt : installTab === "sub-prompt" ? installSubPrompt : installCommand}
                    />
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-5">
                  <AnimatePresence mode="wait">
                    {installTab === "prompt" ? (
                      <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* 提示词描述 */}
                        <p className="text-xs text-gray-400 dark:text-white/30 mb-3">
                          复制以下提示词发送给 AI，即可将该 Agent 安装为<strong className="text-gray-600 dark:text-white/60">主 Agent</strong>
                        </p>

                        {/* 提示词内容 */}
                        <pre className="text-[13px] font-mono text-gray-700 dark:text-white/80 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto pr-2 scrollbar-none">
                          {installPrompt}
                        </pre>

                        {/* 底部步骤指引 */}
                        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-4 text-[11px] text-gray-400 dark:text-white/30">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-400/15 text-cyan-400 text-[10px] font-bold">1</span>
                            检测环境
                          </span>
                          <span className="text-gray-300 dark:text-white/10">→</span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-400/15 text-blue-400 text-[10px] font-bold">2</span>
                            识别 Claw
                          </span>
                          <span className="text-gray-300 dark:text-white/10">→</span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-400/15 text-violet-400 text-[10px] font-bold">3</span>
                            一键安装
                          </span>
                        </div>
                      </motion.div>
                    ) : installTab === "sub-prompt" ? (
                      <motion.div
                        key="sub-prompt"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* 提示词描述 */}
                        <p className="text-xs text-gray-400 dark:text-white/30 mb-3">
                          复制以下提示词发送给 AI，即可将该 Agent 安装为<strong className="text-gray-600 dark:text-white/60">子 Agent</strong>
                        </p>

                        {/* 提示词内容 */}
                        <pre className="text-[13px] font-mono text-gray-700 dark:text-white/80 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto pr-2 scrollbar-none">
                          {installSubPrompt}
                        </pre>

                        {/* 底部步骤指引 */}
                        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-4 text-[11px] text-gray-400 dark:text-white/30">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-400/15 text-cyan-400 text-[10px] font-bold">1</span>
                            检测环境
                          </span>
                          <span className="text-gray-300 dark:text-white/10">→</span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-400/15 text-blue-400 text-[10px] font-bold">2</span>
                            识别 Claw
                          </span>
                          <span className="text-gray-300 dark:text-white/10">→</span>
                          <span className="flex items-center gap-1.5">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-400/15 text-violet-400 text-[10px] font-bold">3</span>
                            一键安装
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="cli"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <p className="text-xs text-gray-400 dark:text-white/30 mb-3">
                          需已安装 soulhub CLI，在终端中执行以下命令
                        </p>
                        <div className="font-mono">
                          <span className="text-gray-400 dark:text-white/30 select-none">$ </span>
                          <span className="text-green-600 dark:text-green-400/90 text-sm">
                            {installCommand}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ZIP 下载 - 辅助链接 */}
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

                {activeTab === "heartbeat" && heartbeat && (
                  <div className="glass rounded-xl p-6">
                    <MarkdownRenderer content={heartbeat} />
                  </div>
                )}

                {activeTab === "skills" && skills.length > 0 && (
                  <div className="glass rounded-xl overflow-hidden">
                    <div className="divide-y divide-[hsl(var(--glass-border)/0.05)]">
                      {skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="flex items-center gap-2.5 px-5 py-3.5 hover:bg-[hsl(var(--glass-bg)/0.05)] transition-colors"
                        >
                          <Zap className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                        </div>
                      ))}
                    </div>
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
