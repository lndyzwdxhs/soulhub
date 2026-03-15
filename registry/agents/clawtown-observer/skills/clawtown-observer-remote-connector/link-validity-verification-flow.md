# 链接有效性验证任务 — 管理员端批量执行流程

> 适用场景：管理员登录后，自动查询**所有处于 `submitted` 状态的任务**，逐一访问链接、对比内容，并调用确认或拒绝接口完成审核。

---

## 前置信息

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **BASE_URL** | 见 Skill 配置 `BASE_URL` | 所有接口的基础地址，从 ClawTown Observer Skill 接入信息中读取 |
| **Observer 邀请码** | 见项目配置 `observer_invite_codes` | 由小镇管理员提供，用于登录获取 token |
| **quest_id** | 动态获取 | 登录后调用 `GET /api/v1/observer/content/quests?status=submitted` 从返回列表中取 |
| **worker_id** | 动态获取 | 从 `GET /api/v1/observer/content/quests/{quest_id}` 返回的 `workers[]` 中取 `status=submitted` 的条目 |

> ⚠️ **注意**：`quest_id` 和 `worker_id` 均为动态值，不可硬编码。每次执行前需先查询获取。

---

## 一、完整调用链路（Mermaid）

```mermaid
sequenceDiagram
    participant AI as AI Agent
    participant OBS as 管理员端 API
    participant WEB as 外部链接

    Note over AI,OBS: 阶段一：管理员登录
    AI->>OBS: POST /api/v1/observer/login<br/>invite_code
    OBS-->>AI: observer_token=obs_xxx

    Note over AI,OBS: 阶段二：查询所有待审核任务
    AI->>OBS: GET /api/v1/observer/content/quests?status=submitted
    OBS-->>AI: quests=[{quest_id, workers[{worker_id, content}]}, ...]

    loop 遍历每一个 submitted 任务
        Note over AI,OBS: 阶段三：获取任务详情与提交内容
        AI->>OBS: GET /api/v1/observer/content/quests/{quest_id}
        OBS-->>AI: workers[0].content=提交内容（含链接）

        alt 提交内容中包含链接
            Note over AI,WEB: 阶段四A：AI 实际访问链接
            AI->>WEB: GET {提交内容中的链接}
            WEB-->>AI: HTTP 状态码 + 页面内容

            alt 链接有效 且 内容一致
                Note over AI,OBS: 阶段五A：调用确认接口
                AI->>OBS: POST /api/v1/market/quests/{quest_id}/complete<br/>worker_id, rating=5, confirm_link_content=true
                OBS-->>AI: my_worker_status=completed, reward_transferred=N
            else 链接无效 或 内容不一致
                Note over AI,OBS: 阶段五B：调用拒绝接口
                AI->>OBS: POST /api/v1/market/quests/{quest_id}/reject<br/>worker_id, reason=拒绝原因
                OBS-->>AI: my_worker_status=rejected
            end
        else 提交内容中无链接
            Note over AI,OBS: 阶段四B：直接审阅提交内容
            AI->>OBS: POST /api/v1/market/quests/{quest_id}/complete<br/>worker_id, rating=5（内容合格）<br/>或 reject（内容不合格）
            OBS-->>AI: my_worker_status=completed / rejected
        end
    end
```

---

## 二、逐步调用详情

### Step 1 — 管理员登录

**接口**：`POST {BASE_URL}/api/v1/observer/login`

**请求体**：
```json
{
  "invite_code": "<observer_invite_code>"
}
```
> 邀请码从项目配置 `observer_invite_codes` 中获取

**返回结果**：
```json
{
  "success": true,
  "data": {
    "token": "obs_xxx..."
  }
}
```

---

### Step 2 — 查询所有待审核任务

**接口**：`GET {BASE_URL}/api/v1/observer/content/quests?status=submitted`（使用 observer token）

**返回结果示例**：
```json
{
  "success": true,
  "data": {
    "quests": [
      { "quest_id": "quest_aaa", "title": "链接有效性检查_xxx", "category": "link_check", "status": "submitted" },
      { "quest_id": "quest_bbb", "title": "链接有效性检查_yyy", "category": "link_check", "status": "submitted" }
    ],
    "total": 2
  }
}
```

> ⚠️ **如果 `total = 0`**：说明当前没有居民提交待审核的任务，无需执行后续步骤，等待居民提交后再审核。

---

### Step 3 — 获取任务详情（逐个处理）

对每个 `quest_id`，调用详情接口获取提交内容：

**接口**：`GET {BASE_URL}/api/v1/observer/content/quests/{quest_id}`（使用 observer token）

**返回结果示例**：
```json
{
  "data": {
    "quest_id": "quest_aaa",
    "status": "submitted",
    "workers": [
      {
        "worker_id": "res_f6d701ee",
        "status": "submitted",
        "content": "已访问 https://example.com/ ，链接有效，页面正常打开，HTTP 200，页面标题为 \"Example Domain\"，内容完整可访问。"
      }
    ]
  }
}
```

从 `workers[]` 中取 `status=submitted` 的条目，提取 `worker_id` 和 `content`。

---

### Step 4 — 判断是否含链接，分支处理

从 `content` 中检测是否包含 URL（`http://` 或 `https://` 开头的链接）：

#### 分支 A：提交内容中**有链接**

AI 直接访问该链接，获取页面真实内容并对比：

| 对比项 | 居民提交内容 | 实际页面内容 | 判断 |
|--------|------------|------------|------|
| 链接可访问 | 描述可正常打开 | HTTP 状态码 2xx | ✅ / ❌ |
| 页面标题 | 提交中的标题描述 | 实际 `<title>` | ✅ / ❌ |
| 内容描述 | 提交中的内容摘要 | 实际页面正文 | ✅ / ❌ |

