import { createHash } from "node:crypto";
import { createAgent, tool } from "langchain";
import { z } from "zod";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import {
  getTextContent,
  printAgentSummary,
  printAgentTrace,
  printFinalAnswer,
  printJson,
  printLearningFocus,
  printModelMessage,
  printSection,
} from "./shared.js";

interface RagLessonSpec {
  id: string;
  title: string;
  mode:
    | "architecture"
    | "parse"
    | "chunk"
    | "vector"
    | "incremental"
    | "queryTransform"
    | "hybrid"
    | "compression"
    | "grounded"
    | "agentic"
    | "eval"
    | "capstone";
  focus: string[];
  question: string;
}

interface RawDocument {
  source: string;
  type: "markdown" | "code" | "web" | "pdf";
  title: string;
  content: string;
}

interface ParsedDocument {
  docId: string;
  source: string;
  type: RawDocument["type"];
  title: string;
  section: string;
  position: number;
  content: string;
  sourceHash: string;
}

interface KnowledgeChunk {
  chunkId: string;
  parentDocId: string;
  source: string;
  type: RawDocument["type"];
  title: string;
  section: string;
  position: number;
  content: string;
  sourceHash: string;
  chunkHash: string;
}

interface VectorRecord {
  chunk: KnowledgeChunk;
  vector: number[];
  namespace: string;
  embeddingModel: string;
  indexVersion: string;
}

interface SearchHit {
  chunk: KnowledgeChunk;
  keywordScore: number;
  vectorScore: number;
  metadataScore: number;
  rerankScore: number;
  finalScore: number;
  matchedTerms: string[];
}

interface EvalCase {
  id: string;
  question: string;
  expectedChunkIds: string[];
  expectedAnswerPoints: string[];
}

const lessonSpecs: Record<string, RagLessonSpec> = {
  B01: {
    id: "B01",
    title: "RAG 架构决策：2-step、Agentic、Hybrid",
    mode: "architecture",
    focus: [
      "固定问答优先 2-step RAG",
      "动态资料选择或多步检索才使用 Agentic RAG",
      "关键词、向量、metadata、rerank 可以组合成 Hybrid RAG",
    ],
    question: "课程知识库问答应该默认采用哪种 RAG 架构？",
  },
  B02: {
    id: "B02",
    title: "文档解析：Loaders、Parsers、Metadata",
    mode: "parse",
    focus: [
      "先统一 Document schema，再进入 chunk 阶段",
      "解析阶段要保留 source、section、position、hash",
      "不同输入类型应该使用不同 parser",
    ],
    question: "如何解析课程 Markdown、网页和代码资料，才能支持后续引用？",
  },
  B03: {
    id: "B03",
    title: "Chunk 策略：证据单元、重叠、父子分块",
    mode: "chunk",
    focus: [
      "chunk 是证据单元，不只是固定长度文本",
      "chunk 要能追溯 parent document",
      "overlap 和 parent-child 都要控制重复召回",
    ],
    question: "课程资料应该如何切成可引用的 chunk？",
  },
  B04: {
    id: "B04",
    title: "Embedding 与 VectorStore 接口",
    mode: "vector",
    focus: [
      "embedding 只负责召回空间",
      "vector store 要有 namespace、dimension、metadata",
      "业务代码不应绑定具体向量库 provider",
    ],
    question: "为什么 embedding 召回不能等同于事实正确？",
  },
  B05: {
    id: "B05",
    title: "增量索引：Hash、Delete、Version、Dirty Index",
    mode: "incremental",
    focus: [
      "sourceHash 判断源文档是否变化",
      "chunkHash 控制最小 upsert/delete 范围",
      "embedding model 变化必须切 indexVersion",
    ],
    question: "文档更新后，如何避免脏索引继续被召回？",
  },
  B06: {
    id: "B06",
    title: "Query Transform：Rewrite、Multi-query、Step-back、HyDE",
    mode: "queryTransform",
    focus: [
      "query rewrite 解决用户表达和文档术语不一致",
      "multi-query 提高召回覆盖但要去重",
      "HyDE 不能被当成最终证据",
    ],
    question: "怎么检索“长任务代理和图编排有什么区别”这类模糊问题？",
  },
  B07: {
    id: "B07",
    title: "Hybrid Retrieval 与 Rerank",
    mode: "hybrid",
    focus: [
      "关键词适合精确术语，向量适合语义相似",
      "metadata filter 应先缩小检索范围",
      "rerank 必须输出可解释分数",
    ],
    question: "LangGraph interrupt 和 Deep Agents HITL 的区别是什么？",
  },
  B08: {
    id: "B08",
    title: "Contextual Compression：只给模型必要证据",
    mode: "compression",
    focus: [
      "检索结果不等于模型上下文",
      "压缩必须保留 source 和 chunkId",
      "snippet 必须能回到原文验证",
    ],
    question: "如何减少 RAG 上下文污染，同时保留引用？",
  },
  B09: {
    id: "B09",
    title: "Grounded Answer：引用、拒答、Unsupported Claims",
    mode: "grounded",
    focus: [
      "最终答案必须绑定 evidence id",
      "reasoning 不是证据",
      "证据不足时要拒答并说明缺口",
    ],
    question: "LangGraph 为什么比普通 Agent 更适合可恢复工作流？",
  },
  B10: {
    id: "B10",
    title: "Agentic RAG：把检索器做成 Tool",
    mode: "agentic",
    focus: [
      "retriever tool 要有清晰 schema",
      "Agentic RAG 要控制工具调用次数",
      "工具返回应是结构化 hits",
    ],
    question: "请检索课程知识库，并回答 Deep Agents 是否应该替代所有 LangGraph 工作流。",
  },
  B11: {
    id: "B11",
    title: "RAG Eval：Recall、MRR、Groundedness、Correctness",
    mode: "eval",
    focus: [
      "检索评测和生成评测要分离",
      "golden cases 要覆盖正例、拒答、干扰项",
      "失败要能定位到召回、排序、生成或引用",
    ],
    question: "如何评测一次 RAG 改动是否真的变好？",
  },
  B12: {
    id: "B12",
    title: "Production RAG Capstone：端到端知识库问答",
    mode: "capstone",
    focus: [
      "把 parse、chunk、index、transform、retrieval、compression、answer、eval 串起来",
      "每一层都要可替换、可观测、可评测",
      "生产 RAG 需要缓存、权限、回滚和质量门禁",
    ],
    question: "请运行端到端 RAG pipeline，并给出生产化检查清单。",
  },
};

