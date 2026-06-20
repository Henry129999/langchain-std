# 模块 A Lessons：LangChain Agent 工程化

目标：把基础 Agent 升级为可控、可观测、可扩展的工程组件。

## A01 Agent Harness 架构与适用边界

学习内容：`createAgent` 的 model、tools、systemPrompt、responseFormat、middleware 和 agent loop。

最佳实践：

- 固定流程优先普通 Runnable 或明确链路，只有需要动态选择工具或动态决策时才使用 Agent。
- system prompt 只负责行为约束，不承载不可测试的业务分支。
- 工具负责确定性能力，模型负责选择、归纳和表达。
- 每个 Agent 必须有 runName、tags、metadata，便于 LangSmith 和日志定位。

实操任务：

- 为当前研究助手画出 HumanMessage -> AIMessage(tool_calls) -> ToolMessage -> AIMessage(final) 流程。
- 标注每一步的输入、输出、失败点和可测试边界。

验收标准：

- 你能解释为什么某个需求应该用 Agent、固定链路或 LangGraph。
- 你能从返回 messages 中定位模型是否调用了工具、工具返回了什么、最终答案来自哪里。

调试关注点：`tool_calls` 是否为空、ToolMessage 是否带正确 `tool_call_id`、最终 AIMessage 是否引用工具结果。

## A02 模型、消息与 Invocation Config

学习内容：模型初始化、`invoke`、`stream`、`batch`、reasoning、token usage、`withConfig`。

最佳实践：

- 模型工厂只处理 provider、baseURL、timeout、temperature、reasoning 等模型级配置。
- 业务运行信息通过 `runName`、`tags`、`metadata` 进入 invocation config。
- 不在业务代码中散落 API Key、模型名和 provider URL。
- 遇到结果不完整，优先检查 `finish_reason`、usage metadata、reasoning token 和 provider 限制。

实操任务：

- 扩展 `createCourseModel` 的调用示例，分别演示低温度稳定输出和高温度发散输出。
- 对一次运行添加 `runName`、`tags`、`metadata`，观察返回和 trace 字段。

验收标准：

- 你能解释模型构造参数和 invocation config 的边界。
- 你能从 `response_metadata` 和 `usage_metadata` 判断一次调用是否正常。

调试关注点：`finish_reason`、`input_tokens`、`output_tokens`、`reasoning_content`、超时和重试。

## A03 Context Engineering：控制模型可见信息

学习内容：model context、tool context、lifecycle context，以及上下文预算。

最佳实践：

- 原始资料不直接全部塞进 prompt，先做筛选、摘要、引用编号。
- 工具内部上下文不一定要暴露给模型。
- 长会话必须有 trim、delete 或 summarize 策略。
- 每次注入上下文都要能回答“为什么模型现在需要看到这段内容”。

实操任务：

- 为研究助手定义 `contextBudget`：最大历史轮数、最大证据片段数、每个片段最大字符数。
- 设计证据注入格式：`[sourceId] title - snippet`。

验收标准：

- 你能区分哪些数据进入 model context，哪些保留在 state 或工具内部。
- 你能说明上下文膨胀会如何影响成本、延迟和答案质量。

调试关注点：重复历史、无关工具结果、过长网页正文、证据编号丢失。

## A04 Middleware 生命周期

学习内容：beforeAgent、beforeModel、wrapModelCall、wrapToolCall、afterModel、afterAgent。

最佳实践：

- 日志、鉴权、限流、重试、审计属于 middleware，不要写进每个工具。
- `wrapModelCall` 处理模型调用前后逻辑，`wrapToolCall` 处理工具执行前后逻辑。
- middleware 返回的数据要保持小而结构化，避免污染消息历史。
- 所有 middleware 都应可单独测试。

实操任务：

- 实现一个 middleware 记录模型调用次数、工具调用次数、耗时和错误类型。
- 给每次工具调用输出 `toolName`、`args`、`ok`、`durationMs`。

验收标准：

- 你能解释 middleware 相比普通函数封装的优势。
- 你能在不改业务工具代码的情况下增加审计能力。

调试关注点：middleware 顺序、异常传播、重复记录、工具错误是否被吞掉。

## A05 动态系统提示词与 Runtime Context

学习内容：dynamic system prompt、runtime context、按角色调整行为。

最佳实践：

- 用户角色、租户、权限、环境变量通过 runtime/context 传入。
- prompt 模板要稳定，动态片段要有明确来源。
- 动态提示词不应该绕过工具权限和 guardrails。
- 角色差异应该可测试，例如 engineer/reviewer/operator 的输出约束不同。

实操任务：

- 设计三种角色：engineer 关注机制，reviewer 关注风险，operator 关注执行步骤。
- 让同一问题在三种角色下生成不同风格的系统提示词。

验收标准：

- 你能说明 runtime context 和普通 message 的区别。
- 你能确保动态 prompt 不会破坏结构化输出 schema。

调试关注点：角色字段缺失、prompt 拼接顺序、用户输入覆盖系统约束。

## A06 Tool 高级设计：上下文、错误、返回值

学习内容：工具 schema、上下文读取、结构化返回、错误处理、stream writer。

最佳实践：

- 工具返回统一 envelope：`ok`、`data`、`error`、`source`。
- 工具错误分为可恢复错误和不可恢复错误。
- 工具描述必须说明能力边界，不要让模型误以为工具能做所有事。
- 工具参数 schema 要约束输入，不靠 prompt 描述格式。

实操任务：

- 把 URL、file、weather 工具统一成 envelope 返回格式。
- 对无数据、权限不足、超时分别返回不同错误码。

验收标准：

- 你能让模型基于工具错误做合理降级，而不是编造结果。
- 程序能直接读取工具结构化结果，不需要解析自然语言。

