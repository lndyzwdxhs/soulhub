"use client";

import { useState } from "react";
import {
  Crown,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/data";
import type { ComposerAgent, RoutingRule } from "@/lib/composer-types";
import { RoutingEditor } from "./routing-editor";
import {
  generateDispatcherIdentity,
  generateDispatcherSoul,
} from "@/lib/dispatcher-generator";

interface PropertiesPanelProps {
  selectedNodeId: string | null;
  selectedType: "dispatcher" | "worker" | null;
  composerAgents: ComposerAgent[];
  routingRules: RoutingRule[];
  dispatcherName: string;
  onDispatcherNameChange: (name: string) => void;
  onUpdateRules: (rules: RoutingRule[]) => void;
}

export function PropertiesPanel({
  selectedNodeId,
  selectedType,
  composerAgents,
  routingRules,
  dispatcherName,
  onDispatcherNameChange,
  onUpdateRules,
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["info", "routing", "identity"])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAgent = composerAgents.find(
    (a) => a.nodeId === selectedNodeId
  );

  if (!selectedNodeId || !selectedType) {
    return (
      <div className="flex h-full w-[320px] flex-col items-center justify-center border-l border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)] px-8">
        <MousePointerClick className="h-10 w-10 text-[hsl(var(--glass-bg)/0.1)] mb-3" />
        <p className="text-sm text-[hsl(var(--glass-bg)/0.3)] text-center">
          点击节点查看属性
        </p>
        <p className="text-xs text-[hsl(var(--glass-bg)/0.15)] text-center mt-1">
          选择画布上的任意节点
        </p>
      </div>
    );
  }

  const identityMd =
    selectedType === "dispatcher"
      ? generateDispatcherIdentity(composerAgents, routingRules)
      : null;
  const soulMd =
    selectedType === "dispatcher"
      ? generateDispatcherSoul(composerAgents, routingRules)
      : null;

  const SectionHeader = ({
    id,
    icon: Icon,
    label,
  }: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex w-full items-center gap-2 py-2 text-xs font-medium text-[hsl(var(--glass-bg)/0.5)] hover:text-[hsl(var(--glass-bg)/0.7)] transition-colors"
    >
      {expandedSections.has(id) ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronRight className="h-3 w-3" />
      )}
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="flex h-full w-[320px] flex-col border-l border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.02)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[hsl(var(--glass-border)/0.1)] px-4 py-3">
        {selectedType === "dispatcher" ? (
          <Crown className="h-4 w-4 text-blue-400" />
        ) : (
          <User className="h-4 w-4 text-[hsl(var(--glass-bg)/0.6)]" />
        )}
        <h2 className="text-sm font-semibold text-white">
          {selectedType === "dispatcher" ? "🦞 调度中心" : "灵魂节点"}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {/* Info Section */}
        <SectionHeader
          id="info"
          icon={selectedType === "dispatcher" ? Crown : User}
          label="基本信息"
        />
        {expandedSections.has("info") && (
          <div className="space-y-3 pb-3">
            {selectedType === "dispatcher" ? (
              <>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    调度中心名称
                  </label>
                  <input
                    value={dispatcherName}
                    onChange={(e) => onDispatcherNameChange(e.target.value)}
                    className="mt-1 w-full rounded-md bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] px-2.5 py-1.5 text-xs text-white outline-none focus:border-[hsl(var(--glass-border)/0.2)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    已连接灵魂
                  </label>
                  <p className="mt-1 text-xs text-[hsl(var(--glass-bg)/0.6)]">
                    {composerAgents.length} 个灵魂
                  </p>
                </div>
              </>
            ) : selectedAgent ? (
              <>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    名称
                  </label>
                  <p className="mt-1 text-xs text-[hsl(var(--glass-bg)/0.8)]">
                    {selectedAgent.displayName}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    ID
                  </label>
                  <p className="mt-1 text-xs text-[hsl(var(--glass-bg)/0.5)] font-mono">
                    {selectedAgent.name}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    描述
                  </label>
                  <p className="mt-1 text-xs text-[hsl(var(--glass-bg)/0.6)]">
                    {selectedAgent.description}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    分类
                  </label>
                  <div className="mt-1 flex items-center gap-1.5">
                    {(() => {
                      const CatIcon = getCategoryIcon(selectedAgent.category);
                      return <CatIcon className="h-3 w-3 text-[hsl(var(--glass-bg)/0.4)]" />;
                    })()}
                    <span className="text-xs text-[hsl(var(--glass-bg)/0.6)]">
                      {selectedAgent.category}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    标签
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedAgent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[hsl(var(--glass-bg)/0.1)] px-2 py-0.5 text-[10px] text-[hsl(var(--glass-bg)/0.5)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Routing Section (Dispatcher only) */}
        {selectedType === "dispatcher" && (
          <>
            <SectionHeader
              id="routing"
              icon={FileText}
              label="路由规则"
            />
            {expandedSections.has("routing") && (
              <div className="pb-3">
                <RoutingEditor
                  rules={routingRules}
                  onUpdateRules={onUpdateRules}
                />
              </div>
            )}
          </>
        )}

        {/* Generated Files Preview */}
        {selectedType === "dispatcher" && identityMd && soulMd && (
          <>
            <SectionHeader
              id="identity"
              icon={FileText}
              label="生成文件预览"
            />
            {expandedSections.has("identity") && (
              <div className="space-y-3 pb-3">
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    IDENTITY.md
                  </label>
                  <pre
                    className={cn(
                      "mt-1 max-h-40 overflow-auto rounded-md p-2 text-[10px] leading-relaxed",
                      "bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] text-[hsl(var(--glass-bg)/0.5)] font-mono whitespace-pre-wrap"
                    )}
                  >
                    {identityMd}
                  </pre>
                </div>
                <div>
                  <label className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider">
                    SOUL.md
                  </label>
                  <pre
                    className={cn(
                      "mt-1 max-h-40 overflow-auto rounded-md p-2 text-[10px] leading-relaxed",
                      "bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] text-[hsl(var(--glass-bg)/0.5)] font-mono whitespace-pre-wrap"
                    )}
                  >
                    {soulMd}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
