export interface RoutingRule {
  id: string;
  keywords: string[];
  targetAgent: string;
  targetDisplayName: string;
  description: string;
}

export interface ComposerAgent {
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  nodeId: string;
}

export interface ComposerState {
  agents: ComposerAgent[];
  routingRules: RoutingRule[];
  dispatcherName: string;
}

export interface HistoryEntry {
  nodes: unknown[];
  edges: unknown[];
  agents: ComposerAgent[];
  routingRules: RoutingRule[];
}
