# 模块 B Lessons：RAG 与知识库工程

目标：把第 10 课的简单检索升级为可引用、可评测、可维护、可生产化的知识库问答系统。该模块按 `B01 架构决策 -> B02 文档解析 -> B03 Chunk -> B04 Embedding/VectorStore -> B05 增量索引 -> B06 Query Transform -> B07 Hybrid/Rerank -> B08 Compression -> B09 Grounded Answer -> B10 Agentic RAG -> B11 Eval -> B12 Production RAG Capstone` 学习。

## B01 RAG 架构决策：2-step、Agentic、Hybrid

学习内容：2-step RAG、Agentic RAG、Hybrid RAG 的架构边界。

最佳实践：

- 固定知识库问答优先 2-step RAG，延迟低、行为稳定、易评测。
- 需要动态决定是否检索、检索哪里、是否调用工具时，使用 Agentic RAG。
- 关键词、向量、metadata filter、rerank 可以组合成 Hybrid RAG。
- RAG 架构选择要同时考虑正确性、延迟、成本、可解释性和实现复杂度。

实操任务：运行 `npm run advanced:b01`，让模型基于课程知识库输出三种 RAG 形态的取舍表。

验收标准：你能解释为什么“所有问题都 agentic RAG”不是最佳实践。

调试关注点：过度 agent 化、无检索直接回答、检索次数不可控、延迟失控。

## B02 文档解析：Loaders、Parsers、Metadata

学习内容：Markdown、网页、PDF、代码文件的解析差异，如何保留标题层级、代码块、表格、URL、页码和 hash。

最佳实践：

- 解析输出先统一成 Document schema，再进入 chunk 阶段。
- 每个 Document 必须保留 source、type、title、section、position、sourceHash。
- 清洗阶段不能丢掉引用所需信息。
- 不同文件类型使用不同 parser，不要把所有输入都当纯文本。

实操任务：运行 `npm run advanced:b02`，把课程内置样本文档解析成标准 Document。

验收标准：每个解析结果都能追溯到原始文件、章节和位置。

调试关注点：标题丢失、代码块被打散、URL/页码丢失、清洗过度导致引用不可用。

## B03 Chunk 策略：证据单元、重叠、父子分块

学习内容：heading-aware chunk、semantic chunk、parent-child chunk、代码 AST/函数级 chunk。

最佳实践：

- chunk 是证据单元，不只是固定长度文本。
- chunk 要有 chunkId、source、section、position、hash、parentId。
- overlap 解决边界截断，但过多 overlap 会导致重复召回。
- parent-child 策略适合“短 chunk 召回 + 父文档扩展上下文”。

实操任务：运行 `npm run advanced:b03`，从标准 Document 生成 KnowledgeChunk。

验收标准：chunk 可引用、可更新、可去重、可映射到父文档。

调试关注点：chunk 过大导致噪声、chunk 过小失去语义、重复 chunk、metadata 缺失。

## B04 Embedding 与 VectorStore 接口

学习内容：embedding 职责、向量维度、vector store 抽象、namespace、metadata filter。

最佳实践：

- embedding 负责召回空间，不负责事实正确性。
- 向量库要通过接口抽象，避免业务代码绑定具体 provider。
- 索引要记录 embeddingModel、dimension、createdAt、namespace。
- 查询时先校验 namespace 和维度，避免跨租户或混模型检索。

实操任务：运行 `npm run advanced:b04`，构建内存 VectorStore 并执行向量召回。

验收标准：你能解释一个 chunk 为什么被向量相似度召回。

调试关注点：embedding 维度不匹配、不同模型混索引、namespace 泄露、向量召回不可解释。

## B05 增量索引：Hash、Delete、Version、Dirty Index

学习内容：sourceHash、chunkHash、indexVersion、delete/update/upsert、脏索引清理。

最佳实践：

- 文档未变更时不重建索引。
- 文档变更时比较 sourceHash 和 chunkHash，最小化 upsert/delete 范围。
- embedding model 切换必须生成新 indexVersion。
- 删除源文档时必须删除旧 chunk，避免脏索引继续被召回。

实操任务：运行 `npm run advanced:b05`，模拟一次文档更新并输出 reindex plan。

验收标准：你能判断哪些 chunk 需要 upsert，哪些需要 delete。

调试关注点：旧 chunk 未删除、重复索引、不同 embedding model 混用、sourceHash 不稳定。

## B06 Query Transform：Rewrite、Multi-query、Step-back、HyDE

学习内容：query rewrite、multi-query、step-back query、hypothetical answer。

最佳实践：

- rewrite 解决用户口语问题和文档术语不一致。
- multi-query 提高召回覆盖，但要限制数量和去重。
- step-back query 适合先召回概念层资料。
- HyDE 适合资料表述和问题表述差距大时，但要防止假答案污染最终回答。

