import { createAgent, dynamicSystemPromptMiddleware } from "langchain";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printFinalAnswer, printSection } from "./shared.js";

const contextSchema = z.object({
  role: z.enum(["engineer", "reviewer", "operator"]),
  region: z.string().optional(),
});

type RuntimeContext = z.infer<typeof contextSchema>;

const dynamicPrompt = dynamicSystemPromptMiddleware<RuntimeContext>(
  (_state, runtime) => {
    const roleInstruction = {
      engineer: "从机制、参数边界和可测试性角度回答。",
      reviewer: "优先指出风险、回归点和缺失的验证。",
      operator: "优先给出可执行步骤和运行检查点。",
    }[runtime.context.role];

    return `你是 LangChain.js 进阶课程助教。
当前角色：${runtime.context.role}
地区：${runtime.context.region ?? "未指定"}
回答要求：${roleInstruction}
不要写泛泛介绍。`;
  }
);

printLessonHeader("进阶 05：动态系统提示词与 Runtime Context");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [],
  contextSchema,
  middleware: [dynamicPrompt],
});

for (const role of ["engineer", "reviewer"] as const) {
  printSection(`runtime role: ${role}`);
  const result = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "为什么工具权限不能只靠 prompt 约束？用三句话回答。",
        },
      ],
    },
    {
      context: { role, region: "CN" },
      runName: `advanced-05-dynamic-prompt-${role}`,
      tags: ["advanced", "05", "dynamic-prompt", role],
      metadata: { lesson: "A05", role },
    }
  );

  printFinalAnswer(result);
}
