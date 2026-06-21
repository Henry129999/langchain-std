export type AdvancedTrack =
  | "langchain"
  | "rag"
  | "langgraph"
  | "deepagents"
  | "langsmith"
  | "production";

export interface AdvancedLesson {
  id: string;
  track: AdvancedTrack;
  title: string;
  engineerFocus: string;
  officialDocs: string[];
  deliverable: string;
}

export interface AdvancedModule {
  track: AdvancedTrack;
  title: string;
  outcome: string;
  lessons: AdvancedLesson[];
}

const langChainDocs = {
  overview: "https://docs.langchain.com/oss/javascript/langchain/overview",
  agents: "https://docs.langchain.com/oss/javascript/langchain/agents",
  models: "https://docs.langchain.com/oss/javascript/langchain/models",
  messages: "https://docs.langchain.com/oss/javascript/langchain/messages",
  tools: "https://docs.langchain.com/oss/javascript/langchain/tools",
  middleware: "https://docs.langchain.com/oss/javascript/langchain/middleware",
  structuredOutput:
    "https://docs.langchain.com/oss/javascript/langchain/structured-output",
  streaming: "https://docs.langchain.com/oss/javascript/langchain/streaming",
  shortTermMemory:
    "https://docs.langchain.com/oss/javascript/langchain/short-term-memory",
  longTermMemory:
    "https://docs.langchain.com/oss/javascript/langchain/long-term-memory",
  contextEngineering:
    "https://docs.langchain.com/oss/javascript/langchain/context-engineering",
  guardrails: "https://docs.langchain.com/oss/javascript/langchain/guardrails",
  runtime: "https://docs.langchain.com/oss/javascript/langchain/runtime",
  humanInTheLoop:
    "https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop",
  mcp: "https://docs.langchain.com/oss/javascript/langchain/mcp",
  retrieval: "https://docs.langchain.com/oss/javascript/langchain/retrieval",
};

const langGraphDocs = {
  overview: "https://docs.langchain.com/oss/javascript/langgraph/overview",
  quickstart: "https://docs.langchain.com/oss/javascript/langgraph/quickstart",
  thinking:
    "https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph",
  persistence:
    "https://docs.langchain.com/oss/javascript/langgraph/persistence",
  faultTolerance:
    "https://docs.langchain.com/oss/javascript/langgraph/fault-tolerance",
  checkpointers:
    "https://docs.langchain.com/oss/javascript/langgraph/checkpointers",
  stores: "https://docs.langchain.com/oss/javascript/langgraph/stores",
  eventStreaming:
    "https://docs.langchain.com/oss/javascript/langgraph/event-streaming",
  interrupts:
    "https://docs.langchain.com/oss/javascript/langgraph/human-in-the-loop",
  timeTravel:
    "https://docs.langchain.com/oss/javascript/langgraph/use-time-travel",
  memory: "https://docs.langchain.com/oss/javascript/langgraph/add-memory",
  subgraphs: "https://docs.langchain.com/oss/javascript/langgraph/use-subgraphs",
  streaming: "https://docs.langchain.com/oss/javascript/langgraph/streaming",
  choosingApis:
    "https://docs.langchain.com/oss/javascript/langgraph/choosing-apis",
  graphApi: "https://docs.langchain.com/oss/javascript/langgraph/graph-api",
  functionalApi:
    "https://docs.langchain.com/oss/javascript/langgraph/functional-api",
  useFunctionalApi:
    "https://docs.langchain.com/oss/javascript/langgraph/use-functional-api",
  runtime: "https://docs.langchain.com/oss/javascript/langgraph/pregel",
  test: "https://docs.langchain.com/oss/javascript/langgraph/test",
  customStreamChannels:
    "https://docs.langchain.com/oss/javascript/langgraph/frontend/custom-stream-channels",
};

