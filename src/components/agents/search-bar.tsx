"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search agents by name, description, or tags..."
        className={cn(
          "w-full pl-10 pr-4 py-2.5 rounded-lg text-sm",
          "bg-[hsl(var(--glass-bg)/0.05)] backdrop-blur-xl border border-[hsl(var(--glass-border)/0.1)]",
          "text-foreground placeholder:text-muted-foreground/50",
          "focus:outline-none focus:ring-1 focus:ring-violet-400/50 focus:border-[hsl(var(--glass-border)/0.2)]",
          "transition-all duration-200"
        )}
      />
    </div>
  );
}
