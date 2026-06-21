# 进阶 Lessons 学习说明

这里是基础 12 课之后的可跟学课程。每个文件对应一个进阶模块，每个模块内部按 `A01`、`A02` 这样的编号组织具体 lesson。

推荐学习方式：

1. 先运行课程地图，确认模块顺序。
2. 每次只学习一节 lesson。
3. 按 lesson 的“实操任务”修改或新增代码。
4. 用“验收标准”判断是否真正掌握。
5. 遇到行为异常时，优先按“调试关注点”排查。

命令：

```bash
npm run advanced:map
npm run advanced:lesson -- A01
npm run advanced:a01
```

文件：

- `01-langchain-agent-engineering-lessons.md`：A01-A13
- `02-rag-engineering-lessons.md`：B01-B06
- `03-langgraph-workflows-lessons.md`：C01-C08
- `04-deep-agents-lessons.md`：D01-D06
- `05-langsmith-evaluation-lessons.md`：E01-E05
- `06-production-capstone-lessons.md`：F01-F04

可运行 TS 实战：

- `npm run advanced:a01`：运行 A01 Agent Harness 架构与适用边界。

学习原则：

- 不追求一次写完大系统，每节课只验证一个工程能力。
- 不把 prompt 当作业务逻辑边界，稳定规则优先放在代码、schema、tool 和 graph 中。
- 不用单次 demo 判断质量，关键能力必须有可重复的验收方式。
- 不把所有能力都塞进 Agent；固定流程优先链路，显式状态优先 LangGraph，长任务优先 Deep Agents。
