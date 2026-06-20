# 模块 B：RAG 与知识库工程

目标：把第 10 课的简单检索升级为可引用、可评测、可维护的知识库问答系统。

## B01 RAG 架构决策

学习 2-step RAG、Agentic RAG、Hybrid RAG。工程判断：固定问答优先 2-step；需要动态选择资料或工具时用 agentic；需要稳定召回时组合关键词、向量、metadata 和 rerank。

产物：为课程资料问答画出三种 RAG 架构的取舍表。

## B02 文档加载、清洗与 Chunk 策略

学习如何处理 Markdown、网页、代码、PDF 的清洗、分块、metadata、hash、增量索引。chunk 不是随便切文本，而是后续引用、更新和评测的最小证据单元。

产物：定义课程知识库 chunk schema：id、source、title、section、content、hash。

## B03 Embedding、向量库与索引更新

学习 embedding 的职责和限制。embedding 只负责召回空间，不负责事实正确性。需要设计索引构建、删除、更新、版本管理和 provider 替换。

产物：实现一个可替换 embedding/vector store 的接口层。

## B04 Hybrid Retrieval 与 Rerank

学习关键词召回、向量召回、metadata filter、rerank、score normalization。避免只靠向量相似度导致“看起来相关但无法回答”的召回。

产物：把 simple keyword retriever 扩展为 hybrid scoring，并输出每个 chunk 的分数解释。

## B05 引用、Grounding 与拒答

学习如何让答案绑定证据，如何输出引用，如何识别 unsupported claims，如何在证据不足时拒答。

产物：让研究助手输出 answer、citations、unsupportedClaims、limitations。

## B06 RAG Evaluation

学习 response correctness、relevance、groundedness、retrieval relevance。工程上不能只看一次 demo，要用固定 dataset 做回归。

产物：创建课程问答 golden cases，并定义 retrieval 与 final answer evaluator。
