"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  type NodeMouseHandler,
  BackgroundVariant,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Agent, Recipe } from "@/lib/types";
import type { ComposerAgent, RoutingRule, HistoryEntry } from "@/lib/composer-types";
import { generateRoutingRules } from "@/lib/dispatcher-generator";

import { WorkerNode } from "./worker-node";
import { DispatcherNode } from "./dispatcher-node";
import { AgentPanel } from "./agent-panel";
import { PropertiesPanel } from "./properties-panel";
import { Toolbar } from "./toolbar";
import { ExportDialog } from "./export-dialog";

const DISPATCHER_NODE_ID = "dispatcher-main";

const nodeTypes = {
  worker: WorkerNode,
  dispatcher: DispatcherNode,
};

interface ComposerClientProps {
  agents: Agent[];
  recipes: Recipe[];
}

export function ComposerClient({ agents, recipes }: ComposerClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [composerAgents, setComposerAgents] = useState<ComposerAgent[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [dispatcherName, setDispatcherName] = useState("总调度中心");
  const [exportOpen, setExportOpen] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [activeRecipeName, setActiveRecipeName] = useState<string | null>(null);

  const pushHistory = useCallback(
    (n: Node[], e: Edge[], a: ComposerAgent[], r: RoutingRule[]) => {
      if (isUndoRedoRef.current) return;
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        return [
          ...trimmed,
          { nodes: n, edges: e, agents: a, routingRules: r },
        ];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    isUndoRedoRef.current = true;
    const entry = history[historyIndex - 1];
    setNodes(entry.nodes as Node[]);
    setEdges(entry.edges as Edge[]);
    setComposerAgents(entry.agents);
    setRoutingRules(entry.routingRules);
    setHistoryIndex((i) => i - 1);
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    isUndoRedoRef.current = true;
    const entry = history[historyIndex + 1];
    setNodes(entry.nodes as Node[]);
    setEdges(entry.edges as Edge[]);
    setComposerAgents(entry.agents);
    setRoutingRules(entry.routingRules);
    setHistoryIndex((i) => i + 1);
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
  }, [history, historyIndex, setNodes, setEdges]);

  // Update node selection status in data
  const updateNodeSelection = useCallback(
    (nodeId: string | null) => {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isSelected: n.id === nodeId },
        }))
      );
    },
    [setNodes]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
      updateNodeSelection(node.id);
    },
    [updateNodeSelection]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    updateNodeSelection(null);
  }, [updateNodeSelection]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  const selectedType = useMemo(() => {
    if (!selectedNodeId) return null;
    if (selectedNodeId === DISPATCHER_NODE_ID) return "dispatcher" as const;
    return "worker" as const;
  }, [selectedNodeId]);

  // Handle drop from agent panel
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/soulhub-agent");
      if (!raw) return;

      const agentData = JSON.parse(raw) as {
        name: string;
        displayName: string;
        description: string;
        category: string;
        tags: string[];
      };

      // Check if agent already exists on canvas
      if (composerAgents.some((a) => a.name === agentData.name)) return;

      const reactFlowInstance = reactFlowInstanceRef.current;
      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeId = `worker-${agentData.name}-${Date.now()}`;
      const isFirst = composerAgents.length === 0;

      const newAgent: ComposerAgent = {
        ...agentData,
        nodeId,
      };

      const newAgents = [...composerAgents, newAgent];
      const newRules = generateRoutingRules(newAgents);

      // Create worker node
      const workerNode: Node = {
        id: nodeId,
        type: "worker",
        position,
        data: {
          label: agentData.displayName,
          description: agentData.description,
          category: agentData.category,
          isSelected: false,
        },
      };

      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (isFirst) {
        // Create dispatcher node at top-center
        const dispatcherNode: Node = {
          id: DISPATCHER_NODE_ID,
          type: "dispatcher",
          position: { x: position.x - 10, y: position.y - 200 },
          data: {
            label: dispatcherName,
            isSelected: false,
          },
          draggable: true,
        };
        newNodes = [...nodes, dispatcherNode, workerNode];
      } else {
        newNodes = [...nodes, workerNode];
      }

      // Create edge from dispatcher to worker
      const newEdge: Edge = {
        id: `edge-${DISPATCHER_NODE_ID}-${nodeId}`,
        source: DISPATCHER_NODE_ID,
        target: nodeId,
        animated: true,
        style: { stroke: "rgba(99, 102, 241, 0.5)", strokeWidth: 2 },
      };
      newEdges = [...edges, newEdge];

      setNodes(newNodes);
      setEdges(newEdges);
      setComposerAgents(newAgents);
      setRoutingRules(newRules);
      pushHistory(newNodes, newEdges, newAgents, newRules);
    },
    [composerAgents, dispatcherName, edges, nodes, pushHistory, setEdges, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Delete nodes
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id));
      const deletedDispatcher = deletedIds.has(DISPATCHER_NODE_ID);

      let newAgents = composerAgents.filter(
        (a) => !deletedIds.has(a.nodeId)
      );

      let newNodes: Node[];
      let newEdges: Edge[];

      if (deletedDispatcher || newAgents.length === 0) {
        // Remove everything if dispatcher deleted or last worker removed
        newAgents = [];
        newNodes = [];
        newEdges = [];
      } else {
        newNodes = nodes.filter((n) => !deletedIds.has(n.id));
        newEdges = edges.filter(
          (e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)
        );
      }

      const newRules = newAgents.length > 0 ? generateRoutingRules(newAgents) : [];

      setNodes(newNodes);
      setEdges(newEdges);
      setComposerAgents(newAgents);
      setRoutingRules(newRules);
      setSelectedNodeId(null);
      pushHistory(newNodes, newEdges, newAgents, newRules);
    },
    [composerAgents, edges, nodes, pushHistory, setEdges, setNodes]
  );

  // Auto layout - tree layout
  const autoLayout = useCallback(() => {
    if (composerAgents.length === 0) return;

    const HORIZONTAL_SPACING = 250;
    const VERTICAL_SPACING = 200;
    const totalWidth = composerAgents.length * HORIZONTAL_SPACING;
    const startX = -totalWidth / 2 + HORIZONTAL_SPACING / 2;

    const newNodes = nodes.map((node) => {
      if (node.id === DISPATCHER_NODE_ID) {
        return {
          ...node,
          position: { x: 0, y: 0 },
        };
      }
      const agentIndex = composerAgents.findIndex(
        (a) => a.nodeId === node.id
      );
      if (agentIndex >= 0) {
        return {
          ...node,
          position: {
            x: startX + agentIndex * HORIZONTAL_SPACING,
            y: VERTICAL_SPACING,
          },
        };
      }
      return node;
    });

    setNodes(newNodes);
    pushHistory(newNodes, edges, composerAgents, routingRules);

    // Fit view after layout
    setTimeout(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.2 });
    }, 50);
  }, [composerAgents, edges, nodes, pushHistory, routingRules, setNodes]);

  // 一键加载预设团队配方
  const loadRecipe = useCallback(
    (recipe: Recipe) => {
      // 根据 recipe.agents 名称列表，从 agents 中找到对应的 Agent 对象
      const recipeAgents = recipe.agents
        .map((name) => agents.find((a) => a.name === name))
        .filter(Boolean) as Agent[];

      if (recipeAgents.length === 0) return;

      const HORIZONTAL_SPACING = 250;
      const totalWidth = recipeAgents.length * HORIZONTAL_SPACING;
      const startX = -totalWidth / 2 + HORIZONTAL_SPACING / 2;

      // 构建 ComposerAgent 和 Node
      const newComposerAgents: ComposerAgent[] = [];
      const newWorkerNodes: Node[] = [];
      const newEdges: Edge[] = [];

      recipeAgents.forEach((agent, idx) => {
        const nodeId = `worker-${agent.name}-${Date.now()}-${idx}`;
        newComposerAgents.push({
          name: agent.name,
          displayName: agent.displayName,
          description: agent.description,
          category: agent.category,
          tags: agent.tags,
          nodeId,
        });

        newWorkerNodes.push({
          id: nodeId,
          type: "worker",
          position: {
            x: startX + idx * HORIZONTAL_SPACING,
            y: 200,
          },
          data: {
            label: agent.displayName,
            description: agent.description,
            category: agent.category,
            isSelected: false,
          },
        });

        newEdges.push({
          id: `edge-${DISPATCHER_NODE_ID}-${nodeId}`,
          source: DISPATCHER_NODE_ID,
          target: nodeId,
          animated: true,
          style: { stroke: "rgba(99, 102, 241, 0.5)", strokeWidth: 2 },
        });
      });

      // 创建调度中心节点
      const dispatcherNode: Node = {
        id: DISPATCHER_NODE_ID,
        type: "dispatcher",
        position: { x: 0, y: 0 },
        data: {
          label: dispatcherName,
          isSelected: false,
        },
        draggable: true,
      };

      const allNodes = [dispatcherNode, ...newWorkerNodes];
      const newRules = generateRoutingRules(newComposerAgents);

      setNodes(allNodes);
      setEdges(newEdges);
      setComposerAgents(newComposerAgents);
      setRoutingRules(newRules);
      setSelectedNodeId(null);
      setActiveRecipeName(recipe.name);
      pushHistory(allNodes, newEdges, newComposerAgents, newRules);

      // 加载后自动居中视图
      setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ padding: 0.2 });
      }, 100);
    },
    [agents, dispatcherName, pushHistory, setEdges, setNodes]
  );

  // Download ZIP
  const downloadZip = useCallback(async () => {
    const JSZip = (await import("jszip")).default;
    const fileSaverModule = await import("file-saver");
    const saveAs = fileSaverModule.saveAs || fileSaverModule.default;
    const { generateDispatcherIdentity, generateDispatcherSoul } = await import(
      "@/lib/dispatcher-generator"
    );

    const zip = new JSZip();

    // Dispatcher 目录名
    const dispatcherDirName = dispatcherName;

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

    for (const agent of composerAgents) {
      const agentDir = zip.folder(agent.name);
      if (agentDir) {
        agentDir.file(
          "IDENTITY.md",
          `# ${agent.displayName}\n\n${agent.description}\n\nCategory: ${agent.category}\nTags: ${agent.tags.join(", ")}\n`
        );
        agentDir.file(
          "SOUL.md",
          `# ${agent.displayName} Soul\n\n// TODO: Configure soul for ${agent.name}\n`
        );
      }
    }

    // soulhub.yaml — 统一包描述格式
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
          ...r.keywords.map((k: string) => `      - "${k}"`),
          `    target: ${r.targetAgent}`,
        ].join("\n")),
      ] : []),
      ``,
      `metadata:`,
      `  author: soulhub`,
      `  exportedAt: "${new Date().toISOString()}"`,
    ].join("\n");
    zip.file("soulhub.yaml", soulhubYaml);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(
      blob,
      `${dispatcherName.toLowerCase().replace(/\s+/g, "-")}-team.zip`
    );
  }, [composerAgents, dispatcherName, routingRules]);

  const onUpdateRules = useCallback(
    (newRules: RoutingRule[]) => {
      setRoutingRules(newRules);
      pushHistory(nodes, edges, composerAgents, newRules);
    },
    [composerAgents, edges, nodes, pushHistory]
  );

  // Update dispatcher node label when name changes
  const onDispatcherNameChange = useCallback(
    (name: string) => {
      setDispatcherName(name);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === DISPATCHER_NODE_ID
            ? { ...n, data: { ...n.data, label: name } }
            : n
        )
      );
    },
    [setNodes]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Left Panel - Agent Selection */}
      <AgentPanel agents={agents} recipes={recipes} onLoadRecipe={loadRecipe} activeRecipeName={activeRecipeName} />

      {/* Center - React Flow Canvas */}
      <div className="relative flex-1 flex flex-col">
        {/* Page Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(var(--glass-border)/0.1)]">
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-gradient">Pick Your 🦞</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              拖拽🦞到画布，自动生成调度中心，可视化编排你的 Agent Team
            </p>
          </div>
          {composerAgents.length > 0 && (
            <span className="text-xs text-muted-foreground bg-[hsl(var(--glass-bg)/0.05)] px-2 py-1 rounded-md">
              {composerAgents.length} 个🦞已就位
            </span>
          )}
        </div>

        {/* Canvas */}
        <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance;
          }}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
          className="composer-flow"
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.05)"
          />
          <Controls
            className="!bg-[hsl(var(--glass-bg)/0.05)] !border-[hsl(var(--glass-border)/0.1)] !rounded-lg [&>button]:!bg-[hsl(var(--glass-bg)/0.05)] [&>button]:!border-[hsl(var(--glass-border)/0.1)] [&>button]:!text-[hsl(var(--glass-bg)/0.5)] [&>button:hover]:!bg-[hsl(var(--glass-bg)/0.1)] [&>button:hover]:!text-[hsl(var(--glass-bg)/1)]"
          />
          <MiniMap
            className="!bg-[hsl(var(--glass-bg)/0.05)] !border-[hsl(var(--glass-border)/0.1)] !rounded-lg"
            nodeColor={(node) =>
              node.type === "dispatcher"
                ? "rgba(59, 130, 246, 0.6)"
                : "rgba(255, 255, 255, 0.2)"
            }
            maskColor="rgba(0, 0, 0, 0.7)"
          />
        </ReactFlow>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--glass-bg)/0.05)] border border-[hsl(var(--glass-border)/0.1)] border-dashed">
                <svg
                  className="h-8 w-8 text-[hsl(var(--glass-bg)/0.15)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm text-[hsl(var(--glass-bg)/0.25)]">
                从左侧面板拖入想要的 🦞 开始编排
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--glass-bg)/0.15)]">
                调度中心将自动生成
              </p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <Toolbar
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          hasAgents={composerAgents.length > 0}
          onUndo={undo}
          onRedo={redo}
          onAutoLayout={autoLayout}
          onExport={() => setExportOpen(true)}
          onDownloadZip={downloadZip}
        />
        </div>
      </div>

      {/* Right Panel - Properties */}
      <PropertiesPanel
        selectedNodeId={selectedNodeId}
        selectedType={selectedType}
        composerAgents={composerAgents}
        routingRules={routingRules}
        dispatcherName={dispatcherName}
        onDispatcherNameChange={onDispatcherNameChange}
        onUpdateRules={onUpdateRules}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        composerAgents={composerAgents}
        routingRules={routingRules}
        dispatcherName={dispatcherName}
        activeRecipeName={activeRecipeName}
      />
    </div>
  );
}
