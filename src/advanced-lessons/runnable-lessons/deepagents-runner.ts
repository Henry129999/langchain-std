import { tool } from "@langchain/core/tools";
import { Command, MemorySaver } from "@langchain/langgraph";
import {
  createDeepAgent,
  StateBackend,
  type FileData,
  type FilesystemPermission,
} from "deepagents";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  printAgentSummary,
  printAgentTrace,
  printJson,
  printLearningFocus,
  printSection,
} from "./shared.js";

interface DeepAgentLessonSpec {
  id: string;
  title: string;
  focus: string[];
  mode: "standard" | "todos" | "subagents" | "memory" | "hitl" | "stream";
  prompt: string;
  toolTopic: string;
}

const lessonSpecs: Record<string, DeepAgentLessonSpec> = {
  D01: {
    id: "D01",
    title: "Deep Agents 定位与架构",
    mode: "standard",
    toolTopic: "deep-agent-positioning",
    focus: [
      "Deep Agents 是长任务 harness，不替代 LangGraph",
      "默认能力包括 planning、filesystem、subagents、context management",
      "仍然要用权限、观测和评测约束默认能力",
    ],
    prompt: "请用决策矩阵说明 LangChain Agent、LangGraph、Deep Agents 的适用边界。",
  },
  D02: {
    id: "D02",
    title: "Execution Environment：工具、MCP、虚拟文件系统",
    mode: "standard",
    toolTopic: "execution-environment-policy",
    focus: [
      "工具、MCP、虚拟文件系统都属于执行环境",
      "权限和审计必须落在工具/后端层",
      "不要依赖模型自觉遵守安全边界",
    ],
    prompt: "请先调用 inspect_deepagent_policy，再解释课程研究代理的执行环境策略。",
  },
  D03: {
    id: "D03",
    title: "任务规划、TODO 与 Context Offloading",
    mode: "todos",
    toolTopic: "todo-context-offloading",
    focus: [
      "长任务必须显式维护 TODO",
      "中间产物应写入 state/files，而不是堆进 messages",
      "checkpoint/report/evidence 要能恢复任务",
    ],
    prompt:
      "请为研究 LangGraph persistence 设计 4 步 TODO，并说明哪些内容应该 offload 到文件。",
  },
  D04: {
    id: "D04",
    title: "Subagents 设计",
    mode: "subagents",
    toolTopic: "subagent-design",
    focus: [
      "subagent description 决定模型何时委派",
      "subagent 工具集要最小化",
      "subagent 返回应短且结构化",
    ],
    prompt:
      "请把 source-checker 子代理用于审查：Deep Agents 是否应该直接替代所有 LangGraph 工作流？",
  },
  D05: {
    id: "D05",
    title: "Skills 与 Memory",
    mode: "memory",
    toolTopic: "skills-memory-policy",
    focus: [
      "skills 是可加载能力，不是长 prompt",
      "memory 要区分 agent/user/org scope",
      "always-loaded memory 要短、稳定、低噪声",
    ],
    prompt:
      "请使用已提供的 AGENTS.md 和 report-writing skill，总结记忆写入规则。",
  },
  D06: {
    id: "D06",
    title: "Deep Agents HITL 与权限",
    mode: "standard",
    toolTopic: "hitl-permission-policy",
    focus: [
      "高风险工具需要 approve/reject/edit",
      "subagent 内部危险动作也不能绕过审批",
      "审批 payload 必须可追踪、可编辑、可恢复",
    ],
    prompt: "请先调用 inspect_deepagent_policy，再设计文件写入和外部请求的 HITL 策略。",
  },
  D07: {
    id: "D07",
    title: "Quickstart 到 createDeepAgent：模型、工具、Profile",
    mode: "standard",
    toolTopic: "quickstart-profile",
    focus: [
      "createDeepAgent 的关键入口是 model、tools、systemPrompt、profile",
      "quickstart 只能验证 harness，不等于生产结构",
      "profile 组合模型、权限、后端和行为偏好",
    ],
    prompt: "请先调用 inspect_deepagent_policy，再给出最小 Deep Agent spec。",
  },
  D08: {
    id: "D08",
    title: "Backends、Permissions、Sandboxes、Interpreters",
    mode: "standard",
    toolTopic: "backend-sandbox-interpreter",
    focus: [
      "backend 决定文件持久性和隔离级别",
      "sandbox 适合高风险代码执行",
      "interpreter 不等于完整 sandbox",
    ],
    prompt:
      "请先调用 inspect_deepagent_policy，再比较 StateBackend、FilesystemBackend、sandbox、interpreter。",
  },
  D09: {
    id: "D09",
    title: "Context Engineering、Prompt Assembly、Middleware",
    mode: "standard",
    toolTopic: "context-middleware",
    focus: [
      "prompt assembly 要分离静态规则和动态上下文",
      "middleware 承载模型选择、工具治理、审计和错误处理",
      "prompt caching 只适合稳定静态部分",
    ],
    prompt:
      "请先调用 inspect_deepagent_policy，再设计长任务上下文预算和 middleware stack。",
  },
  D10: {
    id: "D10",
    title: "Subagents 运维：异步、追踪、结构化输出、故障诊断",
    mode: "subagents",
    toolTopic: "subagent-operations",
    focus: [
      "subagent trace 要能按 name/tool/metadata 过滤",
      "per-subagent context 防止上下文膨胀",
      "async subagent 适合远程长任务，但需要任务状态协议",
    ],
    prompt:
      "请委派给 source-checker 子代理，输出 subagent not called、wrong selected、context bloated 的排查表。",
  },
  D11: {
    id: "D11",
    title: "HITL 深水区：多工具审批、编辑参数、Subagent 中断",
    mode: "hitl",
    toolTopic: "hitl-deep-dive",
    focus: [
      "多工具审批要按 tool call id 追踪",
      "edit arguments 后必须重新校验 schema 和权限",
      "reject message 要给模型可操作反馈",
    ],
    prompt:
      "请调用 dangerous_publish_report，目标路径 reports/deepagents.md，内容为 Deep Agents HITL demo。",
  },
  D12: {
    id: "D12",
    title: "Frontend、Streaming、Protocols 与生产部署",
    mode: "stream",
    toolTopic: "frontend-streaming-production",
    focus: [
      "前端事件协议要区分 progress、tool call、approval、final",
      "MCP/ACP 接入必须明确身份、权限和审计",
      "生产清单要覆盖 trace/eval、sandbox、回滚和数据保留",
    ],
    prompt:
      "请流式输出 Deep Agents 生产发布清单：事件协议、权限、协议接入、trace/eval、回滚。",
  },
};

