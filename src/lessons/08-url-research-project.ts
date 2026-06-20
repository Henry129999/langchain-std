import { createAgent, toolStrategy } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printStructuredResponse } from "../shared/output.js";
import { ResearchAnswerSchema } from "../shared/schemas.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

/**
 * 第 08 课：入门项目 v1：URL 研究助手
 *
 * 学习目标：
 * 1. 用户输入 URL 和问题。
 * 2. Agent 调用 URL 工具读取文本。
 * 3. 最终输出结构化 answer、evidence、limitations、nextActions。
 */
printLessonHeader("第 08 课：入门项目 v1：URL 研究助手");

const url = process.env.COURSE_RESEARCH_URL || "https://example.com";
const question =
  process.env.COURSE_RESEARCH_QUESTION ||
  "这个页面主要说明了什么？请基于页面内容回答。";

const agent = createAgent({
  model: createCourseModel({
    temperature: 0.1,
    timeout: 300_000,
  }),
  tools: [fetchTextFromUrl],
  responseFormat: toolStrategy(ResearchAnswerSchema),
  systemPrompt: `你是一个严谨的 URL 研究助手。

规则：
- 回答前必须调用 fetch_text_from_url。
- 工具返回 JSON；只有 ok=true 时才能使用 text 字段回答。
- evidence 必须来自工具返回的 text。
- 如果工具失败、内容被截断或证据不足，要写入 limitations。
- 不要使用外部知识补全答案。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `URL: ${url}

问题：${question}`,
      },
    ],
  },
  {
    runName: "lesson-08-url-research-project",
    tags: ["lesson", "project", "url-research"],
    metadata: { lesson: 8, url },
  }
);

printStructuredResponse(result);
