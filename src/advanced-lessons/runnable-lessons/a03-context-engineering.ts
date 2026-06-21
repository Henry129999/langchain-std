import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { printJson, printSection } from "./shared.js";

interface CourseChunk {
  id: string;
  source: string;
  title: string;
  content: string;
}

const chunks: CourseChunk[] = [
  {
    id: "basic-05",
    source: "src/lessons/05-first-agent.ts",
    title: "第 05 课：第一个 LangChain Agent",
    content: "Agent 适合模型需要动态选择工具的任务；工具没有数据时不能编造。",
  },
  {
    id: "basic-10",
    source: "src/lessons/10-rag-intro.ts",
    title: "第 10 课：RAG 入门",
    content: "RAG 先检索相关片段，再把证据交给模型生成答案。",
  },
  {
    id: "advanced-a03",
    source: "src/advanced-lessons/lessons/01-langchain-agent-engineering-lessons.md",
    title: "Context Engineering",
    content:
      "上下文分为 model context、tool context、lifecycle context；不要把所有历史和工具结果无差别塞进 prompt。",
  },
  {
    id: "noise-01",
    source: "notes/random.md",
    title: "无关笔记",
    content: "这个片段讨论编辑器主题和终端配色，与 Agent 上下文无关。",
  },
];

function retrieveChunks(question: string, topK: number): CourseChunk[] {
  const terms = question
    .toLowerCase()
    .split(/\s+|，|。|、/)
    .filter(Boolean);

  console.log('terms', terms)

  return chunks
    .map((chunk) => ({
      chunk,
      score: terms.reduce(
        (total, term) =>
          total + (chunk.content.toLowerCase().includes(term) ? 1 : 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);
}

function formatModelContext(retrieved: CourseChunk[]): string {
  return retrieved
    .map(
      (chunk) =>
        `[${chunk.id}] ${chunk.title}\nsource: ${chunk.source}\n${chunk.content}`
    )
    .join("\n\n");
}


printLessonHeader("进阶 03：Context Engineering");

const question = "什么时候应该把资料放进 model context，什么时候不应该全部塞进去？";
const retrieved = retrieveChunks(question, 3);
const modelContext = formatModelContext(retrieved);

console.log('retrieved---------------------->', retrieved)
console.log('modelContext---------------------->', modelContext)


printJson("context budget", {
  maxEvidenceChunks: 3,
  injectedChunkIds: retrieved.map((chunk) => chunk.id),
  omittedChunkIds: chunks
    .filter((chunk) => !retrieved.some((item) => item.id === chunk.id))
    .map((chunk) => chunk.id),
});

const model = createCourseModel({ temperature: 0.1 });
const response = await model.invoke(
  [
    new SystemMessage(`你是一个工程化 LangChain 课程助教。

只能基于 <context> 中的片段回答。
如果证据不足，明确指出缺少什么资料。`),
    new HumanMessage(`<context>
${modelContext}
</context>

问题：${question}`),
  ],
  {
    runName: "advanced-03-context-engineering",
    tags: ["advanced", "03", "context-engineering"],
    metadata: { lesson: "A03", injectedChunkCount: retrieved.length },
  }
);

printSection("model context injected");
console.log(modelContext);

printSection("answer");
console.log(response.content);
