"use client";

import { ArrowDownAZ, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/lib/types";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: typeof ArrowDownAZ }[] = [
  { value: "name", label: "按名称", icon: ArrowDownAZ },
  { value: "downloads", label: "最多安装", icon: TrendingDown },
  { value: "newest", label: "最新发布", icon: Clock },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-1.5">
      {sortOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-[hsl(var(--glass-bg)/0.1)] text-foreground border border-[hsl(var(--glass-border)/0.2)]"
                : "bg-transparent text-muted-foreground hover:bg-[hsl(var(--glass-bg)/0.05)] hover:text-foreground border border-transparent"
            )}
          >
            <Icon className="h-3 w-3" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
