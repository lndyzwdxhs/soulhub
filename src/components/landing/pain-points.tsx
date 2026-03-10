"use client";

import { motion, useInView } from "framer-motion";
import { Lock, FileQuestion, Puzzle, Share2 } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const painPoints = [
  {
    icon: Lock,
    title: "平台封闭，灵魂无法迁移",
    description:
      "GPT Store、Coze、Character.AI 上精心调教的 Agent 无法导出、迁移，灵魂被锁在围墙花园里。",
  },
  {
    icon: FileQuestion,
    title: "缺少「人格」这一中间层",
    description:
      "PromptBase 只卖单条 Prompt，Dify 侧重完整工作流。缺少专注于 Agent 人格与行为模式的标准化格式。",
  },
  {
    icon: Puzzle,
    title: "多 Agent 协作是手工活",
    description:
      "将多个 Agent 协作编排需要复杂的配置和手动调度逻辑，缺乏可视化的团队组装方案。",
  },
  {
    icon: Share2,
    title: "好灵魂无处安放",
    description:
      "调教好的 Agent 散落在私人仓库和 Notion 文档里，没有一个社区让它们被发现、被复用。",
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

export function PainPoints() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Agent 的灵魂{" "}
            <span className="text-gradient">正在流浪</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            精心调教的 Agent 不该被遗忘在角落，它们值得被看见、被分享、被组队。
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {painPoints.map((item) => (
            <motion.div
              key={item.title}
              variants={cardVariants}
              className="group relative rounded-2xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] p-6 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/[0.03]"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-red-500/10 p-3 text-red-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