const deepAgentDocs = {
  overview: "https://docs.langchain.com/oss/javascript/deepagents/overview",
  quickstart: "https://docs.langchain.com/oss/javascript/deepagents/quickstart",
  models: "https://docs.langchain.com/oss/javascript/deepagents/models",
  tools: "https://docs.langchain.com/oss/javascript/deepagents/tools",
  contextEngineering:
    "https://docs.langchain.com/oss/javascript/deepagents/context-engineering",
  backends: "https://docs.langchain.com/oss/javascript/deepagents/backends",
  subagents: "https://docs.langchain.com/oss/javascript/deepagents/subagents",
  asyncSubagents:
    "https://docs.langchain.com/oss/javascript/deepagents/async-subagents",
  permissions:
    "https://docs.langchain.com/oss/javascript/deepagents/permissions",
  memory: "https://docs.langchain.com/oss/javascript/deepagents/memory",
  skills: "https://docs.langchain.com/oss/javascript/deepagents/skills",
  sandboxes: "https://docs.langchain.com/oss/javascript/deepagents/sandboxes",
  interpreters:
    "https://docs.langchain.com/oss/javascript/deepagents/interpreters",
  profiles: "https://docs.langchain.com/oss/javascript/deepagents/profiles",
  streaming: "https://docs.langchain.com/oss/javascript/deepagents/streaming",
  humanInTheLoop:
    "https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop",
  customization:
    "https://docs.langchain.com/oss/javascript/deepagents/customization",
  frontendOverview:
    "https://docs.langchain.com/oss/javascript/deepagents/frontend/overview",
  acp: "https://docs.langchain.com/oss/javascript/deepagents/acp",
  goingToProduction:
    "https://docs.langchain.com/oss/javascript/deepagents/going-to-production",
};

const langSmithDocs = {
  jsSetup: "https://docs.langchain.com/langsmith/setup-javascript",
  observability: "https://docs.langchain.com/langsmith/observability",
  tracingQuickstart:
    "https://docs.langchain.com/langsmith/observability-quickstart",
  evaluation: "https://docs.langchain.com/langsmith/evaluation",
  evaluationConcepts:
    "https://docs.langchain.com/langsmith/evaluation-concepts",
  ragEvaluation: "https://docs.langchain.com/langsmith/evaluate-rag-tutorial",
  complexAgentEvaluation:
    "https://docs.langchain.com/langsmith/evaluate-complex-agent",
};