const rawDocuments: RawDocument[] = [
  {
    source: "course/langchain-agent-engineering.md",
    type: "markdown",
    title: "LangChain Agent 工程化",
    content: `# LangChain Agent 工程化

## Agent Harness
Agent 适合动态工具选择。固定流程、低延迟和强可测场景优先使用普通 Runnable 或显式 workflow。

## Tool Boundary
工具输入 schema、执行上下文、结构化返回、错误 envelope 和审计字段是 Agent 工程化的边界。`,
  },
  {
    source: "course/langgraph-workflows.md",
    type: "markdown",
    title: "LangGraph 工作流编排",
    content: `# LangGraph 工作流编排

## StateGraph
LangGraph 用节点、边和 state 表达显式状态机，适合长期运行、可恢复、可中断、可观测的流程。

## Persistence
checkpointer 保存同一 thread 的 graph state。store 保存跨 thread 的长期数据。thread_id 是恢复流程的关键。

## Interrupt
interrupt/resume 用于人工审核、编辑 state 和工具审批。interrupt 前的副作用必须幂等。`,
  },
  {
    source: "course/deep-agents.md",
    type: "markdown",
    title: "Deep Agents 长任务系统",
    content: `# Deep Agents 长任务系统

## Positioning
Deep Agents 是 LangGraph 之上的长任务 harness，内置 planning、filesystem、subagents、skills、memory 和 context offloading。

## Boundary
Deep Agents 不应该替代所有 LangGraph 工作流。显式业务流程仍应优先使用 LangGraph，Deep Agents 更适合开放式长任务。`,
  },
  {
    source: "docs/rag-production.html",
    type: "web",
    title: "Production RAG Notes",
    content: `# Production RAG Notes

## Retrieval
Production RAG should separate parsing, chunking, indexing, retrieval, reranking, compression, answer generation, and evaluation.

## Evaluation
RAG evaluation should include retrieval recall, MRR, citation coverage, groundedness, correctness, refusal accuracy, latency, and cost.`,
  },
  {
    source: "src/tools/search.ts",
    type: "code",
    title: "Retriever Tool Example",
    content: `export interface SearchInput {
  query: string;
  topK: number;
  module?: "langchain" | "rag" | "langgraph" | "deepagents";
}

export interface SearchHit {
  chunkId: string;
  source: string;
  section: string;
  snippet: string;
  score: number;
}`,
  },
];

