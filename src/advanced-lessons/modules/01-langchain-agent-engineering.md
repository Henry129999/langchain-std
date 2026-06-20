# 模块 A：LangChain Agent 工程化

目标：把基础 Agent 升级为可控、可观测、可扩展的工程组件。

## A01 Agent Harness 架构与适用边界

学习 `createAgent` 的核心结构：model、tools、system prompt、structured output、agent loop、streaming 和配置。重点不是“会调用工具”，而是判断什么时候应该使用 agent，什么时候应该使用固定链路或 LangGraph。

产物：画出当前研究助手的 Agent loop，并标注模型调用、工具调用、最终回答、错误恢复、观测埋点的边界。

## A02 模型、消息与 Invocation Config

学习模型初始化、invoke/stream/batch、reasoning、token usage、baseURL、provider 切换、runName、tags、metadata。你需要能从返回结果里判断模型是否正常停止、是否触发工具、是否存在上下文膨胀。

产物：封装统一模型工厂，支持运行配置和 provider 切换。

## A03 Context Engineering

学习 model context、tool context、lifecycle context。核心判断是：什么信息应该进入模型上下文，什么应该只留在工具或状态里，什么应该被摘要或裁剪。

产物：定义研究助手的上下文预算、证据注入格式和裁剪策略。

## A04 Middleware 生命周期

学习 beforeAgent、beforeModel、wrapModelCall、wrapToolCall、afterModel、afterAgent。middleware 用于横切能力：日志、权限、审计、重试、fallback、注入上下文、改写工具调用。

产物：实现一个记录模型调用、工具调用、耗时和错误类型的 middleware。

## A05 动态系统提示词与 Runtime Context

学习按角色、任务类型、运行环境动态生成系统提示词。工具和 middleware 应该通过 runtime/config 获取上下文，而不是依赖全局变量或硬编码。

产物：实现 engineer/reviewer/operator 三种运行角色的动态提示词策略。

## A06 Tool 高级设计

学习工具 schema、上下文访问、长期记忆访问、stream writer、execution info、server info、工具返回值、错误处理、state injection、动态工具选择、headless tools。

产物：把 URL/file/search 工具改造成统一返回 envelope：`ok/data/error/source`。

## A07 工具选择治理

学习如何减少工具暴露面，如何按任务选择工具，如何控制危险工具调用次数，如何把内部工具设计成 headless tool。

产物：实现按任务类型暴露工具的 selector，并为高风险工具设置调用上限。

## A08 结构化输出生产策略

学习 provider strategy、tool strategy、schema 版本、错误恢复、兼容字段。结构化输出不是“让模型输出 JSON”，而是让程序能稳定消费结果。

产物：为研究答案设计 v1 schema：answer、citations、limitations、unsupportedClaims、nextActions。

## A09 Guardrails 与 PII 治理

学习 built-in guardrails、自定义 guardrails、PII detection、输入侧/输出侧/工具侧防护。重点是风险分层，而不是只写一句“不要泄露隐私”。

产物：实现输入侧 PII redaction 和工具侧 allowlist，并记录被拦截原因。

## A10 Human-in-the-loop 审批

学习 interrupt decision types、approve/reject/edit、多决策、条件中断、streaming HITL。适用于写文件、发请求、删数据、调用外部系统。

产物：给一个写文件工具加人工审批策略，并支持用户编辑工具参数。

## A11 短期记忆与长期记忆

学习 short-term memory、trim/delete/summarize messages、long-term store、工具中读写长期记忆。关键是区分 thread-scoped 和 cross-thread memory。

产物：实现会话摘要和用户偏好存储，并定义何时写入长期记忆。

## A12 Streaming 体验与事件协议

学习 agent progress、LLM tokens、custom updates、多模式 stream、reasoning tokens。重点是把后端事件设计成前端能稳定消费的协议。

产物：输出工具调用开始、工具返回、模型最终回答三类 UI event。

## A13 MCP 集成与工具边界

学习 MCP quickstart、自定义 server、stdio/HTTP transport、工具暴露和远程工具边界。

产物：设计 MCP 工具接入规范：命名、权限、错误、超时、审计字段。
