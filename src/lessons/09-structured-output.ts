import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";

/**
 * 第 09 课：结构化输出 Agent
 *
 * 本节课补齐教程扩展章节中的结构化输出方向：
 * 1. 用工具完成确定性计算。
 * 2. 用系统提示词要求固定 JSON 字段。
 * 3. 观察模型是否把工具结果整理成可被程序读取的结构。
 */
printLessonHeader("第 09 课：结构化输出 Agent");

const calculateDiscount = tool(
  ({ price, discountRate }: { price: number; discountRate: number }) => {
    const discount = Number((price * discountRate).toFixed(2));
    const finalPrice = Number((price - discount).toFixed(2));

    return JSON.stringify({
      price,
      discountRate,
      discount,
      finalPrice,
    });
  },
  {
    name: "calculate_discount",
    description: "计算商品折扣金额和折后价。",
    schema: z.object({
      price: z.number().positive().describe("商品原价"),
      discountRate: z.number().min(0).max(1).describe("折扣比例，例如 0.2 表示 8 折"),
    }),
  }
);

const agent = createAgent({
  model: createCourseModel({ temperature: 0 }),
  tools: [calculateDiscount],
  systemPrompt: `你是一个结构化输出助手。

当用户要求计算折扣时，必须先调用 calculate_discount 工具。
最终只输出 JSON，不要输出 Markdown。
JSON 字段必须是：
- summary
- inputs
- result
- evidence`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "一件商品原价 299 元，优惠比例是 0.18，请计算折后价。",
    },
  ],
});

printLastMessage(result);
