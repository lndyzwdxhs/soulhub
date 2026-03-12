"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// 兼容性复制函数，优先使用 Clipboard API，fallback 到 execCommand
function copyToClipboard(text: string): Promise<void> {
  // 优先尝试 Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text).catch(() => {
      // Clipboard API 失败时 fallback
      return fallbackCopy(text);
    });
  }
  // 直接 fallback
  return fallbackCopy(text);
}

function fallbackCopy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // 不可见但仍可选中
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

// 打字机标题组件 — 循环展示：打字 → 停顿 → 淡出 → 重新打字
function TypewriterTitle() {
  const segments = [
    { text: "Soul，", className: "text-gradient" },
    { text: "生而", className: "" },
    { text: "不朽", className: "" },
  ];
  const fullText = segments.map((s) => s.text).join("");
  const totalLen = fullText.length;

  // phase: "typing" | "fadeOut" | "waiting"
  const [displayCount, setDisplayCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "fadeOut" | "waiting">("typing");
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing":
        if (displayCount < totalLen) {
          timer = setTimeout(() => setDisplayCount((c) => c + 1), 150);
        } else {
          // 打字完成，停顿 2 秒后开始淡出
          timer = setTimeout(() => {
            setPhase("fadeOut");
            setTextVisible(false);
          }, 2000);
        }
        break;
      case "fadeOut":
        // 等待淡出动画完成（800ms），然后重置
        timer = setTimeout(() => {
          setDisplayCount(0);
          setTextVisible(true);
          setPhase("typing");
        }, 1000);
        break;
    }

    return () => clearTimeout(timer);
  }, [displayCount, phase, totalLen]);

  // 根据 displayCount 渲染已打出的字符，保留分段样式
  let rendered = 0;
  return (
    <>
      <motion.span
        animate={{ opacity: textVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="inline"
      >
        {segments.map((seg, i) => {
          const start = rendered;
          rendered += seg.text.length;
          const visibleLen = Math.max(0, Math.min(seg.text.length, displayCount - start));
          if (visibleLen === 0) return null;
          return (
            <span key={i} className={seg.className}>
              {seg.text.slice(0, visibleLen)}
            </span>
          );
        })}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="inline-block w-[3px] sm:w-[4px] h-[0.85em] bg-gradient-to-b from-blue-400 to-violet-500 ml-1 align-middle rounded-full"
        />
      </motion.span>
    </>
  );
}

const openclawTabs = [
  {
    id: "one-liner" as const,
    label: "One-liner",
    command: "# Install OpenClaw — 🦞 的运行时引擎\ncurl -fsSL https://openclaw.ai/install.sh | bash",
  },
  {
    id: "npm" as const,
    label: "npm",
    command: "# Install OpenClaw\nnpm install -g openclaw\n\n# Meet your lobster\nopenclaw onboard",
  },
];

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
        <motion.div variants={itemVariants} className="mt-10 mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Open Source &middot; Community Driven &middot; Free Forever
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]"
        >
          <TypewriterTitle />
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 flex flex-col items-center gap-4"
        >
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
            优质小龙虾<span className="mx-1">🦞</span>，<span className="text-gradient">开箱即用</span>
          </p>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            一行命令，专家级 🦞 即刻就位
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
            三步开启{" "}
            <span className="text-gradient">灵魂之旅</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            一分钟，从零到一，复刻一个优质小龙虾🦞。
          </p>

          {/* Step 01 - 安装 OpenClaw (前置依赖) */}
          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-3 mb-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-xs font-bold text-gradient">
                01
              </span>
              <span className="text-sm font-semibold">安装 OpenClaw</span>
              <span className="text-xs text-muted-foreground">前置依赖 · 🦞 的运行时引擎</span>
            </div>
            <OpenClawTerminal />
            <p className="mt-2 text-xs text-muted-foreground text-left">
              了解更多请访问{" "}
              <a
                href="https://openclaw.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                openclaw.ai
              </a>
            </p>
          </div>

          {/* Step 02 - Terminal (安装 CLI) */}
          <div className="mt-8 mx-auto max-w-xl">
            <div className="flex items-center gap-3 mb-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-xs font-bold text-gradient">
                02
              </span>
              <span className="text-sm font-semibold">安装 CLI 工具</span>
              <span className="text-xs text-muted-foreground">一行命令全局安装 SoulHub CLI</span>
            </div>
            <TerminalPreview />
          </div>

          {/* Step 03 - 探索灵魂 & 组装团队 */}
          <div className="mt-8 mx-auto max-w-xl">
            <div className="flex items-center gap-3 mb-3 text-left">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-xs font-bold text-gradient">
                03
              </span>
              <span className="text-sm font-semibold">安装钟意的 🦞🦞🦞</span>
              <Link
                href="/souls"
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                探索钟意的 Soul →
              </Link>
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
    copyToClipboard(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
    copyToClipboard(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

function OpenClawTerminal() {
  const [activeTab, setActiveTab] = useState<"one-liner" | "npm">("one-liner");
  const [copied, setCopied] = useState(false);

  const activeCommand = openclawTabs.find((t) => t.id === activeTab)!;

  // 复制时去掉注释行和空行
  const copyText = activeCommand.command
    .split("\n")
    .filter((line) => !line.startsWith("#") && line.trim() !== "")
    .join("\n")
    .trim();

  const handleCopy = useCallback(() => {
    copyToClipboard(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
            {openclawTabs.map((tab) => (
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
            const isEmpty = line.trim() === "";
            if (isEmpty) return <div key={`${activeTab}-${i}`} className="h-3" />;
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
