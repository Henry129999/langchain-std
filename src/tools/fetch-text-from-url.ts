import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const fetchTextFromUrl = tool(
  async ({ url }: { url: string }): Promise<string> => {
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
        return `Fetch failed: HTTP ${response.status} ${response.statusText}`;
      }

      return await response.text();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `Fetch failed: ${message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "fetch_text_from_url",
    description: "Fetch plain text or HTML from a URL.",
    schema: z.object({
      url: z.string().url().describe("The URL to fetch"),
    }),
  }
);
