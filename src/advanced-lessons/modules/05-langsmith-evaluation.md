# 模块 E：LangSmith 调试、评测与持续改进

目标：把一次性 demo 转为可观测、可回归、可比较的工程系统。

## E01 Tracing 与工程可观测性

学习 LangSmith tracing、runName、tags、metadata、nested runs。目标是在复杂 agent 中快速定位是哪一次模型调用、哪一个工具、哪一个 graph 节点出了问题。

产物：为所有进阶 lesson 统一 tracing 命名规范。

## E02 Evaluation 基础

学习 dataset、target function、evaluator、offline evaluation、online evaluation。评测不是单元测试的替代，而是对不确定输出进行质量测量。

产物：建立课程研究助手的 dataset schema 和 evaluator 目录结构。

## E03 RAG Evaluation

学习 correctness、relevance、groundedness、retrieval relevance。RAG 的问题可能发生在召回阶段，也可能发生在生成阶段。

产物：为 RAG 项目实现 4 个 evaluator，并输出实验对比表。

## E04 Complex Agent Evaluation

学习 final response evaluator、trajectory evaluator、single-step evaluator。复杂 Agent 必须评估轨迹、工具调用和中间步骤，而不只是最终答案。

产物：为 Agent/Graph 设计 trajectory evaluator 和 single-step evaluator。

## E05 CI 回归与实验比较

学习如何把 prompt/model/tool/schema 改动变成可比较实验，并设置阻断发布的质量门禁。

产物：定义合并前必须通过的 correctness、groundedness、latency 阈值。
