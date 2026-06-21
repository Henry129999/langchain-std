import { createAgent, tool } from "langchain";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printAgentTrace, printFinalAnswer, printJson } from "./shared.js";

type ToolEnvelope =
  | {
      ok: true;
      data: Record<string, unknown>;
      source: string;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
      source: string;
    };

function toToolResult(envelope: ToolEnvelope): string {
  return JSON.stringify(envelope);
}

const lookupCourseConcept = tool(
  ({ concept }: { concept: string }) => {
    const normalized = concept.trim().toLowerCase();

    if (normalized.includes("agent")) {
      return toToolResult({
        ok: true,
        data: {
          concept: "Agent",
          boundary: "模型动态选择工具，工具提供确定性能力。",
        },
        source: "advanced-course-catalog",
      });
    }

    return toToolResult({
      ok: false,
      error: {
        code: "CONCEPT_NOT_FOUND",
        message: `课程目录中没有找到概念：${concept}`,
      },
      source: "advanced-course-catalog",
    });
  },
  {
    name: "lookup_course_concept",
    description:
      "查询进阶课程中的工程概念。返回 JSON envelope：ok/data/error/source。",
    schema: z.object({
      concept: z.string().describe("要查询的课程概念"),
    }),
  }
);

printLessonHeader("进阶 06：Tool 高级设计：上下文、错误、返回值");

printJson("tool envelope contract", {
  success: { ok: true, data: {}, source: "..." },
  failure: { ok: false, error: { code: "...", message: "..." }, source: "..." },
  rule: "程序读取 envelope，模型只负责解释 envelope，不解析自由文本错误。",
});

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [lookupCourseConcept],
  systemPrompt: `你是 LangChain 工程课程助手。

回答课程概念问题前必须调用 lookup_course_concept。
工具返回 JSON envelope：
- ok=true 时基于 data 回答。
- ok=false 时说明 error.code 和 error.message，不要编造。`,
});

const result = await agent.invoke(
  {
    messages: [{ role: "user", content: "Agent 的工程边界是什么？" }],
  },
  {
    runName: "advanced-06-tool-envelope",
    tags: ["advanced", "06", "tool-envelope"],
    metadata: { lesson: "A06" },
  }
);

printAgentTrace(result);
printFinalAnswer(result);
