import { readFileSync } from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import {
  createAgent,
  type Decision,
  type HITLRequest,
  humanInTheLoopMiddleware,
  tool,
} from "langchain";
import { Command, MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  printAgentTrace,
  printFinalAnswer,
  printJson,
  printSection,
} from "./shared.js";

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
不要直接声称已经写入文件。
最终回答必须以 write_report_draft 返回 JSON 中的 path、bytes、dryRun 为准。
如果人工审核编辑了工具参数，要明确说明执行的是审核后的参数，而不是用户最初请求的参数。`,
});

const config = {
  configurable: { thread_id: "advanced-10-hitl-demo" },
  runName: "advanced-10-hitl-approval",
  tags: ["advanced", "10", "hitl"],
  metadata: { lesson: "A10" },
};

function getHitlRequest(result: unknown): HITLRequest | undefined {
  const interrupts = (
    result as { __interrupt__?: Array<{ value?: HITLRequest }> }
  ).__interrupt__;
  return interrupts?.[0]?.value;
}

const scriptedAnswers = input.isTTY
  ? []
  : readFileSync(0, "utf8").split(/\r?\n/);

async function ask(
  rl: ReturnType<typeof createInterface> | undefined,
  question: string
): Promise<string> {
  if (scriptedAnswers.length > 0) {
    const answer = scriptedAnswers.shift() ?? "";
    console.log(`${question}${answer}`);
    return answer;
  }

  if (rl) {
    return rl.question(question);
  }

  console.log(`${question}<no stdin available>`);
  return "";
}

async function reviewAction(
  rl: ReturnType<typeof createInterface> | undefined,
  action: HITLRequest["actionRequests"][number],
  index: number
): Promise<Decision> {
  printSection(`pending approval #${index + 1}`);
  printJson("tool action request", action);

  const rawDecision = (
    await ask(rl, "Decision [approve/edit/reject] (default approve): ")
  )
    .trim()
    .toLowerCase();
  const decision = rawDecision === "" ? "approve" : rawDecision;

  if (decision === "approve") {
    return { type: "approve" };
  }

  if (decision === "edit") {
    const currentPath = String(action.args.path ?? "");
    const currentContent = String(action.args.content ?? "");
    const editedPath =
      (await ask(rl, `Edited path (default ${currentPath}): `)).trim() ||
      currentPath;
    const editedContent =
      (await ask(rl, "Edited content (leave empty to keep original): ")) ||
      currentContent;

    return {
      type: "edit",
      editedAction: {
        name: action.name,
        args: {
          ...action.args,
          path: editedPath,
          content: editedContent,
        },
      },
    };
  }

  if (decision === "reject") {
    const message =
      (await ask(rl, "Reject reason: ")).trim() ||
      "Human reviewer rejected this write operation.";
    return { type: "reject", message };
  }

  console.log(`Unknown decision "${decision}", rejecting for safety.`);
  return {
    type: "reject",
    message: `Unsupported terminal decision: ${decision}`,
  };
}

let currentResult = await agent.invoke(
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

printAgentTrace(currentResult);

let hitlRequest = getHitlRequest(currentResult);

if (!hitlRequest) {
  printSection("no human review needed");
  console.log("Agent completed without a HITL interrupt.");
} else {
  printSection("terminal human review");
  console.log(
    "Review the pending tool call. This lesson tool is still dry-run and will not write files."
  );

  const rl = input.isTTY ? createInterface({ input, output }) : undefined;
  try {
    for (let reviewRound = 1; hitlRequest; reviewRound += 1) {
      if (reviewRound > 5) {
        throw new Error(
          "Too many HITL review rounds; stopping to avoid an approval loop."
        );
      }

      printJson(`interrupt payload #${reviewRound}`, hitlRequest);

      const decisions: Decision[] = [];
      for (const [index, action] of hitlRequest.actionRequests.entries()) {
        decisions.push(await reviewAction(rl, action, index));
      }

      const resume = { decisions };
      printJson("resume command payload", resume);

      currentResult = await agent.invoke(
        new Command({ resume }) as never,
        config
      );

      printSection(`resumed after human decision #${reviewRound}`);
      printAgentTrace(currentResult);
      hitlRequest = getHitlRequest(currentResult);
    }
  } finally {
    rl?.close();
  }
}

printFinalAnswer(currentResult);
