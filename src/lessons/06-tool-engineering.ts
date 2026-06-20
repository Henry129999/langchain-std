import { printLessonHeader } from "../shared/config.js";
import { fetchTextFromUrl } from "../tools/fetch-text-from-url.js";
import { readLocalTextFile } from "../tools/local-file.js";

/**
 * 第 06 课：工具工程最佳实践
 *
 * 学习目标：
 * 1. 网络工具要有协议限制、超时、content-type 检查和大小限制。
 * 2. 文件工具要有路径限制、扩展名限制和大小限制。
 * 3. 工具错误也应返回稳定协议，方便模型和测试处理。
 */
printLessonHeader("第 06 课：工具工程最佳实践");

const url = process.env.COURSE_RESEARCH_URL || "https://example.com";

console.log("\n--- fetch_text_from_url success or controlled failure ---");
const urlResult = await fetchTextFromUrl.invoke({ url });
console.log(urlResult);

console.log("\n--- read_local_text_file success ---");
const fileResult = await readLocalTextFile.invoke({ filePath: "README.md" });
console.log(fileResult);

console.log("\n--- read_local_text_file rejected path ---");
const rejectedPath = await readLocalTextFile.invoke({
  filePath: "../outside-project.md",
});
console.log(rejectedPath);
