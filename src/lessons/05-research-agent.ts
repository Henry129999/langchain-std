import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { researchAssistantPrompt } from "../prompts/research-assistant.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

/**
 * 第 05 课：研究型 Agent
 *
 * 本节课需要学习：
 * 1. `createCourseModel` 如何统一创建课程使用的 GLM 模型。
 * 2. Agent 如何使用 URL 抓取工具读取外部文本。
 * 3. 系统提示词如何限制模型只根据工具结果回答。
 * 4. 为什么长文本研究任务需要明确说明限制和证据。
 */
printLessonHeader("第 05 课：研究型 Agent");

// 初始化聊天模型；研究任务更强调稳定性，因此把 temperature 设置得较低。
const model = createCourseModel({
  temperature: 0.2,
  timeout: 300_000,
  maxTokens: 4000,
});

// 创建研究型 Agent：模型负责推理，fetchTextFromUrl 负责读取外部 URL。
const agent = createAgent({
  model,
  tools: [fetchTextFromUrl],
  systemPrompt: researchAssistantPrompt,
  checkpointer: new MemorySaver(),
});

// 向 Agent 提供一个公开文本 URL，并要求它基于抓取内容用中文回答。
const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `请阅读这个页面，并用中文回答：
URL: https://www.gutenberg.org/files/64317/64317-0.txt

问题：这本书主要讲什么？请简短回答，并说明你回答时存在的限制。`,
      },
    ],
  },
  { configurable: { thread_id: "lesson-05-research" } }
);

// 打印最终回答，重点观察是否包含答案、证据来源和限制说明。
printLastMessage(result);