const policyTool = tool(
  ({ topic }: { topic: string }) =>
    JSON.stringify({
      topic,
      backend: "StateBackend for lesson safety",
      permissions: [
        "read /workspace/**",
        "write /drafts/** only after approval",
        "deny write /** by default in production",
      ],
      auditFields: ["lessonId", "toolName", "argsHash", "decision", "durationMs"],
      note: "真实生产环境要在工具和 backend 层 enforce，不只写进 prompt。",
    }),
  {
    name: "inspect_deepagent_policy",
    description:
      "返回 Deep Agents 课程中的执行环境、权限、审计和 backend 策略。回答相关问题前必须调用。",
    schema: z.object({
      topic: z.string().describe("要检查的 Deep Agents 工程主题"),
    }),
  }
);

const sourcePolicyTool = tool(
  ({ claim }: { claim: string }) =>
    JSON.stringify({
      claim,
      verdict: claim.includes("替代所有") ? "reject" : "needs-context",
      reason:
        "Deep Agents 是长任务 harness。显式业务流程仍应优先使用 LangGraph。",
    }),
  {
    name: "check_source_claim",
    description: "审查 Deep Agents 和 LangGraph 边界相关的课程结论。",
    schema: z.object({
      claim: z.string().describe("需要审查的结论"),
    }),
  }
);

