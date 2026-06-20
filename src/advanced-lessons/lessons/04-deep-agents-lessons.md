# 模块 D Lessons：Deep Agents 长任务系统

目标：理解 Deep Agents 如何在 LangGraph 之上提供长任务执行环境、规划、文件系统、subagents、skills 与 memory。

## D01 Deep Agents 定位与架构

学习内容：Deep Agents 的 harness、长任务能力、与 LangChain Agent/LangGraph 的关系。

最佳实践：

- 简单工具调用不用 Deep Agents。
- 显式业务流程优先 LangGraph。
- 长任务、多文件产物、多 subagent、上下文卸载时考虑 Deep Agents。
- Deep Agents 的默认能力也要受权限和评测约束。

实操任务：

- 写出 LangChain Agent、LangGraph、Deep Agents 的决策矩阵。
- 为 Engineering Research Agent 判断哪些能力属于 Deep Agents。

验收标准：

- 你能解释 Deep Agents 是面向长任务的预置 harness，而不是 LangGraph 替代品。
- 你能说明何时不应该使用 Deep Agents。

调试关注点：把短任务复杂化、权限边界不清、长任务产物不可追踪。

## D02 Execution Environment：工具、MCP、虚拟文件系统

学习内容：工具、MCP、虚拟文件系统、filesystem permissions、code execution、streaming。

最佳实践：

- agent 能读写的路径必须最小化。
- 文件写入要区分草稿、中间产物和最终产物。
- 外部工具和 MCP 要有超时、权限、审计。
- 代码执行能力默认视为高风险能力。

实操任务：

- 设计 filesystem policy：readOnly、workspaceDrafts、reports、blockedPaths。
- 定义每类文件操作是否需要 HITL。

验收标准：

- agent 不能写入未授权路径。
- 文件操作日志能说明谁、何时、为何写入。

调试关注点：路径穿越、覆盖用户文件、工具返回未审计、代码执行无隔离。

## D03 任务规划、TODO 与 Context Offloading

学习内容：长任务计划、TODO、checkpoint、report、context offloading。

最佳实践：

- 长任务必须显式维护计划，不依赖模型记忆。
- 中间产物写入文件或 state，避免上下文无限增长。
- TODO 要能反映当前状态，而不是只列愿望。
- 每个阶段完成后输出可审计 checkpoint。

实操任务：

- 设计 long research task 模板：plan.md、evidence.md、draft.md、final.md。
- 定义 TODO 状态：pending、in_progress、blocked、done。

验收标准：

- 中断后能根据文件和 TODO 恢复任务。
- 最终报告能追溯到 evidence.md。

调试关注点：TODO 不更新、中间产物散落、上下文卸载后模型忘记约束。

## D04 Subagents 设计

学习内容：default subagent、自定义 subagent、compiled subagent、structured output、subagent tracing。

最佳实践：

- subagent 描述要说明“何时使用”和“不要做什么”。
- 每个 subagent 只给必要工具。
- subagent 返回结果要简洁、结构化。
- 选择不同模型时按任务能力和成本决定。

实操任务：

- 设计 researcher、source-checker、writer 三个 subagent。
- 给每个 subagent 写 description、system prompt、tools、output schema。

验收标准：

- 模型能正确选择 subagent。
- subagent 不会互相重复工作或互相覆盖结论。

调试关注点：描述太泛、工具集太大、上下文膨胀、subagent 返回长篇自然语言。

## D05 Skills 与 Memory

学习内容：skills、agent-scoped memory、user-scoped memory、episodic memory、background consolidation。

最佳实践：

- skill 是可复用任务能力，不是随手写的 prompt 片段。
- memory 写入要有权限和规则。
- user-scoped memory 不能被其他用户读取。
- 并发写 memory 要处理冲突和覆盖。

实操任务：

- 定义课程代理可加载的 skills：source-review、rag-debug、report-writing。
- 定义 memory 写入规则：what、when、who、ttl。

验收标准：

- skill 能被描述、加载、执行、评估。
- memory 中不存在敏感信息和临时噪声。

调试关注点：技能描述过长、memory 污染、跨用户泄露、并发写覆盖。

## D06 Deep Agents HITL 与权限

学习内容：工具调用中断、subagent 中断、reject message、编辑工具参数、多工具审批。

最佳实践：

- 对外部搜索、写文件、发布报告设置条件审批。
- 审批时展示影响范围和可编辑参数。
- reject 要给模型可操作反馈，避免重复请求。
- subagent 内部高风险动作也要触发审批。

实操任务：

- 设计 Deep Agents 的 HITL policy：toolName、decisionTypes、when、description。
- 为 file write 和 external request 增加 approve/edit/reject 路径。

验收标准：

- 高风险动作不会在无人审批时执行。
- 编辑参数后任务能继续而不是从头开始。

调试关注点：subagent 绕过审批、拒绝后重复调用、审批上下文不足。
