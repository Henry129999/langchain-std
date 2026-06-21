# 模块 C Lessons：LangGraph 工作流编排

目标：掌握可持久化、可中断、可恢复、可观测的多步骤 agent/workflow 编排能力。该模块覆盖 LangGraph 官方教程中的 overview、quickstart、thinking-in-langgraph、persistence、checkpointers、stores、fault tolerance、time travel、memory、interrupts、streaming、subgraphs、Graph API、Functional API、runtime 与 test 等核心主题。

## C01 从 Agent Loop 到 StateGraph

学习内容：LangGraph 定位、安装和 quickstart、StateGraph、节点、边、编译和运行。

最佳实践：

- 当流程需要显式状态、恢复、中断和确定性路由时，优先 LangGraph。
- Agent 适合动态工具选择，Graph 适合可描述、可回放、可测试的业务流程。
- 图节点要小而明确，避免一个节点里塞完整业务流程。
- graph state 应是业务事实，不是 prompt 文本拼接结果。

实操任务：

- 把研究助手拆成 retrieve、gradeEvidence、answer、review 四个节点。
- 画出节点输入、节点输出和路由条件。

验收标准：

- 你能解释 LangChain Agent 和 LangGraph 的职责差异。
- 你能说明每个节点为什么存在，以及下一跳由什么决定。

调试关注点：节点职责过大、状态字段混乱、模型决策和业务路由耦合。

## C02 State 设计：原始状态、派生状态、Reducer

学习内容：State schema、reducer、messages accumulator、raw state vs derived state、process-first workflow design。

最佳实践：

- 先画业务流程，再设计 state，不要先写 prompt。
- state 保存原始输入、检索结果、评分结果、审核状态和审计字段。
- prompt 在节点内部按需格式化，不作为长期 state。
- 对数组和消息使用 reducer，避免覆盖历史。
- 每个字段要定义 owner 节点、生命周期和是否可持久化。

实操任务：

- 设计 `ResearchGraphState`：question、retrievedChunks、evidenceGrade、draftAnswer、reviewDecision、messages、errors、audit。
- 标注每个字段由哪个节点写入、是否进入 checkpoint、是否允许前端展示。

验收标准：

- 你能避免节点之间通过隐式字符串传递状态。
- 你能解释 state 中每个字段何时创建、更新和结束。

调试关注点：字段被多个节点竞争写入、派生数据被持久化、数组覆盖而不是追加、敏感字段进入 debug 输出。

## C03 节点、边与条件路由

学习内容：addNode、addEdge、conditional edge、END、LLM step/data step/action step/user input step 的拆分。

最佳实践：

- 节点做工作，边做路由。
- 条件路由函数尽量确定性，不要每次都问模型。
- 路由结果用枚举或有限字符串，不使用自由文本。
- 对不可达状态要有兜底路径。
- 数据读取、模型判断、外部动作、人工输入应拆成不同类型节点。

实操任务：

- 实现 `evidenceEnough ? answer : clarify` 路由。
- 为 evidenceGrade 设计 `enough | weak | missing` 三种状态。

验收标准：

- 证据不足时流程不会进入 answer 节点。
- 新增一个路由状态时，TypeScript 能提示需要处理。

调试关注点：条件函数返回未知值、路由循环、END 过早、弱证据仍被回答。

## C04 Command、并行分支与错误恢复

学习内容：节点更新 state、控制下一跳、Command、并行分支、错误分类与恢复。

最佳实践：

- transient error 走 retry，例如网络抖动、限流、临时超时。
- LLM-recoverable error 走模型可见反馈循环，例如 schema 不合法、缺少字段。
- user-fixable error 走 interrupt，例如缺少权限、需要用户补充输入。
- unexpected error 应冒泡或进入明确的 fail/escalate 分支，不要静默吞掉。
- 外部 IO 要幂等，避免 retry 造成重复副作用。
- 并行分支适合独立检索、独立评分，不适合共享可变状态。

实操任务：

- 为 retrieve 节点设计 timeout fallback。
- 为 answer 节点设计模型失败后的降级回答。
- 为 write/report 节点设计幂等 key。

验收标准：

