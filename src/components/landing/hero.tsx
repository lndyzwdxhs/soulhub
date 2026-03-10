"use client";

import { motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
          <p>像 GitHub 存储代码一样，SoulHub 存储<span className="text-foreground font-medium">调教好的小龙虾🦞</span></p>
          <p>
            用 <span className="text-foreground font-medium">Markdown</span> 定义 Soul，一行命令安装，可视化编排多 Agent Team
          </p>
          <p className="text-foreground font-medium">
            开源免费，社区共建
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

        {/* Code Preview */}
        <motion.div
          variants={itemVariants}
          className="mt-16 mx-auto max-w-xl"
        >
          <div className="rounded-2xl border border-gray-200 dark:border-[hsl(var(--glass-border)/0.1)] bg-gray-900 dark:bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl p-1 shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 dark:border-[hsl(var(--glass-border)/0.05)]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-gray-400 ml-2">Terminal</span>
            </div>
            {/* Terminal body */}
            <div className="px-5 py-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-400">$</span>
                <span className="text-gray-100">
                  npx soulhub install{" "}
                  <span className="text-cyan-400">writer-xiaohongshu</span>
                </span>
              </div>
              <div className="mt-3 text-gray-500 text-xs leading-relaxed">
                <p>✓ Fetching template writer-xiaohongshu...</p>
                <p>✓ Installing persona to ./agents/writer-xiaohongshu.yaml</p>
                <p className="text-emerald-400/80">✓ Done! Agent persona ready.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
