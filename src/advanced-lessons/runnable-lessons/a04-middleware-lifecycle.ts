import { createAgent, createMiddleware } from "langchain";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { getWeather } from "../../tools/weather.js";
import {
  printAgentSummary,
  printAgentTrace,
  printFinalAnswer,
  printJson,
} from "./shared.js";

interface AuditEvent {
  hook: string;
  detail: string;
  durationMs?: number;
}

const auditEvents: AuditEvent[] = [];

const auditMiddleware = createMiddleware({
  name: "AdvancedA04AuditMiddleware",
  beforeAgent: async () => {
    auditEvents.push({ hook: "beforeAgent", detail: "agent invocation started" });
  },
  beforeModel: async () => {
    auditEvents.push({ hook: "beforeModel", detail: "about to call model" });
  },
  wrapModelCall: async (request, handler) => {
    const startedAt = Date.now();
    const response = await handler(request);
    auditEvents.push({
      hook: "wrapModelCall",
      detail: "model call completed",
      durationMs: Date.now() - startedAt,
    });
    return response;
  },
  wrapToolCall: async (request, handler) => {
    const startedAt = Date.now();
    const response = await handler(request);
    auditEvents.push({
      hook: "wrapToolCall",
      detail: `tool ${request.toolCall.name} completed`,
      durationMs: Date.now() - startedAt,
    });
    return response;
  },
  afterModel: async () => {
    auditEvents.push({ hook: "afterModel", detail: "model response inspected" });
  },
  afterAgent: async () => {
    auditEvents.push({ hook: "afterAgent", detail: "agent invocation finished" });
  },
});

printLessonHeader("进阶 04：Middleware 生命周期");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [getWeather],
  middleware: [auditMiddleware],
  systemPrompt: "回答天气问题前必须调用 get_weather 工具。不要编造工具没有返回的信息。",
});

const result = await agent.invoke(
  {
    messages: [{ role: "user", content: "上海今天适合户外通勤吗？" }],
  },
  {
    runName: "advanced-04-middleware-lifecycle",
    tags: ["advanced", "04", "middleware"],
    metadata: { lesson: "A04" },
  }
);

printAgentSummary(result);
printAgentTrace(result);
printFinalAnswer(result);
printJson("middleware audit events", auditEvents);
