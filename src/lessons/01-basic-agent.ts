import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 01 课：基础 Agent
 *
 * 本节课需要学习：
 * 1. `createAgent` 如何把模型和工具组合成一个 Agent。
 * 2. Agent 的输入为什么使用 `messages` 对话格式。
 * 3. 模型如何根据用户问题决定是否调用 `getWeather` 工具。
 * 4. 如何查看 Agent 最终返回的最后一条消息。
 */
printLessonHeader("第 01 课：基础 Agent");

// 创建最小 Agent：指定模型，并把天气工具交给模型按需调用。
const agent = createAgent({
  model: createCourseModel(),
  tools: [getWeather],
});

// 向 Agent 发送一条用户消息；Agent 会判断这个问题需要调用天气工具。
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "旧金山今天的天气怎么样？",
    },
  ],
});

// 打印最后一条消息，方便观察模型最终回答和工具调用后的结果。
printLastMessage(result);
