import { createAgent } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printLastMessage } from "../shared/output.js";
import { readLocalTextFile } from "../tools/local-file.js";

/**
 * 第 10 课：本地文件问答 Agent
 *
 * 本节课补齐教程扩展章节中的本地文件问答方向：
 * 1. 文件读取由工具完成，模型不能凭文件名猜内容。
 * 2. 工具限制在当前项目目录内读取文本文件。
 * 3. 回答必须给出来自文件内容的依据和限制。
 */
printLessonHeader("第 10 课：本地文件问答 Agent");

const agent = createAgent({
  model: createCourseModel({ temperature: 0.2 }),
  tools: [readLocalTextFile],
  systemPrompt: `你是一个本地文件问答助手。

规则：
- 回答前必须调用 read_local_text_file。
- 只能根据工具返回的文件内容回答。
- 如果文件没有相关信息，请直接说明。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "请读取 exercises/README.md，并总结 Lesson 05 和 Lesson 06 的练习重点。",
    },
  ],
});

printLastMessage(result);
