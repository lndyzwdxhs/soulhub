"use client";

import { motion } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const installTabs = [
  {
    id: "one-liner" as const,
    label: "One-liner",
    command: "# Works everywhere. Installs everything.\ncurl -fsSL https://soulhub-1251783334.cos.ap-guangzhou.myqcloud.com/install.sh | bash",
  },
  {
    id: "npm" as const,
    label: "npm",
    command: "# Install SoulHub\nnpm install -g soulhubcli",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[128px]" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-6 text-center max-w-4xl"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Open Source &middot; Community Driven &middot; Free Forever
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight"
        >
          每只 🦞 都该有{" "}
          <span className="text-gradient">灵魂</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          variants={itemVariants}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed space-y-2"
        >
          <p>GitHub 版本化代码，SoulHub 版本化<span className="text-foreground font-medium">智能体的灵魂🦞</span></p>
          <p>
            <span className="text-foreground font-medium">Markdown as Code</span> — 声明即部署，一行命令具象化，Fusion 可视化编排
          </p>
          <p className="text-foreground font-medium">
            开源共建，让每只🦞的灵魂可复现、可组合、可进化
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/souls"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105"
          >
            探索 Souls
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/fusion"
            className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--glass-border)/0.15)] bg-[hsl(var(--glass-bg)/0.05)] px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-[hsl(var(--glass-bg)/0.1)] hover:border-[hsl(var(--glass-border)/0.25)] hover:scale-105"
          >
            开始 Fusion
          </Link>
        </motion.div>

        {/* 两步开启灵魂之旅 - 包裹在面板中 */}
        <motion.div
          variants={itemVariants}
          className="mt-20 rounded-3xl border border-[hsl(var(--glass-border)/0.08)] bg-[hsl(var(--glass-bg)/0.03)] backdrop-blur-sm p-8 sm:p-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            两步开启{" "}
            <span className="text-gradient">灵魂之旅</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            一分钟，从零到一，复刻一个优质小龙虾🦞。
          </p>

          {/* Step 01 - Terminal (安装 CLI) */}
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3 mb-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-xs font-bold text-gradient">
                01
              </span>
              <span className="text-sm font-semibold">安装 CLI 工具</span>
              <span className="text-xs text-muted-foreground">一行命令全局安装 SoulHub CLI</span>
            </div>
            <TerminalPreview />
          </div>

          {/* Step 02 - 探索灵魂 & 组装团队 */}
          <div className="mt-8 mx-auto max-w-xl">
            <div className="flex items-center gap-3 mb-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-xs font-bold text-gradient">
                02
              </span>
              <span className="text-sm font-semibold">探索钟意的 🦞🦞🦞</span>
              <span className="text-xs text-muted-foreground">安装超级个体、超级团队</span>
            </div>
            <Step02Terminal />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function TerminalPreview() {
  const [activeTab, setActiveTab] = useState<"one-liner" | "npm">("one-liner");
  const [copied, setCopied] = useState(false);

  const activeCommand = installTabs.find((t) => t.id === activeTab)!;

  // 复制时去掉注释行
  const copyText = activeCommand.command
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trim();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyText]);

  return (
    <div className="rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl p-1 shadow-2xl">
      {/* Terminal header：红绿灯 + 页签 + 复制按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--glass-border)/0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          {/* 页签 */}
          <div className="flex gap-1 ml-1">
            {installTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--glass-bg)/0.1)] text-foreground border border-[hsl(var(--glass-border)/0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-bg)/0.05)]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-bg)/0.1)] transition-all"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Terminal body */}
      <div className="py-4 font-mono text-sm text-left overflow-x-auto">
        <div className="px-5 min-w-max">
        {activeCommand.command.split("\n").map((line, i) => {
          const isComment = line.startsWith("#");
          return (
            <div key={`${activeTab}-${i}`} className={cn("whitespace-nowrap", i > 0 && "mt-1.5")}>
              <span className="text-emerald-600 dark:text-emerald-400 select-none">
                {"$ "}
              </span>
              <span
                className={
                  isComment
                    ? "text-gray-500 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-100"
                }
              >
                {line}
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

const step02Commands = `# 搜索 & 安装你钟意的🦞
soulhub install writer-xiaohongshu`;

function Step02Terminal() {
  const [copied, setCopied] = useState(false);

  const copyText = step02Commands
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trim();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [copyText]);

  return (
    <div className="rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl p-1 shadow-2xl">
      {/* Terminal header：红绿灯 + 复制按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--glass-border)/0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
        </div>
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-bg)/0.1)] transition-all"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Terminal body */}
      <div className="px-5 py-4 font-mono text-sm text-left overflow-x-auto">
        {step02Commands.split("\n").map((line, i) => {
          const isComment = line.startsWith("#");
          return (
            <div key={i} className={cn(i > 0 && "mt-1.5")}>
              <span className="text-emerald-600 dark:text-emerald-400 select-none">
                {"$ "}
              </span>
              <span
                className={
                  isComment
                    ? "text-gray-500 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-100"
                }
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
