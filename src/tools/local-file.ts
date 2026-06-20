import { readFile } from "node:fs/promises";
import path from "node:path";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

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

    if (!absolutePath.startsWith(projectRoot + path.sep)) {
      return "读取失败：只能读取当前项目目录内的文件。";
    }

    try {
      return await readFile(absolutePath, "utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `读取失败：${message}`;
    }
  },
  {
    name: "read_local_text_file",
    description: "读取当前项目目录内的 UTF-8 文本文件。",
    schema: z.object({
      filePath: z.string().describe("相对于项目根目录的文本文件路径"),
    }),
  }
);