export const advancedCurriculum: AdvancedModule[] = [
  {
    track: "langchain",
    title: "模块 A：LangChain Agent 工程化",
    outcome:
      "把基础 Agent 升级为可控、可观测、可扩展的工程组件，掌握 agent harness、middleware、runtime、memory、guardrails 与工具治理。",
    lessons: [
      {
        id: "A01",
        track: "langchain",
        title: "Agent Harness 架构与适用边界",
        engineerFocus:
          "判断何时使用 agent，何时使用固定链路或 LangGraph；拆解 model/tools/systemPrompt/structured output 的职责边界。",
        officialDocs: [langChainDocs.overview, langChainDocs.agents],
        deliverable: "画出你当前研究助手的 Agent loop，并标注每个环节的可测试边界。",
      },
      {
        id: "A02",
        track: "langchain",
        title: "模型、消息与 Invocation Config",
        engineerFocus:
          "掌握模型参数、reasoning、token usage、stream/batch/invoke、tags/metadata/runName 与动态模型选择。",
        officialDocs: [
          langChainDocs.models,
          langChainDocs.messages,
          langChainDocs.runtime,
        ],
        deliverable: "封装一个支持 run metadata、timeout、temperature 与 provider 切换的模型工厂。",
      },
      {
        id: "A03",
        track: "langchain",
        title: "Context Engineering：控制模型可见信息",
        engineerFocus:
          "把上下文分为 model context、tool context、lifecycle context，避免把所有历史和工具结果无差别塞进 prompt。",
        officialDocs: [langChainDocs.contextEngineering],
        deliverable: "为研究助手定义 context budget、证据注入格式和上下文裁剪策略。",
      },
      {
        id: "A04",
        track: "langchain",
        title: "Middleware 生命周期",
        engineerFocus:
          "使用 beforeAgent、beforeModel、wrapModelCall、wrapToolCall、afterModel、afterAgent 实现横切能力，而不是污染业务工具。",
        officialDocs: [langChainDocs.middleware, langChainDocs.agents],
        deliverable: "实现一个记录模型调用、工具调用、耗时和错误类型的 middleware。",
      },
      {
        id: "A05",
        track: "langchain",
        title: "动态系统提示词与 Runtime Context",
        engineerFocus:
          "根据用户角色、任务类型、环境变量和运行配置生成系统提示词，并在工具和 middleware 中读取 runtime。",
        officialDocs: [langChainDocs.runtime, langChainDocs.middleware],
        deliverable: "实现 engineer/reviewer/operator 三种运行角色的动态提示词策略。",
      },
      {
        id: "A06",
        track: "langchain",
        title: "Tool 高级设计：上下文、错误、返回值",
        engineerFocus:
          "区分工具输入 schema、执行上下文、ToolMessage、结构化返回、错误重试、不可恢复错误和用户可见错误。",
        officialDocs: [langChainDocs.tools],
        deliverable: "把 URL/file/search 三类工具改造成统一 envelope：ok/data/error/source。",
      },
      {
        id: "A07",
        track: "langchain",
        title: "工具选择治理：动态选择、Headless Tool、调用上限",
        engineerFocus:
          "减少工具暴露面，限制危险工具调用，理解模型可见工具和系统内部工具的差别。",
        officialDocs: [langChainDocs.tools, langChainDocs.middleware],
        deliverable: "实现按任务类型暴露工具的 selector，并为高风险工具设置调用上限。",
      },
      {
        id: "A08",
        track: "langchain",
        title: "结构化输出的生产策略",
        engineerFocus:
          "比较 provider strategy 与 tool strategy；设计 schema 版本、错误恢复、兼容字段和程序读取协议。",
        officialDocs: [langChainDocs.structuredOutput],
        deliverable: "为研究答案、引用证据、后续行动设计 v1 schema，并写出兼容升级规则。",
      },
      {
        id: "A09",
        track: "langchain",
        title: "Guardrails 与 PII 治理",
        engineerFocus:
          "在请求前、模型后、工具前后分别放置防护；识别 PII、权限、注入和越权工具调用风险。",
        officialDocs: [langChainDocs.guardrails, langChainDocs.middleware],
        deliverable: "实现输入侧 PII redaction 和工具侧 allowlist，并记录被拦截原因。",
      },
      {
        id: "A10",
        track: "langchain",
        title: "Human-in-the-loop 审批",
        engineerFocus:
          "为写文件、发请求、删除数据、调用外部系统等高风险动作设计 approve/reject/edit 决策流。",
        officialDocs: [langChainDocs.humanInTheLoop],
        deliverable: "给一个写文件工具加人工审批策略，并支持用户编辑工具参数。",
      },
      {
        id: "A11",
        track: "langchain",
        title: "短期记忆与长期记忆",
        engineerFocus:
          "区分 thread-scoped short-term memory 和 cross-thread long-term store；掌握 trim/delete/summarize/read/write。",
        officialDocs: [
          langChainDocs.shortTermMemory,
          langChainDocs.longTermMemory,
        ],
        deliverable: "为研究助手实现会话摘要和用户偏好存储，并定义何时写入长期记忆。",
      },
      {
        id: "A12",
        track: "langchain",
        title: "Streaming 体验与事件协议",
        engineerFocus:
          "设计 agent progress、LLM tokens、custom updates、多模式 stream 的前端事件协议。",
        officialDocs: [langChainDocs.streaming],
        deliverable: "把工具调用开始、工具返回、模型最终回答拆成可消费的 UI event。",
      },
      {
        id: "A13",
        track: "langchain",
        title: "MCP 集成与工具边界",
        engineerFocus:
          "理解 MCP server/client、stdio/HTTP transport、远程工具安全边界和工具命名治理。",
        officialDocs: [langChainDocs.mcp, langChainDocs.tools],
        deliverable: "设计一个 MCP 工具接入规范：命名、权限、错误、超时、审计字段。",
      },
    ],
  },
  {
    track: "rag",
    title: "模块 B：RAG 与知识库工程",
    outcome:
      "把第 10 课的简单检索升级为可评测、可维护、可引用的知识库问答系统。",
    lessons: [
      {
        id: "B01",
        track: "rag",
        title: "RAG 架构决策：2-step、Agentic、Hybrid",
        engineerFocus:
          "根据任务不确定性、延迟、成本、可解释性选择 RAG 形态，不把所有问题都做成 agentic RAG。",
        officialDocs: [langChainDocs.retrieval],
        deliverable: "为课程资料问答画出 2-step、agentic、hybrid 三种架构的取舍表。",
      },
      {
        id: "B02",
        track: "rag",
        title: "文档加载、清洗与 Chunk 策略",
        engineerFocus:
          "处理 Markdown、代码、网页、PDF 的 chunk 边界、metadata、去噪和增量索引。",
        officialDocs: [langChainDocs.retrieval],
        deliverable: "定义课程知识库的 chunk schema：id/source/title/section/content/hash。",
      },
      {
        id: "B03",
        track: "rag",
        title: "Embedding、向量库与索引更新",
        engineerFocus:
          "理解 embedding 不是答案，只是召回空间；设计索引构建、更新、删除和版本管理。",
        officialDocs: [langChainDocs.retrieval],
        deliverable: "实现一个可替换 embedding/vector store 的接口层。",
      },
      {
        id: "B04",
        track: "rag",
        title: "Hybrid Retrieval 与 Rerank",
        engineerFocus:
          "组合关键词、向量、metadata filter 和 rerank，降低只靠相似度带来的误召回。",
        officialDocs: [langChainDocs.retrieval],
        deliverable: "把 simple keyword retriever 扩展为 hybrid scoring，并输出每个 chunk 的分数解释。",
      },
      {
        id: "B05",
        track: "rag",
        title: "引用、Grounding 与拒答",
        engineerFocus:
          "强制答案绑定证据，区分 evidence、reasoning、final answer，证据不足时拒答。",
        officialDocs: [langChainDocs.retrieval, langChainDocs.structuredOutput],
        deliverable: "让研究助手输出 answer + citations + unsupportedClaims。",
      },
      {
        id: "B06",
        track: "rag",
        title: "RAG 评测：召回、相关性、忠实度",
        engineerFocus:
          "用固定数据集评测 retrieval relevance、groundedness、correctness，而不是只看一次 demo 是否回答得像。",
        officialDocs: [langSmithDocs.ragEvaluation, langSmithDocs.evaluation],
        deliverable: "创建一组课程问答 golden cases，并定义 retrieval 与 final answer evaluator。",
      },
    ],
  },
  {
    track: "langgraph",
    title: "模块 C：LangGraph 工作流编排",
    outcome:
      "掌握可持久化、可中断、可恢复、可观测的多步骤 agent/workflow 编排能力。",
    lessons: [
      {
        id: "C01",
        track: "langgraph",
        title: "从 Agent Loop 到 StateGraph",
        engineerFocus:
          "理解 LangChain agent 适合动态决策，LangGraph 适合显式状态机、长期运行和可恢复流程。",
        officialDocs: [langGraphDocs.overview, langGraphDocs.quickstart],
        deliverable: "把研究助手拆成 retrieve、grade、answer、review 四个节点。",
      },
      {
        id: "C02",
        track: "langgraph",
        title: "State 设计：原始状态、派生状态、Reducer",
        engineerFocus:
          "避免在 state 中保存格式化 prompt；区分输入、节点输出、累计消息、审计信息。",
        officialDocs: [langGraphDocs.thinking],
        deliverable: "为研究工作流设计 GraphState，并说明每个字段的生命周期。",
      },
      {
        id: "C03",
        track: "langgraph",
        title: "节点、边与条件路由",
        engineerFocus:
          "用节点表达确定性步骤，用条件边表达业务路由；避免让一个节点承担所有逻辑。",
        officialDocs: [langGraphDocs.quickstart, langGraphDocs.thinking],
        deliverable: "实现 evidenceEnough ? answer : clarify 的条件路由。",
      },
      {
        id: "C04",
        track: "langgraph",
        title: "Command、并行分支与错误恢复",
        engineerFocus:
          "掌握节点如何同时更新 state 和控制下一跳；为外部 IO、LLM、工具调用设置可恢复错误策略。",
        officialDocs: [langGraphDocs.thinking],
        deliverable: "为检索失败、模型失败、工具失败分别设计 retry/fallback/escalate。",
      },
      {
        id: "C05",
        track: "langgraph",
        title: "Persistence：Checkpointer vs Store",
        engineerFocus:
          "区分 thread checkpoint 和长期 store；设计 thread_id、checkpoint 恢复和跨会话数据。",
        officialDocs: [langGraphDocs.persistence],
        deliverable: "给研究工作流加 MemorySaver，并演示同一 thread 的恢复。",
      },
      {
        id: "C06",
        track: "langgraph",
        title: "Interrupt 与人工审核",
        engineerFocus:
          "使用 interrupt/resume 实现暂停、审批、编辑 state、校验用户输入；理解中断规则和幂等副作用。",
        officialDocs: [langGraphDocs.interrupts],
        deliverable: "在 answer 发布前加人工审核，支持 approve/edit/reject。",
      },
      {
        id: "C07",
        track: "langgraph",
        title: "LangGraph Streaming",
        engineerFocus:
          "使用 values、updates、messages、custom、debug 多种 stream mode，为 UI 和调试选择不同事件粒度。",
        officialDocs: [langGraphDocs.streaming],
        deliverable: "输出检索进度、节点状态、模型 token 和 debug 事件。",
      },
      {
        id: "C08",
        track: "langgraph",
        title: "子图与多 Agent 工作流",
        engineerFocus:
          "把复杂系统拆成 reviewer、researcher、writer 子图；明确共享 state 和局部 state 的边界。",
        officialDocs: [
          langGraphDocs.thinking,
          langGraphDocs.subgraphs,
          langGraphDocs.streaming,
        ],
        deliverable: "设计一个 researcher -> critic -> writer 的子图方案。",
      },
      {
        id: "C09",
        track: "langgraph",
        title: "Persistence 深水区：Checkpointers、Stores、Memory、Time Travel",
        engineerFocus:
          "把 thread checkpoint、cross-thread store、graph memory、time travel 和 fault tolerance 放进同一套恢复模型中理解。",
        officialDocs: [
          langGraphDocs.persistence,
          langGraphDocs.checkpointers,
          langGraphDocs.stores,
          langGraphDocs.memory,
          langGraphDocs.timeTravel,
          langGraphDocs.faultTolerance,
        ],
        deliverable: "设计一个 thread_id、checkpoint_id、store namespace 与回放调试策略。",
      },
      {
        id: "C10",
        track: "langgraph",
        title: "Interrupt 高级模式：多中断、工具内中断、输入校验",
        engineerFocus:
          "掌握 multiple interrupts、approve/reject、review/edit state、tool interrupts、validation loop、静态断点和 Studio 调试。",
        officialDocs: [langGraphDocs.interrupts],
        deliverable: "实现一份 HITL 设计表：触发点、payload、resume command、幂等要求、失败恢复。",
      },
      {
        id: "C11",
        track: "langgraph",
        title: "Streaming 深水区：事件模式、过滤、Tool Progress、Subgraph",
        engineerFocus:
          "覆盖 updates/values/messages/custom/debug/checkpoints/tasks，多模式组合，按 node/invocation 过滤 token，工具进度与子图事件。",
        officialDocs: [
          langGraphDocs.streaming,
          langGraphDocs.eventStreaming,
          langGraphDocs.customStreamChannels,
        ],
        deliverable: "定义前端可消费的 graph event envelope，并区分 tools/custom/debug 三类事件。",
      },
      {
        id: "C12",
        track: "langgraph",
        title: "LangGraph API、Runtime、测试与生产结构",
        engineerFocus:
          "理解 Graph API vs Functional API、Pregel runtime、local/server 运行边界、测试策略、兼容性和应用目录结构。",
        officialDocs: [
          langGraphDocs.choosingApis,
          langGraphDocs.graphApi,
          langGraphDocs.functionalApi,
          langGraphDocs.useFunctionalApi,
          langGraphDocs.runtime,
          langGraphDocs.test,
        ],
        deliverable: "给 capstone 设计 graph 目录结构、节点单测、端到端轨迹测试和 schema 兼容策略。",
      },
    ],
  },
  {
    track: "deepagents",
    title: "模块 D：Deep Agents 长任务系统",
    outcome:
      "理解 Deep Agents 如何在 LangGraph 之上提供长任务执行环境、计划、文件系统、subagents、skills 与 memory。",
    lessons: [
      {
        id: "D01",
        track: "deepagents",
        title: "Deep Agents 定位与架构",
        engineerFocus:
          "理解 Deep Agents 不是替代 LangGraph，而是面向长任务的预置 harness：规划、文件系统、skills、subagents、context offloading。",
        officialDocs: [deepAgentDocs.overview, deepAgentDocs.quickstart],
        deliverable: "写出 LangChain Agent、LangGraph、Deep Agents 的决策矩阵。",
      },
      {
        id: "D02",
        track: "deepagents",
        title: "Execution Environment：工具、MCP、虚拟文件系统",
        engineerFocus:
          "理解 agent 可以读写哪些文件、执行哪些工具、如何限制权限和审计副作用。",
        officialDocs: [
          deepAgentDocs.overview,
          deepAgentDocs.tools,
          deepAgentDocs.backends,
          deepAgentDocs.permissions,
          deepAgentDocs.customization,
        ],
        deliverable: "为课程研究代理设计 filesystem permission policy。",
      },
      {
        id: "D03",
        track: "deepagents",
        title: "任务规划、TODO 与 Context Offloading",
        engineerFocus:
          "让长任务显式维护计划和中间产物，避免所有过程都压在 conversation history 里。",
        officialDocs: [deepAgentDocs.overview, deepAgentDocs.customization],
        deliverable: "实现长文档研究任务的 todo/checkpoint/report 三层产物约定。",
      },
      {
        id: "D04",
        track: "deepagents",
        title: "Subagents 设计",
        engineerFocus:
          "按职责拆分 subagent，写清 description/system prompt，最小化工具集，控制返回信息量。",
        officialDocs: [deepAgentDocs.subagents, deepAgentDocs.asyncSubagents],
        deliverable: "设计 researcher、source-checker、writer 三个 subagent 的职责和工具清单。",
      },
      {
        id: "D05",
        track: "deepagents",
        title: "Skills 与 Memory",
        engineerFocus:
          "区分 agent-scoped、user-scoped、organization-level memory；理解 episodic memory、后台整合、并发写入风险。",
        officialDocs: [
          deepAgentDocs.skills,
          deepAgentDocs.memory,
          deepAgentDocs.contextEngineering,
          deepAgentDocs.customization,
        ],
        deliverable: "定义课程代理的技能加载规范和记忆写入规则。",
      },
      {
        id: "D06",
        track: "deepagents",
        title: "Deep Agents HITL 与权限",
        engineerFocus:
          "对工具调用、subagent 调用、文件写入和外部请求设置 approve/reject/edit 流程。",
        officialDocs: [deepAgentDocs.humanInTheLoop],
        deliverable: "为外部搜索、文件写入、最终报告发布设计 HITL interrupt 策略。",
      },
      {
        id: "D07",
        track: "deepagents",
        title: "Quickstart 到 createDeepAgent：模型、工具、Profile",
        engineerFocus:
          "从 createDeepAgent 的最小可运行入口理解模型选择、工具暴露、profile 配置和默认 harness 行为。",
        officialDocs: [
          deepAgentDocs.quickstart,
          deepAgentDocs.models,
          deepAgentDocs.tools,
          deepAgentDocs.profiles,
        ],
        deliverable: "搭一个最小 Deep Agent spec：model、tools、systemPrompt、profile、运行输入和预期事件。",
      },
      {
        id: "D08",
        track: "deepagents",
        title: "Backends、Permissions、Sandboxes、Interpreters",
        engineerFocus:
          "区分虚拟文件系统后端、权限策略、远程 sandbox、代码解释器和工具执行环境，避免长任务越权或污染宿主环境。",
        officialDocs: [
          deepAgentDocs.backends,
          deepAgentDocs.permissions,
          deepAgentDocs.sandboxes,
          deepAgentDocs.interpreters,
        ],
        deliverable: "输出一份后端选择表：local disk、memory、LangGraph store、sandbox、interpreter 的适用边界。",
      },
      {
        id: "D09",
        track: "deepagents",
        title: "Context Engineering、Prompt Assembly、Middleware",
        engineerFocus:
          "理解系统提示词装配、默认 middleware stack、provider-specific middleware、自定义 middleware、summarization、context offloading 与 prompt caching。",
        officialDocs: [
          deepAgentDocs.contextEngineering,
          deepAgentDocs.customization,
          deepAgentDocs.skills,
          deepAgentDocs.memory,
        ],
        deliverable: "设计一个长任务上下文预算：always-loaded memory、按需 skills、可卸载 evidence、可缓存静态 prompt。",
      },
      {
        id: "D10",
        track: "deepagents",
        title: "Subagents 运维：异步、追踪、结构化输出、故障诊断",
        engineerFocus:
          "覆盖 default/general-purpose subagent、禁用默认 subagent、compiled subagent、async subagent、streaming、LangSmith filtering、structured output 和选择错误排查。",
        officialDocs: [
          deepAgentDocs.subagents,
          deepAgentDocs.asyncSubagents,
          deepAgentDocs.streaming,
        ],
        deliverable: "为 researcher/source-checker/writer 定义可观测字段、输出 schema、最小工具集和错误定位手册。",
      },
      {
        id: "D11",
        track: "deepagents",
        title: "HITL 深水区：多工具审批、编辑参数、Subagent 中断",
        engineerFocus:
          "把 approve/reject/edit、多工具调用、拒绝反馈、subagent tool call interrupt、tool 内 interrupt 与恢复策略做成可复用权限层。",
        officialDocs: [deepAgentDocs.humanInTheLoop, deepAgentDocs.permissions],
        deliverable: "为每类高风险动作定义 decisionTypes、review payload、reject message 和 resume 行为。",
      },
      {
        id: "D12",
        track: "deepagents",
        title: "Frontend、Streaming、Protocols 与生产部署",
        engineerFocus:
          "理解 Deep Agents 前端事件消费、streaming 协议、ACP/MCP 集成边界、going-to-production checklist 和结构化输出交付协议。",
        officialDocs: [
          deepAgentDocs.frontendOverview,
          deepAgentDocs.streaming,
          deepAgentDocs.acp,
          deepAgentDocs.goingToProduction,
          deepAgentDocs.customization,
        ],
        deliverable: "定义一个生产发布清单：事件协议、权限策略、协议接入、trace/eval、结构化结果和回滚策略。",
      },
    ],
  },
  {
    track: "langsmith",
    title: "模块 E：LangSmith 调试、评测与持续改进",
    outcome:
      "把一次性 demo 转为可观测、可回归、可比较的工程系统。",
    lessons: [
      {
        id: "E01",
        track: "langsmith",
        title: "Tracing 与工程可观测性",
        engineerFocus:
          "用 runName、tags、metadata、nested runs 定位模型、工具、RAG 和 graph 节点问题。",
        officialDocs: [
          langSmithDocs.jsSetup,
          langSmithDocs.observability,
          langSmithDocs.tracingQuickstart,
        ],
        deliverable: "为所有进阶 lesson 统一 tracing 命名规范。",
      },
      {
        id: "E02",
        track: "langsmith",
        title: "Evaluation 基础：Dataset、Target、Evaluator",
        engineerFocus:
          "把测试样例、运行目标和评分逻辑分离；理解 offline/online eval 的不同用途。",
        officialDocs: [
          langSmithDocs.evaluation,
          langSmithDocs.evaluationConcepts,
        ],
        deliverable: "建立课程研究助手的 dataset schema 和 evaluator 目录结构。",
      },
      {
        id: "E03",
        track: "langsmith",
        title: "RAG Evaluation",
        engineerFocus:
          "同时评估 response correctness、relevance、groundedness、retrieval relevance。",
        officialDocs: [langSmithDocs.ragEvaluation],
        deliverable: "为 RAG 项目实现 4 个 evaluator，并输出实验对比表。",
      },
      {
        id: "E04",
        track: "langsmith",
        title: "Complex Agent Evaluation",
        engineerFocus:
          "评估最终答案、轨迹、工具调用、中间步骤和副作用，不只看最后一句话。",
        officialDocs: [langSmithDocs.complexAgentEvaluation],
        deliverable: "为 Agent/Graph 设计 trajectory evaluator 和 single-step evaluator。",
      },
      {
        id: "E05",
        track: "langsmith",
        title: "CI 回归与实验比较",
        engineerFocus:
          "把 prompt/model/tool/schema 改动变成可比较实验，设置阻断发布的质量门禁。",
        officialDocs: [
          langSmithDocs.evaluation,
          langSmithDocs.evaluationConcepts,
        ],
        deliverable: "定义合并前必须通过的 correctness、groundedness、latency 阈值。",
      },
    ],
  },
  {
    track: "production",
    title: "模块 F：生产化 Capstone",
    outcome:
      "完成一个具备 RAG、显式工作流、长任务执行、审批、评测和观测的工程级研究代理。",
    lessons: [
      {
        id: "F01",
        track: "production",
        title: "系统边界与 API 设计",
        engineerFocus:
          "明确 Web/API 层、Agent 层、Tool 层、Storage 层、Eval 层，避免业务代码和模型提示词耦合。",
        officialDocs: [
          langChainDocs.agents,
          langGraphDocs.thinking,
          deepAgentDocs.overview,
        ],
        deliverable: "输出 capstone 的模块边界图和目录结构。",
      },
      {
        id: "F02",
        track: "production",
        title: "安全、权限与副作用控制",
        engineerFocus:
          "为文件、网络、外部 API、用户数据设计权限、审计、超时、幂等和回滚策略。",
        officialDocs: [
          langChainDocs.guardrails,
          langGraphDocs.interrupts,
          deepAgentDocs.humanInTheLoop,
        ],
        deliverable: "输出工具权限矩阵和 HITL 策略。",
      },
      {
        id: "F03",
        track: "production",
        title: "性能、成本与可靠性",
        engineerFocus:
          "跟踪 token usage、latency、cache、重试、fallback、streaming 体验和失败降级。",
        officialDocs: [
          langChainDocs.models,
          langChainDocs.streaming,
          langSmithDocs.observability,
        ],
        deliverable: "建立一次端到端运行的 cost/latency/error 报告。",
      },
      {
        id: "F04",
        track: "production",
        title: "最终项目：Engineering Research Agent",
        engineerFocus:
          "整合 RAG、LangGraph、Deep Agents、LangSmith evaluation，形成可以持续迭代的工程样板。",
        officialDocs: [
          langChainDocs.retrieval,
          langGraphDocs.persistence,
          deepAgentDocs.subagents,
          langSmithDocs.evaluation,
        ],
        deliverable: "提交一个可运行研究代理：可检索、可引用、可审批、可恢复、可评测、可观测。",
      },
    ],
  },
];

export function getAdvancedLessonCount(): number {
  return advancedCurriculum.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
}
