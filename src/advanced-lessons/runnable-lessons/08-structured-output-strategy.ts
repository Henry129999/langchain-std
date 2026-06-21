import { createAgent, toolStrategy } from "langchain";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printJson, printStructuredResponse } from "./shared.js";

const CitationSchema = z.object({
  sourceId: z.string().describe("证据编号"),
  claim: z.string().describe("该证据支持的结论"),
});

const ResearchAnswerV1 = z.object({
  schemaVersion: z.literal("v1"),
  answer: z.string(),
  citations: z.array(CitationSchema),
  unsupportedClaims: z.array(z.string()),
  limitations: z.array(z.string()),
  nextActions: z.array(z.string()),
});

printLessonHeader("进阶 08：结构化输出的生产策略");

printJson("strategy selection", {
  providerStrategy: "模型服务商原生支持 JSON schema 时优先考虑，成本和延迟通常更好。",
  toolStrategy: "跨 provider 更稳定，适合课程里观察 tool calling 和错误恢复。",
  thisLessonUses: "toolStrategy",
});

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [],
  responseFormat: toolStrategy(ResearchAnswerV1, {
    handleError:
      "输出必须匹配 ResearchAnswerV1：schemaVersion、answer、citations、unsupportedClaims、limitations、nextActions。",
    toolMessageContent: "structured response accepted",
  }),
  systemPrompt: `你是课程研究助手。

必须输出 ResearchAnswerV1。
没有证据支持的结论要放入 unsupportedClaims，不要混进 answer。`,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `资料：
[A01] Agent 适合动态选择工具。
[A03] Context engineering 要控制模型可见信息。

问题：Agent 和 context engineering 的关系是什么？`,
      },
    ],
  },
  {
    runName: "advanced-08-structured-output",
    tags: ["advanced", "08", "structured-output"],
    metadata: { lesson: "A08", schemaVersion: "v1" },
  }
);

printStructuredResponse(result);
