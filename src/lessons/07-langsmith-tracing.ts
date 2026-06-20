import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 07 课：LangSmith 追踪
 *
 * 本节课需要学习：
 * 1. LangSmith tracing 用来观察模型调用、工具调用和 token 消耗。
 * 2. `LANGSMITH_TRACING` 和 `LANGSMITH_API_KEY` 应放在 `.env` 中。
 * 3. trace 可以帮助你判断工具选择、工具参数和系统提示词是否符合预期。
 * 4. 没有 LangSmith Key 时，脚本仍然可以运行，只是不会上传追踪。
 */
printLessonHeader("第 07 课：LangSmith 追踪");

const tracingEnabled = process.env.LANGSMITH_TRACING === "true";
const hasLangSmithKey = Boolean(process.env.LANGSMITH_API_KEY);

console.log(`LangSmith tracing：${tracingEnabled ? "已开启" : "未开启"}`);
console.log(`LangSmith API Key：${hasLangSmithKey ? "已配置" : "未配置"}`);

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather],
  systemPrompt: `你是一个 Agent 调试助手。

回答时简短说明：
- 是否调用了工具。
- 最终答案依据是什么。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "请查询深圳天气，并说明你是否使用了工具。",
    },
  ],
});

printLastMessage(result);
