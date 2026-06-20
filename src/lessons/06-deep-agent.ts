import { MemorySaver } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { researchAssistantPrompt } from "../prompts/research-assistant.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

/**
 * 第 06 课：Deep Agent
 *
 * 本节课需要学习：
 * 1. `createDeepAgent` 和普通 `createAgent` 的区别。
 * 2. Deep Agent 内置规划、文件系统工具和更强的长任务处理能力。
 * 3. 为什么计数、行号这类精确问题需要可靠工具支持。
 * 4. 如何对比第 05 课普通研究 Agent 和本课 Deep Agent 的输出。
 */
printLessonHeader("第 06 课：Deep Agent");

// 初始化聊天模型；Deep Agent 会进行多步处理，因此超时时间设置得更宽松。
const model = createCourseModel({
  temperature: 0.2,
  timeout: 300_000,
  maxTokens: 4000,
});

// 创建 Deep Agent：它除了能调用自定义工具，还具备规划和文件类内置能力。
const deepAgent = createDeepAgent({
  model,
  tools: [fetchTextFromUrl],
  systemPrompt: researchAssistantPrompt,
  checkpointer: new MemorySaver(),
});

// 提出需要精确统计和摘要的任务，用来观察 Deep Agent 是否能更可靠地完成多步骤研究。
const result = await deepAgent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `Project Gutenberg 提供了《了不起的盖茨比》的纯文本版本。
URL: https://www.gutenberg.org/files/64317/64317-0.txt

请回答：
1. 有多少行包含子字符串 Gatsby？
2. 第一次出现 Daisy 的行号是多少？
3. 用两句话给出中立摘要。

如果无法验证精确数量，请直接说明，不要猜测。`,
      },
    ],
  },
  { configurable: { thread_id: "lesson-06-deep-agent" } }
);

// 打印最终回答，重点检查精确统计是否有工具依据，以及无法验证时是否明确说明。
printLastMessage(result);
