import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printAgentTrace, printJson, printSection } from "./shared.js";

const dryRunWriteReport = tool(
  ({ path, content }: { path: string; content: string }) => {
    return JSON.stringify({
      ok: true,
      dryRun: true,
      path,
      bytes: Buffer.byteLength(content, "utf8"),
      note: "课程演示工具不会真的写文件。",
    });
  },
  {
    name: "write_report_draft",
    description: "写入课程研究报告草稿。课程演示中只做 dry-run，不产生文件副作用。",
    schema: z.object({
      path: z.string().describe("准备写入的相对路径"),
      content: z.string().describe("准备写入的文件内容"),
    }),
  }
);

printLessonHeader("进阶 10：Human-in-the-loop 审批");

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [dryRunWriteReport],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        write_report_draft: {
          allowedDecisions: ["approve", "edit", "reject"],
          description:
            "文件写入属于高风险动作。请审核 path 和 content 后再决定是否执行。",
        },
      },
      descriptionPrefix: "Tool execution pending approval",
    }),
  ],
  checkpointer: new MemorySaver(),
  systemPrompt: `你是课程报告助手。

当用户要求生成报告文件时，必须调用 write_report_draft。
不要直接声称已经写入文件。`,
});

const config = {
  configurable: { thread_id: "advanced-10-hitl-demo" },
  runName: "advanced-10-hitl-approval",
  tags: ["advanced", "10", "hitl"],
  metadata: { lesson: "A10" },
};

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content:
          "请生成一份 A01 学习总结草稿，并准备写入 reports/a01-summary.md。",
      },
    ],
  },
  config
);

printAgentTrace(result);

const interruptPayload = (result as { __interrupt__?: unknown }).__interrupt__;
printJson("interrupt payload", interruptPayload ?? "no interrupt returned");

printSection("next step in a real app");
console.log(
  "真实应用会把 interrupt payload 展示给审核人，然后用 Command({ resume: { decisions: [...] } }) 继续同一个 thread。"
);
