import { createCourseModel, printLessonHeader } from "../shared/config.js";

/**
 * 第 02 课：Messages 与最小模型调用
 *
 * 学习目标：
 * 1. 理解 LangChain 以 messages 表达对话上下文。
 * 2. 区分 system、user、assistant 消息的职责。
 * 3. 知道简单任务可以只调用模型，不必创建 Agent。
 */
printLessonHeader("第 02 课：Messages 与最小模型调用");

const model = createCourseModel({
  temperature: 0.2,
});

const firstMessages = [
  {
    role: "system" as const,
    content:
      "你是一个工程师课程助教。回答要具体、简洁，并指出适用边界。",
  },
  {
    role: "user" as const,
    content: "什么场景只需要 model.invoke，而不需要 Agent？",
  },
];

const first = await model.invoke(firstMessages);

console.log("\n--- first response ---");
console.dir(first, { depth: 5 });

const second = await model.invoke([
  ...firstMessages,
  first,
  {
    role: "user" as const,
    content: "基于上一轮回答，给我一个 TypeScript 项目里的例子。",
  },
]);

console.log("\n--- second response with manual context ---");
console.dir(second, { depth: 5 });
