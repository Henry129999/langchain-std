import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printMessages } from "../shared/output.js";
import {
  getCityCountry,
  getCityTimezone,
  getWeather,
} from "../tools/weather.js";

/**
 * 第 04 课：Tool 设计基础
 *
 * 学习目标：
 * 1. 用 Zod schema 把确定性函数暴露给模型。
 * 2. 理解工具名称、description、schema 如何影响模型选择。
 * 3. 新增工具时不改 Agent 主流程，只扩展能力列表。
 */
printLessonHeader("第 04 课：Tool 设计基础");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather, getCityTimezone, getCityCountry],
  systemPrompt: `你是一个工具调用助教。

当用户询问天气、时区或所属国家时，优先调用对应工具。
整合工具结果时要说明哪些信息来自工具。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "请告诉我南京和旧金山的天气、时区和所属国家。",
      },
    ],
  },
  {
    runName: "lesson-04-tool-design",
    tags: ["lesson", "tools"],
    metadata: { lesson: 4 },
  }
);

printMessages(result);
