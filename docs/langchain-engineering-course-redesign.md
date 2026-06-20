# LangChain 工程师课程重设计

日期：2026-06-20

## 设计定位

这门课不再定位为“照着 Quickstart 跑脚本”，而是定位为面向工程师的 LangChain / LangGraph Agent 工程课。学习者默认具备 TypeScript、Node.js、HTTP API、基础数据库和测试经验，课程目标是把一个可演示的 Agent 升级为可测试、可观测、可部署、可迭代的工程系统。

新版课程主线：

1. 先掌握 LangChain v1 的 Agent 基元：模型、消息、工具、提示词、结构化输出、middleware。
2. 再判断什么时候用普通链路、什么时候用 Agent、什么时候上 LangGraph。
3. 用 RAG、文件、SQL、外部 API 做真实工程集成。
4. 用 LangSmith tracing、测试、评测和部署把 Agent 纳入工程生命周期。

## 现有课程诊断

当前仓库已经具备很好的入门骨架：

- `README.md` 给出了 Node 22、GLM provider、lesson 脚本和学习路线。
- `langchain-js-agent-tutorial.md` 覆盖了官方 Quickstart 的主要概念。
- `src/lessons/01` 到 `11` 能跑通基础 Agent、工具、提示词、记忆、研究任务、Deep Agent、LangSmith、结构化输出、文件问答和模拟数据库查询。
- 工具层已经有初步安全意识，例如 `read_local_text_file` 限制读取当前项目目录。

但如果面向工程师，当前课程还缺少这些关键能力：

- 缺少“不要默认用 Agent”的架构判断：简单结构化任务、固定流程、动态工具选择、长任务编排应该分开讲。
- `09-structured-output` 主要靠 prompt 要求 JSON，应该升级为 `createAgent.responseFormat` 或模型原生结构化输出。
- 记忆只讲 `MemorySaver` 和 `thread_id`，还没讲短期 checkpoint、长期 store、历史裁剪、摘要和生产持久化。
- 研究型任务直接抓 URL 文本，缺少文档加载、清洗、切分、embedding、vector store、retriever 和引用证据链。
- Deep Agent 被放在第 6 课，但学生还没学 LangGraph、持久化、工具风险和任务分解，容易把它当成魔法能力。
- LangSmith 只作为 tracing 开关出现，还没进入调试、数据集、离线评测、线上评测和回归测试闭环。
- 没有单元测试、fake model、工具测试、集成测试、评测数据集和失败案例库。
- 没有 streaming、human-in-the-loop、guardrails、tool call limit、权限模型和 side-effect 审批。
- 没有生产结构：`langgraph.json`、环境变量分层、部署、日志、限流、成本、超时和重试策略。

## 课程设计原则

- 以工程判断为核心：先判断问题形态，再选择 chain、Agent、LangGraph、Deep Agent 或 RAG。
- 工具必须工程化：小而确定、schema 清晰、输出稳定、错误可分类、超时可控、权限明确。
- 结构化输出不靠祈祷：优先用 schema、`responseFormat`、provider strategy 或 tool strategy，而不是只在 prompt 中写“输出 JSON”。
- 记忆分层：短期会话状态用 checkpointer，长期用户事实和业务知识用 store 或外部数据库。
- RAG 不是“把全文塞给模型”：必须包含 ingestion、chunking、metadata、retrieval、citations、prompt-injection 防护和评测。
- 高风险动作必须可审计：SQL 写入、文件写入、邮件发送、支付、生产数据修改都要有 human-in-the-loop 或等价审批。
- 从第一天开始可观测：每个实验都能在 LangSmith 或日志中看到输入、工具调用、输出、token、错误和元数据。
- 从中段开始可测试：工具单测、Agent fake model 测试、RAG 检索评测、端到端 golden dataset 都要进入课程。

## 新版课程目录

建议重构为 5 个模块、17 课、1 个贯穿项目。