实操任务：运行 `npm run advanced:b06`，让模型生成 query transform bundle 并用于检索。

验收标准：你能说明 transform 如何影响召回结果。

调试关注点：改写过度、query 数量过多、HyDE 被当成证据、召回范围失控。

## B07 Hybrid Retrieval 与 Rerank

学习内容：关键词召回、向量召回、metadata filter、rerank、score normalization。

最佳实践：

- 关键词适合精确术语、API 名称、错误文本。
- 向量适合语义相似和改写后的问题。
- metadata filter 应先缩小范围，再做召回。
- rerank 应输出可解释分数，便于调试误召回。

实操任务：运行 `npm run advanced:b07`，输出每条命中的 keyword/vector/metadata/rerank/finalScore。

验收标准：你能解释为什么某个 chunk 被选中。

调试关注点：分数尺度不一致、rerank 过慢、topK 太小漏召回、topK 太大污染上下文。

## B08 Contextual Compression：只给模型必要证据

学习内容：query-aware compression、extractive compression、evidence pack、token budget。

最佳实践：

- 检索结果不等于模型上下文。
- compression 必须保留 source、chunkId、snippet，不能把证据来源压没。
- 只压缩与问题相关的句子，避免把整段无关文本塞给模型。
- 压缩结果要可审计，不能变成模型自由改写的“二手证据”。

实操任务：运行 `npm run advanced:b08`，把 topK chunks 压缩为 evidence pack。

验收标准：模型上下文变短，但 citation 仍能回到原 chunk。

调试关注点：压缩丢失关键限定词、来源丢失、snippet 与原文不一致。

## B09 Grounded Answer：引用、拒答、Unsupported Claims

学习内容：引用协议、证据绑定、unsupported claims、拒答策略。

最佳实践：

- 最终答案必须引用 evidence id。
- 模型不得把 reasoning 当证据，证据只能来自检索结果或工具结果。
- 证据不足时拒答，并说明缺少哪类资料。
- 输出结构中保留 unsupportedClaims，方便评测和人工审核。

实操任务：运行 `npm run advanced:b09`，生成带 citations 的 grounded answer。

验收标准：每个关键结论都能追溯到至少一个 citation。

调试关注点：引用编号错位、答案包含无证据结论、引用只指向整篇文档而不是具体片段。

## B10 Agentic RAG：把检索器做成 Tool

学习内容：retriever tool、tool schema、Agentic RAG 调用边界、二次检索、调用上限。

最佳实践：

- retriever tool 的输入 schema 要清晰描述 query、topK、filter。
- Agentic RAG 要限制检索次数，避免循环和成本失控。
- 工具返回应该是结构化 hits，不是给模型的一大段裸文本。
- 高风险知识库或外部搜索要有权限和审计。

实操任务：运行 `npm run advanced:b10`，观察模型如何调用 `search_course_knowledge`。

验收标准：trace 中能看到 tool_calls、ToolMessage 和最终回答。

调试关注点：模型不调用检索工具、工具参数过宽、重复检索、工具返回过长。

## B11 RAG Eval：Recall、MRR、Groundedness、Correctness

学习内容：retrieval recall、MRR/nDCG、citation coverage、groundedness、correctness、answer relevance。

最佳实践：

- RAG 评测要拆分检索阶段和生成阶段。
- golden dataset 应覆盖正例、拒答、相似干扰、过期资料。
- evaluator 要能输出分数和失败原因。
- 每次 chunk、embedding、prompt、rerank 改动都应跑同一组回归样例。

实操任务：运行 `npm run advanced:b11`，输出 local retrieval metrics 和一次 LLM-as-judge 结果。

验收标准：你能判断一次失败是召回失败、排序失败、生成失败还是引用失败。

调试关注点：只评最终答案、不评召回；测试集太简单；LLM-as-judge prompt 不稳定。

## B12 Production RAG Capstone：端到端知识库问答

学习内容：parse、chunk、index、query transform、hybrid retrieval、compression、grounding、eval、缓存、权限、延迟成本。

最佳实践：

- pipeline 每一层都要可替换、可观测、可评测。
- 每个用户/租户要有 namespace 和权限边界。
- 缓存要区分 query transform、retrieval、rerank、final answer。
- 上线前要有索引回滚、质量门禁和失败降级策略。

实操任务：运行 `npm run advanced:b12`，执行端到端 RAG pipeline 并输出生产检查清单。

验收标准：你能把 B01-B11 的能力串成一个可维护系统。

调试关注点：阶段边界不清、缓存污染、索引不可回滚、无法定位质量回退原因。