调试关注点：schema 太宽、错误信息不可机器读、工具返回过长、工具描述过度承诺。

## A07 工具选择治理：动态选择、Headless Tool、调用上限

学习内容：动态工具选择、headless tools、工具调用上限、工具暴露面。

最佳实践：

- 不把所有工具默认暴露给模型。
- 高风险工具必须有调用上限和审批策略。
- 内部确定性步骤可用 headless tool，不一定暴露给模型。
- 工具选择策略要基于任务类型、权限和上下文。

实操任务：

- 设计 `selectTools(taskType, userRole)`。
- 对写文件、外部请求、删除类工具设置调用上限。

验收标准：

- 你能解释“模型可见工具”和“系统内部工具”的区别。
- 同一个 Agent 在不同角色下暴露不同工具集合。

调试关注点：工具过多导致误选、工具名相似、描述冲突、无限工具循环。

## A08 结构化输出的生产策略

学习内容：provider strategy、tool strategy、schema 版本、错误恢复。

最佳实践：

- 程序读取 `structuredResponse`，不要解析自然语言 Markdown。
- schema 字段要表达业务协议，不只表达展示格式。
- schema 需要版本策略，避免后续新增字段破坏调用方。
- 结构化失败要有 retry 或明确错误，不要静默降级。

实操任务：

- 设计 `ResearchAnswerV1`：answer、citations、limitations、unsupportedClaims、nextActions。
- 增加 `schemaVersion: "v1"`。

验收标准：

- 你能解释 provider strategy 和 tool strategy 的差异。
- 你能处理模型输出不符合 schema 的情况。

调试关注点：字段可选性、数组为空的语义、schema 太复杂、handleError 过宽。

## A09 Guardrails 与 PII 治理

学习内容：PII detection、输入侧/输出侧/工具侧 guardrails。

最佳实践：

- PII 处理不是只靠 prompt，需要 middleware 或代码层策略。
- 对外部工具调用做 allowlist 和参数校验。
- 安全策略要输出审计字段：拦截原因、规则 ID、处理动作。
- 不同风险使用不同策略：block、redact、mask、hash。

实操任务：

- 对 email、credit card、URL 参数做 redaction。
- 给外部 fetch 工具增加域名 allowlist。

验收标准：

- 你能说明哪些信息不应进入模型 provider。
- 被拦截请求有明确、可追踪的错误信息。

调试关注点：PII 已进入 trace、redaction 后破坏语义、工具参数绕过校验。

## A10 Human-in-the-loop 审批

学习内容：approve、reject、edit、多决策、条件中断。

最佳实践：

- 写文件、删数据、发请求、付费 API 调用都应进入 HITL 策略。
- 审批请求要展示工具名、参数、风险说明和可编辑字段。
- reject 后要给模型明确反馈，不让模型重复同一危险动作。
- HITL 事件也要进入 trace 和审计日志。

实操任务：

- 给写文件工具设计审批请求结构。
- 支持用户编辑路径或内容摘要后再继续。

验收标准：

- 你能解释为什么 HITL 是运行时控制，而不是简单 confirm 文案。
- 拒绝、批准、编辑三种路径都能稳定恢复。

调试关注点：中断后状态丢失、审批参数不可读、模型重复发起同一危险调用。

## A11 短期记忆与长期记忆

学习内容：short-term memory、long-term store、trim/delete/summarize。

最佳实践：

- 短期记忆服务于当前 thread，长期记忆服务于跨会话偏好或事实。
- 不把所有用户输入都写入长期记忆。
- 长期记忆写入要有规则：稳定、可复用、用户允许、非敏感。
- 摘要是压缩上下文，不是替代原始审计记录。

实操任务：

- 设计 `UserPreferenceMemory` 和 `SessionSummary`。
- 定义哪些内容可以写入长期记忆，哪些必须丢弃。

验收标准：

- 你能解释 checkpointer、store、message history 的不同职责。
- 长会话不会无限增长，同时关键偏好不会丢失。

调试关注点：错误写入长期记忆、摘要丢证据、跨用户污染、隐私数据残留。

## A12 Streaming 体验与事件协议

学习内容：agent progress、LLM tokens、custom updates、多模式 stream。

最佳实践：

- 后端 stream 事件要设计为稳定协议，而不是直接把内部对象暴露给前端。
- 工具开始、工具结束、模型 token、最终答案应是不同事件类型。
- 对 reasoning token 要谨慎展示，默认只用于调试或观测。
- stream 不改变业务规则，只改善运行体验。

实操任务：

- 定义 UI event：`tool_start`、`tool_result`、`model_token`、`final`、`error`。
- 把 LangChain stream update 转换为上述事件。

验收标准：

- 前端不依赖 LangChain 内部对象结构也能展示进度。
- 工具错误和最终失败能通过 stream 呈现。

调试关注点：事件乱序、重复 final、工具失败没有 error event、token 拼接乱码。

## A13 MCP 集成与工具边界

学习内容：MCP server/client、stdio/HTTP transport、远程工具边界。

最佳实践：

- MCP 工具命名要带 namespace，避免和本地工具冲突。
- 远程工具必须有超时、权限、审计和错误映射。
- 不默认信任 MCP server 返回内容。
- 对第三方 MCP server 要隔离凭证和权限。

实操任务：

- 设计 MCP 工具接入规范：命名、输入 schema、权限、超时、错误码、审计字段。
- 标出哪些 MCP 工具可以直接暴露给模型，哪些只能 headless 调用。

验收标准：

- 你能解释 MCP 与普通本地 tool 的工程边界。
- 你能设计一个可审计、可替换的 MCP 接入层。

调试关注点：工具命名冲突、远程超时、凭证泄露、MCP 返回内容被直接信任。
