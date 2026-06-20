# LangChain 栏目课程章节

日期：2026-06-20

## 范围说明

本课程只覆盖 LangChain 这一栏的核心能力：models、messages、tools、agents、context engineering、structured output、RAG、streaming、LangSmith observability 和 testing。DeepAgent 和 LangGraph 暂时不进入本阶段课程。

`MemorySaver` / checkpointer 这类依赖 LangGraph 的生产级记忆机制放到后续 LangGraph 阶段再学。本阶段只讲手动维护 messages 的对话上下文。

## 课程目标

学完本阶段后，你应该能独立完成一个工程质量合格的 LangChain 入门项目：

- 能清楚区分 model call、chain、tool calling agent 和 RAG agent。
- 能用 Zod schema 设计安全、可维护的工具接口。
- 能用 `createAgent` 组合模型、工具、提示词和结构化输出。
- 能写出带证据、带限制说明、可被程序消费的输出。
- 能对 URL、本地文本和课程目录这类外部数据做安全接入。
- 能用 streaming 给 CLI 或前端提供运行进度。
- 能用 LangSmith trace 定位模型调用、工具调用和 token 消耗问题。
- 能用 fake model、工具单测和少量 golden cases 做回归测试。

## 经典入门项目

项目名称：课程资料研究助手。

这是一个经典 LangChain 入门项目，因为它覆盖了 Agent 工程里最常见的能力：工具调用、外部数据读取、结构化输出、RAG、引用证据、错误处理、观测和测试。

最终功能：

1. 用户输入一个 URL、本地课程文件路径或课程关键词。
2. 助手判断是否需要调用工具。
3. 助手能读取 URL 文本、本地文本或课程目录。
4. 助手只根据工具返回的数据回答，不编造不存在的资料。
5. 助手输出固定结构：

```json
{
  "answer": "直接回答",
  "evidence": ["证据 1", "证据 2"],
  "limitations": ["当前回答的限制"],
  "nextActions": ["建议用户下一步做什么"]
}
```

工程验收标准：

- 工具有 Zod schema、超时、错误返回和权限边界。
- 结构化输出由 schema 约束，不只靠 prompt 要求 JSON。
- URL 和本地文件读取有大小限制和路径限制。
- RAG 回答必须带 citation 或 evidence。
- 无证据时能拒答，而不是猜测。
- LangSmith trace 能看出模型调用、工具调用、参数和最终输出。
- 至少有工具单测、结构化输出测试和 3 条端到端样例。

## 学习顺序

| 课次 | 章节 | 核心问题 | 产物 |
| --- | --- | --- | --- |
| 01 | 环境、模型与项目骨架 | 如何稳定接入一个模型 provider？ | 统一模型工厂和 env 配置 |
| 02 | Messages 与最小模型调用 | LangChain 为什么以 messages 为核心？ | 最小 model invoke 示例 |
| 03 | Prompt 与 Context Engineering | 如何给模型明确角色、边界和上下文？ | 可复用系统提示词 |
| 04 | Tool 设计基础 | 如何把确定性能力暴露给模型？ | 天气/时区工具 |
| 05 | 第一个 LangChain Agent | `createAgent` 如何组合模型和工具？ | 最小 tool-calling agent |
| 06 | 工具工程最佳实践 | 工具如何处理错误、超时、权限和返回协议？ | 安全 URL 读取工具 |
| 07 | 结构化输出 | 如何让输出可被程序稳定解析？ | Zod response schema |
| 08 | 入门项目 v1：URL 研究助手 | 如何基于 URL 内容回答并说明限制？ | URL research assistant |
| 09 | 本地文件问答 | 如何安全读取本地课程文件？ | file QA agent |
| 10 | RAG 入门 | 如何从“整篇塞给模型”升级到检索增强？ | 简单 RAG pipeline |
| 11 | Streaming 与运行体验 | 如何让用户看到 Agent 正在做什么？ | CLI streaming 示例 |
| 12 | LangSmith 调试与测试 | 如何把 Agent 纳入工程回归流程？ | trace checklist 和测试样例 |

对应文件：

