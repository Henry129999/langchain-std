# 模块 B Lessons：RAG 与知识库工程

目标：把第 10 课的简单检索升级为可引用、可评测、可维护的知识库问答系统。

## B01 RAG 架构决策：2-step、Agentic、Hybrid

学习内容：2-step RAG、Agentic RAG、Hybrid RAG 的架构边界。

最佳实践：

- 固定知识库问答优先 2-step RAG，延迟低、行为稳定、易评测。
- 需要动态决定是否检索、检索哪里、是否调用工具时，使用 Agentic RAG。
- 关键词、向量、metadata filter、rerank 可以组合成 Hybrid RAG。
- RAG 架构选择要同时考虑正确性、延迟、成本、可解释性和实现复杂度。

实操任务：

- 为课程资料问答写出三种架构的输入、输出、失败点和适用条件。
- 给当前项目选择一个默认 RAG 架构，并说明理由。

验收标准：

- 你能解释为什么“所有问题都 agentic RAG”不是最佳实践。
- 你能根据需求选择 RAG 形态，而不是只按技术偏好选择。

调试关注点：过度 agent 化、无检索直接回答、检索次数不可控、延迟失控。

## B02 文档加载、清洗与 Chunk 策略

学习内容：文档加载、清洗、chunk、metadata、hash 和增量索引。

最佳实践：

- chunk 是证据单元，不只是固定长度文本。
- 每个 chunk 必须带 source、title、section、position、hash。
- Markdown、代码、网页、PDF 应使用不同切分策略。
- 清洗阶段要保留引用需要的信息，不要把标题和层级丢掉。

实操任务：

- 设计 `KnowledgeChunk` schema。
- 为 README、课程文档、代码文件分别制定 chunk 规则。

验收标准：

- 每个检索结果都能追溯到原始文件和位置。
- 文档变更后能判断哪些 chunk 需要重建索引。

调试关注点：chunk 过大导致噪声、chunk 过小失去语义、metadata 缺失、重复 chunk。

## B03 Embedding、向量库与索引更新

学习内容：embedding 职责、向量库接口、索引版本和更新策略。

最佳实践：

- embedding 负责召回空间，不负责事实正确性。
- 向量库要通过接口抽象，避免业务代码绑定具体 provider。
- 索引要有 version、embeddingModel、createdAt、sourceHash。
- 删除和更新必须处理旧 chunk，避免脏索引。

实操任务：

- 定义 `VectorIndex` 接口：upsert、delete、search、stats。
- 设计索引元数据表结构。

验收标准：

- 可以替换 embedding provider 而不改 RAG 业务流程。
- 能解释同一个问题召回变化来自模型、chunk 还是索引更新。

调试关注点：embedding 维度不匹配、旧索引未删除、不同模型混索引、向量召回不可解释。

## B04 Hybrid Retrieval 与 Rerank

学习内容：关键词召回、向量召回、metadata filter、rerank、score normalization。

最佳实践：

- 关键词适合精确术语、API 名称、错误文本。
- 向量适合语义相似和改写后的问题。
- metadata filter 应先缩小范围，再做召回。
- rerank 应输出可解释分数，便于调试误召回。

实操任务：

- 在 simple retriever 基础上增加 keywordScore、vectorScore、metadataScore、finalScore。
- 输出 topK 结果和每个结果的分数解释。

验收标准：

- 能解释为什么某个 chunk 被选中。
- 能通过 filter 控制只检索指定课程模块或文件类型。

调试关注点：分数尺度不一致、rerank 过慢、topK 太小漏召回、topK 太大污染上下文。

## B05 引用、Grounding 与拒答

学习内容：答案引用、证据绑定、unsupported claims、拒答策略。

最佳实践：

- 最终答案必须引用 evidence id。
- 模型不得把 reasoning 当证据，证据只能来自检索结果或工具结果。
- 证据不足时拒答，并说明缺少哪类资料。
- 输出结构中保留 unsupportedClaims，方便评测和人工审核。

实操任务：

- 设计 `GroundedAnswer`：answer、citations、unsupportedClaims、limitations。
- 要求每个 citation 包含 chunkId、source、quote 或 snippet。

验收标准：

- 删除相关 chunk 后，模型应拒答而不是编造。
- 每个关键结论都能追溯到至少一个 citation。

调试关注点：引用编号错位、答案包含无证据结论、引用只指向整篇文档而不是具体片段。

## B06 RAG 评测：召回、相关性、忠实度

学习内容：retrieval relevance、groundedness、correctness、answer relevance。

最佳实践：

- RAG 评测要拆分检索阶段和生成阶段。
- golden dataset 应覆盖正例、拒答、相似干扰、过期资料。
- evaluator 要能输出分数和失败原因。
- 每次 chunk、embedding、prompt、rerank 改动都应跑同一组回归样例。

实操任务：

- 建立 10 条课程问答 golden cases。
- 为每条样例标注 expectedSources 和 expectedAnswerPoints。

验收标准：

- 你能判断一次失败是召回失败、排序失败、生成失败还是引用失败。
- 能比较两个 RAG 版本的质量差异。

调试关注点：只评最终答案、不评召回；测试集太简单；LLM-as-judge prompt 不稳定。
