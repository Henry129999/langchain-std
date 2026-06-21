import { createAgent, toolCallLimitMiddleware } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  getCityCountry,
  getCityTimezone,
  getWeather,
} from "../../tools/weather.js";
import { printAgentSummary, printAgentTrace, printFinalAnswer, printJson } from "./shared.js";

type TaskType = "weather" | "profile" | "full_city_report";

function selectTools(taskType: TaskType) {
  switch (taskType) {
    case "weather":
      return [getWeather];
    case "profile":
      return [getCityTimezone, getCityCountry];
    case "full_city_report":
      return [getWeather, getCityTimezone, getCityCountry];
  }
}

printLessonHeader("进阶 07：工具选择治理与调用上限");

const taskType: TaskType = "weather";
const selectedTools = selectTools(taskType);

printJson("selected tool policy", {
  taskType,
  exposedTools: selectedTools.map((tool) => tool.name),
  hiddenTools: ["get_city_timezone", "get_city_country"],
  reason: "当前任务只需要天气能力，减少工具暴露面可以降低误选和越权风险。",
});

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: selectedTools,
  middleware: [
    toolCallLimitMiddleware({
      runLimit: 1,
      exitBehavior: "continue",
    }),
  ],
  systemPrompt: `你是工具治理演示助手。

只能使用当前暴露的工具。
如果用户要求的信息没有对应工具，不要编造，要说明当前工具集不支持。
即使你知道常识，也不要补充未通过工具返回的信息。
最终答案分为两段：已由工具支持的信息、不支持的信息。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "请查询上海天气和时区。如果没有可用工具，请说明原因。",
      },
    ],
  },
  {
    runName: "advanced-07-tool-selection",
    tags: ["advanced", "07", "tool-selection"],
    metadata: { lesson: "A07", taskType },
  }
);

printAgentSummary(result);
printAgentTrace(result);
printFinalAnswer(result);