| 课次 | 文件 |
| --- | --- |
| 01 | `src/lessons/01-environment-model.ts` |
| 02 | `src/lessons/02-messages-and-model.ts` |
| 03 | `src/lessons/03-prompt-context.ts` |
| 04 | `src/lessons/04-tool-design.ts` |
| 05 | `src/lessons/05-first-agent.ts` |
| 06 | `src/lessons/06-tool-engineering.ts` |
| 07 | `src/lessons/07-structured-output.ts` |
| 08 | `src/lessons/08-url-research-project.ts` |
| 09 | `src/lessons/09-local-file-qa.ts` |
| 10 | `src/lessons/10-rag-intro.ts` |
| 11 | `src/lessons/11-streaming.ts` |
| 12 | `src/lessons/12-langsmith-debugging-testing.ts` |

## Lesson 01：环境、模型与项目骨架

目标：

- 跑通 Node.js、TypeScript、dotenv 和模型 provider。
- 理解 `ChatOpenAI` 适配 OpenAI-compatible endpoint 的方式。
- 把 provider 细节隔离在模型工厂里，而不是散落到每个 lesson。

建议阅读：

- `README.md`
- `.env.example`
- `src/shared/config.ts`
- `docs/provider-switching.md`

实践步骤：

1. 运行 `npm run check` 确认 Node.js 版本。
2. 运行 `npm install` 安装依赖。
3. 复制 `.env.example` 为 `.env`，填写 `GLM_API_KEY`。
4. 阅读 `createCourseModel`，确认模型名、base URL、temperature 和 timeout 的默认值。
5. 运行 `npm run typecheck`，确认 TypeScript 能通过。

最佳实践：

- API key 只放 `.env`，不要进入代码和文档示例输出。
- 每个 lesson 只依赖模型工厂，不直接 new provider client。
- 严谨抽取、分类、结构化输出任务默认低 temperature。
- 长任务要显式设置 timeout；长上下文问题应优先用分块、检索或更合适的任务拆分处理。

验收标准：

- 你能解释 `model`、`apiKey`、`baseURL`、`temperature`、`timeout` 分别解决什么问题。
- 你能把 provider 从 GLM 切到另一个 OpenAI-compatible endpoint，而不改 lesson 业务代码。

## Lesson 02：Messages 与最小模型调用

目标：

- 理解 LangChain 中 messages 是模型上下文的基本单位。
- 区分 system、user、assistant、tool message 的职责。
- 知道什么时候只需要模型调用，不需要 Agent。

对应文件：`src/lessons/02-messages-and-model.ts`

实践步骤：

1. 用 `createCourseModel()` 直接调用模型，不绑定工具。
2. 传入一组 messages：system message 设置角色，user message 提问。
3. 打印返回的 AI message，包括 `content` 和 metadata。
4. 手动追加上一轮 assistant/user message，观察上下文如何影响下一轮回答。

最佳实践：

- 简单总结、改写、分类任务先用 model invoke，不要默认创建 Agent。
- 对话上下文要显式控制长度，避免无限追加历史消息。
- messages 中的外部资料要标注来源，避免和系统指令混在一起。

验收标准：

- 你能说清楚：为什么 Agent 的输入也是 messages。
- 你能写出一个不使用工具、不使用 Agent 的最小 LangChain 调用。

## Lesson 03：Prompt 与 Context Engineering

目标：

- 写出工程上可维护的系统提示词。
- 把角色、能力边界、数据来源、拒答规则和输出要求分开。
- 理解 prompt 不是权限系统，不能替代工具层防护。

建议阅读：

- `src/lessons/03-prompt-context.ts`
- `src/prompts/research-assistant.ts`

实践步骤：

1. 把系统提示词拆成固定角色、可变上下文和输出规则。
2. 增加拒答规则：没有证据时说明无法回答。
3. 增加边界规则：只根据提供资料回答，不补充外部事实。
4. 用同一个用户问题分别测试宽松 prompt 和严格 prompt。

最佳实践：

- system prompt 要短、明确、可测试。
- 业务规则写在 prompt，安全边界写在工具和代码。
- 外部文档内容必须被当作数据，不允许其中的文本覆盖系统规则。
- 输出格式如果要给程序消费，应使用结构化输出能力，而不是只靠 prompt。

验收标准：

