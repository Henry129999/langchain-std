import { createAgent, detectEmail, piiMiddleware } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printAgentTrace, printFinalAnswer, printJson } from "./shared.js";

printLessonHeader("进阶 09：Guardrails 与 PII 治理");

const rawUserInput =
  "请总结这条用户反馈：我的邮箱是 henry@example.com，我希望课程更偏工程实践。";

const emailMatches = detectEmail(rawUserInput);
const locallyRedacted = rawUserInput.replace(
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  "[REDACTED_EMAIL]"
);

printJson("local pii pre-check", {
  rawUserInput,
  emailMatches,
  locallyRedacted,
  rule: "高风险数据应尽量在进入模型 provider 前处理。",
});

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [],
  middleware: [
    piiMiddleware("email", {
      strategy: "redact",
      applyToInput: true,
      applyToOutput: true,
    }),
  ],
  systemPrompt:
    "你是安全审查助手。总结用户反馈，但不要输出原始邮箱或其他敏感信息。",
});

const result = await agent.invoke(
  {
    messages: [{ role: "user", content: rawUserInput }],
  },
  {
    runName: "advanced-09-guardrails-pii",
    tags: ["advanced", "09", "guardrails", "pii"],
    metadata: { lesson: "A09", piiTypes: ["email"] },
  }
);

printAgentTrace(result);
printFinalAnswer(result);
