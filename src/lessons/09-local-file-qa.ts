import { createAgent, toolStrategy } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printStructuredResponse } from "../shared/output.js";
import { ResearchAnswerSchema } from "../shared/schemas.js";
import { readLocalTextFile } from "../tools/local-file.js";

/**
 * 第 09 课：本地文件问答
 *
 * 学习目标：
 * 1. 文件读取必须通过工具完成，不能让模型凭文件名猜。
 * 2. 文件工具限制在项目目录内，并限制扩展名和读取大小。
 * 3. 回答仍然使用结构化 schema，便于程序消费。
 */
printLessonHeader("第 09 课：本地文件问答");

const filePath = process.env.COURSE_LOCAL_FILE || "exercises/README.md";
const question =
  process.env.COURSE_LOCAL_QUESTION ||
  "请总结第 05 课和第 06 课的练习重点。";

const agent = createAgent({
  model: createCourseModel({ temperature: 0.1, maxTokens: 2000 }),
  tools: [readLocalTextFile],
  responseFormat: toolStrategy(ResearchAnswerSchema),
  systemPrompt: `你是一个本地课程文件问答助手。

规则：
- 回答前必须调用 read_local_text_file。
- 工具返回 JSON；只有 ok=true 时才能使用 text 字段回答。
- evidence 必须来自文件内容。
- 如果文件里没有相关信息，要明确拒答。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: `文件路径：${filePath}

问题：${question}`,
    },
  ],
});

printStructuredResponse(result);
