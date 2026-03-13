"use client";

import { motion, useInView } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type PlatformStatus = "supported" | "coming" | "beta";

interface Platform {
  name: string;
  status: PlatformStatus;
  description: string;
  company?: string;
}

// SoulHub 原生支持
const nativePlatforms: Platform[] = [
  {
    name: "LightClaw",
    status: "supported",
    description: "轻量级 Claw 引擎，开箱即用。",
  },
  {
    name: "OpenClaw",
    status: "supported",
    description: "完整支持安装、Fusion 编排与分享。",
  },
];

// 业界 Claw 生态
const industryClaw: Platform[] = [
  {
    name: "WorkBuddy",
    company: "腾讯",
    status: "beta",
    description: "全场景AI智能体，完全兼容OpenClaw技能，主打办公自动化。",
  },
  {
    name: "QClaw",
    company: "腾讯",
    status: "beta",
    description: "面向个人用户和开发者的产品，支持通过微信/QQ控制。",
  },
  {
    name: "ArkClaw",
    company: "字节跳动",
    status: "beta",
    description: "火山引擎云上SaaS版，深度适配飞书，支持多模型切换。",
  },
  {
    name: "KimiClaw",
    company: "月之暗面",
    status: "coming",
    description: "基于Kimi K2.5大模型，托管云服务，预装ClawHub技能库。",
  },
  {
    name: "MaxClaw",
    company: "MiniMax",
    status: "coming",
    description: "基于M2.5模型，iOS/Android全球版本，主打低成本优势。",
  },
  {
    name: "AutoClaw",
    company: "智谱AI",
    status: "coming",
    description: "一键安装本地版，内置Pony-Alpha-2模型，预置50+主流技能。",
  },
  {
    name: "小艺Claw",
    company: "华为",
    status: "coming",
    description: "基于鸿蒙系统，支持多端协同，预设多种人格。",
  },
  {
    name: "MiClaw",
    company: "小米",
    status: "coming",
    description: "基于MiMo大模型，系统级运行，可控制IoT设备。",
  },
  {
    name: "DuClaw",
    company: "百度",
    status: "coming",
    description: "即开即用零部署服务，已接入百度App搜索框。",
  },
];

// 其他 Agent 框架
const otherFrameworks: Platform[] = [
  {
    name: "Dify",
    status: "coming",
    description: "基于工作流的 Agent 平台。",
  },
  {
    name: "CrewAI",
    status: "coming",
    description: "多 Agent 编排框架。",
  },
  {
    name: "AutoGen",
    status: "coming",
    description: "Microsoft 多 Agent 框架。",
  },
  {
    name: "LangGraph",
    status: "coming",
    description: "LangChain Agent 图框架。",
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Platforms() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent" />

      <div className="relative container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            为你的{" "}
            <span className="text-gradient">平台而生</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            已支持 LightClaw 与 OpenClaw，业界 Claw 生态百花齐放。
          </p>
        </motion.div>

        {/* SoulHub 原生支持 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-4 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <Check className="h-4 w-4" />
            SoulHub 原生支持
          </span>
        </motion.div>
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          {nativePlatforms.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </motion.div>

        {/* 业界 Claw 生态 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-16 mb-4 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-400">
            🔥 业界 Claw 生态
          </span>
          <p className="mt-2 text-xs text-muted-foreground/60">全行业都在拥抱 Claw 生态</p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto"
        >
          {industryClaw.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} compact />
          ))}
        </motion.div>

        {/* 其他 Agent 框架 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-16 mb-4 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--glass-bg)/0.1)] border border-[hsl(var(--glass-border)/0.1)] px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            更多 Agent 框架
          </span>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          {otherFrameworks.map((platform) => (
            <PlatformCard key={platform.name} platform={platform} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Platform Card 子组件 ---------- */
function PlatformCard({ platform, compact }: { platform: Platform; compact?: boolean }) {
  const statusConfig = {
    supported: {
      badge: "已完整支持",
      icon: <Check className="h-3.5 w-3.5" />,
      badgeClass: "bg-emerald-500/20 text-emerald-400",
      cardClass: "border-emerald-500/30 bg-emerald-500/[0.05] glow-sm hover:glow",
      nameClass: "text-foreground",
    },
    beta: {
      badge: "内测中",
      icon: <Clock className="h-3.5 w-3.5" />,
      badgeClass: "bg-amber-500/20 text-amber-400",
      cardClass: "border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/40",
      nameClass: "text-foreground/80",
    },
    coming: {
      badge: "即将支持",
      icon: <Clock className="h-3.5 w-3.5" />,
      badgeClass: "bg-[hsl(var(--glass-bg)/0.1)] text-muted-foreground",
      cardClass: "border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] opacity-60 hover:opacity-80",
      nameClass: "text-muted-foreground",
    },
  };

  const config = statusConfig[platform.status];

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "relative rounded-2xl border text-center transition-all duration-300",
        compact ? "p-4 min-w-[160px]" : "p-6 min-w-[180px]",
        config.cardClass
      )}
    >
      {/* Status Badge */}
      <div className={cn("flex justify-center", compact ? "mb-2" : "mb-3")}>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
          config.badgeClass
        )}>
          {config.icon}
          {config.badge}
        </span>
      </div>

      {platform.company && (
        <p className="text-[10px] text-muted-foreground/50 mb-0.5">{platform.company}</p>
      )}

      <h3 className={cn(
        "font-semibold mb-1",
        compact ? "text-base" : "text-lg",
        config.nameClass
      )}>
        {platform.name}
      </h3>
      <p className={cn(
        "text-muted-foreground/80",
        compact ? "text-[11px] leading-tight" : "text-xs"
      )}>
        {platform.description}
      </p>
    </motion.div>
  );
}
