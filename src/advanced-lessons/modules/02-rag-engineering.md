# 模块 B：RAG 与知识库工程

目标：把第 10 课的简单检索升级为可引用、可评测、可维护、可生产化的知识库问答系统。

## B01 RAG 架构决策

学习 2-step RAG、Agentic RAG、Hybrid RAG 的边界，避免把所有问题都做成 agentic RAG。

产物：三种 RAG 架构的取舍表。

## B02 文档解析

学习 loaders/parsers、metadata、source hash、标题层级、代码块、URL 和页码保留。

产物：标准 Document schema。

## B03 Chunk 策略

学习 heading-aware chunk、semantic chunk、parent-child chunk 和证据单元设计。

产物：KnowledgeChunk 列表。

## B04 Embedding 与 VectorStore

学习 embedding 职责、向量库接口、namespace、metadata filter 和维度校验。

产物：内存向量索引接口。

## B05 增量索引

学习 sourceHash、chunkHash、indexVersion、upsert/delete 和脏索引清理。

产物：一次文档变更的 reindex plan。

## B06 Query Transform

学习 rewrite、multi-query、step-back query 和 HyDE。

产物：query transform bundle。

## B07 Hybrid Retrieval 与 Rerank

学习关键词、向量、metadata filter、score normalization 和 rerank。

产物：带分数解释的 topK 结果。

## B08 Contextual Compression

学习只把相关证据片段放进模型上下文，减少上下文污染和 token 成本。

产物：保留 citation 的 evidence pack。

## B09 Grounded Answer

学习引用、拒答、unsupported claims 和 limitations。

产物：带 citations 的 grounded answer。

## B10 Agentic RAG

学习把 retriever 做成 tool，让模型决定是否检索、检索什么、是否二次检索。

产物：可观察 tool_calls 的 Agentic RAG demo。

## B11 RAG Eval

学习 retrieval recall、MRR、citation coverage、groundedness 和 correctness。

产物：golden cases 与 evaluator 输出。

## B12 Production RAG Capstone

学习端到端 RAG pipeline 的生产化边界：缓存、权限、回滚、观测、质量门禁。

产物：完整 RAG pipeline 与生产检查清单。
