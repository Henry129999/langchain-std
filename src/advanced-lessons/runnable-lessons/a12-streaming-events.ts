import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { getWeather } from "../../tools/weather.js";
import { asMessage, getMessageType, getToolCalls, printJson } from "./shared.js";

type UiEvent =
  | { type: "model_message"; content: string }
  | { type: "tool_start"; toolName: string; args: unknown }
  | { type: "tool_result"; content: string }
  | { type: "unknown_update"; keys: string[] };

function toUiEvents(update: unknown): UiEvent[] {
  if (typeof update !== "object" || update === null) {
    return [{ type: "unknown_update", keys: [] }];
  }

  const events: UiEvent[] = [];
  const record = update as Record<string, { messages?: unknown[] }>;

  for (const value of Object.values(record)) {
    for (const message of value.messages ?? []) {
      const type = getMessageType(message);
      const msg = asMessage(message);
      const toolCalls = getToolCalls(message);

      for (const toolCall of toolCalls) {
        events.push({
          type: "tool_start",
          toolName: toolCall.name ?? "unknown",
          args: toolCall.args,
        });
      }

      if (type === "tool") {
        events.push({
          type: "tool_result",
          content: String(msg.content ?? ""),
        });
      }

      if (type === "ai" && toolCalls.length === 0 && msg.content) {
        events.push({
          type: "model_message",
          content: String(msg.content),
        });
      }
    }
  }

  return events.length > 0
    ? events
    : [{ type: "unknown_update", keys: Object.keys(record) }];
}

printLessonHeader("进阶 12：Streaming 体验与事件协议");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather],
  systemPrompt: "回答天气问题前必须调用 get_weather 工具，并用一句话回答。",
}).withConfig({
  runName: "advanced-12-streaming-events",
  tags: ["advanced", "12", "streaming"],
  metadata: { lesson: "A12" },
});

const stream = await agent.stream(
  {
    messages: [{ role: "user", content: "上海天气怎么样？" }],
  },
  {
    streamMode: "updates",
  }
);

console.log('---------->', stream);

for await (const update of stream) {
  printJson("raw stream update", update);
  printJson("ui events", toUiEvents(update));
}
