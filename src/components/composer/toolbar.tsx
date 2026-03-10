"use client";

import { Undo2, Redo2, LayoutGrid, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasAgents: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onExport: () => void;
  onDownloadZip: () => void;
}

export function Toolbar({
  canUndo,
  canRedo,
  hasAgents,
  onUndo,
  onRedo,
  onAutoLayout,
  onExport,
  onDownloadZip,
}: ToolbarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-xl glass px-2 py-1.5 shadow-2xl">
      {/* History controls */}
      <ToolbarButton
        icon={Undo2}
        label="Undo"
        disabled={!canUndo}
        onClick={onUndo}
      />
      <ToolbarButton
        icon={Redo2}
        label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
      />

      <div className="mx-1 h-5 w-px bg-[hsl(var(--glass-bg)/0.1)]" />

      <ToolbarButton
        icon={LayoutGrid}
        label="Auto Layout"
        disabled={!hasAgents}
        onClick={onAutoLayout}
      />

      <div className="mx-1 h-5 w-px bg-[hsl(var(--glass-bg)/0.1)]" />

      {/* Export */}
      <button
        onClick={onExport}
        disabled={!hasAgents}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
          hasAgents
            ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400 shadow-lg shadow-blue-500/20"
            : "bg-[hsl(var(--glass-bg)/0.05)] text-[hsl(var(--glass-bg)/0.2)] cursor-not-allowed"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate Command
      </button>

      <ToolbarButton
        icon={Download}
        label="Download ZIP"
        disabled={!hasAgents}
        onClick={onDownloadZip}
      />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 transition-all duration-150",
        disabled
          ? "text-[hsl(var(--glass-bg)/0.15)] cursor-not-allowed"
          : "text-[hsl(var(--glass-bg)/0.5)] hover:text-white hover:bg-[hsl(var(--glass-bg)/0.1)]"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
