import {
  Annotation,
  Command,
  END,
  getStore,
  InMemoryStore,
  interrupt,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  getTextContent,
  printJson,
  printLearningFocus,
  printModelMessage,
  printSection,
} from "./shared.js";

interface LangGraphLessonSpec {
  id: string;
  title: string;
  focus: string[];
  userPrompt: string;
  evidence: string[];
  routeHint?: "answer" | "clarify";
  mode:
    | "standard"
    | "route"
    | "persistence"
    | "interrupt"
    | "stream"
    | "subgraph"
    | "store"
    | "api";
}

const lessonSpecs: Record<string, LangGraphLessonSpec> = {
  C01: {
    id: "C01",
    title: "从 Agent Loop 到 StateGraph",
    mode: "standard",
    focus: [
      "用 StateGraph 显式表达 retrieve -> answer 的流程",
      "真实模型只负责生成 answer，业务路由留在图里",
      "观察最终 state，而不是只看最后一段文本",
    ],
    userPrompt: "用工程视角说明 LangGraph 为什么适合可恢复的研究工作流。",
    evidence: [
      "LangGraph 用节点和边表达显式状态机。",
      "LangChain Agent 更适合动态工具选择，LangGraph 更适合可恢复流程。",
    ],
  },
  C02: {
    id: "C02",
    title: "State 设计：原始状态、派生状态、Reducer",
    mode: "standard",
    focus: [
      "state 保存业务事实，不保存拼好的 prompt",
      "数组字段用 reducer 追加审计事件",
      "每个字段需要 owner 和生命周期",
    ],
    userPrompt: "请审查这个 GraphState 设计：question、evidence、draft、review、audit。",
    evidence: [
      "question 是用户输入，evidence 是检索结果，draft 是模型草稿。",
      "audit 是跨节点追加的调试轨迹，适合 reducer。",
    ],
  },
  C03: {
    id: "C03",
    title: "节点、边与条件路由",
    mode: "route",
    routeHint: "answer",
    focus: [
      "节点负责产生状态，条件边负责路由",
      "路由值必须是有限枚举",
      "证据不足时不能进入最终回答节点",
    ],
    userPrompt: "根据证据判断是否可以回答：LangGraph 是否适合显式流程？",
    evidence: [
      "证据明确：LangGraph 适合显式状态、条件路由、恢复和中断。",
    ],
  },
  C04: {
    id: "C04",
    title: "Command、并行分支与错误恢复",
    mode: "standard",
    focus: [
      "把错误分成 transient、LLM-recoverable、user-fixable、unexpected",
      "恢复策略要进入 state，便于后续节点解释",
      "外部副作用必须幂等",
    ],
    userPrompt: "请为检索节点、模型节点、写文件节点分别给出恢复策略。",
    evidence: [
      "网络超时适合 retry，schema 错误适合反馈给模型重试。",
      "缺少权限适合 interrupt，未知异常应升级到 fail/escalate。",
    ],
  },
  C05: {
    id: "C05",
    title: "Persistence：Checkpointer vs Store",
    mode: "persistence",
    focus: [
      "checkpointer 保存同一 thread 的 graph state",
      "store 保存跨 thread 的长期数据",
      "thread_id 是业务层必须稳定传入的恢复键",
    ],
    userPrompt: "解释 checkpointer 和 store 在研究助手中的不同职责。",
    evidence: [
      "checkpoint 用于恢复流程位置和 state。",
      "store 用于跨会话偏好、组织策略或长期知识。",
    ],
  },
  C06: {
    id: "C06",
    title: "Interrupt 与人工审核",
    mode: "interrupt",
    focus: [
      "interrupt 暂停图执行，resume 后继续同一 thread",
      "approve/edit/reject 是业务协议，不是自然语言闲聊",
      "interrupt 前的副作用必须幂等",
    ],
    userPrompt: "生成一段需要人工审核后才能发布的研究结论。",
    evidence: ["最终回答发布前需要人工审核，允许 approve/edit/reject。"],
  },
  C07: {
    id: "C07",
    title: "LangGraph Streaming",
    mode: "stream",
    focus: [
      "updates 适合观察节点级 state 更新",
      "messages/custom/debug 面向不同消费端",
      "前端不应该只等待最终答案",
    ],
    userPrompt: "流式说明 LangGraph streaming 的工程价值。",
    evidence: [
      "streaming 可以暴露节点进度、模型 token、工具进度和调试事件。",
    ],
  },
  C08: {
    id: "C08",
    title: "子图与多 Agent 工作流",
    mode: "subgraph",
    focus: [
      "子图封装完整子流程",
      "父图和子图 state 要显式映射",
      "子图输出应结构化，避免父图解析长篇自然语言",
    ],
    userPrompt: "设计 researcher -> critic -> writer 的子图协作边界。",
    evidence: [
      "researcher 产出证据，critic 阻止弱证据，writer 只写被批准内容。",
    ],
  },
  C09: {
    id: "C09",
    title: "Persistence 深水区：Checkpointers、Stores、Memory、Time Travel",
    mode: "store",
    focus: [
      "checkpoint、store、memory、time travel 是不同层次",
      "恢复流程必须考虑幂等副作用",
      "回放调试需要 thread_id、checkpoint_id 和 run metadata",
    ],
    userPrompt: "请给出 checkpoint 回放和长期 store 的生产设计建议。",
    evidence: [
      "time travel 用于调试和恢复到历史 checkpoint。",
      "长期 store 不应被短期 graph state 污染。",
    ],
  },
  C10: {
    id: "C10",
    title: "Interrupt 高级模式：多中断、工具内中断、输入校验",
    mode: "interrupt",
    focus: [
      "多中断需要稳定顺序和稳定 resume payload",
      "工具内 interrupt 适合危险动作审批",
      "输入校验推荐通过状态和条件边循环",
    ],
    userPrompt: "生成一个需要用户编辑参数后再继续的工具调用审批说明。",
    evidence: [
      "多工具审批要按 tool_call_id 追踪，edit 后必须重新校验权限。",
    ],
  },
  C11: {
    id: "C11",
    title: "Streaming 深水区：事件模式、过滤、Tool Progress、Subgraph",
    mode: "stream",
    focus: [
      "多模式 streaming 要有稳定 event envelope",
      "tool progress 和业务 progress 要分开建模",
      "subgraph 事件必须能定位来源",
    ],
    userPrompt: "为 graph 前端事件协议设计 type、source、node、payload 字段。",
    evidence: [
      "updates、values、messages、custom、debug、checkpoints、tasks 服务不同消费者。",
    ],
  },
  C12: {
    id: "C12",
    title: "LangGraph API、Runtime、测试与生产结构",
    mode: "api",
    focus: [
      "Graph API 适合显式节点状态机，Functional API 适合函数式流程",
      "runtime 配置应由 graph factory 注入",
      "节点单测和轨迹测试都要纳入 CI",
    ],
    userPrompt: "请设计 LangGraph 工程目录结构和测试策略。",
    evidence: [
      "生产结构应分离 graph definition、nodes、tools、state、storage、eval、api。",
    ],
  },
};

