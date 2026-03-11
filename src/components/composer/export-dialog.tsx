"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Copy, Download, Check, Terminal, Loader2 } from "lucide-react";
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
  const [copyError, setCopyError] = useState(false);
  const [installCommand, setInstallCommand] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 当对话框打开时，调用 API 保存配置并获取真实的分享链接
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function saveComposition() {
      setSaving(true);
      setSaveError(null);
      setInstallCommand("");

      try {
        const config = {
          dispatcherName,
          agents: composerAgents.map((a) => ({
            name: a.name,
            displayName: a.displayName,
            description: a.description,
            category: a.category,
            tags: a.tags,
            identity: generateDispatcherIdentity(composerAgents, routingRules),
          })),
          routingRules: routingRules.map((r) => ({
            keywords: r.keywords,
            targetAgent: r.targetAgent,
          })),
          dispatcher: {
            name: dispatcherName,
            identity: generateDispatcherIdentity(composerAgents, routingRules),
            soul: generateDispatcherSoul(composerAgents, routingRules),
          },
        };

        const res = await fetch("/api/compose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });

        if (!res.ok) {
          throw new Error(`保存失败: ${res.statusText}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setInstallCommand(data.installCommand || `soulhub install --from ${data.shareUrl}`);
        }
      } catch (err) {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : "保存配置失败");
          // API 失败时不生成假链接，安装命令置空
          setInstallCommand("");
        }
      } finally {
        if (!cancelled) {
          setSaving(false);
        }
      }
    }

    saveComposition();
    return () => { cancelled = true; };
  }, [open, composerAgents, routingRules, dispatcherName]);

  const copyCommand = useCallback(async () => {
    try {
      // 优先使用 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(installCommand);
      } else {
        // Fallback: 使用 textarea + execCommand 兼容 HTTP 环境
        const textarea = document.createElement("textarea");
        textarea.value = installCommand;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [installCommand]);

  const downloadZip = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const fileSaverModule = await import("file-saver");
    const saveAs = fileSaverModule.saveAs || fileSaverModule.default;

    const zip = new JSZip();

    // Dispatcher 目录名
    const dispatcherDirName = dispatcherName;

    // Dispatcher files
    const dispatcherDir = zip.folder(dispatcherDirName);
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

    // 🆕 soulhub.yaml — 统一包描述格式（类似 Helm Chart.yaml）
    const soulhubYaml = [
      `apiVersion: v1`,
      `kind: team`,
      `name: ${dispatcherName.toLowerCase().replace(/\s+/g, "-")}-team`,
      `version: "1.0.0"`,
      `description: "${dispatcherName} 团队"`,
      ``,
      `dispatcher:`,
      `  name: "${dispatcherName}"`,
      `  dir: "${dispatcherDirName}"`,
      ``,
      `agents:`,
      ...composerAgents.map((a) => [
        `  - name: ${a.name}`,
        `    dir: ${a.name}`,
        `    role: worker`,
        `    displayName: "${a.displayName}"`,
      ].join("\n")),
      ``,
      ...(routingRules.length > 0 ? [
        `routing:`,
        ...routingRules.map((r) => [
          `  - keywords:`,
          ...r.keywords.map((k) => `      - "${k}"`),
          `    target: ${r.targetAgent}`,
        ].join("\n")),
      ] : []),
      ``,
      `metadata:`,
      `  author: soulhub`,
      `  exportedAt: "${new Date().toISOString()}"`,
    ].join("\n");
    zip.file("soulhub.yaml", soulhubYaml);

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
          className="absolute right-4 top-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
            <p className="text-xs text-muted-foreground">
              {composerAgents.length} 个灵魂 + 调度中心
            </p>
          </div>
        </div>

        {/* Install Command */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-2 block">
            安装命令
          </label>
          <div className="relative group">
            {saving ? (
              <div className="rounded-lg bg-gray-900 dark:bg-black/40 border border-border p-3 text-xs text-muted-foreground font-mono flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                正在生成分享链接...
              </div>
            ) : !installCommand ? (
              <div className="rounded-lg bg-gray-900 dark:bg-black/40 border border-border p-3 text-xs text-yellow-400 font-mono">
                ⚠ 安装命令不可用，请使用下方"下载 ZIP 压缩包"手动安装
              </div>
            ) : (
              <>
                <pre className="rounded-lg bg-gray-900 dark:bg-black/40 border border-border p-3 pr-12 text-xs text-green-400 dark:text-green-300 font-mono overflow-x-auto">
                  {installCommand}
                </pre>
                <button
                  onClick={copyCommand}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200",
                    copied
                      ? "bg-green-500/20 text-green-400"
                      : copyError
                      ? "bg-red-500/20 text-red-400"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                  title={copyError ? "复制失败，请手动复制" : "复制命令"}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
          {copyError && (
            <p className="text-xs text-red-500 mt-1">复制失败，请手动选择命令文本复制</p>
          )}
          {saveError && (
            <p className="text-xs text-yellow-500 mt-1">⚠ {saveError}（使用了本地降级链接）</p>
          )}
        </div>

        {/* Agents summary */}
        <div className="mb-6 rounded-lg bg-muted/50 border border-border p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
            Included Agents
          </p>
          <div className="flex flex-wrap gap-1">
            {composerAgents.map((a) => (
              <span
                key={a.nodeId}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/70">
                🦞 {a.displayName}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadZip}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-all"
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
