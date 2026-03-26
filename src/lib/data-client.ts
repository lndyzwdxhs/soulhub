import {
  PenTool,
  Code,
  GraduationCap,
  Network,
  Palette,
  Compass,
  Shield,
  Microscope,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

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
    id: "education",
    name: "教育",
    nameEn: "Education",
    icon: "graduation-cap",
    description: "Teaching, tutoring, and learning tools",
  },
  {
    id: "design",
    name: "设计",
    nameEn: "Design",
    icon: "palette",
    description: "UI/UX 设计、视觉设计、交互设计相关 Agent",
  },
  {
    id: "product",
    name: "产品",
    nameEn: "Product",
    icon: "compass",
    description: "产品管理、项目管理、数据分析相关 Agent",
  },
  {
    id: "security",
    name: "安全",
    nameEn: "Security",
    icon: "shield",
    description: "应用安全、威胁建模、安全审计相关 Agent",
  },
  {
    id: "dispatcher",
    name: "调度",
    nameEn: "Dispatcher",
    icon: "network",
    description: "Task routing and multi-agent orchestration",
  },
  {
    id: "research",
    name: "科研",
    nameEn: "Research",
    icon: "microscope",
    description: "药物发现、生物信息学、化学信息学等科学研究相关 Agent",
  },
];

const iconMap: Record<string, LucideIcon> = {
  "pen-tool": PenTool,
  code: Code,
  "graduation-cap": GraduationCap,
  palette: Palette,
  compass: Compass,
  shield: Shield,
  network: Network,
  microscope: Microscope,
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