const GraphState = Annotation.Root({
  lessonId: Annotation<string>(),
  topic: Annotation<string>(),
  question: Annotation<string>(),
  evidence: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  audit: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
  route: Annotation<string>(),
  draft: Annotation<string>(),
  review: Annotation<string>(),
  final: Annotation<string>(),
});

type GraphStateType = typeof GraphState.State;

function createInput(spec: LangGraphLessonSpec): GraphStateType {
  return {
    lessonId: spec.id,
    topic: spec.title,
    question: spec.userPrompt,
    evidence: [],
    audit: [],
    route: spec.routeHint ?? "answer",
    draft: "",
    review: "",
    final: "",
  };
}

async function callLessonModel(
  spec: LangGraphLessonSpec,
  state: GraphStateType,
  purpose: string
) {
  const model = createCourseModel({ temperature: 0.1 });
  return model.invoke(
    [
      {
        role: "system",
        content:
          "你是面向工程师的 LangGraph 课程教练。回答要短，聚焦机制、边界、调试点。",
      },
      {
        role: "user",
        content: `课程：${spec.id} ${spec.title}
目的：${purpose}
问题：${state.question}
证据：
${state.evidence.map((item, index) => `[${index + 1}] ${item}`).join("\n")}

请输出 3 条工程要点。`,
      },
    ],
    {
      runName: `advanced-${spec.id.toLowerCase()}-model-node`,
      tags: ["advanced", "langgraph", spec.id.toLowerCase()],
      metadata: { lesson: spec.id, module: "langgraph-workflows", purpose },
    }
  );
}

