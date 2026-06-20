# LangChain 进阶课程

本目录用于管理基础 12 课之后的进阶课程。基础课程仍保留在 `src/lessons`，本目录不覆盖、不重排、不修改已完成的基础 lesson。

运行课程地图：

```bash
npm run advanced:map
npm run advanced:lesson -- A01
```

## 设计原则

- 面向工程师：每节课都围绕架构边界、运行机制、调试路径、可测试性和生产风险设计。
- 对齐官方文档：课程覆盖 LangChain、LangGraph、Deep Agents、LangSmith 的 JavaScript 官方文档主题。
- 以项目驱动：最终形成一个 Engineering Research Agent，具备 RAG、显式工作流、长任务执行、人工审批、评测和观测能力。
- 基础课隔离：基础 12 课只作为前置知识，不再混入 Deep Agents 或 LangGraph。

## 学习路线

| 模块 | 主题 | 目标 |
| --- | --- | --- |
| A | LangChain Agent 工程化 | 掌握 agent harness、middleware、runtime、memory、guardrails、HITL、MCP |
| B | RAG 与知识库工程 | 从简单检索升级为可引用、可评测、可维护的知识库问答 |
| C | LangGraph 工作流编排 | 掌握显式状态机、条件路由、持久化、中断、流式输出 |
| D | Deep Agents 长任务系统 | 掌握规划、虚拟文件系统、subagents、skills、memory、权限 |
| E | LangSmith 调试与评测 | 建立 tracing、dataset、evaluator、experiment 和 CI 质量门禁 |
| F | 生产化 Capstone | 整合前面所有能力，完成工程级研究代理 |

## 最终项目

最终项目是 `Engineering Research Agent`：

1. 能加载本地课程资料、网页资料和用户指定资料。
2. 能进行 2-step RAG、agentic RAG 和 hybrid retrieval。
3. 能用 LangGraph 编排检索、证据评估、回答生成、人工审核和发布。
4. 能用 Deep Agents 处理长任务、多文件产物、subagents 和技能加载。
5. 能用 LangSmith 追踪、调试、评测和比较实验。
6. 对高风险工具调用提供 HITL 审批。

## 目录结构

- `curriculum.ts`：结构化课程数据，可被脚本、测试或后续页面读取。
- `print-course-map.ts`：打印完整课程地图。
- `print-lesson.ts`：按课程编号打印单节课入口。
- `lessons/`：可跟学的进阶 lesson playbook。
- `modules/01-langchain-agent-engineering.md`：LangChain 进阶。
- `modules/02-rag-engineering.md`：RAG 工程。
- `modules/03-langgraph-workflows.md`：LangGraph 编排。
- `modules/04-deep-agents.md`：Deep Agents。
- `modules/05-langsmith-evaluation.md`：LangSmith 评测与观测。
- `modules/06-production-capstone.md`：生产化最终项目。

## 官方文档入口

- [LangChain.js overview](https://docs.langchain.com/oss/javascript/langchain/overview)
- [LangChain.js agents](https://docs.langchain.com/oss/javascript/langchain/agents)
- [LangGraph.js overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [Deep Agents overview](https://docs.langchain.com/oss/javascript/deepagents/overview)
- [LangSmith Evaluation](https://docs.langchain.com/langsmith/evaluation)
