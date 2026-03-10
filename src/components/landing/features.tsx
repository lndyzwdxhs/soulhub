"use client";

import { motion, useInView } from "framer-motion";
import { Sparkles, Terminal, MousePointerClick, Link2 } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "Curated Agent Templates",
    description:
      "21+ ready-to-use agent personas covering writing, coding, analysis, and more. Community-vetted quality.",
    highlight: "21+ templates",
  },
  {
    icon: Terminal,
    title: "One-Line CLI Install",
    description:
      "Run soulhub install <name> and you're done. No config, no setup, just instant agent personas.",
    highlight: "Zero config",
  },
  {
    icon: MousePointerClick,
    title: "Visual Multi-Agent Composer",
    description:
      "Drag agents onto a canvas, connect them, auto-generate a dispatcher. Build agent teams visually.",
    highlight: "Drag & drop",
  },
  {
    icon: Link2,
    title: "Share Link",
    description:
      "Share your multi-agent team setup with a single link. Anyone can import your exact configuration.",
    highlight: "One link",
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
            Everything You Need to{" "}
            <span className="text-gradient">Build Agent Teams</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From single agents to multi-agent orchestration, SoulHub has you covered.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
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
