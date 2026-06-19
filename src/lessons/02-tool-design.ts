import { createAgent } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getCityTimezone, getWeather } from "../tools/weather.js";

printLessonHeader("Lesson 02: Tool Design");
requireModelEnvironment();

const agent = createAgent({
  model: modelName,
  tools: [getWeather, getCityTimezone],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Tell me the weather and timezone for Shanghai and San Francisco. Use tools when useful.",
    },
  ],
});

printLastMessage(result);
