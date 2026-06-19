import { MemorySaver } from "@langchain/langgraph";
import { createAgent, initChatModel } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { researchAssistantPrompt } from "../prompts/research-assistant.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

printLessonHeader("Lesson 05: Research Agent");
requireModelEnvironment();

const model = await initChatModel(modelName, {
  temperature: 0.2,
  timeout: 300_000,
  maxTokens: 4000,
});

const agent = createAgent({
  model,
  tools: [fetchTextFromUrl],
  systemPrompt: researchAssistantPrompt,
  checkpointer: new MemorySaver(),
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `Read this page and answer in Chinese:
URL: https://www.gutenberg.org/files/64317/64317-0.txt

Question: What is this book about? Give a short answer and mention any limitations.`,
      },
    ],
  },
  { configurable: { thread_id: "lesson-05-research" } }
);

printLastMessage(result);