| 模块 | 课次 | 新课名 | 对应现有章节 | 工程交付物 |
| --- | --- | --- | --- | --- |
| A. 基础工程骨架 | 01 | 项目初始化与模型 Provider 抽象 | 0、1、5、provider-switching | `src/models/` provider factory，统一 env 命名，Node 版本检查 |
| A. 基础工程骨架 | 02 | LangChain v1 核心对象：messages、model、agent harness | 2、01 | 最小 Agent，加 tags/metadata/runName |
| A. 基础工程骨架 | 03 | 工具工程：schema、错误、超时、重试、返回协议 | 3、02 | 天气/时区工具升级为可测工具，补工具单测 |
| A. 基础工程骨架 | 04 | Prompt 与 Context Engineering | 4、03 | 系统提示词模板、动态上下文、工具使用策略 |
| A. 基础工程骨架 | 05 | 结构化输出：schema 优先，而不是 prompt-only JSON | 10、09 | `responseFormat` + Zod schema + 输出验证 |
| B. Agent 控制与状态 | 06 | 什么时候用 Agent，什么时候不用 Agent | 2、7 | chain vs agent vs graph 决策表，两个对照实现 |
| B. Agent 控制与状态 | 07 | Agent loop、tool call limit、fallback、retry | 01、02、07 | 增加 tool call 限制、模型 fallback、错误演示 |
| B. Agent 控制与状态 | 08 | 短期记忆、长期记忆与持久化 | 6、04 | `MemorySaver` 示例 + 生产 checkpointer/store 设计 |
| B. Agent 控制与状态 | 09 | LangGraph 工作流：routing、parallel、evaluator-optimizer | 7、06 | 一个确定性 workflow + 一个动态 Agent 对照 |
| B. Agent 控制与状态 | 10 | Streaming 与事件流：给 UI 和 CLI 实时反馈 | 新增 | token 流、工具进度流、最终状态流 |
| C. 知识与数据集成 | 11 | 文档摄取：loader、clean、split、metadata | 5、8、10 | URL/本地文件 ingestion pipeline |
| C. 知识与数据集成 | 12 | RAG：vector store、retriever、citation、拒答策略 | 5、8、10 | RAG chain 与 RAG agent 两种实现 |
| C. 知识与数据集成 | 13 | 本地文件问答的权限模型与索引策略 | 10 | allowlist、文件大小限制、索引缓存 |
| C. 知识与数据集成 | 14 | SQL / 数据工具：只读查询、schema introspection、审批 | 11 | SQL agent，查询校验，HITL 审批 |
| D. 复杂 Agent 模式 | 15 | Deep Agents 与多 Agent：何时使用，何时避免 | 7、06 | Deep Agent 与 LangGraph subagent 对照实验 |
| E. 生产化闭环 | 16 | LangSmith 可观测性：trace、debug、metadata、项目隔离 | 8、07 | 标准 tracing 配置和调试 checklist |
| E. 生产化闭环 | 17 | 测试、评测与部署 | 新增 | fake model 单测、LangSmith dataset/eval、`langgraph.json` 部署骨架 |

## 贯穿项目

项目名称：工程级研究助手。

最终能力：

- 输入一个 URL、本地文档或知识库问题。
- 自动判断是否需要检索、工具调用或人工确认。
- 支持结构化输出：`answer`、`citations`、`confidence`、`limitations`、`tool_trace_summary`。
- 对文件和 SQL 工具实施权限控制。
- 对高风险动作触发 human-in-the-loop。
- 对长任务提供 streaming 进度。
- 每次运行写入 LangSmith trace，关键字段带 metadata。
- 有工具单测、Agent 单测、RAG 检索评测和端到端评测集。
- 能通过 `langgraph.json` 或 Web API 形式部署。

## 当前章节到新版课程的迁移

| 当前章节 | 保留方式 | 升级重点 |
| --- | --- | --- |
| 0. 学习目标 | 合并到新版课程总览 | 改为工程能力目标和项目交付目标 |
| 1. 环境准备 | 升级为第 01 课 | env 命名泛化，Provider 抽象，不绑定 `GLM_*` 概念 |
| 2. 第一个 Agent | 升级为第 02 课 | 补 messages、run config、metadata、trace naming |
| 3. 工具设计 | 升级为第 03 课 | 补错误协议、超时、重试、工具返回 artifact、测试 |
| 4. System Prompt | 升级为第 04 课 | 补 context engineering 和 middleware |
| 5. 模型配置 | 合并到第 01、07 课 | 补 fallback、retry、provider capability matrix |
| 6. 记忆 | 升级为第 08 课 | 区分 checkpoint 与 long-term store，补 trim/summarize |
| 7. Agents vs Deep Agents | 移到第 06 和第 15 课 | 先讲架构判断，再讲 Deep Agent |
| 8. 追踪 | 升级为第 16 课 | 从 tracing 开关升级为调试和生产观测方法 |
| 9. 推荐学习路线 | 替换为 5 模块路线 | 每课都有工程交付物和验收标准 |
| 10. 扩展章节 | 拆入第 05、11、12、13、14、17 课 | 结构化输出、RAG、文件、SQL、测试、部署分开讲 |
| 11. 第一个实战项目 | 升级为贯穿项目 | 从 URL 总结助手升级为工程级研究助手 |

## 每课建议结构

每一课都建议固定成同一套教学结构：

1. 问题场景：这一课解决什么工程问题。
2. 架构判断：为什么用这个 LangChain / LangGraph 能力，而不是别的方案。
3. 最小实现：保留可运行脚本。
4. 工程升级：错误、测试、观测、权限、性能至少覆盖一个维度。
5. 失败案例：展示一个常见坑，例如 JSON 解析失败、工具重复调用、RAG 引用错误。
6. 验收标准：明确“学会”的标准，不只看脚本是否运行成功。

