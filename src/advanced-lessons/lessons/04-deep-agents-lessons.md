# 模块 D Lessons：Deep Agents 长任务系统

目标：理解 Deep Agents 如何在 LangGraph 之上提供长任务执行环境、规划、文件系统、subagents、skills、memory、streaming、权限与生产化协议。该模块覆盖 Deep Agents 官方教程中的 overview、quickstart、customization、models、tools、context engineering、backends、subagents、async subagents、human-in-the-loop、permissions、memory、skills、sandboxes、interpreters、profiles、streaming、frontend、protocols 与 going to production 等核心主题。

## D01 Deep Agents 定位与架构

学习内容：Deep Agents 的 harness、长任务能力、与 LangChain Agent/LangGraph 的关系。

最佳实践：

- 简单工具调用不用 Deep Agents。
- 显式业务流程优先 LangGraph。
- 长任务、多文件产物、多 subagent、上下文卸载时考虑 Deep Agents。
- Deep Agents 的默认能力也要受权限、观测和评测约束。
- Deep Agents 不是“更聪明的模型”，而是一个带执行环境和治理能力的长任务 agent harness。

实操任务：

- 写出 LangChain Agent、LangGraph、Deep Agents 的决策矩阵。
- 为 Engineering Research Agent 判断哪些能力属于 Deep Agents。

验收标准：

- 你能解释 Deep Agents 是面向长任务的预置 harness，而不是 LangGraph 替代品。
- 你能说明何时不应该使用 Deep Agents。

调试关注点：把短任务复杂化、权限边界不清、长任务产物不可追踪、默认能力没有治理。

## D02 Execution Environment：工具、MCP、虚拟文件系统

学习内容：tools、MCP tools、virtual filesystem、filesystem permissions、backends、streaming、执行环境边界。

最佳实践：

- agent 能读写的路径必须最小化。
- 文件写入要区分草稿、中间产物和最终产物。
- 外部工具和 MCP 要有超时、权限、审计和错误 envelope。
- 虚拟文件系统应有明确 backend：memory、local disk、LangGraph store、composite 或 custom backend。
- permission rule 应按 first-match-wins 理解，规则顺序就是安全边界的一部分。

实操任务：

- 设计 filesystem policy：readOnly、workspaceDrafts、reports、blockedPaths。
- 定义每类文件操作是否需要 HITL。

验收标准：

- agent 不能写入未授权路径。
- 文件操作日志能说明谁、何时、为何写入。

调试关注点：路径穿越、覆盖用户文件、工具返回未审计、MCP 工具权限过宽、规则顺序错误。

## D03 任务规划、TODO 与 Context Offloading

学习内容：长任务计划、内置 TODO、checkpoint、report、summarization、context offloading。

最佳实践：

- 长任务必须显式维护计划，不依赖模型记忆。
- 中间产物写入文件或 state，避免上下文无限增长。
- TODO 要能反映当前状态，而不是只列愿望。
- 每个阶段完成后输出可审计 checkpoint。
- 上下文卸载要保留可恢复线索：文件路径、证据摘要、决策状态和下一步。

实操任务：

- 设计 long research task 模板：plan.md、evidence.md、draft.md、final.md。
- 定义 TODO 状态：pending、in_progress、blocked、done。

验收标准：

- 中断后能根据文件和 TODO 恢复任务。
- 最终报告能追溯到 evidence.md。

调试关注点：TODO 不更新、中间产物散落、上下文卸载后模型忘记约束、计划和实际状态不一致。

## D04 Subagents 设计

学习内容：default/general-purpose subagent、自定义 subagent、compiled subagent、async subagent、structured output、subagent tracing。

最佳实践：

- subagent 描述要说明“何时使用”和“不要做什么”。
- 每个 subagent 只给必要工具。
- subagent 返回结果要简洁、结构化。
- 选择不同模型时按任务能力、成本和延迟决定。
- 默认 general-purpose subagent 可以保留、覆盖或禁用，取决于是否会造成职责不清。

实操任务：

- 设计 researcher、source-checker、writer 三个 subagent。
- 给每个 subagent 写 description、system prompt、tools、output schema。

验收标准：

- 模型能正确选择 subagent。
- subagent 不会互相重复工作或互相覆盖结论。

调试关注点：描述太泛、工具集太大、上下文膨胀、subagent 返回长篇自然语言、默认 subagent 抢走专业任务。

