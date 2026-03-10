import { Navbar } from "@/components/ui/navbar";
import { BookOpen, Terminal, Puzzle, Rocket, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "📖 文档中心 - SoulHub",
  description:
    "SoulHub 使用指南、Soul 定义规范、CLI 工具文档与 API 参考。",
};

const docSections = [
  {
    icon: Rocket,
    title: "快速开始",
    description: "5 分钟上手 SoulHub，从安装到发布你的第一只🦞",
    href: "#",
  },
  {
    icon: FileText,
    title: "Soul 定义规范",
    description: "用 Markdown 定义人格、技能树和行为边界的完整语法指南",
    href: "#",
  },
  {
    icon: Terminal,
    title: "CLI 工具",
    description: "一行命令安装、测试、发布 Soul，开发者的瑞士军刀",
    href: "#",
  },
  {
    icon: Puzzle,
    title: "Fusion 编排",
    description: "多 Agent 团队协作编排指南，让你的🦞们各司其职",
    href: "#",
  },
  {
    icon: BookOpen,
    title: "API 参考",
    description: "完整的 SoulHub API 文档，支持集成到你的应用中",
    href: "#",
  },
  {
    icon: MessageSquare,
    title: "社区与贡献",
    description: "参与社区共建，提交你调教好的 Soul 模板",
    href: "#",
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container mx-auto px-6 py-16">
          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              📖 文档中心
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从零开始，学会调教你的专属🦞。无论你是新手还是老养殖户，都能找到需要的指南。
            </p>
          </div>

          {/* Doc Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {docSections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                  <section.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center mt-16 py-8 border-t border-border/30">
            <p className="text-muted-foreground text-sm">
              🚧 文档正在持续完善中，欢迎到{" "}
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub
              </Link>{" "}
              参与贡献
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
