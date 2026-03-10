"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryIcon } from "@/lib/data";
import type { Agent } from "@/lib/types";

interface AgentPanelProps {
  agents: Agent[];
}

export function AgentPanel({ agents }: AgentPanelProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(CATEGORIES.map((c) => c.id))
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return agents;
    const q = search.toLowerCase();
    return agents.filter(
      (a) =>
        a.displayName.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [agents, search]);

  const grouped = useMemo(() => {
    const map: Record<string, Agent[]> = {};
    for (const agent of filtered) {
      if (!map[agent.category]) map[agent.category] = [];
      map[agent.category].push(agent);
    }
    return map;
  }, [filtered]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    agent: Agent
  ) => {
    e.dataTransfer.setData(
      "application/soulhub-agent",
      JSON.stringify({
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        category: agent.category,
        tags: agent.tags,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--glass-border)/0.1)] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">🦞🧺 虾笼</h2>
        <span className="text-xs text-[hsl(var(--glass-bg)/0.4)]">{filtered.length}</span>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--glass-bg)/0.3)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索灵魂..."
            className="w-full rounded-lg bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-[hsl(var(--glass-bg)/0.3)] outline-none focus:border-[hsl(var(--glass-border)/0.2)] focus:bg-[hsl(var(--glass-bg)/0.08)] transition-colors"
          />
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        {CATEGORIES.filter(
          (cat) => cat.id !== "dispatcher" && grouped[cat.id]?.length
        ).map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const isExpanded = expandedCategories.has(cat.id);
          const catAgents = grouped[cat.id] ?? [];

          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[hsl(var(--glass-bg)/0.6)] hover:text-[hsl(var(--glass-bg)/0.8)] hover:bg-[hsl(var(--glass-bg)/0.05)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <Icon className="h-3.5 w-3.5" />
                <span className="font-medium">{cat.nameEn}</span>
                <span className="ml-auto text-[hsl(var(--glass-bg)/0.3)]">{catAgents.length}</span>
              </button>

              {isExpanded && (
                <div className="ml-1 mt-0.5 space-y-0.5">
                  {catAgents.map((agent) => (
                    <div
                      key={agent.name}
                      draggable
                      onDragStart={(e) => onDragStart(e, agent)}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 cursor-grab active:cursor-grabbing",
                        "hover:bg-[hsl(var(--glass-bg)/0.05)] transition-colors border border-transparent hover:border-[hsl(var(--glass-border)/0.1)]"
                      )}
                    >
                      <GripVertical className="h-3 w-3 text-[hsl(var(--glass-bg)/0.2)] group-hover:text-[hsl(var(--glass-bg)/0.4)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[hsl(var(--glass-bg)/0.8)] truncate">
                          {agent.displayName}
                        </div>
                        <div className="text-[10px] text-[hsl(var(--glass-bg)/0.3)] truncate">
                          {agent.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--glass-bg)/0.3)]">
            <Search className="h-8 w-8 mb-2" />
            <p className="text-xs">未找到灵魂</p>
          </div>
        )}
      </div>
    </div>
  );
}