## D05 Skills 与 Memory

学习内容：skills、Agent Skills 标准、`SKILL.md`、progressive disclosure、agent-scoped memory、user-scoped memory、episodic memory、organization-level memory、background consolidation。

最佳实践：

- skill 是可复用任务能力，不是随手写的 prompt 片段。
- memory 写入要有权限、scope 和规则。
- user-scoped memory 不能被其他用户读取。
- organization-level memory 要区分只读政策和可写知识。
- 并发写 memory 要处理冲突和覆盖，避免 last-write-wins 污染关键记忆。
- `AGENTS.md` 这类 always-loaded memory 要短、稳定、低噪声。

实操任务：

- 定义课程代理可加载的 skills：source-review、rag-debug、report-writing。
- 定义 memory 写入规则：what、when、who、scope、ttl、conflict policy。

验收标准：

- skill 能被描述、加载、执行、评估。
- memory 中不存在敏感信息和临时噪声。

调试关注点：技能描述过长、memory 污染、跨用户泄露、并发写覆盖、短期任务状态被写入长期记忆。

## D06 Deep Agents HITL 与权限

学习内容：工具调用中断、subagent 中断、reject message、编辑工具参数、多工具审批。

最佳实践：

- 对外部搜索、写文件、发布报告设置条件审批。
- 审批时展示影响范围和可编辑参数。
- reject 要给模型可操作反馈，避免重复请求。
- subagent 内部高风险动作也要触发审批。
- 审批协议要同时记录原始参数、编辑后参数、审批人、时间和原因。

实操任务：

- 设计 Deep Agents 的 HITL policy：toolName、decisionTypes、when、description。
- 为 file write 和 external request 增加 approve/edit/reject 路径。

验收标准：

- 高风险动作不会在无人审批时执行。
- 编辑参数后任务能继续而不是从头开始。

调试关注点：subagent 绕过审批、拒绝后重复调用、审批上下文不足、多工具审批顺序不稳定。

## D07 Quickstart 到 createDeepAgent：模型、工具、Profile

学习内容：最小 Deep Agent、createDeepAgent、model、tools、system prompt、profile、运行输入和事件输出。

最佳实践：

- quickstart 只用于验证 harness 能跑通，不直接当生产结构。
- 模型选择要写入配置层，而不是散落在业务代码里。
- 工具描述和 schema 是模型选择工具的主要依据，不能写得模糊。
- profile 用于把模型、权限、执行后端和行为偏好组合成可复用配置。
- 运行输入、stream 输出和最终结果要有稳定协议。

实操任务：

- 搭一个最小 Deep Agent spec：model、tools、systemPrompt、profile、运行输入和预期事件。
- 写出“本地学习 profile”和“生产受限 profile”的差异。

验收标准：

- 你能从 quickstart 代码中指出 harness 的关键入口。
- 你能解释 profile 为什么不是普通 prompt 变量。

调试关注点：工具 schema 不清、profile 配置分散、模型能力和工具风险不匹配、quickstart 代码直接进生产。

## D08 Backends、Permissions、Sandboxes、Interpreters

学习内容：虚拟文件系统后端、permission policy、remote sandbox、code execution、interpreter、host isolation。

最佳实践：

- backend 选择决定数据持久性和隔离级别：memory 适合 demo，local disk 适合本地，LangGraph store 适合可管理持久化。
- sandbox 适合高风险代码执行，interpreter 适合受控表达式或轻量脚本能力。
- custom backend 必须在读写前做权限校验，而不是只依赖上层 prompt。
- 权限规则要最小化，并为 blocked paths 写显式拒绝。
- 执行代码的 stdout、stderr、exit code、timeout 都应结构化记录。

实操任务：

- 输出一份后端选择表：local disk、memory、LangGraph store、sandbox、interpreter 的适用边界。
- 为代码执行能力设计 timeout、resource limit、allowed imports、output capture。

验收标准：

- 你能解释 sandbox 和 interpreter 的安全边界差异。
- 你能说明哪类任务必须远程隔离执行。

调试关注点：宿主文件被污染、权限只写在 prompt 里、interpreter 被当成完整 sandbox、执行日志不可追踪。

## D09 Context Engineering、Prompt Assembly、Middleware

学习内容：system prompt assembly、default middleware stack、provider-specific middleware、custom middleware、summarization、context offloading、prompt caching。

最佳实践：

