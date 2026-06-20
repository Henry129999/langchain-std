import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { getWeather } from "../tools/weather.js";

/**
 * 第 04 课：记忆
 *
 * 本节课需要学习：
 * 1. `MemorySaver` 如何在同一个线程中保存对话状态。
 * 2. `thread_id` 如何区分不同会话。
 * 3. Agent 如何利用上一轮用户偏好回答下一轮问题。
 * 4. 本地内存记忆适合学习，生产环境需要换成持久化存储。
 */
printLessonHeader("第 04 课：记忆");

// 创建内存检查点；它会在当前进程内保存同一个 thread_id 的对话历史。
const checkpointer = new MemorySaver();

// 创建带记忆的 Agent，并要求它记住当前线程内的用户偏好。
const agent = createAgent({
  model: createCourseModel(),
  tools: [getWeather],
  systemPrompt: "你是一个简洁的助手。请记住当前线程中的用户偏好。",
  checkpointer,
});

// 第一次调用：告诉 Agent 用户偏好的城市，并使用固定 thread_id 保存这段上下文。
await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "我最喜欢的城市是深圳，请记住。",
      },
    ],
  },
  { configurable: { thread_id: "lesson-04-memory" } }
);

// 第二次调用：不再直接说城市名，测试 Agent 是否能从同一个 thread_id 中读取记忆。
const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "我最喜欢的城市天气怎么样？",
      },
    ],
  },
  { configurable: { thread_id: "lesson-04-memory" } }
);

// 打印最终回答，重点观察 Agent 是否记住“深圳”并调用天气工具。
printLastMessage(result);
