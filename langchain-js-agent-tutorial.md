# LangChain JavaScript Agent 学习教程

资料来源：LangChain 官方文档 Quickstart  
原文链接：https://docs.langchain.com/oss/javascript/langchain/quickstart#langchain-agents

配套可运行项目见本仓库 `README.md`。建议先按 README 跑通每个 lesson，再回到本文档补概念。

## 0. 学习目标

这份教程先围绕 LangChain JavaScript 的 Agent 入门路径展开。完成本教程后，你应该能理解：

- LangChain Agent 是如何把模型、工具和提示词组合起来工作的。
- 如何用 `createAgent` 创建一个最小可运行 Agent。
- 如何用 `tool` 暴露外部能力给模型调用。
- 为什么复杂任务需要记忆、追踪、文件工具或 Deep Agents。
- 如何把官方 Quickstart 改造成自己的练习项目。

## 1. 环境准备

官方 Quickstart 要求 Node.js 22+。

安装依赖：

```bash
npm install deepagents langchain @langchain/core
```

如果使用 OpenAI 模型，设置 API Key：

```bash
export OPENAI_API_KEY="your-api-key"
```

Windows PowerShell 可以这样设置当前终端会话的环境变量：

```powershell
$env:OPENAI_API_KEY = "your-api-key"
```

也可以换成 Google Gemini、Claude、OpenRouter、Ollama、Azure OpenAI、AWS Bedrock 等模型提供商，但要同步设置对应的环境变量。

## 2. 第一个 Agent：天气查询

Agent 的基本结构是：

1. 模型：负责理解用户问题、决定是否调用工具、组织最终回答。
2. 工具：由你定义的函数，模型可以按 schema 调用。
3. 提示词：约束 Agent 的角色、能力边界和回答方式。

新建 `agent-basic.ts`：

```ts
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  (input) => `It's always sunny in ${input.city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

const agent = createAgent({
  model: "gpt-5.5",
  tools: [getWeather],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's the weather in San Francisco?",
    },
  ],
});

console.log(result);
```

关键理解：

- `tool(...)` 把普通函数包装成模型可调用的工具。
- `name` 是模型调用工具时看到的工具名。
- `description` 影响模型什么时候选择这个工具。
- `schema` 定义工具参数，官方示例使用 Zod。
- `agent.invoke(...)` 的输入是消息列表，类似一次对话。

练习：

- 把 `get_weather` 改成中文返回。
- 新增一个 `get_city_timezone` 工具。
- 让用户一次问两个城市，观察模型会不会多次调用工具。

## 3. 工具设计：不要只给模型“答案”，要给它“能力”

官方 Quickstart 的真实场景示例是研究 Agent：它可以从 URL 抓取文本，再回答关于文本的问题。

工具示例：

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const fetchTextFromUrl = tool(
  async ({ url }: { url: string }): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; quickstart-research/1.0)",
        },
        signal: controller.signal,
      });

      if (!resp.ok) {
        return `Fetch failed: HTTP ${resp.status} ${resp.statusText}`;
      }

      return await resp.text();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return `Fetch failed: ${msg}`;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "fetch_text_from_url",
    description: "Fetch the document from a URL.",
    schema: z.object({
      url: z.string().url(),
    }),
  }
);
```

这里的重点不是“抓网页”本身，而是工具边界：

- 工具应该做确定性工作，比如请求 URL、查询数据库、计算数量、读写文件。
- 模型负责判断什么时候调用工具，以及如何解释工具结果。
- 如果任务要求精确计数、精确行号、检索大量文本，不能只依赖模型凭上下文估算，应该给它搜索或代码执行能力。

## 4. System Prompt：明确角色和限制

官方示例使用类似这样的系统提示词：

```ts
const SYSTEM_PROMPT = `You are a literary data assistant.

## Capabilities

- \`fetch_text_from_url\`: loads document text from a URL into the conversation.
Do not guess line counts or positions—ground them in tool results from the saved file.`;
```

学习要点：

- System Prompt 不是越长越好，而是要明确角色、工具能力和禁止行为。
- 对精确任务要写清楚“不确定就不要编造”。
- 工具说明和系统提示词要互相配合：工具负责能做什么，提示词负责如何使用这些能力。

练习：

- 把角色改成“合同审阅助手”。
- 增加规则：只根据工具返回的文本回答，不补充外部知识。
- 增加输出格式：`summary`、`risks`、`evidence` 三个字段。

## 5. 模型配置

官方示例使用 `initChatModel` 配置模型：

```ts
import { initChatModel } from "langchain";