const dangerousPublishTool = tool(
  ({ path, content }: { path: string; content: string }) =>
    JSON.stringify({
      ok: true,
      dryRun: true,
      path,
      bytes: Buffer.byteLength(content, "utf8"),
      note: "课程演示不会真的写文件。",
    }),
  {
    name: "dangerous_publish_report",
    description:
      "发布最终报告。课程演示中是 dry-run，但仍被视为高风险动作，需要 HITL。",
    schema: z.object({
      path: z.string().describe("报告目标路径"),
      content: z.string().describe("报告内容"),
    }),
  }
);

const permissions: FilesystemPermission[] = [
  { operations: ["read"], paths: ["/workspace/**", "/skills/**", "/AGENTS.md"] },
  { operations: ["write"], paths: ["/drafts/**"] },
  { operations: ["write"], paths: ["/**"], mode: "deny" },
];

function lessonFiles(): Record<string, FileData> {
  const now = new Date().toISOString();
  return {
    "/AGENTS.md": {
      content:
        "Always answer as an engineering course assistant. Keep memory durable, scoped, and low-noise.",
      mimeType: "text/markdown",
      created_at: now,
      modified_at: now,
    },
    "/skills/report-writing/SKILL.md": {
      content: `---
name: report-writing
description: Write concise engineering reports with assumptions, evidence, risks, and next actions.
---

# Report Writing

Use this skill when converting research evidence into an engineering-facing report.`,
      mimeType: "text/markdown",
      created_at: now,
      modified_at: now,
    },
  };
}

function printDeepAgentState(result: unknown): void {
  const state = result as {
    todos?: unknown;
    files?: Record<string, unknown>;
    structuredResponse?: unknown;
  };

  printAgentSummary(state);
  printAgentTrace(state);
  printJson("deep agent state fields", {
    todos: state.todos,
    files: Object.keys(state.files ?? {}),
    structuredResponse: state.structuredResponse,
  });
}

function baseSystemPrompt(spec: DeepAgentLessonSpec): string {
  return `你是面向工程师的 Deep Agents 进阶课程教练。

当前课程：${spec.id} ${spec.title}

要求：
1. 必须基于真实工具或 Deep Agent harness 行为回答。
2. 回答要短，聚焦机制、边界、调试点。
3. 不要声称执行了未执行的外部副作用。
4. 如果需要文件写入，只能使用课程演示的受控状态后端或 dry-run 工具。`;
}

function createBaseAgent(spec: DeepAgentLessonSpec) {
  return createDeepAgent({
    name: `advanced-${spec.id.toLowerCase()}-deep-agent`,
    model: createCourseModel({ temperature: 0.1 }),
    backend: new StateBackend(),
    tools: [policyTool],
    permissions,
    systemPrompt: baseSystemPrompt(spec),
  });
}

async function runStandard(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createBaseAgent(spec);
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: `${spec.prompt}\n\n工具参数 topic=${spec.toolTopic}`,
        },
      ],
    },
    {
      runName: `advanced-${spec.id.toLowerCase()}-deep-agent`,
      tags: ["advanced", "deepagents", spec.id.toLowerCase()],
      metadata: { lesson: spec.id, module: "deep-agents" },
    }
  );

  printDeepAgentState(result);
}

async function runTodos(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createDeepAgent({
    name: `advanced-${spec.id.toLowerCase()}-todos`,
    model: createCourseModel({ temperature: 0.1 }),
    backend: new StateBackend(),
    tools: [policyTool],
    permissions,
    systemPrompt: `${baseSystemPrompt(spec)}

你必须使用内置 TODO 能力维护计划，并在回答中说明哪些内容应该 offload 到文件。`,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: spec.prompt }],
  });

  printDeepAgentState(result);
}

async function runSubagents(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createDeepAgent({
    name: `advanced-${spec.id.toLowerCase()}-subagents`,
    model: createCourseModel({ temperature: 0.1 }),
    backend: new StateBackend(),
    tools: [policyTool],
    permissions,
    subagents: [
      {
        name: "source-checker",
        description:
          "Use this subagent to verify claims about LangGraph vs Deep Agents boundaries, subagent operations, and context bloat.",
        systemPrompt:
          "You are a strict source checker. Use check_source_claim before giving a verdict. Return concise JSON-like text.",
        tools: [sourcePolicyTool],
        responseFormat: z.object({
          verdict: z.enum(["accept", "reject", "needs-context"]),
          reason: z.string(),
          operationalRisk: z.string(),
        }),
      },
    ],
    systemPrompt: `${baseSystemPrompt(spec)}

如果问题涉及结论审查或子代理排查，必须委派给 source-checker。`,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: spec.prompt }],
  });

  printDeepAgentState(result);
}

