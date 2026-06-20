import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { searchCourseCatalog } from "../tools/course-catalog.js";

/**
 * 第 11 课：数据库查询工具
 *
 * 本节课补齐教程扩展章节中的数据库查询方向：
 * 1. 工具模拟数据库检索，返回结构化查询结果。
 * 2. 模型负责把查询结果解释成适合用户阅读的建议。
 * 3. 如果没有查到结果，模型应说明而不是编造课程。
 */
printLessonHeader("第 11 课：数据库查询工具");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [searchCourseCatalog],
  systemPrompt: `你是一个课程推荐助手。

回答前必须调用 search_course_catalog。
只根据工具返回的课程目录推荐，不要编造不存在的课程。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "我想学习调试 Agent，有哪些课程适合？",
    },
  ],
});

printLastMessage(result);
