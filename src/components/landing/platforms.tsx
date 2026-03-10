"use client";

import { motion, useInView } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "OpenClaw",
    status: "supported" as const,
    description: "Full integration with install, compose, and share.",
  },
  {
    name: "Dify",
    status: "coming" as const,
    description: "Workflow-based agent platform.",
  },
  {
    name: "CrewAI",
    status: "coming" as const,
    description: "Multi-agent orchestration framework.",
  },
  {
    name: "AutoGen",
    status: "coming" as const,
    description: "Microsoft's multi-agent framework.",
  },
  {
    name: "LangGraph",
    status: "coming" as const,
    description: "LangChain's agent graph framework.",
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
            Built for{" "}
            <span className="text-gradient">Your Platform</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Starting with OpenClaw, expanding to the entire AI agent ecosystem.
          </p>
        </motion.div>

        {/* Platform Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto"
        >
          {platforms.map((platform) => (
            <motion.div
              key={platform.name}
              variants={cardVariants}
              className={cn(
                "relative rounded-2xl border p-6 text-center min-w-[180px] transition-all duration-300",
                platform.status === "supported"
                  ? "border-emerald-500/30 bg-emerald-500/[0.05] glow-sm hover:glow"
                  : "border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] opacity-60 hover:opacity-80"
              )}
            >
              {/* Status Badge */}
              <div className="mb-3 flex justify-center">
                {platform.status === "supported" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Fully Supported
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--glass-bg)/0.1)] px-3 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Coming Soon
                  </span>
                )}
              </div>

              <h3 className={cn(
                "text-lg font-semibold mb-1",
                platform.status === "supported" ? "text-foreground" : "text-muted-foreground"
              )}>
                {platform.name}
              </h3>
              <p className="text-xs text-muted-foreground/80">
                {platform.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
