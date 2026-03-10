"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DispatcherNodeData {
  label: string;
  isSelected: boolean;
  [key: string]: unknown;
}

function DispatcherNodeComponent({ data }: NodeProps) {
  const { label, isSelected } = data as unknown as DispatcherNodeData;

  return (
    <div
      className={cn(
        "relative min-w-[220px] rounded-xl p-4 transition-all duration-200",
        "bg-gradient-to-br from-blue-500/20 via-violet-500/15 to-blue-500/10",
        "border-2",
        isSelected
          ? "border-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.4)]"
          : "border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {label}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-300 border border-blue-500/20">
              Auto-generated
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-blue-600"
      />
    </div>
  );
}

export const DispatcherNode = memo(DispatcherNodeComponent);
