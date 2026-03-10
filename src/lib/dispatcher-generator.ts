import type { ComposerAgent, RoutingRule } from "./composer-types";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  development: ["写代码", "调试", "技术实现", "代码审查", "部署", "开发", "编程"],
  "self-media": [
    "写文章",
    "内容创作",
    "小红书",
    "公众号",
    "知乎",
    "Twitter",
    "创作",
  ],
  operations: ["数据分析", "SEO", "文件整理", "增长", "运营", "优化"],
  support: ["客服", "投诉", "技术支持", "问题处理", "工单"],
  education: ["教学", "学习", "编程入门", "练习", "辅导"],
  dispatcher: ["调度", "协调", "任务分发"],
};

export function generateRoutingRules(agents: ComposerAgent[]): RoutingRule[] {
  return agents.map((agent) => {
    const categoryKeywords = CATEGORY_KEYWORDS[agent.category] ?? [];
    const combined = [...new Set([...categoryKeywords, ...agent.tags])];

    return {
      id: `rule-${agent.nodeId}`,
      keywords: combined,
      targetAgent: agent.name,
      targetDisplayName: agent.displayName,
      description: agent.description,
    };
  });
}

export function generateDispatcherIdentity(
  agents: ComposerAgent[],
  rules: RoutingRule[]
): string {
  const teamRows = agents
    .map((a) => {
      const rule = rules.find((r) => r.targetAgent === a.name);
      const keywords = rule?.keywords.slice(0, 4).join("、") ?? "";
      return `| ${a.displayName} | ${a.name} | ${a.description} | ${keywords} |`;
    })
    .join("\n");

  return `# 总调度中心

## 角色定义
你是一个多Agent团队的总调度中心，负责理解用户意图并将任务路由到最合适的专业Agent。

## 团队成员

| 名称 | ID | 职责 | 关键词 |
|------|-----|------|--------|
${teamRows}

## 调度原则
1. 分析用户输入，识别核心意图
2. 匹配最相关的专业Agent
3. 如果任务涉及多个领域，拆分子任务分别委派
4. 保持上下文连贯性，跟踪任务状态
5. 汇总各Agent结果，给出完整回复
`;
}

export function generateDispatcherSoul(
  agents: ComposerAgent[],
  rules: RoutingRule[]
): string {
  const routingBlocks = rules
    .map((rule) => {
      const keywordStr = rule.keywords.map((k) => `"${k}"`).join(", ");
      return `  - when:
      keywords: [${keywordStr}]
    delegate_to: "${rule.targetAgent}"
    description: "${rule.description}"`;
    })
    .join("\n\n");

  const agentList = agents.map((a) => `  - ${a.name}`).join("\n");

  return `# 调度灵魂配置

sessions_spawn:
  available_agents:
${agentList}

  routing_rules:
${routingBlocks}

  fallback:
    action: ask_clarification
    message: "我不太确定您的需求属于哪个领域，能否更详细地描述一下？"

  multi_intent:
    strategy: split_and_delegate
    merge_results: true
`;
}