- prompt assembly 要区分静态规则、用户目标、memory、skills、任务状态、工具结果。
- 静态 prompt 适合缓存，动态上下文不应误放进可缓存区域。
- middleware 用于横切能力：模型选择、工具治理、审计、错误处理、上下文裁剪。
- provider-specific middleware 要明确依赖的模型供应商能力，避免换模型后静默失效。
- summarization/context offloading 要保留来源链接和可恢复引用。

实操任务：

- 设计一个长任务上下文预算：always-loaded memory、按需 skills、可卸载 evidence、可缓存静态 prompt。
- 写出 middleware 清单：beforeModel、wrapModelCall、wrapToolCall、afterAgent。

验收标准：

- 你能说明 Deep Agents 默认 harness 中哪些能力来自 middleware。
- 你能判断哪些上下文适合放进 prompt cache。

调试关注点：静态和动态 prompt 混在一起、middleware 顺序不清、上下文卸载后证据不可追溯、供应商切换后缓存失效。

## D10 Subagents 运维：异步、追踪、结构化输出、故障诊断

学习内容：async subagents、subagent streaming、LangSmith tracing/filtering、structured output、per-subagent context、identifying caller、troubleshooting。

最佳实践：

- 异步 subagent 适合可并行、低耦合、结果可合并的任务。
- 子代理输出必须短而结构化，不把整个上下文带回主代理。
- LangSmith trace 要能按 subagent、tool、metadata 过滤。
- 每个 subagent 应有 per-subagent context，避免继承无关上下文。
- 如果 subagent 选错，优先检查 description、任务边界和工具集，而不是继续加强主 prompt。

实操任务：

- 为 researcher/source-checker/writer 定义可观测字段、输出 schema、最小工具集和错误定位手册。
- 设计一个 subagent not called、wrong subagent selected、context bloated 的排查流程。

验收标准：

- 你能定位一次 subagent 调用来自哪个父任务。
- 你能让主 agent 只接收结构化摘要，而不是完整子代理对话。

调试关注点：子代理不被调用、错误子代理被调用、上下文仍然膨胀、trace 无法过滤、结构化输出缺字段。

## D11 HITL 深水区：多工具审批、编辑参数、Subagent 中断

学习内容：decision types、multiple tool calls、rejection messages、edit tool arguments、subagent interrupts、interrupts within tool calls。

最佳实践：

- 多工具审批要按 tool call id 追踪每个决策。
- edit arguments 后要重新校验 schema 和权限。
- reject message 要告诉模型下一步能做什么，不能只写“拒绝”。
- subagent 内部工具中断要回传到父任务上下文，避免审批孤岛。
- 对高风险工具设置默认拒绝或默认需要 approval，不依赖模型自觉。

实操任务：

- 为每类高风险动作定义 decisionTypes、review payload、reject message 和 resume 行为。
- 写出多工具调用同时出现时的审批结果合并规则。

验收标准：

- 一个工具被拒绝不会误拒绝其他已批准工具。
- 编辑参数后任务继续运行，并在 trace 中保留编辑记录。

调试关注点：tool call id 丢失、编辑后未重验权限、subagent interrupt 无法恢复、拒绝反馈不可操作。

## D12 Frontend、Streaming、Protocols 与生产部署

学习内容：Deep Agents frontend、streaming、ACP/MCP 集成边界、going-to-production checklist、structured output、部署前质量门禁。

最佳实践：

- 前端事件协议要区分 progress、tool call、file change、approval request、final structured result。
- streaming 事件必须可追踪到 runId、subagent、tool call id 和文件路径。
- MCP 是工具协议边界，ACP/A2A 这类协议用于 agent 间或外部系统协作时要明确身份和权限。
- 生产部署前要定义权限策略、sandbox 策略、trace/eval、错误恢复、回滚和数据保留。
- structured output 是系统集成合同，不是为了让回答“看起来整齐”。

实操任务：

- 定义一个生产发布清单：事件协议、权限策略、协议接入、trace/eval、结构化结果和回滚策略。
- 为最终报告输出定义 `structuredResponse` schema 和版本字段。

验收标准：

- 前端可以稳定展示长任务进度、中断审批和最终产物。
- 生产清单覆盖安全、可靠性、可观测性和数据治理。

调试关注点：前端事件无版本、protocol 工具越权、structured output 没有兼容策略、上线后无法回放问题轨迹。