- 你能说清每个节点失败后的下一跳。
- retry 不会造成重复写文件或重复外部请求。

调试关注点：异常被吞、无限 retry、副作用不幂等、错误状态没有被后续节点读取。

## C05 Persistence：Checkpointer vs Store

学习内容：MemorySaver、thread_id、checkpoint、checkpointer、store、thread-scoped memory、cross-thread memory。

最佳实践：

- checkpointer 用于同一 thread 的 graph state 恢复。
- store 用于跨 thread 的长期数据和应用自定义数据。
- thread_id 必须由业务层生成和传入，不应由节点临时拼接。
- checkpoint 里不要存不可序列化对象、敏感大对象或可重新计算的大型派生数据。
- store namespace 要有 user/org/assistant 维度，避免跨租户读取。

实操任务：

- 给研究工作流加 MemorySaver。
- 使用同一个 thread_id 连续运行两次，观察状态延续。
- 设计 store namespace：`users/{userId}/research-preferences`、`orgs/{orgId}/source-policy`。

验收标准：

- 你能解释为什么第二次运行可以恢复上下文。
- 你能区分 checkpoint 状态和长期用户记忆。

调试关注点：thread_id 丢失、不同用户共用 thread、checkpoint 太大、敏感数据持久化、store namespace 过宽。

## C06 Interrupt 与人工审核

学习内容：interrupt、resume、approve/reject/edit、状态编辑、中断规则和幂等副作用。

最佳实践：

- interrupt 前的副作用必须幂等，或放到 resume 后执行。
- 不要把 interrupt 包进 try/catch。
- 不要在同一节点里随意重排 interrupt 调用顺序。
- 审核 payload 要简洁、结构化、可编辑。
- resume command 要可版本化，避免前端和 graph 升级后协议不兼容。

实操任务：

- 在最终回答发布前插入 review interrupt。
- 支持 approve、edit、reject 三种恢复路径。

验收标准：

- 中断后进程可以恢复到正确节点。
- edit 后的 state 会影响最终输出。

调试关注点：恢复参数格式错误、中断顺序变化、审核前已执行副作用。

## C07 LangGraph Streaming

学习内容：values、updates、messages、custom、debug stream mode，以及 checkpoints/tasks 等工程调试事件。

最佳实践：

- UI 通常消费 updates、messages 和 custom；调试消费 debug、checkpoints、tasks。
- custom stream 用于业务进度，不要混入内部对象。
- token stream 要支持按 node、metadata、LLM invocation 过滤。
- 子图输出要带 namespace，避免事件来源不清。
- stream 协议要可版本化，并允许前端忽略未知事件。

实操任务：

- 为 retrieve、grade、answer 节点输出 custom progress。
- 同时观察 updates、messages、custom 三种 stream mode。

验收标准：

- 你能区分 graph state 更新和 LLM token 输出。
- 前端能显示“正在检索、正在评分、正在生成”。

调试关注点：事件量过大、debug 泄露敏感状态、subgraph 事件来源不清、token 过滤条件失效。

## C08 子图与多 Agent 工作流

学习内容：subgraph、共享 state、局部 state、多 agent 协作、子图输出与父图路由。

最佳实践：

- 子图应该封装一个完整子流程，而不是随意拆文件。
- 共享 state 只放跨子图需要的数据。
- 子 agent 工具集要最小化。
- 子图输出要结构化，避免主图解析自然语言。
- 子图和父图的 state schema 要显式映射，避免隐式字段泄露。

实操任务：

- 设计 researcher -> critic -> writer 三段式工作流。
- 定义每个子流程输入、输出和失败恢复。

验收标准：

- 你能解释为什么该流程需要子图，而不是单图节点。
- critic 能阻止无证据或弱证据答案进入 writer。

调试关注点：共享 state 太大、子图输出不稳定、子 agent 职责重叠。

## C09 Persistence 深水区：Checkpointers、Stores、Memory、Time Travel

学习内容：checkpointer 语义、stores、graph memory、fault tolerance、time travel、checkpoint 回放调试。

最佳实践：

