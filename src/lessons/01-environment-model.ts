import { createCourseModel, printLessonHeader } from "../shared/config.js";

/**
 * 第 01 课：环境、模型与项目骨架
 *
 * 学习目标：
 * 1. 确认课程统一通过 `createCourseModel` 创建模型。
 * 2. 理解 provider 配置只应该留在 `src/shared/config.ts`。
 * 3. 先跑通最小模型调用，再进入 Agent。
 */
printLessonHeader("第 01 课：环境、模型与项目骨架");

const model = createCourseModel({
  temperature: 0.2,
});

const result = await model.invoke([
  {
    role: "system",
    content: "你是一个简洁的 TypeScript 与 LangChain 学习助手。",
  },
  {
    role: "user",
    content:
      "用三点说明：为什么课程代码应该通过统一模型工厂创建模型？",
  },
]);

console.log("\n--- model response ---");
console.dir(result, { depth: 5 });