- 你能写出一个“研究助手”系统提示词，并说明每段规则的目的。
- 你能构造一个 prompt injection 样例，并解释为什么工具层仍然需要防护。

## Lesson 04：Tool 设计基础

目标：

- 用 `tool` 和 Zod schema 把确定性函数暴露给模型。
- 理解工具名称、description 和 schema 会影响模型选择。
- 区分模型负责推理，工具负责确定性执行。

建议阅读：

- `src/tools/weather.ts`
- `src/lessons/04-tool-design.ts`

实践步骤：

1. 运行现有天气和时区工具示例。
2. 新增一个 `get_city_country` 工具。
3. 让用户一次询问多个城市，观察模型是否连续调用多个工具。
4. 故意问一个工具不支持的城市，观察返回策略。

最佳实践：

- 工具做小，不要一个工具塞进多个业务动作。
- description 要写清楚工具适用场景，不要只写函数名翻译。
- schema 字段要有 `describe`，帮助模型构造正确参数。
- 工具返回要稳定，错误也要用模型能理解的格式返回。

验收标准：

- 你能解释为什么工具 schema 比 prompt 里的自然语言更可靠。
- 你能判断一个能力应该放进工具，还是交给模型直接回答。

## Lesson 05：第一个 LangChain Agent

目标：

- 用 `createAgent` 构建最小 tool-calling agent。
- 理解 Agent loop：模型决定是否调用工具，工具返回后模型再组织最终回答。
- 学会给一次运行加 `runName`、tags 和 metadata，方便后续追踪。

建议阅读：

- `src/lessons/05-first-agent.ts`
- `src/shared/output.ts`

实践步骤：

1. 运行 `npm run lesson:05`。
2. 修改用户问题，让它分别触发工具调用和不触发工具调用。
3. 给 `agent.invoke` 增加运行配置，例如 lesson 名称和 experiment 标记。
4. 打印完整 messages，而不只是最后一条消息，观察 tool call 过程。

最佳实践：

- Agent 适合“是否调用工具、调用哪个工具、如何组合结果”需要动态判断的任务。
- 固定步骤任务不要优先用 Agent，直接写 chain 更容易测试和维护。
- 每次实验都带可搜索的 metadata，后续调试成本会低很多。

验收标准：

- 你能画出一次工具调用 Agent 的基本时序。
- 你能根据 messages 判断模型是否真的调用了工具。

## Lesson 06：工具工程最佳实践

目标：

- 把工具从 demo 函数升级为工程函数。
- 增加超时、输入校验、错误分类、大小限制和权限边界。
- 理解工具失败时应该返回什么给模型，什么留给日志。

建议阅读：

- `src/tools/fetch-text-from-url.ts`
- `src/tools/local-file.ts`

实践步骤：

1. 给 URL 工具增加协议限制：只允许 `http` 和 `https`。
2. 增加响应大小限制，避免一次拉取超大页面。
3. 增加 content-type 检查，优先处理 text/html 和 text/plain。
4. 把错误分成 `NETWORK_ERROR`、`HTTP_ERROR`、`TIMEOUT`、`UNSUPPORTED_CONTENT`。
5. 保持返回给模型的内容简短，把详细错误留给日志或 trace。

最佳实践：

- 网络工具必须有 timeout。
- 文件工具必须限制根目录和文件大小。
- 数据库工具默认只读，写操作需要后续 human-in-the-loop 阶段再学。
- 工具不要返回无上限大文本，长文本要进入 RAG 或分块流程。

验收标准：

- 你能说明每个工具的输入边界、输出协议和失败模式。
- 你能写出至少 3 个工具单测：成功、非法输入、外部失败。

## Lesson 07：结构化输出

目标：

- 使用 LangChain structured output，而不是只在 prompt 里要求 JSON。
- 用 Zod schema 约束最终输出。
- 让入门项目的输出能被程序稳定解析。

对应文件：`src/lessons/07-structured-output.ts`

实践步骤：

1. 定义 `ResearchAnswerSchema`，包含 `answer`、`evidence`、`limitations`、`nextActions`。
2. 用 agent 的 response format 或模型结构化输出能力返回 schema。
3. 故意让用户要求“随便输出 Markdown”，验证系统仍返回结构化数据。
4. 在代码里读取结构化字段，而不是解析自然语言。

