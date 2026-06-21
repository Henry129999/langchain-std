# LangGraph 与 Deep Agents 官方主题覆盖矩阵

用途：确认进阶课程没有只停留在概览层，而是把官方 LangGraph 与 Deep Agents 栏目中的关键知识点映射到具体课程。基础 12 节课程不纳入本矩阵。

## LangGraph

| 官方主题 | 覆盖课程 | 工程学习重点 |
| --- | --- | --- |
| Overview、Install、Quickstart | C01 | 识别 LangGraph 的适用边界，搭建最小 StateGraph。 |
| Thinking in LangGraph | C02、C03、C04 | 先拆业务流程，再拆 state、节点、边和错误路径。 |
| Workflow step types：LLM、data、action、user input | C03 | 不把所有逻辑塞进一个模型节点。 |
| State design、raw state、derived state、reducer | C02 | state 保存业务事实，prompt 按需生成。 |
| Command、conditional routing、parallel branches | C03、C04 | 节点做工作，边做路由，错误路径显式化。 |
| Error handling：transient、LLM-recoverable、user-fixable、unexpected | C04 | 按错误类型选择 retry、feedback loop、interrupt、escalate。 |
| Persistence、Checkpointers、Stores | C05、C09 | 区分线程内恢复和跨线程长期数据。 |
| Memory、Time travel、Fault tolerance | C09 | 设计 checkpoint 回放、故障恢复和幂等副作用。 |
| Interrupts、resume、approve/reject/edit | C06、C10 | 生产 HITL 协议、恢复 payload、幂等规则。 |
| Multiple interrupts、interrupts in tools、validating human input | C10 | 多中断顺序、工具内审批、输入校验循环。 |
| Static interrupts、LangSmith Studio debugging | C10 | 区分调试断点和生产 HITL。 |
| Streaming modes：updates、values、messages、custom、debug、checkpoints、tasks | C07、C11 | 为 UI、调试和审计设计不同粒度事件。 |
| Token filtering、tool progress、subgraph outputs、custom channels | C11 | 设计前端事件 envelope 和过滤策略。 |
| Subgraphs、多 agent workflow | C08 | 共享 state 与局部 state 显式映射。 |
| Graph API、Functional API、Runtime | C12 | 根据流程复杂度选择 API，并理解 Pregel runtime 边界。 |
| Testing、application structure、schema compatibility | C12 | 节点单测、端到端轨迹测试、旧 checkpoint 兼容。 |

## Deep Agents

| 官方主题 | 覆盖课程 | 工程学习重点 |
| --- | --- | --- |
| Overview、Core capabilities | D01 | Deep Agents 是长任务 harness，不替代 LangGraph。 |
| Quickstart、createDeepAgent | D07 | 从最小可运行入口理解 model/tools/systemPrompt/profile。 |
| Models、Tools、MCP tools | D02、D07 | 工具 schema、模型选择、MCP 权限边界。 |
| Execution environment、Virtual filesystem | D02、D08 | 文件系统后端、读写边界、审计字段。 |
| Backends、custom backend、composite backend | D02、D08 | 根据持久性、隔离级别和治理需求选择 backend。 |
| Permissions、first-match-wins policy | D02、D08、D11 | 权限规则顺序、blocked paths、高风险默认审批。 |
| Sandboxes、Interpreters、Code execution | D08 | 区分 sandbox 隔离和 interpreter 受控执行。 |
| Context engineering、summarization、context offloading | D03、D09 | 长任务上下文预算和中间产物卸载。 |
| Skills、Agent Skills、progressive disclosure | D05、D09 | skill 是可加载任务能力，不是长 prompt。 |
| Memory：agent/user/org scoped、episodic、background consolidation | D05 | 记忆 scope、写入规则、后台整合和冲突策略。 |
| Prompt caching、prompt assembly | D09 | 区分静态 prompt 和动态上下文。 |
| Middleware：default stack、provider-specific、custom | D09 | 横切模型选择、工具治理、审计和错误处理。 |
| Task planning、TODO | D03 | 长任务显式维护计划、状态和 checkpoint。 |
| Subagents、default/general-purpose、compiled、async | D04、D10 | 子代理职责、工具最小化、异步任务和结构化返回。 |
| Subagent streaming、LangSmith filtering、per-subagent context | D10 | 子代理可观测性、上下文边界和错误定位。 |
| Structured output | D04、D10、D12 | 把最终结果和子代理结果作为系统集成合同。 |
| Human-in-the-loop：approve/reject/edit、多工具调用 | D06、D11 | 多工具审批、参数编辑、拒绝反馈和恢复策略。 |
| Subagent interrupts、interrupts within tools | D06、D11 | 子代理高风险动作不能绕过审批。 |
| Profiles | D07 | 把模型、权限、后端和行为偏好组合成可复用配置。 |
| Streaming、Frontend patterns | D10、D12 | 长任务进度、工具调用、审批请求和最终产物的前端事件协议。 |
| Protocols：ACP、MCP、agent integration | D12 | 协议接入边界、身份、权限和审计。 |
| Going to production、managed/deployment checklist | D12、F01-F04 | 权限、sandbox、trace/eval、回滚、数据保留和质量门禁。 |
| Deep Agents Code CLI 相关主题 | D08、D10、D12 | 作为延伸工程主题映射到 sandbox、subagents、MCP、配置和生产治理，不作为 TS SDK 主线 lesson。 |

