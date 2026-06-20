# 模块 F Lessons：生产化 Capstone

目标：完成一个具备 RAG、显式工作流、长任务执行、审批、评测和观测的工程级研究代理。

## F01 系统边界与 API 设计

学习内容：Web/API 层、Agent 层、Tool 层、Storage 层、Eval 层的边界。

最佳实践：

- API 层处理鉴权、请求校验、stream 协议和错误映射。
- Agent 层处理模型、工具、结构化输出和运行上下文。
- Tool 层处理确定性外部能力。
- Storage 层处理知识库、checkpoint、long-term memory。
- Eval 层独立于业务运行，不能污染生产路径。

实操任务：

- 设计 Engineering Research Agent 目录结构。
- 画出请求从 API 到最终回答的链路。

验收标准：

- 任一层可以替换实现而不大规模改其他层。
- prompt 不承担鉴权、权限、数据持久化职责。

调试关注点：业务逻辑散落在 prompt、工具直接读写全局状态、API 直接拼 prompt。

## F02 安全、权限与副作用控制

学习内容：文件、网络、外部 API、用户数据的权限、审计、超时、幂等和回滚。

最佳实践：

- 所有高风险工具默认 deny，需要显式 allow。
- 文件写入、外部请求、删除类动作需要 HITL 或策略审批。
- 工具参数必须校验，不能只相信模型生成参数。
- 副作用操作必须具备幂等键或回滚策略。

实操任务：

- 输出工具权限矩阵：tool、risk、allowedRoles、hitl、timeout、auditFields。
- 给每个高风险工具设计拒绝消息。

验收标准：

- 未授权角色无法调用高风险工具。
- 每次副作用都有审计记录。

调试关注点：越权工具调用、路径穿越、重复执行副作用、审批日志缺失。

## F03 性能、成本与可靠性

学习内容：token usage、latency、cache、retry、fallback、streaming、失败降级。

最佳实践：

- 每次端到端运行都要记录模型调用次数、工具调用次数、token、latency。
- 对可重试错误和不可重试错误分开处理。
- fallback 模型要有质量评测，不只是“能返回”。
- streaming 解决体验，不解决模型质量。

实操任务：

- 建立 cost/latency/error 报告。
- 为模型失败、检索失败、工具失败设计降级路径。

验收标准：

- 能解释一次请求的主要成本来自哪里。
- 任一外部依赖失败时，系统能给出明确、可恢复的结果。

调试关注点：无指标优化、无限 retry、fallback 质量未评估、stream 掩盖慢工具。

## F04 最终项目：Engineering Research Agent

学习内容：整合 LangChain、RAG、LangGraph、Deep Agents、LangSmith。

最佳实践：

- 用 LangChain Agent 处理动态工具和结构化输出。
- 用 RAG 提供可引用知识来源。
- 用 LangGraph 编排检索、评分、生成、审核、发布。
- 用 Deep Agents 处理长任务、多文件产物和 subagents。
- 用 LangSmith 做 tracing、dataset、evaluator 和实验比较。

实操任务：

- 实现一个最小可用版本：输入问题 -> 检索资料 -> 评估证据 -> 生成带引用答案 -> 审核 -> 输出。
- 再扩展长任务版本：生成 plan、evidence、draft、final 四类文件。
- 建立至少 10 条评测样例。

验收标准：

- 可检索：能找到相关课程资料。
- 可引用：答案每个关键结论有 citation。
- 可审批：高风险输出或工具调用可中断。
- 可恢复：中断后能继续。
- 可评测：能跑固定 dataset。
- 可观测：能在 trace 中定位模型、工具、graph 节点。

调试关注点：系统边界不清、RAG 无引用、Graph 状态混乱、Deep Agents 权限过大、没有评测闭环。
