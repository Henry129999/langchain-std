# 模块 D：Deep Agents 长任务系统

目标：理解 Deep Agents 如何在 LangGraph 之上提供长任务执行环境、规划、文件系统、subagents、skills 与 memory。

## D01 Deep Agents 定位

Deep Agents 适合长任务和复杂产物，不是替代 LangGraph。它把规划、文件系统、skills、subagents、context offloading 等能力预置到一个长任务 harness 中。

产物：写出 LangChain Agent、LangGraph、Deep Agents 的决策矩阵。

## D02 Execution Environment

学习工具、MCP、虚拟文件系统、权限、代码执行和 streaming。工程重点是 agent 能访问什么、能修改什么、能否被审计。

产物：为课程研究代理设计 filesystem permission policy。

## D03 任务规划、TODO 与 Context Offloading

学习如何让长任务显式维护计划、中间产物和上下文卸载。不要把所有过程都压进 conversation history。

产物：实现长文档研究任务的 todo/checkpoint/report 三层产物约定。

## D04 Subagents

学习 default subagent、自定义 subagent、compiled subagent、streaming、LangSmith tracing、结构化输出、工具最小化和上下文管理。

产物：设计 researcher、source-checker、writer 三个 subagent 的职责和工具清单。

## D05 Skills 与 Memory

学习 skills 继承、agent-scoped memory、user-scoped memory、episodic memory、后台整合、并发写入、只读和可写 memory。

产物：定义课程代理的技能加载规范和记忆写入规则。

## D06 HITL 与权限

学习工具调用中断、subagent 中断、reject message、编辑工具参数和多工具调用审批。

产物：为外部搜索、文件写入、最终报告发布设计 HITL interrupt 策略。
