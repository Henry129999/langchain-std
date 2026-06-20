import { createAgent, toolStrategy } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printStructuredResponse } from "../shared/output.js";
import { ResearchAnswerSchema } from "../shared/schemas.js";

/**
 * 第 07 课：结构化输出
 *
 * 学习目标：
 * 1. 使用 `responseFormat` + Zod schema 约束最终答案。
 * 2. 让程序读取 `structuredResponse`，而不是解析自然语言。
 * 3. 把 prompt 作为业务语义约束，把 schema 作为数据形状约束。
 */
printLessonHeader("第 07 课：结构化输出");

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [],
  responseFormat: toolStrategy(ResearchAnswerSchema, {
    handleError:
      "输出必须匹配课程研究助手的结构：answer、evidence、limitations、nextActions。",
  }),
  systemPrompt: `你是一个课程资料研究助手。

即使用户要求 Markdown，也必须返回结构化结果。
证据不足时，要在 answer 中明确说明无法根据资料回答。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: `课程资料：
- LangChain Agent 适合需要动态选择工具的任务。
- 固定流程优先考虑普通模型调用或明确链路。

问题：什么时候应该优先使用 Agent？请不要输出 Markdown。`,
    },
  ],
});

printStructuredResponse(result);
