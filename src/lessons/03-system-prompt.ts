import { createAgent } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

printLessonHeader("Lesson 03: System Prompt");
requireModelEnvironment();

const agent = createAgent({
  model: modelName,
  tools: [getWeather],
  systemPrompt: `You are a concise bilingual assistant.

When the user asks about weather:
- Use get_weather before answering.
- Answer in Chinese.
- Keep the answer under 80 Chinese characters.`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "How is the weather in Beijing?",
    },
  ],
});

printLastMessage(result);