## 仓库结构建议

建议逐步演进为：

```text
src/
  agents/
    basic-agent.ts
    research-agent.ts
    rag-agent.ts
    sql-agent.ts
  graphs/
    research-workflow.ts
    sql-review-workflow.ts
  models/
    course-model.ts
    providers.ts
  prompts/
    research.ts
    sql.ts
  rag/
    ingest.ts
    split.ts
    retrieve.ts
    citations.ts
  shared/
    config.ts
    errors.ts
    logging.ts
  tools/
    weather.ts
    fetch-url.ts
    local-file.ts
    sql.ts
  lessons/
  evals/
    datasets/
    run-eval.ts
tests/
  tools/
  agents/
  rag/
langgraph.json
```

## 建议新增 npm scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "eval": "tsx src/evals/run-eval.ts",
    "lesson:12": "tsx src/lessons/12-rag-agent.ts",
    "lesson:13": "tsx src/lessons/13-file-indexing.ts",
    "lesson:14": "tsx src/lessons/14-sql-agent.ts",
    "lesson:15": "tsx src/lessons/15-deep-agent-patterns.ts",
    "lesson:16": "tsx src/lessons/16-langsmith-debugging.ts",
    "lesson:17": "tsx src/lessons/17-testing-evaluation-deploy.ts"
  }
}
```

## 关键最佳实践清单

- Agent 不是默认选择：固定流程先写 chain 或 LangGraph workflow，只有需要动态工具选择和多步推理时再用 Agent。
- 工具描述要写“何时用”和“何时不用”，避免模型乱调用。
- 工具返回应区分给模型看的文本和应用保留的 artifact，RAG 检索尤其需要保留原始文档 metadata。
- 所有网络、文件、SQL 工具都要有超时、大小限制、错误类型和权限边界。
- 结构化输出使用 schema 能力，prompt 只做业务语义约束。
- 检索内容必须被当作数据，不允许检索片段中的指令覆盖系统提示词。
- checkpoint 里不要塞超大文档全文；大对象存外部存储，状态里只保留 ID、摘要或必要 metadata。
- LangGraph 节点要考虑重放和幂等性，尤其是写数据库、发邮件、创建工单等 side effect。
- 对删除、写入、SQL 执行、外发消息等高风险工具加 HITL。
- LangSmith trace 要带 `project`、`runName`、`tags`、`metadata`，否则后期很难按版本和场景排查。
- 测试分三层：纯工具单测、fake model Agent 单测、真实模型端到端评测。
- RAG 评测至少覆盖检索命中率、答案忠实度、引用正确性和拒答行为。

## 实施路线

第一阶段：不大改代码，先重排文档和前 6 课。

- 把 `README.md` 学习路线改成 5 模块路线。
- 把 `lesson:09` 改为 schema-based structured output。
- 给 `src/tools` 增加基础单测。
- 增加 `docs/architecture-decisions.md`，说明 chain / Agent / LangGraph / Deep Agent 的选择。

第二阶段：补工程核心能力。

- 新增 RAG ingestion、retrieval、citation 课程。
- 新增 LangGraph workflow 和 streaming 课程。
- 新增 human-in-the-loop 和 guardrails 课程。
- 引入 Vitest 和 fake model 测试。

第三阶段：完成生产闭环。

- 建 LangSmith eval dataset。
- 增加 `langgraph.json` 和部署说明。
- 把贯穿项目做成一个 CLI 或最小 Web API。
- 用一组固定任务做回归评测，比较 prompt、模型、retriever 和工具策略变化。

## 参考来源

- LangChain JS overview: https://docs.langchain.com/oss/javascript/langchain/overview
- LangChain JS agents: https://docs.langchain.com/oss/javascript/langchain/agents
- LangChain JS tools: https://docs.langchain.com/oss/javascript/langchain/tools
- LangChain JS structured output: https://docs.langchain.com/oss/javascript/langchain/structured-output
- LangChain JS streaming: https://docs.langchain.com/oss/javascript/langchain/streaming
- LangChain JS unit testing: https://docs.langchain.com/oss/javascript/langchain/test/unit-testing
- LangChain JS RAG: https://docs.langchain.com/oss/javascript/langchain/rag
- LangChain JS knowledge base: https://docs.langchain.com/oss/javascript/langchain/knowledge-base
- LangGraph JS persistence: https://docs.langchain.com/oss/javascript/langgraph/persistence
- LangGraph JS workflows and agents: https://docs.langchain.com/oss/javascript/langgraph/workflows-agents
- LangGraph JS application structure: https://docs.langchain.com/oss/javascript/langgraph/application-structure
- LangChain JS human-in-the-loop: https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop
- LangSmith observability: https://docs.langchain.com/langsmith/observability
- LangSmith evaluation: https://docs.langchain.com/langsmith/evaluation
