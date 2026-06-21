# 模块 D：Deep Agents 长任务系统

目标：理解 Deep Agents 如何在 LangGraph 之上提供长任务执行环境、规划、文件系统、subagents、skills、memory、streaming、权限与生产化协议。

## D01 Deep Agents 定位

Deep Agents 适合长任务和复杂产物，不是替代 LangGraph。它把规划、文件系统、skills、subagents、context offloading 等能力预置到一个长任务 harness 中。

产物：写出 LangChain Agent、LangGraph、Deep Agents 的决策矩阵。

## D02 Execution Environment

学习工具、MCP、虚拟文件系统、backend、权限、执行环境和 streaming。工程重点是 agent 能访问什么、能修改什么、能否被审计。

产物：为课程研究代理设计 filesystem permission policy。

## D03 任务规划、TODO 与 Context Offloading

学习如何让长任务显式维护计划、中间产物、checkpoint、summarization 和上下文卸载。不要把所有过程都压进 conversation history。

产物：实现长文档研究任务的 todo/checkpoint/report 三层产物约定。

## D04 Subagents

学习 default/general-purpose subagent、自定义 subagent、compiled subagent、async subagent、streaming、LangSmith tracing、结构化输出、工具最小化和上下文管理。

产物：设计 researcher、source-checker、writer 三个 subagent 的职责和工具清单。

## D05 Skills 与 Memory

学习 skills 继承、Agent Skills 标准、agent-scoped memory、user-scoped memory、episodic memory、organization-level memory、后台整合、并发写入、只读和可写 memory。

产物：定义课程代理的技能加载规范和记忆写入规则。

## D06 HITL 与权限

学习工具调用中断、subagent 中断、reject message、编辑工具参数和多工具调用审批。

产物：为外部搜索、文件写入、最终报告发布设计 HITL interrupt 策略。

## D07 Quickstart 到 createDeepAgent

学习最小 Deep Agent、createDeepAgent、model、tools、system prompt、profile、运行输入和事件输出。

产物：搭一个最小 Deep Agent spec，并区分本地学习 profile 与生产受限 profile。

## D08 Backends、Permissions、Sandboxes、Interpreters

学习虚拟文件系统后端、permission policy、remote sandbox、code execution、interpreter 和 host isolation。

产物：输出 local disk、memory、LangGraph store、sandbox、interpreter 的后端选择表。

## D09 Context Engineering、Prompt Assembly、Middleware

学习系统提示词装配、默认 middleware stack、provider-specific middleware、自定义 middleware、summarization、context offloading 和 prompt caching。

产物：设计一个长任务上下文预算和 middleware 清单。

## D10 Subagents 运维

学习 async subagents、subagent streaming、LangSmith filtering、structured output、per-subagent context、caller tracing 和 troubleshooting。

产物：为 researcher/source-checker/writer 定义可观测字段、输出 schema、最小工具集和错误定位手册。

## D11 HITL 深水区

学习 decision types、multiple tool calls、rejection messages、edit tool arguments、subagent interrupts、interrupts within tool calls。

产物：为每类高风险动作定义 decisionTypes、review payload、reject message 和 resume 行为。

## D12 Frontend、Streaming、Protocols 与生产部署

学习 Deep Agents frontend、streaming、ACP/MCP 集成边界、going-to-production checklist、structured output 和部署前质量门禁。

产物：定义生产发布清单：事件协议、权限策略、协议接入、trace/eval、结构化结果和回滚策略。
