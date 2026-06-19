import { MemorySaver } from "@langchain/langgraph";
import { createDeepAgent } from "deepagents";
import { initChatModel } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { researchAssistantPrompt } from "../prompts/research-assistant.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";

printLessonHeader("Lesson 06: Deep Agent");
requireModelEnvironment();

const model = await initChatModel(modelName, {
  temperature: 0.2,
  timeout: 300_000,
  maxTokens: 4000,
});

const deepAgent = createDeepAgent({
  model,
  tools: [fetchTextFromUrl],
  systemPrompt: researchAssistantPrompt,
  checkpointer: new MemorySaver(),
});

const result = await deepAgent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `Project Gutenberg hosts a plain-text copy of The Great Gatsby.
URL: https://www.gutenberg.org/files/64317/64317-0.txt

Answer:
1. How many lines contain the substring Gatsby?
2. What is the first line number containing Daisy?
3. Give a two-sentence neutral synopsis.

If you cannot verify exact counts, say so instead of guessing.`,
      },
    ],
  },
  { configurable: { thread_id: "lesson-06-deep-agent" } }
);

printLastMessage(result);
