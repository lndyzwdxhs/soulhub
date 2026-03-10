"use client";

import { motion, useInView } from "framer-motion";
import { RefreshCw, FileQuestion, Puzzle, Share2 } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const painPoints = [
  {
    icon: RefreshCw,
    title: "Repetitive Prompt Engineering",
    description:
      "Spending hours crafting the same system prompts for every new project, reinventing the wheel each time.",
  },
  {
    icon: FileQuestion,
    title: "No Standardized Format",
    description:
      "Every team uses a different format for agent personas. No interoperability, no community sharing.",
  },
  {
    icon: Puzzle,
    title: "Manual Multi-Agent Setup",
    description:
      "Wiring multiple agents together requires complex configuration and manual dispatcher logic.",
  },
  {
    icon: Share2,
    title: "Hard to Share & Reuse",
    description:
      "Great agent setups live in private repos and Notion docs. No easy way to share or discover them.",
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
            The Problem with{" "}
            <span className="text-gradient">Agent Prompts</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Building AI agents shouldn&apos;t mean starting from scratch every time.
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
