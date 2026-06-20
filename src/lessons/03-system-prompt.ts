import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 03 课：系统提示词
 *
 * 本节课需要学习：
 * 1. `systemPrompt` 如何约束 Agent 的身份、语言和输出长度。
 * 2. 如何要求模型在特定问题上必须先调用工具。
 * 3. 工具说明和系统提示词如何共同影响模型行为。
 * 4. 如何通过修改提示词观察输出风格变化。
 */
printLessonHeader("第 03 课：系统提示词");

// 创建 Agent，并通过系统提示词要求它用中文、简短回答，并优先调用天气工具。
const agent = createAgent({
  model: createCourseModel(),
  tools: [getWeather],
  systemPrompt: `你是一个简洁的双语助手。

当用户询问天气时：
- 回答前必须先使用 get_weather 工具。
- 用中文回答。
- 回答控制在 80 个汉字以内。`,
});

// 提出一个天气问题，用来验证系统提示词是否会促使模型调用工具。
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "北京今天的天气怎么样？",
    },
  ],
});

// 打印最终回答，重点观察语言、长度和工具使用是否符合要求。
printLastMessage(result);
