import { readFile } from "node:fs/promises";
import path from "node:path";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const MAX_LOCAL_FILE_CHARS = 30_000;
const ALLOWED_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".ts",
  ".tsx",
  ".js",
  ".json",
]);

function jsonResult(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * 本地文本文件读取工具。
 *
 * 学习项目中只允许读取当前项目目录下的文件，避免示例工具误读系统上的
 * 其他路径。真实项目应该按业务权限进一步收紧可访问目录。
 */
export const readLocalTextFile = tool(
  async ({ filePath }: { filePath: string }): Promise<string> => {
    const projectRoot = process.cwd();
    const absolutePath = path.resolve(projectRoot, filePath);
    const relativePath = path.relative(projectRoot, absolutePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return jsonResult({
        ok: false,
        errorCode: "OUTSIDE_PROJECT",
        message: "读取失败：只能读取当前项目目录内的文件。",
      });
    }

    const extension = path.extname(absolutePath).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return jsonResult({
        ok: false,
        errorCode: "UNSUPPORTED_EXTENSION",
        message: `读取失败：不支持 ${extension || "无扩展名"} 文件。`,
      });
    }

    try {
      const text = await readFile(absolutePath, "utf8");
      const truncated = text.length > MAX_LOCAL_FILE_CHARS;

      return jsonResult({
        ok: true,
        filePath: relativePath,
        charCount: text.length,
        truncated,
        text: truncated ? text.slice(0, MAX_LOCAL_FILE_CHARS) : text,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return jsonResult({
        ok: false,
        errorCode: "READ_ERROR",
        message: `读取失败：${message}`,
      });
    }
  },
  {
    name: "read_local_text_file",
    description:
      "读取当前项目目录内的 UTF-8 文本文件；返回 JSON，包含 ok、text、errorCode、truncated 等字段。",
    schema: z.object({
      filePath: z.string().describe("相对于项目根目录的文本文件路径"),
    }),
  }
);