最佳实践：

- 程序要消费的输出必须 schema-first。
- prompt 负责业务语义，schema 负责数据形状。
- evidence、citations 这类字段要用数组，不要塞成一段长文本。
- confidence 不要伪装成数学概率，除非你有评测或统计依据。

验收标准：

- 你能拿到类型稳定的结构化对象。
- 输出缺字段或字段类型错误时，测试能失败。

## Lesson 08：入门项目 v1：URL 研究助手

目标：

- 完成经典项目第一版：读取 URL，回答问题，给出证据和限制。
- 把工具调用、prompt、结构化输出组合成一个完整 LangChain Agent。

建议阅读：

- `src/lessons/08-url-research-project.ts`
- `src/prompts/research-assistant.ts`

实践步骤：

1. 用户输入 URL 和问题。
2. Agent 必须先调用 URL 工具。
3. URL 工具返回截断后的文本和来源信息。
4. Agent 输出 `answer`、`evidence`、`limitations`、`nextActions`。
5. 问一个文本里没有答案的问题，验证它能拒答。

最佳实践：

- 不要把“抓网页成功”当作“答案可靠”。
- evidence 必须来自工具返回内容。
- 对长文档要明确说明上下文截断和覆盖范围限制。
- 对网页 HTML 要考虑清洗，否则模型可能被导航、脚本、页脚干扰。

验收标准：

- 输入一个 URL 后，助手能基于文本回答。
- 当证据不足时，助手不会编造。
- 输出结构稳定，能被 TypeScript 代码读取字段。

## Lesson 09：本地文件问答

目标：

- 让项目支持读取本地课程文件。
- 学习文件工具的路径安全和权限边界。
- 把文件内容作为资料回答，而不是让模型凭文件名猜。

建议阅读：

- `src/tools/local-file.ts`
- `src/lessons/09-local-file-qa.ts`

实践步骤：

1. 读取 `README.md`，总结当前课程路线。
2. 读取 `exercises/README.md`，提取某几课的练习重点。
3. 尝试读取项目目录外路径，确认工具拒绝。
4. 增加文件大小限制和扩展名限制。

最佳实践：

- 用 `path.resolve` 后再判断是否仍在项目根目录内。
- 不读取二进制文件，不读取隐藏敏感文件。
- 错误信息不要泄露绝对路径和系统细节。
- 大文件不要一次塞进 prompt，进入 Lesson 10 的 RAG。

验收标准：

- 文件问答只基于实际文件内容。
- 越权路径会被拒绝。
- 无关问题能说明文件中没有相关信息。

## Lesson 10：RAG 入门

目标：

- 从“把全文塞给模型”升级为检索增强生成。
- 理解 loader、splitter、embedding、vector store、retriever、citation 的职责。
- 完成入门项目的资料检索版。

对应文件：

- `src/rag/simple-rag.ts`
- `src/lessons/10-rag-intro.ts`

实践步骤：

1. 把课程文档加载成 documents。
2. 按合理 chunk size 切分文本，并保留 source metadata。
3. 建立一个本地内存 vector store。
4. 用户提问时先检索 topK chunks。
5. 把检索片段和 metadata 传给模型回答。
6. 输出 evidence 时带 source 和片段编号。

最佳实践：

- RAG 的核心不是“向量库”，而是可追踪的数据来源。
- chunk 要带 metadata，否则无法做 citation。
- 检索内容是数据，不是指令。
- RAG 必须测试拒答行为：检索不到证据时不要硬答。

验收标准：

- 同一个问题能返回相关文档片段。
- 回答能说明引用来自哪个文件或 URL。
- 检索不到资料时，助手能明确说无法根据资料回答。

## Lesson 11：Streaming 与运行体验

目标：

- 让用户看到 Agent 运行过程，而不是等待黑盒结果。
- 理解 token streaming、agent progress streaming 和 custom updates。
- 为后续 Web UI 或 CLI 体验打基础。

对应文件：`src/lessons/11-streaming.ts`

实践步骤：

