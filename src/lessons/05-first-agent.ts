import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printMessages } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 05 课：第一个 LangChain Agent
 *
 * 学习目标：
 * 1. 用 `createAgent` 组合模型、工具和系统提示词。
 * 2. 观察 Agent loop：模型提出工具调用，工具返回结果，模型组织最终回答。
 * 3. 给运行加 runName、tags、metadata，方便 LangSmith 和日志检索。
 */
printLessonHeader("第 05 课：第一个 LangChain Agent");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather],
  systemPrompt: `你是一个简洁的天气助手。

当用户询问天气时，必须先使用 get_weather 工具。
如果工具没有对应城市数据，不要编造。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "上海今天的天气怎么样？请说明你是否调用了工具。",
      },
    ],
  },
  {
    runName: "lesson-05-first-agent",
    tags: ["lesson", "agent", "weather"],
    metadata: { lesson: 5, project: "course-research-assistant" },
  }
);

printMessages(result);
