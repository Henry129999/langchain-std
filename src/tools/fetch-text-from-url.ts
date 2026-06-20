import { tool } from "@langchain/core/tools";
import { z } from "zod";

const URL_FETCH_TIMEOUT_MS = 120_000;
const MAX_TEXT_CHARS = 20_000;
const SUPPORTED_CONTENT_TYPES = [
  "text/plain",
  "text/html",
  "application/json",
  "application/xml",
  "text/markdown",
];

function jsonResult(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * URL 文本抓取工具。
 *
 * 研究型 Agent 不能只靠模型猜网页内容；这个工具负责确定性地请求 URL，
 * 并把页面文本返回给 Agent，后续回答再基于工具结果展开。
 */
export const fetchTextFromUrl = tool(
  async ({ url }: { url: string }): Promise<string> => {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return jsonResult({
        ok: false,
        errorCode: "INVALID_URL",
        message: "URL 格式不合法。",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return jsonResult({
        ok: false,
        errorCode: "UNSUPPORTED_PROTOCOL",
        message: "只允许抓取 http 或 https URL。",
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; langchain-agent-study/0.1)",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return jsonResult({
          ok: false,
          errorCode: "HTTP_ERROR",
          status: response.status,
          statusText: response.statusText,
          message: `HTTP ${response.status} ${response.statusText}`,
        });
      }

      const contentType = response.headers.get("content-type") ?? "unknown";
      const normalizedContentType = contentType.split(";")[0]?.trim().toLowerCase();

      if (
        normalizedContentType &&
        normalizedContentType !== "unknown" &&
        !SUPPORTED_CONTENT_TYPES.includes(normalizedContentType)
      ) {
        return jsonResult({
          ok: false,
          errorCode: "UNSUPPORTED_CONTENT_TYPE",
          contentType,
          message: `不支持的 content-type：${contentType}`,
        });
      }

      const text = await response.text();
      const truncated = text.length > MAX_TEXT_CHARS;

      return jsonResult({
        ok: true,
        url,
        contentType,
        charCount: text.length,
        truncated,
        text: truncated ? text.slice(0, MAX_TEXT_CHARS) : text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const errorCode = message.includes("abort") ? "TIMEOUT" : "NETWORK_ERROR";

      return jsonResult({
        ok: false,
        errorCode,
        message,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "fetch_text_from_url",
    description:
      "从 http/https URL 抓取文本内容；返回 JSON，包含 ok、text、errorCode、truncated 等字段。",
    schema: z.object({
      url: z.string().url().describe("需要抓取的 URL"),
    }),
  }
);