async function runMemory(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createDeepAgent({
    name: `advanced-${spec.id.toLowerCase()}-memory`,
    model: createCourseModel({ temperature: 0.1 }),
    backend: new StateBackend(),
    tools: [policyTool],
    permissions,
    memory: ["/AGENTS.md"],
    skills: ["/skills/"],
    systemPrompt: `${baseSystemPrompt(spec)}

你可以使用课程提供的 memory 和 skill。回答要说明 memory scope、skill loading 和冲突写入风险。`,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: spec.prompt }],
    files: lessonFiles(),
  });

  printDeepAgentState(result);
}

async function runHitl(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createDeepAgent({
    name: `advanced-${spec.id.toLowerCase()}-hitl`,
    model: createCourseModel({ temperature: 0 }),
    backend: new StateBackend(),
    tools: [dangerousPublishTool],
    permissions,
    checkpointer: new MemorySaver(),
    interruptOn: {
      dangerous_publish_report: {
        allowedDecisions: ["approve", "edit", "reject"],
        description:
          "发布报告属于高风险动作。审核 path/content 后再决定是否执行。",
      },
    },
    systemPrompt: `${baseSystemPrompt(spec)}

当用户要求发布报告时，必须调用 dangerous_publish_report，不要直接声称已经发布。`,
  });

  const config = {
    configurable: { thread_id: `${spec.id.toLowerCase()}-deepagent-hitl` },
    runName: `advanced-${spec.id.toLowerCase()}-hitl`,
    tags: ["advanced", "deepagents", spec.id.toLowerCase(), "hitl"],
    metadata: { lesson: spec.id },
  };

  const interrupted = await agent.invoke(
    {
      messages: [{ role: "user", content: spec.prompt }],
    },
    config
  );

  printDeepAgentState(interrupted);
  printJson(
    "interrupt payload",
    (interrupted as { __interrupt__?: unknown }).__interrupt__ ?? "no interrupt returned"
  );

  printSection("resume command shape");
  console.log(
    "真实应用审核后继续同一 thread：agent.invoke(new Command({ resume: { decisions: [...] } }), config)"
  );
  printJson(
    "example command object",
    new Command({
      resume: {
        decisions: [
          {
            type: "reject",
            message: "请先把目标路径改到 /drafts/**，并缩短报告内容。",
          },
        ],
      },
    })
  );
}

async function runStream(spec: DeepAgentLessonSpec): Promise<void> {
  const agent = createBaseAgent(spec);

  printSection("stream mode: updates");
  for await (const chunk of await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: `${spec.prompt}\n\n请先调用 inspect_deepagent_policy，topic=${spec.toolTopic}`,
        },
      ],
    },
    {
      streamMode: "updates",
    }
  )) {
    console.dir(chunk, { depth: 6 });
  }
}

export async function runDeepAgentsLesson(id: string): Promise<void> {
  const spec = lessonSpecs[id.toUpperCase()];
  if (!spec) {
    throw new Error(`Unknown Deep Agents lesson id: ${id}`);
  }

  printLessonHeader(`进阶 ${spec.id}：${spec.title}`);
  printLearningFocus(spec.focus);

  switch (spec.mode) {
    case "todos":
      await runTodos(spec);
      break;
    case "subagents":
      await runSubagents(spec);
      break;
    case "memory":
      await runMemory(spec);
      break;
    case "hitl":
      await runHitl(spec);
      break;
    case "stream":
      await runStream(spec);
      break;
    case "standard":
      await runStandard(spec);
      break;
    default:
      throw new Error(`Unsupported Deep Agents lesson mode: ${spec.mode}`);
  }
}
