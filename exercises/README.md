# 练习题

每运行完一个 lesson 脚本后，可以用对应练习继续修改和观察结果。

## 第 01 课

- 修改 `src/lessons/01-basic-agent.ts` 中的城市。
- 在 `src/tools/weather.ts` 中新增一个城市。
- 提一个不需要天气工具的问题，观察 Agent 的回答。

## 第 02 课

- 新增第三个工具，命名为 `get_city_language`。
- 让用户在同一条消息里询问两个城市。
- 对比模型是调用一个工具，还是连续调用多个工具。

## 第 03 课

- 把系统提示词从双语助手改成合同审阅助手。
- 要求输出必须包含 `answer`、`evidence` 和 `limitations`。
- 测试模型是否遵守指定输出结构。

## 第 04 课

- 修改 `thread_id`，观察 Agent 是否还能记住最喜欢的城市。
- 在第一条消息中增加第二个偏好。
- 在第二条消息中同时询问这两个偏好。

## 第 05 课

- 把 Gutenberg URL 替换成另一个公开文本页面。
- 先要求总结，再要求 Agent 从抓取文本中给出证据。
- 调低 `maxTokens`，观察回答是否发生变化。

## 第 06 课

- 用同一个问题对比 `lesson:05` 和 `lesson:06` 的输出。
- 提一个计数问题，检查 Deep Agent 是否使用更强的内置工具。
- 开启 LangSmith tracing，查看模型和工具的调用顺序。

## 第 07 课

- 设置 `LANGSMITH_TRACING=true`，然后运行 `npm run lesson:07`。
- 对比终端输出和 LangSmith trace。
- 检查 trace 中是否展示了天气工具调用及其参数。

## 第 08 课

- 把 `COURSE_RESEARCH_URL` 设置成另一个公开文本 URL。
- 把 `COURSE_RESEARCH_QUESTION` 设置成一个需要证据的问题。
- 检查回答是否包含 `answer`、`evidence` 和 `limitations`。

## 第 09 课

- 修改 `src/lessons/09-structured-output.ts` 中的价格和折扣比例。
- 检查最终回答是否仍然是合法 JSON。
- 在系统提示词中增加一个必填 JSON 字段，观察模型是否遵守。

## 第 10 课

- 让 Agent 读取 `README.md`，而不是 `exercises/README.md`。
- 尝试读取项目目录外的路径，确认工具会拒绝。
- 提一个所选文件无法回答的问题。

## 第 11 课

- 分别搜索 `memory`、`research` 和 `beginner`。
- 查询一个课程目录中不存在的关键词。
- 在 `src/tools/course-catalog.ts` 中新增一条课程记录，然后重新运行本课。
