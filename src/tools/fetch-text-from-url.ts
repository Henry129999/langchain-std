import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * URL 文本抓取工具。
 *
 * 研究型 Agent 不能只靠模型猜网页内容；这个工具负责确定性地请求 URL，
 * 并把页面文本返回给 Agent，后续回答再基于工具结果展开。
 */
export const fetchTextFromUrl = tool(
  async ({ url }: { url: string }): Promise<string> => {
    // 使用 AbortController 给网络请求设置超时，避免脚本长时间卡住。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; langchain-agent-study/0.1)",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return `抓取失败：HTTP ${response.status} ${response.statusText}`;
      }

      return await response.text();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `抓取失败：${message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "fetch_text_from_url",
    description: "从 URL 抓取纯文本或 HTML 内容。",
    schema: z.object({
      url: z.string().url().describe("需要抓取的 URL"),
    }),
  }
);
