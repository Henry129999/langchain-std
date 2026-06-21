# RAG 工程课程覆盖矩阵

本文件用于检查模块 B 是否把 RAG 从 demo 级检索补齐到工程级知识库问答。课程顺序按 `B01 -> B12` 递进，每节都有对应的可运行 TS lesson。

## 覆盖范围

| Lesson | 主题 | 关键知识点 | 可运行命令 |
| --- | --- | --- | --- |
| B01 | 架构决策 | 2-step RAG、Agentic RAG、Hybrid RAG 的取舍；延迟、成本、可测性边界 | `npm run advanced:b01` |
| B02 | 文档解析 | Loader/Parser 思路、统一 Document schema、source/section/position/hash metadata | `npm run advanced:b02` |
| B03 | Chunk | heading-aware chunk、证据单元、parent document、chunkHash、重复召回风险 | `npm run advanced:b03` |
| B04 | Embedding/VectorStore | embedding 召回空间、namespace、indexVersion、vector store 抽象接口 | `npm run advanced:b04` |
| B05 | 增量索引 | sourceHash、chunkHash、delete/upsert、dirty index、embedding model 版本切换 | `npm run advanced:b05` |
| B06 | Query Transform | rewrite、multi-query、step-back、HyDE；召回查询和最终证据的边界 | `npm run advanced:b06` |
| B07 | Hybrid/Rerank | keyword + vector + metadata + rerank；score normalization 和命中解释 | `npm run advanced:b07` |
| B08 | Compression | query-aware snippet、evidence pack、上下文预算、保留 source/chunkId | `npm run advanced:b08` |
| B09 | Grounded Answer | citations、unsupported claims、limitations、证据不足拒答 | `npm run advanced:b09` |
| B10 | Agentic RAG | retriever as tool、tool schema、tool call trace、调用次数治理 | `npm run advanced:b10` |
| B11 | Eval | retrieval recall、MRR、citation coverage、groundedness、correctness、golden cases | `npm run advanced:b11` |
| B12 | Production Capstone | parse/chunk/index/query transform/retrieval/compression/answer/eval 串联；缓存、回滚、质量门禁 | `npm run advanced:b12` |

## 工程验收标准

- 每个 lesson 都能通过 `npm run advanced:bXX` 单独运行。
- 所有 B 模块脚本都复用 `rag-runner.ts` 的同一套数据模型，避免每节课重复造不同 schema。
- RAG pipeline 的每一层都输出可调试结构：parsed document、chunk、index stats、hit score、evidence pack、final answer 或 eval metrics。
- 所有需要模型判断的步骤都走项目当前配置的真实大模型，不使用 mock 模型隐藏模型调用行为。
- B10 明确展示 Agentic RAG 的 tool 调用轨迹，避免把 retriever tool 当成普通函数讲解。

## 对应官方主题

- LangChain Retrieval：RAG 架构、文档处理、向量检索、检索器组合、生成回答。
- LangChain Agents/Tools：把 retriever 暴露为工具，观察 agent tool calls 与最终回答。
- LangChain Context Engineering：把检索结果压缩成 evidence pack，而不是把 topK 原文全部塞给模型。
- LangChain Structured Output：把 grounded answer 拆成 answer、citations、unsupportedClaims、limitations。
- LangSmith RAG Evaluation：把检索评测和生成评测拆开，形成可回归的 golden cases。
