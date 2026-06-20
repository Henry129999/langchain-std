import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { researchAssistantPrompt } from "../prompts/research-assistant.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

/**
 * 第 08 课：URL 文本研究助手
 *
 * 本节课对应教程中的第一个实战项目：
 * 1. 用户提供 URL 和问题。
 * 2. Agent 必须调用 `fetch_text_from_url` 抓取文本。
 * 3. Agent 只基于抓取内容回答。
 * 4. 输出必须包含 `answer`、`evidence`、`limitations`。
 */
printLessonHeader("第 08 课：URL 文本研究助手");

const url =
  process.env.COURSE_RESEARCH_URL ||
  "https://www.gutenberg.org/files/64317/64317-0.txt";
const question =
  process.env.COURSE_RESEARCH_QUESTION ||
  "这本书主要讲什么？请给出简短答案。";

const agent = createAgent({
  model: createCourseModel({
    temperature: 0.2,
    timeout: 300_000,
    maxTokens: 4000,
  }),
  tools: [fetchTextFromUrl],
  systemPrompt: `${researchAssistantPrompt}

## 输出格式

请严格使用以下 Markdown 小节：

### answer
### evidence
### limitations`,
  checkpointer: new MemorySaver(),
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `URL: ${url}

问题：${question}

请先读取 URL，再回答。`,
      },
    ],
  },
  { configurable: { thread_id: "lesson-08-url-research-project" } }
);

printLastMessage(result);
