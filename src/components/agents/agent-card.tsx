"use client";

import { motion } from "framer-motion";
import { Download, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import type { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const categoryColors: Record<string, string> = {
  "self-media": "text-pink-400 bg-pink-400/10 border-pink-400/20",
  development: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  education: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  design: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  product: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  security: "text-red-400 bg-red-400/10 border-red-400/20",
  dispatcher: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  research: "text-teal-400 bg-teal-400/10 border-teal-400/20",
};

const categoryIconColors: Record<string, string> = {
  "self-media": "text-pink-400",
  development: "text-blue-400",
  education: "text-violet-400",
  design: "text-rose-400",
  product: "text-indigo-400",
  security: "text-red-400",
  dispatcher: "text-cyan-400",
  research: "text-teal-400",
};

export function AgentCard({ agent, index }: AgentCardProps) {
  const Icon = getCategoryIcon(agent.category);
  const categoryLabel = getCategoryLabel(agent.category);
  const colorClass = categoryColors[agent.category] || "text-muted-foreground bg-[hsl(var(--glass-bg)/0.05)] border-[hsl(var(--glass-border)/0.1)]";
  const iconColor = categoryIconColors[agent.category] || "text-muted-foreground";
  const visibleTags = agent.tags.slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/souls/${agent.name}`} className="block group h-full">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "relative rounded-xl p-5 h-full flex flex-col",
            "bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl border border-[hsl(var(--glass-border)/0.1)]",
            "transition-shadow duration-300",
            "group-hover:glow-sm group-hover:border-[hsl(var(--glass-border)/0.2)]"
          )}
        >
          {/* Category icon + badge */}
          <div className="flex items-center gap-2 mb-3">
            <Icon className={cn("h-4 w-4", iconColor)} />
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                colorClass
              )}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-gradient transition-colors duration-200 truncate">
            {agent.displayName}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed min-h-[2.75rem]">
            {agent.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px] max-h-[28px] overflow-hidden">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--glass-bg)/0.05)] text-muted-foreground border border-[hsl(var(--glass-border)/0.05)]"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--glass-bg)/0.05)] text-muted-foreground/60">
                +{agent.tags.length - 3}
              </span>
            )}
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--glass-border)/0.05)] mt-auto">
            <span className="text-xs text-muted-foreground/60 font-mono">
              v{agent.version}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="h-3 w-3" />
                {agent.downloads}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                {agent.stars}
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
