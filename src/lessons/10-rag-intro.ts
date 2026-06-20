import { createAgent, toolStrategy } from "langchain";
import { createCourseModel, printLessonHeader } from "../shared/config.js";
import { printStructuredResponse } from "../shared/output.js";
import { formatRetrievedChunks, loadCourseDocuments, retrieveRelevantChunks, splitDocuments } from "../rag/simple-rag.js";
import { ResearchAnswerSchema } from "../shared/schemas.js";

/**
 * 第 10 课：RAG 入门
 *
 * 学习目标：
 * 1. 把文档加载、切分、检索和生成分开。
 * 2. 检索片段保留 source 和 chunk id，便于 evidence/citation。
 * 3. 证据不足时拒答，而不是让模型猜。
 *
 * 说明：本课使用轻量词项检索演示 RAG 结构。生产项目可把 retriever
 * 替换成 embedding + vector store，保留相同的输入输出边界。
 */
printLessonHeader("第 10 课：RAG 入门");

const question =
  process.env.COURSE_RAG_QUESTION ||
  "新版 LangChain-only 课程为什么暂时跳过 DeepAgent 和 LangGraph？";

const documents = await loadCourseDocuments([
  "README.md",
  "docs/langchain-lessons-curriculum.md",
  "exercises/README.md",
]);
const chunks = splitDocuments(documents);
const retrieved = retrieveRelevantChunks(question, chunks, 4);
const context = formatRetrievedChunks(retrieved);

console.log("\n--- retrieved chunks ---");
console.dir(
  retrieved.map((chunk) => ({
    id: chunk.id,
    source: chunk.source,
    score: chunk.score,
  })),
  { depth: 4 }
);

const agent = createAgent({
  model: createCourseModel({ temperature: 0.1, maxTokens: 2000 }),
  tools: [],
  responseFormat: toolStrategy(ResearchAnswerSchema),
  systemPrompt: `你是一个 RAG 课程资料问答助手。

规则：
- 只能根据用户提供的检索片段回答。
- evidence 必须引用片段 id，例如 README.md#0。
- 如果检索片段为空或不相关，必须拒答。`,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: `问题：${question}

检索片段：
${context}`,
    },
  ],
});

printStructuredResponse(result);
