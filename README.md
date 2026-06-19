# LangChain Agent Study

这是一个按 LangChain JavaScript Quickstart 拆出来的学习项目。目标不是一次写完一个复杂应用，而是让你按脚本一步一步理解 Agent、工具、提示词、记忆、研究任务和 Deep Agents。

官方文档入口：https://docs.langchain.com/oss/javascript/langchain/quickstart#langchain-agents

## 0. 环境要求

LangChain 官方 Quickstart 要求 Node.js 22+。

检查当前版本：

```powershell
npm run check
```

如果低于 Node 22，请先升级或切换 Node 版本。

## 1. 安装依赖

```powershell
npm install
```

## 2. 配置模型

复制环境变量模板：

```powershell
Copy-Item .env.example .env
```

然后编辑 `.env`，至少设置一个模型提供商的 API Key。默认配置使用官方文档里的 OpenAI 示例：

```text
OPENAI_API_KEY=你的 key
LANGCHAIN_MODEL=gpt-5.5
```

如果使用其他 provider，修改 `LANGCHAIN_MODEL` 和对应 API Key。

## 3. 学习路线

按顺序运行：

```powershell
npm run lesson:01
npm run lesson:02
npm run lesson:03
npm run lesson:04
npm run lesson:05
npm run lesson:06
```

每一课对应一个文件：

| 课程 | 文件 | 重点 |
| --- | --- | --- |
| 01 | `src/lessons/01-basic-agent.ts` | 最小 Agent 和工具调用 |
| 02 | `src/lessons/02-tool-design.ts` | 多工具设计 |
| 03 | `src/lessons/03-system-prompt.ts` | 系统提示词约束行为 |
| 04 | `src/lessons/04-memory.ts` | `MemorySaver` 和 `thread_id` |
| 05 | `src/lessons/05-research-agent.ts` | URL 文本研究 Agent |
| 06 | `src/lessons/06-deep-agent.ts` | Deep Agent 对比 |

## 4. 推荐学习方式

1. 先读 `langchain-js-agent-tutorial.md` 理解概念。
2. 跑 `lesson:01`，只改城市名和问题。
3. 跑 `lesson:02`，自己添加一个工具。
4. 跑 `lesson:03`，改 system prompt 观察输出变化。
5. 跑 `lesson:04`，改变 `thread_id` 观察记忆边界。
6. 跑 `lesson:05`，换 URL 练习研究型 Agent。
7. 跑 `lesson:06`，对比 Deep Agent 是否更适合复杂任务。

练习题在 `exercises/README.md`。

## 5. LangSmith 追踪

如果要观察 Agent 内部每一步，可以在 `.env` 中启用：

```text
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=你的 LangSmith key
```

然后重新运行任意 lesson，到 LangSmith 控制台查看 trace。

## 6. 项目结构

```text
langchain-agent-study/
  exercises/
    README.md
  scripts/
    check-node-version.mjs
  src/
    lessons/
    prompts/
    shared/
    tools/
  .env.example
  langchain-js-agent-tutorial.md
  package.json
  tsconfig.json
```

## 7. 常见问题

`npm run check` 失败：

当前 Node.js 版本低于 22。先升级 Node，再继续。

缺少 API Key：

复制 `.env.example` 为 `.env`，填写对应 provider 的 key。

模型名报错：

不同 provider 的模型命名方式不同。先用官方 Quickstart 里的模型名，确认 API Key 和 provider 配置匹配。

研究型脚本消耗 token 较多：

`lesson:05` 和 `lesson:06` 会读取较长文本。初学时可以换成短一点的公开 URL。
