"use client";

import { useState, useCallback } from "react";
import { X, Copy, Download, Check, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComposerAgent, RoutingRule } from "@/lib/composer-types";
import {
  generateDispatcherIdentity,
  generateDispatcherSoul,
} from "@/lib/dispatcher-generator";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  composerAgents: ComposerAgent[];
  routingRules: RoutingRule[];
  dispatcherName: string;
}

export function ExportDialog({
  open,
  onClose,
  composerAgents,
  routingRules,
  dispatcherName,
}: ExportDialogProps) {
  const [copied, setCopied] = useState(false);

  const installCommand = `soulhub install --from https://soulhub.dev/share/${dispatcherName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;

  const copyCommand = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [installCommand]);

  const downloadZip = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const fileSaverModule = await import("file-saver");
    const saveAs = fileSaverModule.saveAs || fileSaverModule.default;

    const zip = new JSZip();

    // Dispatcher files
    const dispatcherDir = zip.folder(
      dispatcherName.toLowerCase().replace(/\s+/g, "-")
    );
    if (dispatcherDir) {
      dispatcherDir.file(
        "IDENTITY.md",
        generateDispatcherIdentity(composerAgents, routingRules)
      );
      dispatcherDir.file(
        "SOUL.md",
        generateDispatcherSoul(composerAgents, routingRules)
      );
    }

    // Worker agent placeholder files
    for (const agent of composerAgents) {
      const agentDir = zip.folder(agent.name);
      if (agentDir) {
        agentDir.file(
          "IDENTITY.md",
          `# ${agent.displayName}\n\n${agent.description}\n\nCategory: ${agent.category}\nTags: ${agent.tags.join(", ")}\n`
        );
        agentDir.file("SOUL.md", `# ${agent.displayName} Soul\n\n// TODO: Configure soul for ${agent.name}\n`);
      }
    }

    // Manifest
    const manifest = {
      name: dispatcherName,
      agents: [
        {
          name: dispatcherName.toLowerCase().replace(/\s+/g, "-"),
          role: "dispatcher",
        },
        ...composerAgents.map((a) => ({ name: a.name, role: "worker" })),
      ],
      routingRules: routingRules.map((r) => ({
        keywords: r.keywords,
        target: r.targetAgent,
      })),
      exportedAt: new Date().toISOString(),
    };
    zip.file("openclaw-agents.json", JSON.stringify(manifest, null, 2));

    // Install instructions
    zip.file(
      "INSTALL.md",
      `# Installation\n\n## Using SoulHub CLI\n\n\`\`\`bash\n${installCommand}\n\`\`\`\n\n## Manual Installation\n\n1. Copy each agent directory to your OpenClaw agents folder\n2. Configure the dispatcher as your main entry point\n3. Each agent directory contains IDENTITY.md and SOUL.md\n`
    );

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${dispatcherName.toLowerCase().replace(/\s+/g, "-")}-team.zip`);
  }, [composerAgents, routingRules, dispatcherName, installCommand]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl glass p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-[hsl(var(--glass-bg)/0.3)] hover:text-white hover:bg-[hsl(var(--glass-bg)/0.1)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              🦞 导出团队配置
            </h3>
            <p className="text-xs text-[hsl(var(--glass-bg)/0.4)]">
              {composerAgents.length} 个灵魂 + 调度中心
            </p>
          </div>
        </div>

        {/* Install Command */}
        <div className="mb-4">
          <label className="text-xs text-[hsl(var(--glass-bg)/0.5)] mb-2 block">
            安装命令
          </label>
          <div className="relative group">
            <pre className="rounded-lg bg-black/40 border border-[hsl(var(--glass-border)/0.1)] p-3 pr-12 text-xs text-green-300 font-mono overflow-x-auto">
              {installCommand}
            </pre>
            <button
              onClick={copyCommand}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200",
                copied
                  ? "bg-green-500/20 text-green-400"
                  : "text-[hsl(var(--glass-bg)/0.3)] hover:text-white hover:bg-[hsl(var(--glass-bg)/0.1)]"
              )}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Agents summary */}
        <div className="mb-6 rounded-lg bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] p-3">
          <p className="text-[10px] text-[hsl(var(--glass-bg)/0.4)] uppercase tracking-wider mb-2">
            Included Agents
          </p>
          <div className="flex flex-wrap gap-1">
            {composerAgents.map((a) => (
              <span
                key={a.nodeId}
                className="rounded-full bg-[hsl(var(--glass-bg)/0.1)] px-2 py-0.5 text-[10px] text-[hsl(var(--glass-bg)/0.6)]">
                🦞 {a.displayName}              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadZip}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--glass-border)/0.1)] bg-[hsl(var(--glass-bg)/0.05)] px-4 py-2.5 text-sm text-[hsl(var(--glass-bg)/0.7)] hover:bg-[hsl(var(--glass-bg)/0.1)] hover:text-white transition-all"
          >
            <Download className="h-4 w-4" />
            下载 ZIP 压缩包
          </button>
          <button
            onClick={copyCommand}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400 shadow-lg shadow-blue-500/20"
            )}
          >
            <Copy className="h-4 w-4" />
            {copied ? "已复制 ✅" : "复制命令"}
          </button>
        </div>
      </div>
    </div>
  );
}
