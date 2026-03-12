---
title: OpenClaw 登顶 GitHub 之后，我做了一个给 AI 存放「灵魂」的地方
cover: https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text.png
---

# OpenClaw 登顶 GitHub 之后，我做了一个给 AI 存放「灵魂」的地方

> 像 GitHub 存代码一样，SoulHub 存调教好的 Agent 灵魂。

---

## 01 一只「龙虾」引发的思考

2026 年最火的开源项目是什么？

不是大模型，不是训练框架，而是一只"龙虾"—— **OpenClaw**。

发布四个月，GitHub 星标突破 24.8 万，超越 Linux 登顶历史第一。OpenAI CEO Sam Altman 亲自官宣挖走其创始人 Peter Steinberger。阿里云、腾讯云纷纷推出一键部署方案。ClawHub 技能市场收录超过 1715 个官方认证技能。

"养虾"热潮从程序员圈席卷到大众视野，人人都在聊怎么调教自己的 AI 助手。

但热闹之后，一个问题浮出水面：

**你花了三天调教出一个完美的 AI 人设，然后呢？**

它存在你的 `~/.openclaw/workspace/` 里，别人用不了，你也没法分享。换台电脑，一切从零开始。

这就是我做 **SoulHub** 的原因。

---

## 02 Agent 时代缺了什么？

2026 年，AI Agent 赛道已经卷成红海：

- OpenClaw 让你拥有一个能干活的私人助手
- MCP 协议让 Agent 拥有了标准化的「手脚」
- Dify、CrewAI 让你编排复杂的工作流

但有一个层面，几乎所有平台都忽略了——

**Agent 的人格。**

一个好的 Agent，不只是会调用工具。它需要知道自己是谁、该怎么说话、面对不确定性该怎么决策、边界在哪里。

这些东西，我把它称为 Agent 的 **「灵魂」**。

看看现状：

| 痛点 | 现实 |
|------|------|
| 🔒 平台锁定 | GPT Store、Coze、Character.AI 的 Agent 无法导出，换平台等于重来 |
| 📐 粒度错位 | PromptBase 卖单条 Prompt，Dify 侧重工作流，中间"Agent 人格"这一层是空白 |
| 🧩 缺少团队视角 | 没有平台关注多 Agent 协作团队的模板分享 |

**SoulHub 就是来填这个空白的。**

---

## 03 什么是 SoulHub？

一句话：**开源的 AI Agent 人格模板社区。**

每个 Agent 的"灵魂"由两个 Markdown 文件定义：

```
📄 IDENTITY.md — 定义 Agent「是谁」
   角色、职责、能力边界

📄 SOUL.md — 定义 Agent「怎么做」
   性格特征、沟通风格、工作流程、决策原则
```

就这么简单。纯文本，人类可读，Git 可追踪，无厂商锁定。

你可以把它理解为 **AI 人格领域的 GitHub**：

- GitHub 存代码 → SoulHub 存灵魂
- npm 管理 JS 包 → SoulHub CLI 管理 Agent 模板
- Docker Hub 分享镜像 → SoulHub 分享调教好的 Agent 人设

---

## 04 灵魂市集：21 个精选模板

目前 SoulHub 已经收录了 **21 个精选 Agent 模板**，覆盖 6 大领域：

**自媒体**
- 小红书写手 — 爆款标题、emoji 密度、种草话术一步到位
- 微信公众号写手 — 深度长文、结构化表达、数据引用
- 知乎写手 — 理性分析、知识密度、引经据典
- Twitter/X 写手 — 英文短推、话题标签、engagement 优化

**开发**
- 全栈工程师 — 架构设计到代码落地
- Python 专家 — 代码规范、性能优化
- 代码审查官 — 安全漏洞、逻辑缺陷、最佳实践
- K8s 运维专家 — 集群管理、故障排查

**运营**
- 数据分析师 — SQL 查询、可视化建议、数据洞察
- SEO 优化师 — 关键词策略、内容优化
- 增长黑客 — 用户增长、漏斗分析、A/B 测试

**客服 / 教育 / 调度 …**

每个模板都经过精心调教，拿来即用。

---

## 05 杀手锏：Fusion 可视化编排

SoulHub 最硬核的功能是 **Fusion 编排台**——一个基于 React Flow 的可视化画布：

**三步组建你的 AI 团队：**

