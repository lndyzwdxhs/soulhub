"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoutingRule } from "@/lib/composer-types";

interface RoutingEditorProps {
  rules: RoutingRule[];
  onUpdateRules: (rules: RoutingRule[]) => void;
}

export function RoutingEditor({ rules, onUpdateRules }: RoutingEditorProps) {
  const [editingKeyword, setEditingKeyword] = useState<{
    ruleId: string;
    value: string;
  } | null>(null);

  const updateRule = (id: string, updates: Partial<RoutingRule>) => {
    onUpdateRules(
      rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteRule = (id: string) => {
    onUpdateRules(rules.filter((r) => r.id !== id));
  };

  const addCustomRule = () => {
    const newRule: RoutingRule = {
      id: `rule-custom-${Date.now()}`,
      keywords: ["新关键词"],
      targetAgent: "custom",
      targetDisplayName: "Custom Rule",
      description: "Custom routing rule",
    };
    onUpdateRules([...rules, newRule]);
  };

  const removeKeyword = (ruleId: string, keywordIndex: number) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newKeywords = rule.keywords.filter((_, i) => i !== keywordIndex);
    updateRule(ruleId, { keywords: newKeywords });
  };

  const addKeyword = (ruleId: string) => {
    if (!editingKeyword || editingKeyword.ruleId !== ruleId) {
      setEditingKeyword({ ruleId, value: "" });
      return;
    }
    if (!editingKeyword.value.trim()) {
      setEditingKeyword(null);
      return;
    }
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      keywords: [...rule.keywords, editingKeyword.value.trim()],
    });
    setEditingKeyword(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-[hsl(var(--glass-bg)/0.6)] uppercase tracking-wider">
          Routing Rules
        </h4>
        <button
          onClick={addCustomRule}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-blue-300 hover:bg-blue-500/10 transition-colors"
        >
          <Plus className="h-3 w-3" />
          添加规则
        </button>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="rounded-lg glass p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[hsl(var(--glass-bg)/0.8)]">
                {rule.targetDisplayName}
              </span>
              <button
                onClick={() => deleteRule(rule.id)}
                className="p-1 rounded text-[hsl(var(--glass-bg)/0.2)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1">
              {rule.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--glass-bg)/0.1)] px-2 py-0.5 text-[10px] text-[hsl(var(--glass-bg)/0.6)] group"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(rule.id, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-2.5 w-2.5 text-[hsl(var(--glass-bg)/0.4)] hover:text-white" />
                  </button>
                </span>
              ))}

              {editingKeyword?.ruleId === rule.id ? (
                <input
                  autoFocus
                  value={editingKeyword.value}
                  onChange={(e) =>
                    setEditingKeyword({
                      ...editingKeyword,
                      value: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addKeyword(rule.id);
                    if (e.key === "Escape") setEditingKeyword(null);
                  }}
                  onBlur={() => addKeyword(rule.id)}
                  className="rounded-full bg-[hsl(var(--glass-bg)/0.1)] px-2 py-0.5 text-[10px] text-white outline-none w-16"
                  placeholder="关键词"
                />
              ) : (
                <button
                  onClick={() => addKeyword(rule.id)}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px]",
                    "text-[hsl(var(--glass-bg)/0.3)] hover:text-[hsl(var(--glass-bg)/0.5)] hover:bg-[hsl(var(--glass-bg)/0.05)] transition-colors"
                  )}
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              )}
            </div>

            {/* Description */}
            <input
              value={rule.description}
              onChange={(e) =>
                updateRule(rule.id, { description: e.target.value })
              }
              className="w-full bg-transparent text-[10px] text-[hsl(var(--glass-bg)/0.4)] outline-none border-b border-transparent focus:border-[hsl(var(--glass-border)/0.1)] transition-colors"
              placeholder="描述..."
            />
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <p className="text-center text-xs text-[hsl(var(--glass-bg)/0.2)] py-4">
          拖入灵魂到画布即可自动生成路由规则
        </p>
      )}
    </div>
  );
}