function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex").slice(0, 12);
}

function tokenize(text: string): string[] {
  return [...text.toLowerCase().matchAll(/[\p{L}\p{N}_]+/gu)].map(
    (match) => match[0]
  );
}

function parseDocuments(docs = rawDocuments): ParsedDocument[] {
  return docs.flatMap((doc) => {
    const sourceHash = hashText(doc.content);
    const headingMatches = [...doc.content.matchAll(/^##?\s+(.+)$/gm)];

    if (headingMatches.length === 0 || doc.type === "code") {
      return [
        {
          docId: hashText(`${doc.source}:root`),
          source: doc.source,
          type: doc.type,
          title: doc.title,
          section: doc.type === "code" ? "code" : doc.title,
          position: 0,
          content: doc.content.trim(),
          sourceHash,
        },
      ];
    }

    return headingMatches
      .map((match, index) => {
        const start = match.index ?? 0;
        const next = headingMatches[index + 1]?.index ?? doc.content.length;
        const section = match[1]?.trim() ?? doc.title;

        return {
          docId: hashText(`${doc.source}:${section}:${index}`),
          source: doc.source,
          type: doc.type,
          title: doc.title,
          section,
          position: index,
          content: doc.content.slice(start, next).trim(),
          sourceHash,
        };
      })
      .filter((parsed) =>
        parsed.content
          .split(/\n+/)
          .some((line) => line.trim() && !/^#{1,6}\s/.test(line.trim()))
      );
  });
}

function chunkDocuments(documents = parseDocuments()): KnowledgeChunk[] {
  return documents.flatMap((document) => {
    const sentences = document.content
      .split(/(?<=[。.!?])\s+|\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);
    const chunks: KnowledgeChunk[] = [];
    let buffer = "";
    let chunkPosition = 0;

    for (const sentence of sentences) {
      if (buffer.length > 0 && buffer.length + sentence.length > 320) {
        chunks.push(createChunk(document, buffer, chunkPosition));
        chunkPosition += 1;
        buffer = "";
      }
      buffer = [buffer, sentence].filter(Boolean).join("\n");
    }

    if (buffer.length > 0) {
      chunks.push(createChunk(document, buffer, chunkPosition));
    }

    return chunks;
  });
}

function createChunk(
  document: ParsedDocument,
  content: string,
  chunkPosition: number
): KnowledgeChunk {
  const chunkHash = hashText(content);

  return {
    chunkId: `${document.docId}-${chunkPosition}-${chunkHash.slice(0, 6)}`,
    parentDocId: document.docId,
    source: document.source,
    type: document.type,
    title: document.title,
    section: document.section,
    position: chunkPosition,
    content,
    sourceHash: document.sourceHash,
    chunkHash,
  };
}

function embedText(text: string, dimensions = 24): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  for (const token of tokenize(text)) {
    const digest = createHash("md5").update(token).digest();
    const index = (digest[0] ?? 0) % dimensions;
    const sign = (digest[1] ?? 0) % 2 === 0 ? 1 : -1;
    vector[index] = (vector[index] ?? 0) + sign;
  }

  const norm = Math.sqrt(vector.reduce((total, item) => total + item * item, 0));
  return norm === 0 ? vector : vector.map((item) => item / norm);
}

function cosineSimilarity(left: number[], right: number[]): number {
  return left.reduce((total, item, index) => total + item * (right[index] ?? 0), 0);
}

class InMemoryVectorIndex {
  private records = new Map<string, VectorRecord>();

  constructor(
    private readonly namespace: string,
    private readonly embeddingModel: string,
    private readonly indexVersion: string
  ) {}

  upsert(chunks: KnowledgeChunk[]): void {
    for (const chunk of chunks) {
      this.records.set(chunk.chunkId, {
        chunk,
        vector: embedText(chunk.content),
        namespace: this.namespace,
        embeddingModel: this.embeddingModel,
        indexVersion: this.indexVersion,
      });
    }
  }

  delete(chunkIds: string[]): void {
    for (const chunkId of chunkIds) {
      this.records.delete(chunkId);
    }
  }

  search(query: string, topK: number, type?: RawDocument["type"]): SearchHit[] {
    const queryTerms = new Set(tokenize(query));
    const queryVector = embedText(query);

    return [...this.records.values()]
      .filter((record) => !type || record.chunk.type === type)
      .map((record) => scoreChunk(record.chunk, query, queryTerms, queryVector, type))
      .sort((left, right) => right.finalScore - left.finalScore)
      .slice(0, topK);
  }

  stats() {
    return {
      namespace: this.namespace,
      embeddingModel: this.embeddingModel,
      indexVersion: this.indexVersion,
      count: this.records.size,
      chunkIds: [...this.records.keys()],
    };
  }
}

function scoreChunk(
  chunk: KnowledgeChunk,
  query: string,
  queryTerms: Set<string>,
  queryVector: number[],
  type?: RawDocument["type"]
): SearchHit {
  const chunkTerms = new Set(tokenize(`${chunk.title} ${chunk.section} ${chunk.content}`));
  const matchedTerms = [...queryTerms].filter((term) => chunkTerms.has(term));
  const keywordScore = queryTerms.size === 0 ? 0 : matchedTerms.length / queryTerms.size;
  const vectorScore = Math.max(0, cosineSimilarity(queryVector, embedText(chunk.content)));
  const metadataScore = type && chunk.type === type ? 1 : 0;
  const rerankScore = rerank(query, chunk, matchedTerms);
  const finalScore =
    keywordScore * 0.35 + vectorScore * 0.35 + metadataScore * 0.1 + rerankScore * 0.2;

  return {
    chunk,
    keywordScore: round(keywordScore),
    vectorScore: round(vectorScore),
    metadataScore: round(metadataScore),
    rerankScore: round(rerankScore),
    finalScore: round(finalScore),
    matchedTerms,
  };
}

function rerank(query: string, chunk: KnowledgeChunk, matchedTerms: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  if (matchedTerms.length > 0) score += 0.4;
  if (queryLower.includes("langgraph") && chunk.title.includes("LangGraph")) score += 0.35;
  if (queryLower.includes("deep") && chunk.title.includes("Deep Agents")) score += 0.35;
  if (queryLower.includes("评测") && chunk.content.toLowerCase().includes("evaluation")) {
    score += 0.25;
  }
  if (queryLower.includes("tool") && chunk.type === "code") score += 0.25;

  return Math.min(1, score);
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

function buildIndex(): InMemoryVectorIndex {
  const index = new InMemoryVectorIndex("course-rag", "local-hash-embedding-v1", "v1");
  index.upsert(chunkDocuments());
  return index;
}

function compressHits(query: string, hits: SearchHit[]): Array<{
  evidenceId: string;
  chunkId: string;
  source: string;
  section: string;
  snippet: string;
}> {
  const terms = new Set(tokenize(query));

  return hits.map((hit, index) => {
    const sentences = hit.chunk.content
      .split(/(?<=[。.!?])\s+|\n+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
    const evidenceSentences = sentences.filter(
      (sentence) => !/^#{1,6}\s/.test(sentence)
    );
    const relevant = evidenceSentences.filter((sentence) =>
      tokenize(sentence).some((token) => terms.has(token))
    );
    const snippet = (
      relevant[0] ??
      evidenceSentences[0] ??
      sentences[0] ??
      hit.chunk.content
    ).slice(0, 260);

    return {
      evidenceId: `E${index + 1}`,
      chunkId: hit.chunk.chunkId,
      source: hit.chunk.source,
      section: hit.chunk.section,
      snippet,
    };
  });
}

function renderEvidencePack(pack: ReturnType<typeof compressHits>): string {
  return pack
    .map(
      (item) =>
        `[${item.evidenceId}] ${item.source}#${item.section} (${item.chunkId})\n${item.snippet}`
    )
    .join("\n\n");
}

async function callRagCoach(spec: RagLessonSpec, payload: string) {
  const model = createCourseModel({ temperature: 0.1 });
  return model.invoke(
    [
      {
        role: "system",
        content:
          "你是面向工程师的 RAG 课程教练。回答要短，聚焦机制、边界、调试点和生产实践。",
      },
      {
        role: "user",
        content: `课程：${spec.id} ${spec.title}
问题：${spec.question}

上下文：
${payload}

请输出 3-5 条工程要点。`,
      },
    ],
    {
      runName: `advanced-${spec.id.toLowerCase()}-rag`,
      tags: ["advanced", "rag", spec.id.toLowerCase()],
      metadata: { lesson: spec.id, module: "rag-engineering" },
    }
  );
}

async function runArchitecture(spec: RagLessonSpec): Promise<void> {
  printJson("architecture decision matrix", [
    {
      architecture: "2-step RAG",
      useWhen: "固定知识库问答、低延迟、强评测、固定检索策略",
      risk: "无法动态决定是否二次检索或调用其他工具",
    },
    {
      architecture: "Agentic RAG",
      useWhen: "资料来源不确定、需要动态检索、需要工具链协作",
      risk: "成本、延迟、循环和可测性风险更高",
    },
    {
      architecture: "Hybrid RAG",
      useWhen: "既有精确术语又有语义问题，需要关键词+向量+metadata+rerank",
      risk: "调参复杂，需要 score explanation 和评测集",
    },
  ]);

  printModelMessage(
    await callRagCoach(
      spec,
      "当前项目默认应先选择 2-step + hybrid retrieval；只有当检索策略本身需要模型动态决策时才升级到 Agentic RAG。"
    )
  );
}

async function runParse(spec: RagLessonSpec): Promise<void> {
  const parsed = parseDocuments();
  printJson("parsed documents", parsed);
  printModelMessage(
    await callRagCoach(spec, JSON.stringify(parsed.slice(0, 5), null, 2))
  );
}

async function runChunk(spec: RagLessonSpec): Promise<void> {
  const chunks = chunkDocuments();
  printJson("knowledge chunks", chunks);
  printModelMessage(
    await callRagCoach(
      spec,
      `chunkCount=${chunks.length}\nexample=${JSON.stringify(chunks[0], null, 2)}`
    )
  );
}

async function runVector(spec: RagLessonSpec): Promise<void> {
  const index = buildIndex();
  const hits = index.search("LangGraph 可恢复 workflow checkpoint interrupt", 4);
  printJson("vector index stats", index.stats());
  printJson("vector search hits", hits);
  printModelMessage(await callRagCoach(spec, JSON.stringify(hits, null, 2)));
}

async function runIncremental(spec: RagLessonSpec): Promise<void> {
  const originalDocs = parseDocuments();
  const originalChunks = chunkDocuments(originalDocs);
  const updatedRawDocs = rawDocuments.map((doc) =>
    doc.source === "course/langgraph-workflows.md"
      ? {
          ...doc,
          content: `${doc.content}\n\n## Time Travel\nTime travel lets engineers replay from historical checkpoints for debugging and recovery.`,
        }
      : doc
  );
  const updatedDocs = parseDocuments(updatedRawDocs);
  const updatedChunks = chunkDocuments(updatedDocs);
  const originalHashes = new Map(originalChunks.map((chunk) => [chunk.chunkId, chunk.chunkHash]));
  const updatedHashes = new Map(updatedChunks.map((chunk) => [chunk.chunkId, chunk.chunkHash]));
  const deletes = [...originalHashes.keys()].filter((chunkId) => !updatedHashes.has(chunkId));
  const upserts = updatedChunks.filter(
    (chunk) => originalHashes.get(chunk.chunkId) !== chunk.chunkHash
  );

  printJson("incremental index plan", {
    originalChunkCount: originalChunks.length,
    updatedChunkCount: updatedChunks.length,
    deletes,
    upserts: upserts.map((chunk) => ({
      chunkId: chunk.chunkId,
      source: chunk.source,
      section: chunk.section,
      chunkHash: chunk.chunkHash,
    })),
    indexVersionRule: "embeddingModel or splitter changes require a new indexVersion",
  });

  printModelMessage(
    await callRagCoach(
      spec,
      `delete=${deletes.length}, upsert=${upserts.length}, source=course/langgraph-workflows.md`
    )
  );
}

async function runQueryTransform(spec: RagLessonSpec): Promise<void> {
  const response = await callRagCoach(
    spec,
    `请生成 JSON 风格的 query transform bundle：
original="${spec.question}"
需要包含 rewrite、multiQuery、stepBack、hypotheticalAnswer。
注意 hypotheticalAnswer 只能用于召回，不能作为最终证据。`
  );
  printModelMessage(response);

  const transformedQueries = [
    spec.question,
    "Deep Agents 与 LangGraph 的定位差异",
    "长任务代理 harness 和显式状态机 workflow",
    "Deep Agents 是否替代 LangGraph",
  ];
  const index = buildIndex();
  printJson(
    "retrieval with transformed queries",
    transformedQueries.map((query) => ({
      query,
      hits: index.search(query, 2).map((hit) => ({
        chunkId: hit.chunk.chunkId,
        title: hit.chunk.title,
        section: hit.chunk.section,
        finalScore: hit.finalScore,
      })),
    }))
  );
}

async function runHybrid(spec: RagLessonSpec): Promise<void> {
  const index = buildIndex();
  const hits = index.search(spec.question, 5);
  printJson("hybrid rerank hits", hits);
  printModelMessage(await callRagCoach(spec, JSON.stringify(hits, null, 2)));
}

async function runCompression(spec: RagLessonSpec): Promise<void> {
  const hits = buildIndex().search(spec.question, 5);
  const evidencePack = compressHits(spec.question, hits);
  printJson("raw hits", hits);
  printJson("compressed evidence pack", evidencePack);
  printModelMessage(await callRagCoach(spec, renderEvidencePack(evidencePack)));
}

async function runGrounded(spec: RagLessonSpec): Promise<void> {
  const hits = buildIndex().search(spec.question, 4);
  const evidencePack = compressHits(spec.question, hits);
  const response = await callRagCoach(
    spec,
    `请只基于以下 evidence 回答，并给出 citations、unsupportedClaims、limitations。

${renderEvidencePack(evidencePack)}`
  );

  printJson("evidence pack", evidencePack);
  printModelMessage(response);
}

async function runAgentic(spec: RagLessonSpec): Promise<void> {
  const index = buildIndex();
  const searchCourseKnowledge = tool(
    ({ query, topK, type }: { query: string; topK: number; type?: RawDocument["type"] }) => {
      const hits = index.search(query, topK, type);
      return JSON.stringify(
        hits.map((hit) => ({
          chunkId: hit.chunk.chunkId,
          source: hit.chunk.source,
          section: hit.chunk.section,
          snippet: hit.chunk.content.slice(0, 220),
          score: hit.finalScore,
        }))
      );
    },
    {
      name: "search_course_knowledge",
      description:
        "Search the local course knowledge base. Use this before answering RAG, LangGraph, or Deep Agents boundary questions.",
      schema: z.object({
        query: z.string().describe("search query"),
        topK: z.number().int().min(1).max(5).describe("number of hits"),
        type: z
          .enum(["markdown", "code", "web", "pdf"])
          .optional()
          .describe("optional document type filter"),
      }),
    }
  );
  const agent = createAgent({
    model: createCourseModel({ temperature: 0 }),
    tools: [searchCourseKnowledge],
    systemPrompt: `你是 Agentic RAG 课程助手。

回答课程知识库问题前必须调用 search_course_knowledge。
只能基于工具返回的 hits 回答，并引用 chunkId。`,
  });

  const result = await agent.invoke(
    {
      messages: [{ role: "user", content: spec.question }],
    },
    {
      runName: "advanced-b10-agentic-rag",
      tags: ["advanced", "rag", "b10", "agentic"],
      metadata: { lesson: "B10" },
    }
  );

  printAgentSummary(result);
  printAgentTrace(result);
  printFinalAnswer(result);
}

function evaluateRetrieval(cases: EvalCase[]) {
  const index = buildIndex();

  return cases.map((item) => {
    const hits = index.search(item.question, 5);
    const hitIds = hits.map((hit) => hit.chunk.chunkId);
    const firstRelevantRank = hitIds.findIndex((chunkId) =>
      item.expectedChunkIds.includes(chunkId)
    );
    const recall =
      item.expectedChunkIds.filter((chunkId) => hitIds.includes(chunkId)).length /
      item.expectedChunkIds.length;

    return {
      id: item.id,
      question: item.question,
      expectedChunkIds: item.expectedChunkIds,
      hitIds,
      recall: round(recall),
      mrr: firstRelevantRank >= 0 ? round(1 / (firstRelevantRank + 1)) : 0,
    };
  });
}

async function runEval(spec: RagLessonSpec): Promise<void> {
  const chunks = chunkDocuments();
  const langGraphStateChunk = chunks.find(
    (chunk) => chunk.title.includes("LangGraph") && chunk.section === "StateGraph"
  );
  const langGraphPersistenceChunk = chunks.find(
    (chunk) => chunk.title.includes("LangGraph") && chunk.section === "Persistence"
  );
  const deepAgentsBoundaryChunk = chunks.find(
    (chunk) => chunk.title.includes("Deep Agents") && chunk.section === "Boundary"
  );
  const deepAgentsPositioningChunk = chunks.find(
    (chunk) => chunk.title.includes("Deep Agents") && chunk.section === "Positioning"
  );
  const evalCases: EvalCase[] = [
    {
      id: "rag-positive-langgraph",
      question: "LangGraph 为什么适合可恢复工作流？",
      expectedChunkIds: [
        langGraphStateChunk?.chunkId ?? chunks[0]!.chunkId,
        langGraphPersistenceChunk?.chunkId ?? chunks[0]!.chunkId,
      ],
      expectedAnswerPoints: ["state", "checkpointer", "interrupt"],
    },
    {
      id: "rag-boundary-deepagents",
      question: "Deep Agents 是否应该替代所有 LangGraph 工作流？",
      expectedChunkIds: [
        deepAgentsBoundaryChunk?.chunkId ?? chunks[0]!.chunkId,
        deepAgentsPositioningChunk?.chunkId ?? chunks[0]!.chunkId,
      ],
      expectedAnswerPoints: ["不应该替代所有", "显式业务流程", "长任务 harness"],
    },
  ];
  const metrics = evaluateRetrieval(evalCases);
  printJson("retrieval metrics", metrics);
  printModelMessage(
    await callRagCoach(
      spec,
      `请作为 LLM-as-judge 审查这些 retrieval metrics 是否足以发布：\n${JSON.stringify(
        metrics,
        null,
        2
      )}`
    )
  );
}

async function runCapstone(spec: RagLessonSpec): Promise<void> {
  const documents = parseDocuments();
  const chunks = chunkDocuments(documents);
  const index = buildIndex();
  const transformedQueries = [
    "LangGraph 可恢复 workflow checkpoint interrupt",
    "Deep Agents long task harness vs explicit workflow",
  ];
  const hits = transformedQueries.flatMap((query) => index.search(query, 3));
  const dedupedHits = [...new Map(hits.map((hit) => [hit.chunk.chunkId, hit])).values()]
    .sort((left, right) => right.finalScore - left.finalScore)
    .slice(0, 5);
  const evidencePack = compressHits(transformedQueries.join(" "), dedupedHits);
  const answer = await callRagCoach(
    spec,
    `pipeline stats:
documents=${documents.length}
chunks=${chunks.length}
queries=${JSON.stringify(transformedQueries)}
evidence:
${renderEvidencePack(evidencePack)}

请输出 answer、citations、productionChecklist。`
  );

  printJson("capstone pipeline", {
    parsedDocuments: documents.length,
    chunks: chunks.length,
    transformedQueries,
    selectedEvidence: evidencePack,
    productionChecklist: [
      "namespace and tenant isolation",
      "index version and rollback",
      "query/retrieval/rerank/final answer tracing",
      "golden eval gate before release",
      "cache invalidation tied to sourceHash and indexVersion",
    ],
  });
  printModelMessage(answer);
}

export async function runRagLesson(id: string): Promise<void> {
  const spec = lessonSpecs[id.toUpperCase()];
  if (!spec) {
    throw new Error(`Unknown RAG lesson id: ${id}`);
  }

  printLessonHeader(`进阶 ${spec.id}：${spec.title}`);
  printLearningFocus(spec.focus);

  switch (spec.mode) {
    case "architecture":
      await runArchitecture(spec);
      break;
    case "parse":
      await runParse(spec);
      break;
    case "chunk":
      await runChunk(spec);
      break;
    case "vector":
      await runVector(spec);
      break;
    case "incremental":
      await runIncremental(spec);
      break;
    case "queryTransform":
      await runQueryTransform(spec);
      break;
    case "hybrid":
      await runHybrid(spec);
      break;
    case "compression":
      await runCompression(spec);
      break;
    case "grounded":
      await runGrounded(spec);
      break;
    case "agentic":
      await runAgentic(spec);
      break;
    case "eval":
      await runEval(spec);
      break;
    case "capstone":
      await runCapstone(spec);
      break;
    default:
      throw new Error(`Unsupported RAG lesson mode: ${spec.mode}`);
  }
}
