import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 11 课：Streaming 与运行体验
 *
 * 学习目标：
 * 1. 用 stream 观察 Agent 运行中的状态更新。
 * 2. 把“正在调用工具”“工具返回”“最终回答”展示给用户。
 * 3. streaming 只改变用户体验，不改变业务规则和最终 schema。
 */
printLessonHeader("第 11 课：Streaming 与运行体验");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather],
  systemPrompt: `你是一个简洁的天气助手。

回答天气问题前必须调用 get_weather 工具。`,
}).withConfig({
  runName: "lesson-11-streaming",
  tags: ["lesson", "streaming"],
  metadata: { lesson: 11 },
});

const stream = await agent.stream(
  {
    messages: [
      {
        role: "user",
        content: "请查询南京天气，并用一句话回答。",
      },
    ],
  },
  {
    streamMode: "updates",
  }
);

for await (const update of stream) {
  console.log("\n--- stream update ---");
  console.dir(update, { depth: 5 });
}