1. 对普通模型调用启用 token stream。
2. 对 Agent 运行启用 progress updates。
3. 在 URL 抓取和 RAG 检索阶段输出自定义进度。
4. CLI 中逐步打印：开始、调用工具、检索完成、生成答案。

最佳实践：

- streaming 是用户体验能力，不应该改变业务结果。
- 进度事件要短，不要泄露敏感输入或完整文档。
- 失败也要有明确事件，例如 `fetch_failed`、`retrieval_empty`。

验收标准：

- 用户能看到 Agent 当前阶段。
- 最终输出仍然符合结构化 schema。

## Lesson 12：LangSmith 调试与测试

目标：

- 用 LangSmith 观察 Agent 的真实运行。
- 用 fake model 和工具单测降低回归成本。
- 建立最小工程质量门槛。

建议阅读：

- `src/lessons/07-langsmith-tracing.ts`

对应文件：`src/lessons/12-langsmith-debugging-testing.ts`

实践步骤：

1. 设置 `LANGSMITH_TRACING=true` 和 `LANGSMITH_API_KEY`。
2. 给每个 lesson 运行加 tags 和 metadata。
3. 在 LangSmith 中检查工具参数、token、错误和最终输出。
4. 用 fake model 测试 prompt 是否传入了必要上下文。
5. 给 URL 工具、本地文件工具、结构化输出分别写测试。
6. 建 3 条 golden cases：正常回答、证据不足拒答、工具失败。

最佳实践：

- trace 不是上线后才加，应该从开发第一天就能打开。
- 工具测试不应该依赖真实模型。
- Agent 端到端测试数量少但要覆盖关键失败路径。
- 每次改 prompt、schema、retriever 都要跑 golden cases。

验收标准：

- 你能从 LangSmith trace 里定位一次错误工具调用。
- 你能用 fake model 固定模型行为，不依赖真实 LLM 做回归检查。
- 你能设计至少 3 条 golden cases：正常回答、证据不足拒答、工具失败。

## 本阶段暂不学习的内容

以下内容后续单独开 DeepAgent / LangGraph 栏目：

- `createDeepAgent`
- LangGraph StateGraph
- checkpoint / persistent memory
- interrupt / human-in-the-loop
- multi-agent orchestration
- graph deployment with `langgraph.json`

在本阶段，如果遇到这些概念，只需要知道它们存在，不需要实现。

## 当前仓库运行建议

如果你现在就要基于已有代码跟学，建议顺序是：

```powershell
npm run check
npm run typecheck
npm run lesson:01
npm run lesson:02
npm run lesson:03
npm run lesson:04
npm run lesson:05
npm run lesson:06
npm run lesson:07
npm run lesson:08
npm run lesson:09
npm run lesson:10
npm run lesson:11
npm run lesson:12
```

## 后续代码落地顺序

本轮已经完成 lesson 重排、工具安全边界、结构化输出、RAG 和 streaming 示例。后续如果继续加强工程化，建议：

1. 引入 Vitest，把第 12 课里的 fake model 断言迁移为自动化测试。
2. 给 URL、本地文件和课程目录工具补单元测试。
3. 把 `src/rag/simple-rag.ts` 替换或扩展为 embedding + vector store。
4. 建立 `src/evals/golden-cases.json`，固定端到端回归样例。
5. 后续单独开启 DeepAgent / LangGraph 栏目。

## 参考来源

- LangChain JS quickstart: https://docs.langchain.com/oss/javascript/langchain/quickstart
- LangChain JS agents: https://docs.langchain.com/oss/javascript/langchain/agents
- LangChain JS messages: https://docs.langchain.com/oss/javascript/langchain/messages
- LangChain JS tools: https://docs.langchain.com/oss/javascript/langchain/tools
- LangChain JS context engineering: https://docs.langchain.com/oss/javascript/langchain/context-engineering
- LangChain JS structured output: https://docs.langchain.com/oss/javascript/langchain/structured-output
- LangChain JS RAG: https://docs.langchain.com/oss/javascript/langchain/rag
- LangChain JS streaming: https://docs.langchain.com/oss/javascript/langchain/streaming
- LangChain JS unit testing: https://docs.langchain.com/oss/javascript/langchain/test/unit-testing
- LangSmith observability: https://docs.langchain.com/langsmith/observability