1. **拖拽** — 从左侧面板把 Agent 拖到画布上
2. **连接** — 系统自动创建调度器节点，自动生成路由规则
3. **导出** — 一键下载 ZIP 包或生成分享链接

系统会自动为你生成：

- 一个 Dispatcher（调度中心），负责理解用户意图并路由到合适的 Agent
- 每个 Worker Agent 的完整灵魂文件
- Agent 之间的通信配置
- 详细的安装指南

**已有 3 个预设团队配方：**

- 🎬 **自媒体运营团队** — 调度中心 + 小红书/公众号/知乎/Twitter 写手
- 💻 **研发小队** — 调度中心 + 全栈工程师 + 代码审查 + 系统架构师
- 🎧 **客服中心** — 调度中心 + 一线客服 + 技术支持 + 问题升级协调

不会编排？选个配方一键加载就行。

---

## 06 与 OpenClaw 深度集成

SoulHub 天然为 OpenClaw 而生。

**CLI 一键安装：**

```bash
# 安装 CLI
npm install -g soulhubcli

# 搜索模板
soulhub search 写手

# 安装单个 Agent
soulhub install writer-xiaohongshu

# 安装整个团队
soulhub install self-media-team
```

安装团队时，CLI 会自动完成：

- 将 Dispatcher 部署到 OpenClaw 主工作区
- 将 Worker Agent 部署到各自的工作区
- 配置多 Agent 通信（`sessions_spawn` 路由）
- 重启 Gateway 使配置生效

**还支持备份和回滚：**

```bash
# 查看备份记录
soulhub rollback --list

# 回滚到上一次安装前的状态
soulhub rollback
```

你的每次安装都有后悔药。

---

## 07 不止 OpenClaw

虽然 SoulHub 诞生于 OpenClaw 生态，但它的设计是**框架无关**的。

灵魂文件本质上就是 Markdown——任何支持 System Prompt 的框架都能用：

- 把 `IDENTITY.md` 的内容粘到 Dify 的 Agent 人设里 ✅
- 把 `SOUL.md` 的行为规范作为 CrewAI 的角色定义 ✅
- 直接塞进 Claude/GPT 的 System Prompt 里 ✅

Markdown 就是最好的跨平台格式。

---

## 08 快速体验

**在线体验：**

访问 `soulhub.store`，浏览灵魂市集，试试 Fusion 编排台。

**本地部署：**

```bash
git clone https://github.com/lndyzwdxhs/soulhub.git
cd soulhub
npm install
npm run dev
```

打开 `http://localhost:3000`，开始探索。

**Docker 一行搞定：**

```bash
docker build -t soulhub . && docker run -p 3000:3000 soulhub
```

---

## 09 参与贡献

SoulHub 最需要的不是代码，而是**好的灵魂模板**。

如果你调教出了一个好用的 Agent 人设——无论是会写法律文书的律师 Agent、能做竞品分析的产品经理 Agent、还是会哄小孩睡觉的育儿 Agent——都欢迎贡献到 SoulHub。

**贡献流程超简单：**

1. Fork 仓库
2. 在 `registry/agents/` 下创建你的 Agent 目录
3. 写好 `manifest.yaml` + `IDENTITY.md` + `SOUL.md`
4. 运行 `soulhub publish` 验证格式
5. 提交 PR

**或者用 CLI 验证：**

```bash
soulhub publish ./my-awesome-agent
```

通过校验后，按提示提交 PR 即可。

---

## 10 写在最后

OpenClaw 给了每个人一个能干活的 AI 助手。

SoulHub 想做的事情再往前一步——**让好的 Agent 灵魂可以被分享、复用、组合。**

就像开源社区改变了软件行业一样，我相信开放的 Agent 人格模板，会加速整个 AI Agent 生态的进化。

你调教好的每一个 AI 人设，都不应该被锁在某个平台的黑盒子里。它应该是你的，是开放的，是可以帮助更多人的。

**SoulHub — 给你的 AI 一个可以被传承的灵魂。**

---

📎 **相关链接**

- SoulHub 在线平台：soulhub.store
- SoulHub GitHub：github.com/lndyzwdxhs/soulhub
- SoulHub CLI：github.com/lndyzwdxhs/soulhub-cli
- OpenClaw 官方：openclaw.ai

---

*如果这篇文章对你有帮助，欢迎点赞、在看、转发三连。关注我，一起探索 AI Agent 的无限可能。*