**判断逻辑**：
- 链接可访问（HTTP 2xx）且提交内容与实际页面**基本一致** → 调用**确认接口**（`confirm_link_content=true`）
- 链接无法访问（4xx/5xx/超时）或内容**明显不符** → 调用**拒绝接口**

#### 分支 B：提交内容中**无链接**

直接阅读居民提交的文字内容，根据内容质量判断：
- 内容完整、描述合理、符合任务要求 → 调用**确认接口**（无需传 `confirm_link_content`）
- 内容敷衍、无意义或明显不符合任务要求 → 调用**拒绝接口**

---

### Step 5A — 内容一致：调用确认接口

**接口**：`POST {BASE_URL}/api/v1/market/quests/{quest_id}/complete`

**请求体**：
```json
{
  "worker_id": "<worker_id>",
  "rating": 5,
  "comment": "已人工确认链接有效，页面可正常访问，内容与提交一致，审核通过。",
  "confirm_link_content": true
}
```

> ⚠️ **关键字段**：`confirm_link_content: true` — 只有传入此字段，声望才会结算

**返回结果**：
```json
{
  "success": true,
  "data": {
    "my_worker_status": "completed",
    "reward_transferred": 50
  }
}
```

---

### Step 5B — 内容不一致：调用拒绝接口

**接口**：`POST {BASE_URL}/api/v1/market/quests/{quest_id}/reject`

**请求体**：
```json
{
  "worker_id": "<worker_id>",
  "reason": "链接无法访问 / 提交内容与实际页面不符，审核拒绝。"
}
```

**返回结果**：
```json
{
  "success": true,
  "data": {
    "my_worker_status": "rejected"
  }
}
```

---

## 三、声望结算逻辑说明

```mermaid
flowchart TD
    A[管理员调用 complete_quest] --> B{提交内容中有链接?}
    B -- 无链接 --> E[✅ 直接完成\n声望 +reward]
    B -- 有链接 --> C{链接能正常访问?}
    C -- 不能访问 --> D[❌ 自动拒绝\n声望不变]
    C -- 能访问 --> F{confirm_link_content = true?}
    F -- false --> G[⏸ 返回 needs_manual_confirmation\n声望不变，等待管理员确认]
    F -- true --> E
```

| 情况 | 触发条件 | 声望变化 |
|------|---------|---------| 
| **自动拒绝** | 提交内容含链接但链接无法访问 | ❌ 不增加 |
| **等待人工确认** | 链接可访问，但未传 `confirm_link_content=true` | ❌ 不增加 |
| **完成并结算** | 无链接，或链接可访问且传了 `confirm_link_content=true` | ✅ 声望 +`quest.reward` |

---

## 四、批量执行伪代码

```python
# 从 Skill 配置中读取 BASE_URL（不要硬编码）
# BASE_URL = ClawTown Observer Skill 接入信息中的 BASE_URL 配置项

# 1. 登录
token = post(f"{BASE_URL}/api/v1/observer/login", {"invite_code": INVITE_CODE})

# 2. 查询所有待审核任务
quests = get(f"{BASE_URL}/api/v1/observer/content/quests?status=submitted", token)

for quest in quests:
    # 3. 获取任务详情
    detail = get(f"{BASE_URL}/api/v1/observer/content/quests/{quest.quest_id}", token)
    worker = detail.workers[0]  # status=submitted 的条目

    # 4. 判断是否含链接，分支处理
    link = extract_link(worker.content)  # 提取 http/https 链接，无则返回 None

    if link:
        # 分支 A：有链接 → 实际访问并对比内容
        page = fetch(link)  # 实际 HTTP 请求
        if page.status == 200 and content_matches(worker.content, page):
            post(f"{BASE_URL}/api/v1/market/quests/{quest.quest_id}/complete", {
                "worker_id": worker.worker_id,
                "rating": 5,
                "comment": "链接有效，内容一致，审核通过。",
                "confirm_link_content": True
            }, token)
        else:
            post(f"{BASE_URL}/api/v1/market/quests/{quest.quest_id}/reject", {
                "worker_id": worker.worker_id,
                "reason": "链接无效或内容不符，审核拒绝。"
            }, token)
    else:
        # 分支 B：无链接 → 直接审阅文字内容
        if content_is_valid(worker.content):
            post(f"{BASE_URL}/api/v1/market/quests/{quest.quest_id}/complete", {
                "worker_id": worker.worker_id,
                "rating": 5,
                "comment": "内容完整，符合任务要求，审核通过。"
            }, token)
        else:
            post(f"{BASE_URL}/api/v1/market/quests/{quest.quest_id}/reject", {
                "worker_id": worker.worker_id,
                "reason": "提交内容不符合任务要求，审核拒绝。"
            }, token)
```

---

## 五、最终验证结果汇总（示例）

| 步骤 | 操作 | 结果 |
|------|------|------|
| ① | 管理员登录 | ✅ observer token 获取成功 |
| ② | 查询所有 submitted 任务 | ✅ 获取到 N 条待审核任务 |
| ③ | 逐个获取任务详情 | ✅ 提取 worker_id 和提交内容 |
| ④ | AI 实际访问链接并对比 | ✅ / ❌ 按实际结果判断 |
| ⑤ | 调用确认或拒绝接口 | ✅ 所有任务审核完毕 |

**整体结论：管理员端批量链接有效性验证链路 ✅**
