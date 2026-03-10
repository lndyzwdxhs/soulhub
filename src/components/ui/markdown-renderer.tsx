"use client";

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface Block {
  type: string;
  content: string;
  language?: string;
  items?: string[];
  ordered?: boolean;
  level?: number;
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`, [link](url)
  const regex =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // **bold**
      nodes.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      nodes.push(
        <em key={match.index} className="italic">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // `inline code`
      nodes.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-[hsl(var(--glass-bg)/0.1)] text-sm font-mono text-violet-300"
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // [link](url)
      nodes.push(
        <a
          key={match.index}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      blocks.push({ type: "hr", content: "" });
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Code blocks
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        language,
      });
      i++; // skip closing ```
      continue;
    }

    // Unordered lists
    if (/^[\s]*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", content: "", items, ordered: false });
      continue;
    }

    // Ordered lists
    if (/^[\s]*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", content: "", items, ordered: true });
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph - collect consecutive non-empty lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].trim().startsWith("```") &&
      !/^[\s]*[-*+]\s+/.test(lines[i]) &&
      !/^[\s]*\d+\.\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\*\*\*+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", content: paraLines.join("\n") });
    }
  }

  return blocks;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = parseBlocks(content);

  return (
    <div className={cn("space-y-4 text-muted-foreground leading-relaxed", className)}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading": {
            const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
            const sizes: Record<number, string> = {
              1: "text-2xl font-bold text-foreground mt-6 mb-3",
              2: "text-xl font-semibold text-foreground mt-5 mb-2",
              3: "text-lg font-semibold text-foreground mt-4 mb-2",
              4: "text-base font-medium text-foreground mt-3 mb-1",
            };
            return (
              <HeadingTag
                key={idx}
                className={sizes[block.level ?? 1]}
              >
                {parseInline(block.content)}
              </HeadingTag>
            );
          }

          case "paragraph":
            return (
              <p key={idx} className="text-sm leading-7">
                {parseInline(block.content)}
              </p>
            );

          case "code":
            return (
              <div key={idx} className="relative rounded-lg overflow-hidden">
                {block.language && (
                  <div className="px-4 py-1.5 bg-[hsl(var(--glass-bg)/0.05)] border-b border-[hsl(var(--glass-border)/0.1)] text-xs text-muted-foreground/60 font-mono">
                    {block.language}
                  </div>
                )}
                <pre className="p-4 bg-[hsl(var(--glass-bg)/0.05)] overflow-x-auto">
                  <code className="text-sm font-mono text-green-300/80 leading-6">
                    {block.content}
                  </code>
                </pre>
              </div>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={idx}
                className={cn(
                  "space-y-1.5 pl-5 text-sm",
                  block.ordered ? "list-decimal" : "list-disc"
                )}
              >
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-7 text-muted-foreground">
                    {parseInline(item)}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "hr":
            return (
              <hr key={idx} className="border-[hsl(var(--glass-border)/0.1)] my-6" />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
