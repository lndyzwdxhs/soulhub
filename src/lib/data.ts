import {
  PenTool,
  Code,
  Settings,
  Headphones,
  GraduationCap,
  Network,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";
import type { AgentIndex, Category } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "self-media",
    name: "自媒体",
    nameEn: "Self Media",
    icon: "pen-tool",
    description: "Content creation and social media management",
  },
  {
    id: "development",
    name: "开发",
    nameEn: "Development",
    icon: "code",
    description: "Software development and engineering tools",
  },
  {
    id: "operations",
    name: "运营",
    nameEn: "Operations",
    icon: "settings",
    description: "Business operations and data analysis",
  },
  {
    id: "support",
    name: "客服",
    nameEn: "Support",
    icon: "headphones",
    description: "Customer support and service management",
  },
  {
    id: "education",
    name: "教育",
    nameEn: "Education",
    icon: "graduation-cap",
    description: "Teaching, tutoring, and learning tools",
  },
  {
    id: "dispatcher",
    name: "调度",
    nameEn: "Dispatcher",
    icon: "network",
    description: "Task routing and multi-agent orchestration",
  },
  {
    id: "clawtown",
    name: "ClawTown角色",
    nameEn: "ClawTown",
    icon: "gamepad-2",
    description: "ClawTown 小镇模拟游戏角色，每只小龙虾都有独特的人格与故事",
  },
];

const iconMap: Record<string, LucideIcon> = {
  "pen-tool": PenTool,
  code: Code,
  settings: Settings,
  headphones: Headphones,
  "graduation-cap": GraduationCap,
  network: Network,
  "gamepad-2": Gamepad2,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (category) {
    return iconMap[category.icon] || Code;
  }
  return Code;
}

export function getCategoryLabel(categoryId: string): string {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category?.name ?? categoryId;
}