function createBaseGraph(spec: LangGraphLessonSpec) {
  const builder = new StateGraph(GraphState)
    .addNode("retrieve", () => ({
      evidence: spec.evidence,
      audit: [`${spec.id}: retrieve produced ${spec.evidence.length} chunks`],
    }))
    .addNode("analyze", async (state) => {
      const response = await callLessonModel(spec, state, "analyze graph state");
      return {
        draft: getTextContent(response.content),
        audit: [`${spec.id}: analyze called real model`],
      };
    })
    .addNode("reviewNode", async (state) => {
      const response = await callLessonModel(spec, state, "review draft");
      return {
        review: getTextContent(response.content),
        final: state.draft,
        audit: [`${spec.id}: review called real model`],
      };
    })
    .addNode("clarifyNode", async (state) => {
      const response = await callLessonModel(spec, state, "ask clarification");
      return {
        final: `证据不足，需要澄清：${getTextContent(response.content)}`,
        audit: [`${spec.id}: routed to clarify`],
      };
    })
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "analyze");

  return builder
    .addConditionalEdges(
      "analyze",
      (state) => state.route,
      {
        answer: "reviewNode",
        clarify: "clarifyNode",
      }
    )
    .addEdge("reviewNode", END)
    .addEdge("clarifyNode", END);
}

async function runStandard(spec: LangGraphLessonSpec): Promise<void> {
  const graph = createBaseGraph(spec).compile();
  const result = await graph.invoke(createInput(spec));
  printJson("final graph state", result);
}

async function runPersistence(spec: LangGraphLessonSpec): Promise<void> {
  const checkpointer = new MemorySaver();
  const graph = createBaseGraph(spec).compile({ checkpointer });
  const config = {
    configurable: { thread_id: `${spec.id.toLowerCase()}-thread` },
  };

  const first = await graph.invoke(createInput(spec), config);
  const second = await graph.invoke(
    {
      ...createInput(spec),
      question: `${spec.userPrompt} 请结合上一次 checkpoint 继续补充。`,
    },
    config
  );

  printJson("first run checkpointed state", first);
  printJson("second run same thread state", second);
}

async function runStore(spec: LangGraphLessonSpec): Promise<void> {
  const store = new InMemoryStore();
  const checkpointer = new MemorySaver();
  const graph = new StateGraph(GraphState)
    .addNode("writeStore", async (state) => {
      const runtimeStore = getStore();
      await runtimeStore?.put(["advanced", "langgraph", state.lessonId], "policy", {
        topic: state.topic,
        rule: "store only durable cross-thread facts",
      });

      return {
        evidence: spec.evidence,
        audit: [`${spec.id}: wrote durable policy to InMemoryStore`],
      };
    })
    .addNode("answer", async (state) => {
      const response = await callLessonModel(spec, state, "persistence design");
      return {
        final: getTextContent(response.content),
        audit: [`${spec.id}: answer called real model`],
      };
    })
    .addEdge(START, "writeStore")
    .addEdge("writeStore", "answer")
    .addEdge("answer", END)
    .compile({ checkpointer, store });

  const result = await graph.invoke(createInput(spec), {
    configurable: { thread_id: `${spec.id.toLowerCase()}-store-thread` },
  });
  const durableItems = await store.search(["advanced", "langgraph", spec.id]);

  printJson("final graph state", result);
  printJson("store search result", durableItems);
}

