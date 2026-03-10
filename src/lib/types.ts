export interface Agent {
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  minClawVersion: string;
  files: Record<string, number>;
  downloads: number;
  stars: number;
}

export interface Recipe {
  name: string;
  displayName: string;
  description: string;
  agents: string[];
  version: string;
  author: string;
}

export interface AgentIndex {
  agents: Agent[];
  recipes: Recipe[];
}

export type Category = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
};

export type SortOption = "name" | "downloads" | "newest";