## 课程使用顺序

1. 先继续 A 模块可运行 TS lesson，完成 LangChain Agent 工程化能力。
2. 进入 B 模块补 RAG 工程基础。
3. 进入 C 模块学习 LangGraph，先 C01-C08 建主干，再 C09-C12 做生产级补强。
4. 最后进入 D 模块学习 Deep Agents，先 D01-D06 建长任务心智模型，再 D07-D12 做官方主题补齐和生产治理。

## Runnable Lesson 覆盖

| 课程 | 可运行命令 | 实战入口 |
| --- | --- | --- |
| C01 | `npm run advanced:c01` | `src/advanced-lessons/runnable-lessons/c01-stategraph-entry.ts` |
| C02 | `npm run advanced:c02` | `src/advanced-lessons/runnable-lessons/c02-state-design-reducers.ts` |
| C03 | `npm run advanced:c03` | `src/advanced-lessons/runnable-lessons/c03-conditional-routing.ts` |
| C04 | `npm run advanced:c04` | `src/advanced-lessons/runnable-lessons/c04-command-error-recovery.ts` |
| C05 | `npm run advanced:c05` | `src/advanced-lessons/runnable-lessons/c05-persistence-checkpointer-store.ts` |
| C06 | `npm run advanced:c06` | `src/advanced-lessons/runnable-lessons/c06-interrupt-human-review.ts` |
| C07 | `npm run advanced:c07` | `src/advanced-lessons/runnable-lessons/c07-langgraph-streaming.ts` |
| C08 | `npm run advanced:c08` | `src/advanced-lessons/runnable-lessons/c08-subgraphs-multi-agent.ts` |
| C09 | `npm run advanced:c09` | `src/advanced-lessons/runnable-lessons/c09-persistence-deep-dive.ts` |
| C10 | `npm run advanced:c10` | `src/advanced-lessons/runnable-lessons/c10-interrupt-advanced.ts` |
| C11 | `npm run advanced:c11` | `src/advanced-lessons/runnable-lessons/c11-streaming-deep-dive.ts` |
| C12 | `npm run advanced:c12` | `src/advanced-lessons/runnable-lessons/c12-api-runtime-testing.ts` |
| D01 | `npm run advanced:d01` | `src/advanced-lessons/runnable-lessons/d01-deep-agents-positioning.ts` |
| D02 | `npm run advanced:d02` | `src/advanced-lessons/runnable-lessons/d02-execution-environment.ts` |
| D03 | `npm run advanced:d03` | `src/advanced-lessons/runnable-lessons/d03-planning-todo-offloading.ts` |
| D04 | `npm run advanced:d04` | `src/advanced-lessons/runnable-lessons/d04-subagents-design.ts` |
| D05 | `npm run advanced:d05` | `src/advanced-lessons/runnable-lessons/d05-skills-memory.ts` |
| D06 | `npm run advanced:d06` | `src/advanced-lessons/runnable-lessons/d06-hitl-permissions.ts` |
| D07 | `npm run advanced:d07` | `src/advanced-lessons/runnable-lessons/d07-quickstart-profile.ts` |
| D08 | `npm run advanced:d08` | `src/advanced-lessons/runnable-lessons/d08-backends-sandboxes-interpreters.ts` |
| D09 | `npm run advanced:d09` | `src/advanced-lessons/runnable-lessons/d09-context-middleware.ts` |
| D10 | `npm run advanced:d10` | `src/advanced-lessons/runnable-lessons/d10-subagents-operations.ts` |
| D11 | `npm run advanced:d11` | `src/advanced-lessons/runnable-lessons/d11-hitl-deep-dive.ts` |
| D12 | `npm run advanced:d12` | `src/advanced-lessons/runnable-lessons/d12-frontend-streaming-production.ts` |
