"use client";

import { motion, useInView } from "framer-motion";
import { Sparkles, Terminal, MousePointerClick, Link2, FileText, Users } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "灵魂优先",
    description:
      "不是分享代码或工作流，而是分享 Agent 的人格、技能和行为模式。21+ 精选灵魂模板，社区共同打磨。",
    highlight: "Soul First",
  },
  {
    icon: FileText,
    title: "Markdown 原生",
    description:
      "以 IDENTITY.md + SOUL.md 为标准格式，人类可读可编辑。像写文档一样定义 Agent 灵魂。",
    highlight: "人类可读",
  },
  {
    icon: Terminal,
    title: "一行命令，灵魂到位",
    description:
      "运行 soulhub install <name> 即刻完成。零配置、零门槛，灵魂瞬间注入你的项目。",
    highlight: "秒级安装",
  },
  {
    icon: MousePointerClick,
    title: "可视化 Fusion 编排",
    description:
      "将 Agent 灵魂拖拽到画布，自动生成调度器与路由规则。团队配方一键导出，协作从未如此简单。",
    highlight: "拖拽组队",
  },
  {
    icon: Link2,
    title: "一个链接，分享团队",
    description:
      "将你的多 Agent 团队配方生成分享链接。任何人都能一键导入你的完整团队架构。",
    highlight: "即传即用",
  },
  {
    icon: Users,
    title: "开源社区，共建灵魂",
    description:
      "GitHub PR 贡献模式，人人都可以提交自己调教好的灵魂。优先适配 OpenClaw，兼容 Dify / CrewAI 等框架。",
    highlight: "社区驱动",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
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

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent" />

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            我们的{" "}
            <span className="text-gradient">核心理念</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            用 Markdown 定义灵魂，用开源社区分享它们 —— 从单个 Agent 到多 Agent 军团，SoulHub 为你而生。
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group relative rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] p-8 transition-all duration-500 hover:border-violet-500/30 hover:glow"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="mb-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 p-3 text-blue-400 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>

                <div className="mb-2 inline-block ml-3">
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                    {feature.highlight}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
