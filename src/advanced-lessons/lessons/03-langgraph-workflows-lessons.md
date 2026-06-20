# 模块 C Lessons：LangGraph 工作流编排

目标：掌握可持久化、可中断、可恢复、可观测的多步骤 agent/workflow 编排能力。

## C01 从 Agent Loop 到 StateGraph

学习内容：LangGraph 定位、StateGraph、节点、边、编译和运行。

最佳实践：

- 当流程需要显式状态、恢复、中断和确定性路由时，优先 LangGraph。
- Agent 适合动态工具选择，Graph 适合可描述的业务流程。
- 图节点要小而明确，避免一个节点里塞完整业务流程。
- graph state 应是业务事实，不是 prompt 文本拼接结果。

实操任务：

- 把研究助手拆成 retrieve、gradeEvidence、answer、review 四个节点。
- 画出节点输入输出。

验收标准：

- 你能解释 LangChain Agent 和 LangGraph 的职责差异。
- 你能说明每个节点为什么存在，以及下一跳由什么决定。

调试关注点：节点职责过大、状态字段混乱、模型决策和业务路由耦合。

## C02 State 设计：原始状态、派生状态、Reducer

学习内容：State schema、reducer、messages accumulator、raw vs derived state。

最佳实践：

- state 保存原始输入、检索结果、评分结果、审核状态。
- prompt 在节点内部按需格式化，不作为长期 state。
- 对数组和消息使用 reducer，避免覆盖历史。
- 每个字段要定义 owner 节点和生命周期。

实操任务：

- 设计 `ResearchGraphState`：question、retrievedChunks、evidenceGrade、draftAnswer、reviewDecision、messages。
- 标注每个字段由哪个节点写入。

验收标准：

- 你能避免节点之间通过隐式字符串传递状态。
- 你能解释 state 中每个字段何时创建、更新和结束。

调试关注点：字段被多个节点竞争写入、派生数据被持久化、数组覆盖而不是追加。

## C03 节点、边与条件路由

学习内容：addNode、addEdge、conditional edge、END。

最佳实践：

- 节点做工作，边做路由。
- 条件路由函数尽量确定性，不要每次都问模型。
- 路由结果用枚举或有限字符串，不使用自由文本。
- 对不可达状态要有兜底路径。

实操任务：

- 实现 `evidenceEnough ? answer : clarify` 路由。
- 为 evidenceGrade 设计 `enough | weak | missing` 三种状态。

验收标准：

- 证据不足时流程不会进入 answer 节点。
- 新增一个路由状态时，TypeScript 能提示需要处理。

调试关注点：条件函数返回未知值、路由循环、END 过早、弱证据仍被回答。

## C04 Command、并行分支与错误恢复

学习内容：节点更新 state、控制下一跳、错误恢复策略。

最佳实践：

- 可恢复错误进入 retry 或 fallback，不可恢复错误进入 escalate。
- 外部 IO 要幂等，避免 retry 造成重复副作用。
- 并行分支适合独立检索、独立评分，不适合共享可变状态。
- 错误信息要进入 state，便于后续节点解释和恢复。

实操任务：

- 为 retrieve 节点设计 timeout fallback。
- 为 answer 节点设计模型失败后的降级回答。

验收标准：

- 你能说清每个节点失败后的下一跳。
- retry 不会造成重复写文件或重复外部请求。

调试关注点：异常被吞、无限 retry、副作用不幂等、错误状态没有被后续节点读取。

## C05 Persistence：Checkpointer vs Store

学习内容：MemorySaver、thread_id、checkpoint、store。

最佳实践：

- checkpointer 用于同一 thread 的恢复。
- store 用于跨 thread 的长期数据。
- thread_id 必须由业务层生成和传入。
- checkpoint 里不要存不可序列化对象或敏感大对象。

实操任务：

- 给研究工作流加 MemorySaver。
- 使用同一个 thread_id 连续运行两次，观察状态延续。

验收标准：

- 你能解释为什么第二次运行可以恢复上下文。
- 你能区分 checkpoint 状态和长期用户记忆。

调试关注点：thread_id 丢失、不同用户共用 thread、checkpoint 太大、敏感数据持久化。

## C06 Interrupt 与人工审核

学习内容：interrupt、resume、approve/reject/edit、状态编辑。

最佳实践：

- interrupt 前的副作用必须幂等。
- 不要把 interrupt 包进 try/catch。
- 不要在同一节点里随意重排 interrupt 调用顺序。
- 审核 payload 要简洁、结构化、可编辑。

实操任务：

- 在最终回答发布前插入 review interrupt。
- 支持 approve、edit、reject 三种恢复路径。

验收标准：

- 中断后进程可以恢复到正确节点。
- edit 后的 state 会影响最终输出。

调试关注点：恢复参数格式错误、中断顺序变化、审核前已执行副作用。

## C07 LangGraph Streaming

学习内容：values、updates、messages、custom、debug stream mode。

最佳实践：

- UI 通常消费 updates 和 messages，调试消费 debug。
- custom stream 用于业务进度，不要混入内部对象。
- subgraph 输出要带 namespace，避免事件来源不清。
- stream 协议要可版本化。

实操任务：

- 为 retrieve、grade、answer 节点输出 custom progress。
- 同时观察 updates 和 messages 两种 stream mode。

验收标准：

- 你能区分 graph state 更新和 LLM token 输出。
- 前端能显示“正在检索、正在评分、正在生成”。

调试关注点：事件量过大、debug 泄露敏感状态、subgraph 事件来源不清。

## C08 子图与多 Agent 工作流

学习内容：subgraph、共享 state、局部 state、多 agent 协作。

最佳实践：

- 子图应该封装一个完整子流程，而不是随意拆文件。
- 共享 state 只放跨子图需要的数据。
- 子 agent 工具集要最小化。
- 子图输出要结构化，避免主图解析自然语言。

实操任务：

- 设计 researcher -> critic -> writer 三段式工作流。
- 定义每个子流程输入、输出和失败恢复。

验收标准：

- 你能解释为什么该流程需要子图，而不是单图节点。
- critic 能阻止无证据或弱证据答案进入 writer。

调试关注点：共享 state 太大、子图输出不稳定、子 agent 职责重叠。