const model = await initChatModel("gpt-5.5", {
  temperature: 0.5,
  timeout: 300,
  maxTokens: 25000,
});
```

参数理解：

- `temperature` 越低，输出越稳定；越高，表达更发散。
- `timeout` 控制请求等待时间。
- `maxTokens` 控制最大输出长度，长文档任务通常需要更高上限。
- 不同模型提供商的参数可能不同，需要查对应 provider 文档。

实践建议：

- 入门练习用较低 `temperature`，比如 `0` 到 `0.5`。
- 需要严谨抽取、分类、结构化输出时，不要把 temperature 调太高。
- 长文本任务优先考虑检索、文件工具或分块处理，而不是直接把所有内容塞进 prompt。

## 6. 记忆：让 Agent 保持会话状态

官方示例使用 LangGraph 的 `MemorySaver`：

```ts
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
```

创建 Agent 时传入：

```ts
const agent = createAgent({
  model,
  tools: [fetchTextFromUrl],
  systemPrompt: SYSTEM_PROMPT,
  checkpointer,
});
```

调用时设置线程 ID：

```ts
await agent.invoke(
  { messages: [{ role: "user", content }] },
  { configurable: { thread_id: "great-gatsby-lc" } }
);
```

理解：

- `checkpointer` 保存对话状态。
- `thread_id` 用来区分不同会话。
- `MemorySaver` 适合学习和本地实验；生产环境应该换成持久化存储。

## 7. LangChain Agents vs Deep Agents

官方 Quickstart 对比了两种 Agent：

- LangChain Agent：更细粒度，适合你自己控制工具、记忆、流程。
- Deep Agent：内置更多能力，例如规划、文件系统工具、子 Agent，适合用更少配置处理复杂研究任务。

选择建议：

- 如果只是客服、工具调用、业务流程自动化，先从 `createAgent` 开始。
- 如果任务天然需要规划、读写文件、多步骤研究、委派子任务，可以尝试 `createDeepAgent`。
- 如果你需要严格控制每一步行为，LangChain Agent 更透明。

## 8. 追踪：用 LangSmith 看 Agent 内部发生了什么

复杂 Agent 会多次调用模型和工具。官方建议使用 LangSmith 追踪。

环境变量：

```bash
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="..."
```

PowerShell：

```powershell
$env:LANGSMITH_TRACING = "true"
$env:LANGSMITH_API_KEY = "..."
```

你应该重点观察：

- 模型是否选择了正确工具。
- 工具参数是否符合预期。
- 哪一步导致错误或幻觉。
- token 消耗是否过高。
- 系统提示词是否真的约束了行为。

## 9. 推荐学习路线

第 1 天：跑通基础 Agent

- 安装依赖。
- 设置模型 API Key。
- 跑通天气工具示例。
- 修改工具 schema 和返回值。

第 2 天：写自己的工具

- 做一个 `calculate_discount` 工具。
- 做一个 `fetch_text_from_url` 工具。
- 观察 Agent 什么时候调用工具、什么时候直接回答。

第 3 天：加入系统提示词

- 给 Agent 明确角色。
- 要求它输出固定 JSON 或 Markdown。
- 加入“不知道就说不知道”的规则。

第 4 天：加入记忆

- 使用 `MemorySaver`。
- 用不同 `thread_id` 模拟不同用户。
- 测试 Agent 是否记住之前对话。

第 5 天：接入 LangSmith

- 打开 tracing。
- 查看一次完整调用链。
- 根据 trace 优化工具描述和 prompt。

第 6 天：尝试 Deep Agents

- 对比同一个研究任务在 LangChain Agent 和 Deep Agent 下的表现。
- 观察 Deep Agent 的规划、文件工具和子任务能力。

## 10. 下一步可以扩展的教程章节

- 搭建一个最小 TypeScript 项目。
- 使用 OpenAI、Gemini、Ollama 三种 provider 分别运行。
- 编写结构化输出 Agent。
- 编写网页内容总结 Agent。
- 编写本地文件问答 Agent。
- 给 Agent 增加数据库查询工具。
- 用 LangSmith 调试一次错误工具调用。
- 部署 Agent 到一个 Web API。

## 11. 本教程的第一个实战项目

项目名称：URL 文本研究助手

功能：

- 用户输入一个 URL 和一个问题。
- Agent 使用 `fetch_text_from_url` 抓取文本。
- Agent 只基于抓取内容回答。
- 如果问题要求精确统计，Agent 必须说明是否具备可靠工具。
- 输出包括 `answer`、`evidence`、`limitations`。

建议目录：

```text
langchain-agent-lab/
  package.json
  tsconfig.json
  src/
    agent-basic.ts
    tools/
      fetch-text-from-url.ts
    prompts/
      research-assistant.ts
```

后续我们可以继续把这个教程落成一个可运行项目。
