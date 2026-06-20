import { tool } from "@langchain/core/tools";
import { z } from "zod";

const courseCatalog = [
  {
    id: "agent-101",
    title: "Agent 入门",
    level: "beginner",
    tags: ["agent", "tool", "prompt"],
    minutes: 45,
  },
  {
    id: "research-201",
    title: "研究型 Agent",
    level: "intermediate",
    tags: ["agent", "research", "url"],
    minutes: 60,
  },
  {
    id: "memory-201",
    title: "会话记忆",
    level: "intermediate",
    tags: ["memory", "langgraph", "thread_id"],
    minutes: 35,
  },
  {
    id: "debug-301",
    title: "LangSmith 调试",
    level: "advanced",
    tags: ["trace", "debug", "langsmith"],
    minutes: 50,
  },
];

/**
 * 演示用课程目录查询工具。
 *
 * 它模拟数据库查询：工具负责确定性过滤和排序，模型负责解释查询结果。
 */
export const searchCourseCatalog = tool(
  ({ keyword, maxResults = 3 }: { keyword: string; maxResults?: number }) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const matches = courseCatalog
      .filter((course) => {
        return (
          course.title.toLowerCase().includes(normalizedKeyword) ||
          course.level.toLowerCase().includes(normalizedKeyword) ||
          course.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))
        );
      })
      .slice(0, maxResults);

    return JSON.stringify(matches, null, 2);
  },
  {
    name: "search_course_catalog",
    description: "按关键词查询演示课程目录，模拟数据库检索能力。",
    schema: z.object({
      keyword: z.string().describe("课程标题、难度或标签关键词"),
      maxResults: z.number().int().min(1).max(10).default(3),
    }),
  }
);
