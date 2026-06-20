import { z } from "zod";

/**
 * 贯穿项目“课程资料研究助手”的标准输出。
 *
 * 课程中所有给程序消费的最终答案都使用 schema 约束，而不是只在 prompt
 * 中要求“输出 JSON”。这样字段缺失或类型错误时更容易被测试发现。
 */
export const ResearchAnswerSchema = z.object({
  answer: z.string().describe("直接回答用户问题；证据不足时明确拒答。"),
  evidence: z
    .array(z.string())
    .describe("支持答案的证据，必须来自工具返回或检索片段。"),
  limitations: z
    .array(z.string())
    .describe("当前回答的限制，例如资料不足、内容被截断或未覆盖。"),
  nextActions: z.array(z.string()).describe("建议用户下一步可以做什么。"),
});

export type ResearchAnswer = z.infer<typeof ResearchAnswerSchema>;
