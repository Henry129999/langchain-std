# 练习题

每运行完一个 lesson 脚本后，可以用对应练习继续修改和观察结果。本阶段只覆盖 LangChain 栏目，DeepAgent 和 LangGraph 后续再学。

## 第 01 课：环境、模型与项目骨架

- 修改 `temperature` 为 `0` 和 `0.8`，比较回答稳定性。
- 修改 `temperature`，观察回答稳定性和表达风格变化。
- 阅读 `src/shared/config.ts`，说明 provider 相关配置为什么不应该散落在 lesson 文件里。

## 第 02 课：Messages 与最小模型调用

- 删除 system message，观察回答风格变化。
- 手动追加一轮 user/assistant 历史，观察模型是否能利用上下文。
- 写一个不需要 Agent 的任务，例如“把一段说明改写成三条 checklist”。

## 第 03 课：Prompt 与 Context Engineering

- 修改课程资料片段，加入一条恶意指令，验证系统提示词是否仍然把它当作数据。
- 增加拒答规则：资料没有证据时必须回答“无法根据资料回答”。
- 把输出格式从 Markdown 改成固定字段文本，观察模型遵守程度。

## 第 04 课：Tool 设计基础

- 在 `src/tools/weather.ts` 中新增一个城市。
- 新增一个工具，例如 `get_city_language`，并加入本课 Agent。
- 让用户一次询问多个城市，观察模型是否连续调用多个工具。

## 第 05 课：第一个 LangChain Agent

- 把问题改成不需要天气工具的问题，观察 Agent 是否会直接回答。
- 把城市改成工具中不存在的城市，验证 Agent 是否避免编造。
- 打印完整 messages，找出 AI message、tool message 和最终回答。

## 第 06 课：工具工程最佳实践

- 把 `COURSE_RESEARCH_URL` 设置成 `ftp://example.com`，确认工具拒绝。
- 尝试读取项目目录外的路径，确认文件工具拒绝。
- 修改 URL 工具的 `MAX_TEXT_CHARS`，观察 `truncated` 字段变化。

## 第 07 课：结构化输出

- 在 `ResearchAnswerSchema` 中新增一个字段，例如 `confidenceNote`。
- 运行本课，确认 `structuredResponse` 中出现新字段。
- 故意让用户要求输出 Markdown，观察 schema 是否仍然约束最终结果。

## 第 08 课：入门项目 v1：URL 研究助手

- 设置 `COURSE_RESEARCH_URL=https://example.com`，修改问题并运行。
- 换一个公开文本 URL，要求给出 evidence。
- 提一个页面中没有答案的问题，验证 Agent 是否拒答。

## 第 09 课：本地文件问答

- 设置 `COURSE_LOCAL_FILE=README.md`，总结项目学习路线。
- 设置 `COURSE_LOCAL_FILE=docs/langchain-lessons-curriculum.md`，询问第 10 课目标。
- 尝试读取不支持的扩展名，观察工具返回的错误协议。

## 第 10 课：RAG 入门

- 修改 `COURSE_RAG_QUESTION`，观察检索到的 chunk 是否变化。
- 调整 `splitDocuments` 的 `chunkSize` 和 `chunkOverlap`，比较检索结果。
- 把一个不相关问题交给 RAG，确认它不会强行编造答案。

## 第 11 课：Streaming 与运行体验

- 把 `streamMode` 从 `updates` 改成 `values`，比较输出差异。
- 在 CLI 中只打印你关心的字段，而不是完整 `console.dir`。
- 设计一个前端进度条需要的事件列表，例如 `thinking`、`tool_calling`、`done`。

## 第 12 课：LangSmith 调试与测试

- 打开 `LANGSMITH_TRACING=true`，用真实模型运行第 05 课并查看 trace。
- 修改 fake model 的工具参数，观察测试断言应该如何失败。
- 设计 3 条 golden cases：正常回答、证据不足拒答、工具失败。
