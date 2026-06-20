import { createAgent } from "langchain";
import { modelName, printLessonHeader, requireModelEnvironment } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getCityTimezone, getWeather } from "../tools/weather.js";

/**
 * 第 02 课：工具设计
 *
 * 本节课需要学习：
 * 1. 一个 Agent 可以同时拥有多个工具。
 * 2. 工具的 `description` 和 `schema` 会影响模型是否正确调用工具。
 * 3. 用户一次提出多个需求时，模型可能会连续调用多个工具。
 * 4. 工具应该处理确定性任务，模型负责组织答案。
 */
printLessonHeader("第 02 课：工具设计");

// 检查模型 API Key，避免脚本运行到模型调用时才报错。
requireModelEnvironment();

// 创建带有两个工具的 Agent：天气查询和城市时区查询。
const agent = createAgent({
  model: modelName,
  tools: [getWeather, getCityTimezone],
});

// 这个问题同时需要天气和时区信息，用来观察 Agent 是否会调用多个工具。
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "请告诉我上海和旧金山的天气与时区。需要时请使用工具。",
    },
  ],
});

// 打印最终回答，检查工具返回值是否被模型正确整合。
printLastMessage(result);
