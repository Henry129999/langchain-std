# 模块 C：LangGraph 工作流编排

目标：掌握可持久化、可中断、可恢复、可观测的多步骤 agent/workflow 编排能力。

## C01 从 Agent Loop 到 StateGraph

学习 LangGraph 的定位：当流程需要显式状态、确定性步骤、条件路由、恢复和人工审核时，使用 StateGraph 比把所有逻辑交给 Agent 更可控。

产物：把研究助手拆成 retrieve、grade、answer、review 四个节点。

## C02 State 设计

学习 raw state、derived state、reducer、message accumulator。最佳实践是把原始数据存在 state，prompt 在节点内按需格式化。

产物：设计 GraphState，并说明每个字段的生命周期。

## C03 节点、边与条件路由

学习 addNode、addEdge、conditional edge，以及 LLM/data/action/user input step 的拆分。节点表达确定性步骤，条件边表达业务路由。

产物：实现 `evidenceEnough ? answer : clarify` 的条件路由。

## C04 Command、并行分支与错误恢复

学习节点如何同时更新 state 和控制下一跳；为 transient、LLM-recoverable、user-fixable、unexpected error 分别设计 retry、fallback、interrupt、escalate。

产物：为检索失败、模型失败、工具失败分别设计恢复策略。

## C05 Persistence 基础

学习 checkpointer vs store、thread_id、checkpoint 恢复。checkpointer 解决同一线程的运行恢复，store 解决跨线程长期记忆。

产物：给研究工作流加 MemorySaver，并演示同一 thread 恢复。

## C06 Interrupt 与人工审核

学习 interrupt/resume、approve/reject/edit、校验用户输入、中断规则和幂等副作用。

产物：在 answer 发布前加人工审核，支持 approve/edit/reject。

## C07 LangGraph Streaming 基础

学习 values、updates、messages、custom、debug、checkpoints、tasks 等 stream mode。UI 和调试需要不同粒度的事件。

产物：输出检索进度、节点状态、模型 token 和 debug 事件。

## C08 子图与多 Agent 工作流

学习把复杂系统拆成 researcher、critic、writer 子图或节点，明确共享 state 和局部 state 的边界。

产物：设计 researcher -> critic -> writer 的子图方案。

## C09 Persistence 深水区

学习 checkpointers、stores、graph memory、time travel、fault tolerance 和 checkpoint 回放调试。

产物：设计 thread_id、checkpoint_id、store namespace 与回放调试策略。

## C10 Interrupt 高级模式

学习 multiple interrupts、tool interrupts、review/edit state、validating human input、static breakpoints 和 LangSmith Studio 调试。

产物：输出一份 HITL 设计表：触发点、payload、resume command、幂等要求、失败恢复。

## C11 Streaming 深水区

学习 token 过滤、tool progress、subgraph outputs、custom stream channels、多模式组合和前端消费协议。

产物：定义前端可消费的 graph event envelope。

## C12 API、Runtime、测试与生产结构

学习 Graph API vs Functional API、Pregel runtime、local/server 运行边界、测试策略、兼容性和应用目录结构。

产物：给 capstone 设计 graph 目录结构、节点单测、端到端轨迹测试和 schema 兼容策略。
