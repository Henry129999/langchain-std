import { createAgent } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

printLessonHeader("Lesson 01: Basic Agent");
requireModelEnvironment();

const agent = createAgent({
  model: modelName,
  tools: [getWeather],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's the weather in San Francisco?",
    },
  ],
});

printLastMessage(result);
