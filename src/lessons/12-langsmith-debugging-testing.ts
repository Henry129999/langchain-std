import { AIMessage, createAgent, fakeModel } from "langchain";
import { printLessonHeader } from "../shared/config.js";
import { printMessages } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 12 课：LangSmith 调试与测试
 *
 * 学习目标：
 * 1. 真实模型运行时用 LangSmith trace 看调用链。
 * 2. 回归测试时用 fake model 固定模型行为，避免测试依赖真实 LLM。
 * 3. 测试 Agent 时重点检查：是否调用正确工具、参数是否正确、最终输出是否符合预期。
 */
printLessonHeader("第 12 课：LangSmith 调试与测试");

console.log(
  `LangSmith tracing: ${
    process.env.LANGSMITH_TRACING === "true" ? "enabled" : "disabled"
  }`
);

const model = fakeModel()
  .respondWithTools([
    {
      name: "get_weather",
      args: { city: "Shanghai" },
      id: "call_get_weather_shanghai",
    },
  ])
  .respond(new AIMessage("上海今天多云，适合通勤。这一结论来自 get_weather 工具。"));

const agent = createAgent({
  model,
  tools: [getWeather],
  systemPrompt: "回答天气问题前必须调用 get_weather 工具。",
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "上海天气怎么样？",
    },
  ],
});

printMessages(result);

console.log("\n--- fake model assertions you would put in a test ---");
console.log(`model.callCount === 2 -> ${model.callCount === 2}`);
console.log(
  "第一次模型调用应产生 get_weather 工具调用，第二次模型调用应产生最终回答。"
);
