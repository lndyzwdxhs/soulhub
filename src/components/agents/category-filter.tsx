"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryIcon } from "@/lib/data";
import type { Agent } from "@/lib/types";

interface CategoryFilterProps {
  agents: Agent[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({ agents, selected, onSelect }: CategoryFilterProps) {
  const totalCount = agents.length;

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: agents.filter((a) => a.category === cat.id).length,
  }));

  return (
    <div className="flex flex-wrap gap-2">
      {/* All button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onSelect(null)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          selected === null
            ? "bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 text-foreground border border-blue-400/30 glow-sm"
            : "bg-[hsl(var(--glass-bg)/0.05)] text-muted-foreground border border-[hsl(var(--glass-border)/0.1)] hover:bg-[hsl(var(--glass-bg)/0.1)] hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        全部
        <span className="text-xs opacity-60">({totalCount})</span>
      </motion.button>

      {/* Category buttons */}
      {categoryCounts.map((cat) => {
        const Icon = getCategoryIcon(cat.id);
        const isActive = selected === cat.id;

        return (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-cyan-500/20 text-foreground border border-blue-400/30 glow-sm"
                : "bg-[hsl(var(--glass-bg)/0.05)] text-muted-foreground border border-[hsl(var(--glass-border)/0.1)] hover:bg-[hsl(var(--glass-bg)/0.1)] hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.name}
            <span className="text-xs opacity-60">({cat.count})</span>
          </motion.button>
        );
      })}
    </div>
  );
}
