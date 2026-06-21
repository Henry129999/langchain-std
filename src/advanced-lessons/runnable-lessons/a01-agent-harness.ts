import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  getCityCountry,
  getCityTimezone,
  getWeather,
} from "../../tools/weather.js";

interface ToolCallLike {
  id?: string;
  name?: string;
  args?: unknown;
}

interface MessageLike {
  _getType?: () => string;
  content?: unknown;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCallLike[];
  response_metadata?: {
    finish_reason?: string;
  };
}

interface AgentResultLike {
  messages?: unknown[];
}

const implementationDecisionMatrix = [
  {
    style: "固定链路 / Runnable",
    useWhen: "步骤稳定、工具固定、分支少、需要低延迟和强可测性",
    avoidWhen: "需要模型动态决定下一步或动态选择工具",
  },
  {
    style: "LangChain Agent",
    useWhen: "需要模型根据用户问题动态选择工具，并把工具结果组织成最终回答",
    avoidWhen: "流程必须严格按业务状态机执行，或需要恢复、中断、人工审批",
  },
  {
    style: "LangGraph",
    useWhen: "需要显式状态、条件路由、持久化、恢复、人工审核和多步骤工作流",
    avoidWhen: "只是一次简单问答或固定工具调用",
  },
];

function asMessage(message: unknown): MessageLike {
  return typeof message === "object" && message !== null
    ? (message as MessageLike)
    : {};
}

function getMessageType(message: unknown): string {
  const value = asMessage(message);

  if (typeof value._getType === "function") {
    return value._getType();
  }

  return "message";
}

function getTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  return JSON.stringify(content);
}

function getToolCalls(message: unknown): ToolCallLike[] {
  const value = asMessage(message);

  return Array.isArray(value.tool_calls) ? value.tool_calls : [];
}

function printDecisionMatrix(): void {
  console.log("\n--- implementation decision matrix ---");
  console.table(implementationDecisionMatrix);
}

function printAgentBoundaryReport(result: AgentResultLike): void {
  const messages = result.messages ?? [];
  const messageTypes = messages.map(getMessageType);
  const toolCalls = messages.flatMap(getToolCalls);
  const toolMessages = messages.filter((message) => getMessageType(message) === "tool");
  const finalMessage = [...messages]
    .reverse()
    .find((message) => getMessageType(message) === "ai");

  console.log("\n--- agent boundary report ---");
  console.log(`message count: ${messages.length}`);
  console.log(`message types: ${messageTypes.join(" -> ")}`);
  console.log(
    `requested tools: ${
      toolCalls.map((toolCall) => toolCall.name ?? "unknown").join(", ") || "none"
    }`
  );
  console.log(`tool result count: ${toolMessages.length}`);

  console.log("\n--- step-by-step trace ---");
  messages.forEach((message, index) => {
    const value = asMessage(message);
    const type = getMessageType(message);
    const content = getTextContent(value.content);
    const toolCallsInMessage = getToolCalls(message);

    console.log(`\n[${index}] ${type}`);

    if (toolCallsInMessage.length > 0) {
      console.log("tool_calls:");
      for (const toolCall of toolCallsInMessage) {
        console.log(`- ${toolCall.name}(${JSON.stringify(toolCall.args)})`);
      }
    }

    if (type === "tool") {
      console.log(`tool name: ${value.name ?? "unknown"}`);
      console.log(`tool_call_id: ${value.tool_call_id ?? "unknown"}`);
    }

    if (value.response_metadata?.finish_reason) {
      console.log(`finish_reason: ${value.response_metadata.finish_reason}`);
    }

    console.log(`content: ${content.slice(0, 500)}`);
  });

  console.log("\n--- final answer field ---");
  console.log(getTextContent(asMessage(finalMessage).content));
}

function printEngineeringChecklist(result: AgentResultLike): void {
  const messages = result.messages ?? [];
  const hasHumanMessage = messages.some(
    (message) => getMessageType(message) === "human"
  );
  const hasToolRequest = messages.some(
    (message) => getToolCalls(message).length > 0
  );
  const hasToolResult = messages.some(
    (message) => getMessageType(message) === "tool"
  );
  const hasFinalAnswer =
    messages.length > 0 && getMessageType(messages[messages.length - 1]) === "ai";

  console.log("\n--- engineering checklist ---");
  console.table([
    {
      check: "用户输入进入 messages",
      passed: hasHumanMessage,
      why: "Agent 的输入边界必须可追踪",
    },
    {
      check: "模型产生 tool_calls",
      passed: hasToolRequest,
      why: "证明这次确实使用了 Agent 的动态工具选择能力",
    },
    {
      check: "工具结果以 ToolMessage 回到 Agent",
      passed: hasToolResult,
      why: "工具是确定性能力边界，模型不能跳过工具编造结果",
    },
    {
      check: "最终答案由最后一条 AIMessage 承载",
      passed: hasFinalAnswer,
      why: "业务调用方通常读取最后的 AIMessage 或结构化输出",
    },
  ]);
}

printLessonHeader("进阶 A01：Agent Harness 架构与适用边界");
printDecisionMatrix();

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather, getCityTimezone, getCityCountry],
  systemPrompt: `你是一个工程化课程中的城市信息助手。

当用户询问天气、时区或所属国家时，必须调用对应工具。
不要编造工具中没有返回的信息。
最终回答要简洁，并明确说明信息来自工具。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "请查询南京今天的天气、时区和所属国家，并说明这些信息是否来自工具。",
      },
    ],
  },
  {
    runName: "advanced-a01-agent-harness",
    tags: ["advanced", "a01", "agent-harness"],
    metadata: {
      lesson: "A01",
      module: "langchain-agent-engineering",
      purpose: "inspect-agent-loop-boundaries",
    },
  }
);

printAgentBoundaryReport(result);
printEngineeringChecklist(result);
