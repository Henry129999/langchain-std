import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

printLessonHeader("Lesson 04: Memory");
requireModelEnvironment();

const checkpointer = new MemorySaver();
const agent = createAgent({
  model: modelName,
  tools: [getWeather],
  systemPrompt: "You are a concise assistant. Remember user preferences inside the current thread.",
  checkpointer,
});

await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "My favorite city is Shenzhen. Please remember it.",
      },
    ],
  },
  { configurable: { thread_id: "lesson-04-memory" } }
);

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What's the weather in my favorite city?",
      },
    ],
  },
  { configurable: { thread_id: "lesson-04-memory" } }
);

printLastMessage(result);
