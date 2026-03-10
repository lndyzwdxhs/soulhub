"use client";

import { motion, useInView } from "framer-motion";
import { Download, Search, MousePointerClick, Copy, Check } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass-bg)/0.1)] transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

const steps = [
  {
    number: "01",
    icon: Download,
    title: "安装 CLI 工具",
    description: "一行命令全局安装 SoulHub CLI。",
    code: "npm install -g @soulhub/cli",
  },
  {
    number: "02",
    icon: Search,
    title: "探索 & 安装灵魂",
    description: "搜索你需要的 Agent 灵魂，一键注入你的项目。",
    code: "soulhub search writer\nsoulhub install writer-xiaohongshu",
  },
  {
    number: "03",
    icon: MousePointerClick,
    title: "或者用 Fusion 组装团队",
    description: "打开可视化 Fusion 编排器，拖拽灵魂组建超级团队。",
    code: "# 打开 Fusion 可视化编排器\n# 拖拽灵魂 → 连接协作 → 导出团队\n# 获得: soulhub team install my-team",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function QuickStart() {
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
            三步开启{" "}
            <span className="text-gradient">灵魂之旅</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            从零到一个完整配置的 Agent 灵魂，不到一分钟。
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-3xl mx-auto space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="group relative flex gap-6"
            >
              {/* Step Number & Line */}
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-[hsl(var(--glass-border)/0.1)] text-lg font-bold text-gradient">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-full bg-gradient-to-b from-[hsl(var(--glass-border)/0.1)] to-transparent mt-3" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {step.description}
                </p>

                {/* Code Block */}
                <div className="relative rounded-xl border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] overflow-hidden">
                  <CopyButton text={step.code.replace(/^#.*\n?/gm, "").trim()} />
                  <pre className="p-4 pr-12 text-sm font-mono overflow-x-auto">
                    <code>
                      {step.code.split("\n").map((line, i) => (
                        <div key={i} className={cn(
                          line.startsWith("#") ? "text-muted-foreground/50" : "text-emerald-400"
                        )}>
                          {!line.startsWith("#") && (
                            <span className="text-muted-foreground mr-2">$</span>
                          )}
                          {line}
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
