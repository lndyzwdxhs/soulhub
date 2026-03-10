"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, GripVertical, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryIcon } from "@/lib/data";
import type { Agent, Recipe } from "@/lib/types";

interface AgentPanelProps {
  agents: Agent[];
  recipes: Recipe[];
  onLoadRecipe: (recipe: Recipe) => void;
  activeRecipeName: string | null;
}

type PanelTab = "agents" | "recipes";

export function AgentPanel({ agents, recipes, onLoadRecipe, activeRecipeName }: AgentPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("agents");
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

  // 根据 recipe 中的 agents 名称，查找展示名称
  const getAgentDisplayName = (agentName: string) => {
    const agent = agents.find((a) => a.name === agentName);
    return agent?.displayName ?? agentName;
  };

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)]">
      {/* Header */}
      <div className="flex items-center justify-center border-b border-[hsl(var(--glass-border)/0.1)] px-4 py-3">
        <h1 className="text-base font-semibold text-foreground">🦞 🧺</h1>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-[hsl(var(--glass-border)/0.1)]">
        <button
          onClick={() => setActiveTab("agents")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative",
            activeTab === "agents"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          小龙虾
          <span className="text-[10px] text-muted-foreground ml-0.5">{agents.length}</span>
          {activeTab === "agents" && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors relative",
            activeTab === "recipes"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Agent Team
          <span className="text-[10px] text-muted-foreground ml-0.5">{recipes.length}</span>
          {activeTab === "recipes" && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* ===== 小龙虾标签页 ===== */}
      {activeTab === "agents" && (
        <>
          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--glass-bg)/0.3)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索🦞..."
                className="w-full rounded-lg bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[hsl(var(--glass-border)/0.2)] focus:bg-[hsl(var(--glass-bg)/0.08)] transition-colors"
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
        </>
      )}

      {/* ===== 虾笼配方标签页 ===== */}
      {activeTab === "recipes" && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--glass-bg)/0.3)]">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-xs">暂无预设配方</p>
            </div>
          ) : (
            recipes.map((recipe) => {
              const isActive = activeRecipeName === recipe.name;
              return (
                <div
                  key={recipe.name}
                  className={cn(
                    "rounded-xl border p-3 transition-all",
                    isActive
                      ? "border-primary/40 bg-primary/5 shadow-sm"
                      : "border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.03)] hover:border-[hsl(var(--glass-border)/0.2)] hover:bg-[hsl(var(--glass-bg)/0.06)]"
                  )}
                >
                  {/* 配方标题 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-foreground truncate">
                        {recipe.displayName}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                  </div>

                  {/* 成员列表 */}
                  <div className="space-y-1 mb-2.5">
                    {recipe.agents.map((agentName) => (
                      <div
                        key={agentName}
                        className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--glass-bg)/0.5)]"
                      >
                        <span className="h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                        <span className="truncate">{getAgentDisplayName(agentName)}</span>
                      </div>
                    ))}
                  </div>

                  {/* 加载按钮 */}
                  <button
                    onClick={() => onLoadRecipe(recipe)}
                    className={cn(
                      "w-full rounded-lg py-1.5 text-[11px] font-medium transition-all",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30 cursor-default"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-transparent hover:border-primary/20"
                    )}
                  >
                    {isActive ? "✓ 已加载到画布" : "🧺 一键加载"}
                  </button>
                </div>
              );
            })
          )}

          {/* 底部提示 */}
          <div className="text-center pt-2 pb-1">
            <p className="text-[10px] text-muted-foreground/60">
              点击一键加载，会清空当前画布
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
