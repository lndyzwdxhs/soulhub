"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/data";

const CATEGORY_COLORS: Record<string, string> = {
  "self-media": "border-l-pink-400",
  development: "border-l-emerald-400",
  operations: "border-l-amber-400",
  support: "border-l-sky-400",
  education: "border-l-purple-400",
  dispatcher: "border-l-blue-400",
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  "self-media": "bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/20",
  development: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
  operations: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20",
  support: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/20",
  education: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/20",
  dispatcher: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/20",
};

interface WorkerNodeData {
  label: string;
  description: string;
  category: string;
  isSelected: boolean;
  [key: string]: unknown;
}

function WorkerNodeComponent({ data }: NodeProps) {
  const { label, description, category, isSelected } =
    data as unknown as WorkerNodeData;
  const Icon = getCategoryIcon(category);
  const borderColor = CATEGORY_COLORS[category] ?? "border-l-gray-400";
  const badgeColor =
    CATEGORY_BADGE_COLORS[category] ??
    "bg-gray-500/15 text-gray-300 border-gray-500/20";

  return (
    <div
      className={cn(
        "relative min-w-[180px] max-w-[220px] rounded-lg border-l-[3px] p-3 transition-all duration-200",
        borderColor,
        "bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl border border-[hsl(var(--glass-border)/0.1)]",
        isSelected &&
          "ring-1 ring-[hsl(var(--glass-border)/0.3)] shadow-[0_0_16px_hsl(var(--glass-bg)/0.08)]"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[hsl(var(--glass-bg)/0.4)] !border-2 !border-[hsl(var(--glass-border)/0.2)]"
      />

      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--glass-bg)/0.1)]">
          <Icon className="h-4 w-4 text-[hsl(var(--glass-bg)/0.7)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-foreground truncate">
            {label}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2 leading-tight">
            {description}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium border",
            badgeColor
          )}
        >
          {category}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[hsl(var(--glass-bg)/0.4)] !border-2 !border-[hsl(var(--glass-border)/0.2)]"
      />
    </div>
  );
}

export const WorkerNode = memo(WorkerNodeComponent);