- 把 checkpoint 看成“线程内流程恢复”，不要把它当业务数据库。
- 把 store 看成“应用长期记忆或配置”，不要把每一步 graph state 都塞进去。
- time travel 用于调试、回放、比较策略和恢复人工审核前状态。
- fault tolerance 要和幂等副作用一起设计，否则恢复后可能重复执行外部动作。
- checkpoint_id、thread_id、run metadata 应进入 tracing，方便关联 LangSmith 轨迹。

实操任务：

- 设计一个 thread_id、checkpoint_id、store namespace 与回放调试策略。
- 写出一次失败恢复流程：从 checkpoint 恢复、读取 store、跳过已执行副作用、继续 graph。

验收标准：

- 你能说明 checkpointer、store、memory、time travel 的边界。
- 你能判断哪些字段不应该持久化。

调试关注点：恢复后重复执行工具、长期 store 被短期状态污染、checkpoint 无法序列化、回放缺少 metadata。

## C10 Interrupt 高级模式：多中断、工具内中断、输入校验

学习内容：multiple interrupts、approve/reject、review/edit state、interrupts in tools、validating human input、static breakpoints、LangSmith Studio 调试。

最佳实践：

- 多中断要定义稳定顺序和稳定 resume payload。
- 工具内 interrupt 适合审批危险动作，但工具本身也要保持幂等。
- 输入校验建议通过状态返回错误并走条件边循环，不要在一个节点里无限 interrupt。
- static interrupt 更适合调试断点，生产 HITL 应使用 `interrupt`。
- reject message 要给模型可操作反馈，避免重复请求同一危险动作。

实操任务：

- 实现一份 HITL 设计表：触发点、payload、resume command、幂等要求、失败恢复。
- 为“写入最终报告”设计 approve/edit/reject，并为 edit 后 state 更新写出协议。

验收标准：

- 多个中断不会因为代码重排导致恢复错位。
- 用户编辑后的参数会被后续节点使用。

调试关注点：interrupt 顺序变动、tool interrupt 绕过权限层、校验循环卡死、reject 后重复调用。

## C11 Streaming 深水区：事件模式、过滤、Tool Progress、Subgraph

学习内容：updates/values/messages/custom/debug/checkpoints/tasks，多模式组合，按 node/invocation 过滤 token，tool progress、subgraph outputs、React `useStream` 与 custom stream channels。

最佳实践：

- 对前端定义统一 event envelope：type、source、node、runId、payload、timestamp、version。
- 工具进度和业务进度分开建模，不把工具内部日志直接暴露给用户。
- messages token stream 要支持过滤，避免多个模型节点 token 混在一起。
- debug/checkpoints/tasks 只给开发者或受控环境，不默认给终端用户。
- 多模式 streaming 要保证事件可以乱序容忍或带序号重排。

实操任务：

- 定义前端可消费的 graph event envelope。
- 区分 `tools`、`custom`、`debug` 三类事件，并写出消费端忽略未知事件的规则。

验收标准：

- 前端能独立渲染节点进度、工具进度、模型 token 和最终结果。
- 子图事件能定位到父图和子图来源。

调试关注点：事件协议不稳定、内部状态泄露、多个 token 源混流、前端对未知事件崩溃。

## C12 LangGraph API、Runtime、测试与生产结构

学习内容：Graph API vs Functional API、Pregel runtime、local/server 运行边界、测试策略、应用目录结构、兼容性。

最佳实践：

- Graph API 适合显式节点和复杂状态机；Functional API 适合更函数式的流程表达。
- runtime 相关配置不要散落在节点内部，应由 graph factory 或 app boundary 注入。
- 节点要能单测，graph 要能端到端轨迹测试。
- state schema 和 stream event schema 要有版本策略。
- 生产目录结构应分离 graph definition、nodes、tools、state、storage、eval、api。

实操任务：

- 给 capstone 设计 graph 目录结构。
- 写出节点单测、端到端轨迹测试、checkpoint 恢复测试和 schema 兼容策略。

验收标准：

- 你能解释 Graph API 和 Functional API 的取舍。
- 你能把 LangGraph 工作流纳入 CI 回归测试，而不是只手动跑 demo。

调试关注点：节点强依赖真实外部服务、runtime 配置不可替换、schema 变更破坏旧 checkpoint、测试只断言最终文本。
