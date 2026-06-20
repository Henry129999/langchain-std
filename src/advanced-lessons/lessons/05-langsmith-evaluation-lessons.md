# 模块 E Lessons：LangSmith 调试、评测与持续改进

目标：把一次性 demo 转为可观测、可回归、可比较的工程系统。

## E01 Tracing 与工程可观测性

学习内容：LangSmith tracing、runName、tags、metadata、nested runs。

最佳实践：

- 每个 lesson、agent、tool、graph 节点都有稳定命名。
- tags 用于筛选类别，metadata 用于记录业务上下文。
- trace 中不要记录敏感原文，必要时先 redaction。
- 复杂系统必须能从 trace 还原模型、工具、节点执行链路。

实操任务：

- 定义 tracing 命名规范：project、lessonId、runName、tags、metadata。
- 给进阶课程的示例运行增加统一 metadata。

验收标准：

- 能在 LangSmith 中按 lessonId 查到一次运行。
- 能定位失败发生在模型、工具、RAG 还是 graph 节点。

调试关注点：runName 随机、metadata 缺字段、trace 中泄露 PII、嵌套调用不可读。

## E02 Evaluation 基础：Dataset、Target、Evaluator

学习内容：dataset、target function、evaluator、offline/online evaluation。

最佳实践：

- dataset 存问题和期望，不存模型临时输出。
- target function 封装被测应用，不能混入评测逻辑。
- evaluator 输出 score、reason、key。
- evaluation 和 unit test 互补：一个测确定性逻辑，一个测概率系统质量。

实操任务：

- 设计 `CourseResearchDataset`：input、referenceAnswer、expectedSources、mustRefuse。
- 设计 evaluator 输出 schema。

验收标准：

- 同一 dataset 能跑不同模型、prompt、retriever 版本。
- evaluator 结果能用于比较实验。

调试关注点：测试集含糊、评测目标不稳定、evaluator prompt 泄露答案格式。

## E03 RAG Evaluation

学习内容：correctness、relevance、groundedness、retrieval relevance。

最佳实践：

- retrieval relevance 评检索结果是否能回答问题。
- groundedness 评答案是否被证据支持。
- correctness 评答案是否符合 reference。
- relevance 评答案是否回应用户问题。

实操任务：

- 为 10 条课程问答实现 4 类 evaluator 设计。
- 为每条失败结果输出 failureCategory。

验收标准：

- 能判断 RAG 失败发生在检索还是生成。
- 改 chunk 策略后能比较 groundedness 是否提升。

调试关注点：只看 correctness、忽略召回；reference 不完整；LLM judge 不稳定。

## E04 Complex Agent Evaluation

学习内容：final response evaluator、trajectory evaluator、single-step evaluator。

最佳实践：

- 最终答案正确不代表 Agent 轨迹正确。
- 工具调用顺序、参数、次数和副作用都应被评估。
- 对关键中间节点做 single-step evaluator。
- 测试环境要避免真实删除、真实付款、真实外部副作用。

实操任务：

- 设计 trajectory evaluator：是否调用必要工具、是否调用禁止工具、是否重复调用。
- 设计 single-step evaluator：evidenceGrade 是否合理。

验收标准：

- 能发现“答案看起来对，但工具调用错误”的问题。
- 能在测试环境关闭真实副作用。

调试关注点：只评 final answer、工具副作用未隔离、轨迹过长难判断。

## E05 CI 回归与实验比较

学习内容：实验比较、质量门禁、回归策略。

最佳实践：

- prompt、模型、工具、schema 改动都应触发评测。
- 质量门禁应同时考虑 correctness、groundedness、latency、cost。
- 不用单一平均分掩盖关键失败样例。
- 失败样例要进入后续 dataset，而不是只手动修 prompt。

实操任务：

- 定义合并前质量门禁：correctness >= 0.8、groundedness >= 0.85、拒答准确率 >= 0.9。
- 设计实验对比表字段。

验收标准：

- 两次实验能按样例和指标比较。
- 不达标时能明确阻断原因。

调试关注点：阈值拍脑袋、测试集太小、只看平均分、忽略成本和延迟。
