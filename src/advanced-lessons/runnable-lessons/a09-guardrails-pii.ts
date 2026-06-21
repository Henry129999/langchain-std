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
      // 表示处理方式是 脱敏替换，也就是把检测到的邮箱替换成类似 [REDACTED] / [REDACTED_EMAIL] 这类占位内容，避免原始邮箱继续流转
      strategy: "redact",
      // 表示在用户输入进入模型 provider 之前先处理。也就是说，模型看到的不是原始邮箱，而是脱敏后的文本。这是最关键的安全点，因为敏感信息最好不要进模型请求和 trace
      applyToInput: true,
      // 示模型输出返回给调用方之前也要再检查一遍，防止模型把邮箱复述出来
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
