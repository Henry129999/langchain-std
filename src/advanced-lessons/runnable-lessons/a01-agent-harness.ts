import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  getCityCountry,
  getCityTimezone,
  getWeather,
} from "../../tools/weather.js";
import {
  getMessageType,
  getToolCalls,
  printAgentSummary,
  printAgentTrace,
  printChecklist,
  printFinalAnswer,
  printSection,
} from "./shared.js";

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

printLessonHeader("进阶 01：Agent Harness 架构与适用边界");

printSection("implementation decision matrix");
console.table(implementationDecisionMatrix);

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
        content: "请查询上海今天的天气、时区和所属国家，并说明这些信息是否来自工具。",
      },
    ],
  },
  {
    runName: "advanced-01-agent-harness",
    tags: ["advanced", "01", "agent-harness"],
    metadata: {
      lesson: "A01",
      module: "langchain-agent-engineering",
      purpose: "inspect-agent-loop-boundaries",
    },
  }
);

printAgentSummary(result);
printAgentTrace(result);
printFinalAnswer(result);

const messages = result.messages ?? [];
printChecklist([
  {
    check: "用户输入进入 messages",
    passed: messages.some((message) => getMessageType(message) === "human"),
    why: "Agent 的输入边界必须可追踪",
  },
  {
    check: "模型产生 tool_calls",
    passed: messages.some((message) => getToolCalls(message).length > 0),
    why: "证明这次确实使用了 Agent 的动态工具选择能力",
  },
  {
    check: "工具结果以 ToolMessage 回到 Agent",
    passed: messages.some((message) => getMessageType(message) === "tool"),
    why: "工具是确定性能力边界，模型不能跳过工具编造结果",
  },
  {
    check: "最终答案由最后一条 AIMessage 承载",
    passed:
      messages.length > 0 &&
      getMessageType(messages[messages.length - 1]) === "ai",
    why: "业务调用方通常读取最后的 AIMessage 或结构化输出",
  },
]);