async function runInterrupt(spec: LangGraphLessonSpec): Promise<void> {
  const checkpointer = new MemorySaver();
  const graph = new StateGraph(GraphState)
    .addNode("retrieve", () => ({
      evidence: spec.evidence,
      audit: [`${spec.id}: retrieve before interrupt`],
    }))
    .addNode("draftNode", async (state) => {
      const response = await callLessonModel(spec, state, "draft before human review");
      return {
        draft: getTextContent(response.content),
        audit: [`${spec.id}: draft called real model`],
      };
    })
    .addNode("humanReview", (state) => {
      const decision = interrupt({
        lessonId: spec.id,
        draft: state.draft,
        decisionTypes: ["approve", "edit", "reject"],
      }) as { action?: string; editedFinal?: string; reason?: string };

      if (decision.action === "edit") {
        return {
          final: decision.editedFinal ?? state.draft,
          audit: [`${spec.id}: human edited final answer`],
        };
      }

      if (decision.action === "reject") {
        return {
          final: `rejected: ${decision.reason ?? "no reason provided"}`,
          audit: [`${spec.id}: human rejected draft`],
        };
      }

      return {
        final: state.draft,
        audit: [`${spec.id}: human approved draft`],
      };
    })
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "draftNode")
    .addEdge("draftNode", "humanReview")
    .addEdge("humanReview", END)
    .compile({ checkpointer });

  const config = {
    configurable: { thread_id: `${spec.id.toLowerCase()}-interrupt-thread` },
  };

  const interrupted = await graph.invoke(createInput(spec), config);
  printJson("interrupted result", interrupted);

  const resumed = await graph.invoke(
    new Command({
      resume: {
        action: "edit",
        editedFinal: `${spec.id} 人工编辑后的最终结论：审批协议应结构化、可追踪、可恢复。`,
      },
    }) as never,
    config
  );
  printJson("resumed result", resumed);
}

async function runStream(spec: LangGraphLessonSpec): Promise<void> {
  const graph = createBaseGraph(spec).compile();

  printSection("stream mode: updates");
  for await (const chunk of await graph.stream(createInput(spec), {
    streamMode: "updates",
  })) {
    console.dir(chunk, { depth: 6 });
  }
}

async function runSubgraph(spec: LangGraphLessonSpec): Promise<void> {
  const childGraph = new StateGraph(GraphState)
    .addNode("critic", async (state) => {
      const response = await callLessonModel(spec, state, "critic subgraph review");
      return {
        review: getTextContent(response.content),
        audit: [`${spec.id}: child critic called real model`],
      };
    })
    .addEdge(START, "critic")
    .addEdge("critic", END)
    .compile();

  const parentGraph = new StateGraph(GraphState)
    .addNode("researcher", () => ({
      evidence: spec.evidence,
      draft: "researcher 输出：LangGraph 子图适合封装 reviewer/critic 子流程。",
      audit: [`${spec.id}: parent researcher produced draft`],
    }))
    .addNode("criticSubgraph", async (state) => {
      const child = await childGraph.invoke(state);
      return {
        review: child.review,
        audit: [`${spec.id}: parent consumed child subgraph output`],
      };
    })
    .addNode("writer", (state) => ({
      final: `${state.draft}\n\ncritic review:\n${state.review}`,
      audit: [`${spec.id}: writer merged structured subgraph output`],
    }))
    .addEdge(START, "researcher")
    .addEdge("researcher", "criticSubgraph")
    .addEdge("criticSubgraph", "writer")
    .addEdge("writer", END)
    .compile();

  const result = await parentGraph.invoke(createInput(spec));
  printJson("parent graph state", result);
}

async function runApi(spec: LangGraphLessonSpec): Promise<void> {
  const response = await callLessonModel(spec, createInput(spec), "api and testing strategy");
  printModelMessage(response);
  printJson("production structure checklist", {
    graphApi: "适合显式节点、边、状态机和可视化调试",
    functionalApi: "适合函数式任务组合和更轻量的 workflow 表达",
    runtime: "模型、store、checkpointer、thread_id 应由运行边界注入",
    tests: ["node unit tests", "graph trajectory tests", "checkpoint restore tests"],
  });
}

export async function runLangGraphLesson(id: string): Promise<void> {
  const spec = lessonSpecs[id.toUpperCase()];
  if (!spec) {
    throw new Error(`Unknown LangGraph lesson id: ${id}`);
  }

  printLessonHeader(`进阶 ${spec.id}：${spec.title}`);
  printLearningFocus(spec.focus);

  switch (spec.mode) {
    case "persistence":
      await runPersistence(spec);
      break;
    case "interrupt":
      await runInterrupt(spec);
      break;
    case "stream":
      await runStream(spec);
      break;
    case "subgraph":
      await runSubgraph(spec);
      break;
    case "store":
      await runStore(spec);
      break;
    case "api":
      await runApi(spec);
      break;
    case "route":
    case "standard":
      await runStandard(spec);
      break;
    default:
      throw new Error(`Unsupported LangGraph lesson mode: ${spec.mode}`);
  }
}
