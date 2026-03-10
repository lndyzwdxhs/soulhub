"use client";

import { Navbar } from "@/components/ui/navbar";
import {
  BookOpen,
  Terminal,
  Puzzle,
  Rocket,
  FileText,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const docSections = [
  {
    icon: Rocket,
    title: "快速开始",
    description: "5 分钟上手 SoulHub，从安装到发布你的第一只🦞",
    href: "#",
    gradient: "from-orange-500/20 to-rose-500/20",
    hoverBorder: "hover:border-orange-500/30",
    iconColor: "text-orange-400",
    tag: "入门",
  },
  {
    icon: FileText,
    title: "Soul 定义规范",
    description: "用 Markdown 定义人格、技能树和行为边界的完整语法指南",
    href: "#",
    gradient: "from-violet-500/20 to-purple-500/20",
    hoverBorder: "hover:border-violet-500/30",
    iconColor: "text-violet-400",
    tag: "核心",
  },
  {
    icon: Terminal,
    title: "CLI 工具",
    description: "一行命令安装、测试、发布 Soul，开发者的瑞士军刀",
    href: "#",
    gradient: "from-emerald-500/20 to-teal-500/20",
    hoverBorder: "hover:border-emerald-500/30",
    iconColor: "text-emerald-400",
    tag: "工具",
  },
  {
    icon: Puzzle,
    title: "Fusion 编排",
    description: "多 Agent 团队协作编排指南，让你的🦞们各司其职",
    href: "#",
    gradient: "from-blue-500/20 to-cyan-500/20",
    hoverBorder: "hover:border-blue-500/30",
    iconColor: "text-blue-400",
    tag: "进阶",
  },
  {
    icon: BookOpen,
    title: "API 参考",
    description: "完整的 SoulHub API 文档，支持集成到你的应用中",
    href: "#",
    gradient: "from-amber-500/20 to-yellow-500/20",
    hoverBorder: "hover:border-amber-500/30",
    iconColor: "text-amber-400",
    tag: "参考",
  },
  {
    icon: MessageSquare,
    title: "社区与贡献",
    description: "参与社区共建，提交你调教好的 Soul 模板",
    href: "#",
    gradient: "from-pink-500/20 to-rose-500/20",
    hoverBorder: "hover:border-pink-500/30",
    iconColor: "text-pink-400",
    tag: "社区",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function DocsPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px" });
  const footerRef = useRef<HTMLDivElement>(null);
  const footerInView = useInView(footerRef, { once: true, margin: "-50px" });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* 背景网格 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* 渐变光晕 */}
        <div className="absolute top-0 -left-32 w-96 h-96 bg-violet-500/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-[128px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 container mx-auto px-6 py-20 sm:py-28 text-center max-w-4xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              持续完善中 &middot; 欢迎贡献
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
          >
            📖 <span className="text-gradient">文档中心</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            从零开始，学会调教你的专属🦞。
            <br className="hidden sm:block" />
            无论你是新手还是老养殖户，都能找到需要的指南。
          </motion.p>

          {/* 快捷操作 */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="#"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-105"
            >
              快速开始
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="https://github.com/lndyzwdxhs/soulhub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--glass-border)/0.15)] bg-[hsl(var(--glass-bg)/0.05)] px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-[hsl(var(--glass-bg)/0.1)] hover:border-[hsl(var(--glass-border)/0.25)] hover:scale-105"
            >
              GitHub
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Doc Cards Grid */}
      <section className="relative py-16 sm:py-24">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent" />

        <div className="relative container mx-auto px-6">
          <motion.div
            ref={cardsRef}
            variants={containerVariants}
            initial="hidden"
            animate={cardsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {docSections.map((section) => (
              <motion.div key={section.title} variants={cardVariants}>
                <Link
                  href={section.href}
                  className={`group relative block rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] p-8 transition-all duration-500 ${section.hoverBorder} hover:glow`}
                >
                  {/* Hover 渐变光效 */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    {/* 图标 + 标签 */}
                    <div className="flex items-start justify-between mb-5">
                      <div
                        className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${section.gradient} p-3 ${section.iconColor} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <section.icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                        {section.tag}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-gradient transition-colors duration-300">
                      {section.title}
                    </h3>

                    {/* 描述 */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>

                    {/* 底部箭头 */}
                    <div className="mt-5 flex items-center text-sm text-muted-foreground/50 group-hover:text-violet-400 transition-colors duration-300">
                      <span className="text-xs">阅读文档</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Terminal Section */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto max-w-2xl"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                等不及了？先来{" "}
                <span className="text-gradient">一行命令</span>
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                跳过文档直接上手，回来再补理论也不迟 🦞
              </p>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl p-1 shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--glass-border)/0.05)]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  Terminal
                </span>
              </div>
              {/* Terminal body */}
              <div className="px-5 py-4 font-mono text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400">$</span>
                  <span className="text-gray-800 dark:text-gray-100">
                    npm install -g{" "}
                    <span className="text-cyan-600 dark:text-cyan-400">
                      @soulhub/cli
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400">$</span>
                  <span className="text-gray-800 dark:text-gray-100">
                    soulhub install{" "}
                    <span className="text-cyan-600 dark:text-cyan-400">
                      writer-xiaohongshu
                    </span>
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-500 text-xs leading-relaxed pl-6">
                  <p>✓ Fetching soul template...</p>
                  <p className="text-emerald-600/80 dark:text-emerald-400/80">
                    ✓ Done! Your 🦞 is ready.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.div
        ref={footerRef}
        initial={{ opacity: 0 }}
        animate={footerInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="border-t border-[hsl(var(--glass-border)/0.1)]"
      >
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-muted-foreground text-sm">
            🚧 文档正在持续完善中，欢迎到{" "}
            <Link
              href="https://github.com/lndyzwdxhs/soulhub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 hover:underline transition-colors"
            >
              GitHub
            </Link>{" "}
            参与贡献
          </p>
          <p className="mt-4 text-xs text-muted-foreground/40">
            🦞 每只龙虾都有灵魂 &middot; Every Agent Deserves a Soul
          </p>
        </div>
      </motion.div>
    </main>
  );
}
