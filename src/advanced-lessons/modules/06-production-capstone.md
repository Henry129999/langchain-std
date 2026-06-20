# 模块 F：生产化 Capstone

目标：完成一个具备 RAG、显式工作流、长任务执行、审批、评测和观测的工程级研究代理。

## F01 系统边界与 API 设计

学习如何拆分 Web/API 层、Agent 层、Tool 层、Storage 层、Eval 层。模型提示词不能替代工程边界，业务代码也不应该散落在工具里。

产物：输出 capstone 的模块边界图和目录结构。

## F02 安全、权限与副作用控制

学习文件、网络、外部 API、用户数据的权限、审计、超时、幂等和回滚策略。

产物：输出工具权限矩阵和 HITL 策略。

## F03 性能、成本与可靠性

学习 token usage、latency、cache、重试、fallback、streaming 体验和失败降级。工程系统必须知道一次请求花了多少钱、慢在哪里、失败后怎么退化。

产物：建立一次端到端运行的 cost/latency/error 报告。

## F04 最终项目：Engineering Research Agent

整合 RAG、LangGraph、Deep Agents、LangSmith evaluation，形成可以持续迭代的工程样板。

最终验收：

- 能检索本地和网页资料。
- 能输出引用和证据不足说明。
- 能用 LangGraph 编排多步骤流程。
- 能用 Deep Agents 处理长任务和多文件产物。
- 能对高风险工具调用进行人工审批。
- 能用 LangSmith 追踪和评测。
