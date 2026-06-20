# Course Coverage

This file maps the tutorial chapters to runnable lessons or project files.

| Tutorial chapter | Covered by | Notes |
| --- | --- | --- |
| 0. Learning goals | `README.md`, all lesson comments | The goals are spread across the lesson route and file headers. |
| 1. Environment setup | `README.md`, `.env.example`, `scripts/check-node-version.mjs` | Covers Node 22+, dependency installation, GLM variables, and PowerShell env examples. |
| 2. First Agent | `src/lessons/01-basic-agent.ts`, `src/tools/weather.ts` | Covers `createAgent`, `tool`, tool schema, and message input. |
| 3. Tool design | `src/lessons/02-tool-design.ts`, `src/tools/weather.ts`, `src/tools/fetch-text-from-url.ts` | Covers multiple tools, deterministic work, URL fetching, and tool boundaries. |
| 4. System Prompt | `src/lessons/03-system-prompt.ts`, `src/prompts/research-assistant.ts` | Covers role, limitations, output constraints, and anti-hallucination rules. |
| 5. Model config | `src/shared/config.ts`, `src/lessons/05-research-agent.ts` | Covers GLM through `ChatOpenAI`, temperature, timeout, max tokens, base URL, and thinking kwargs. |
| 6. Memory | `src/lessons/04-memory.ts` | Covers `MemorySaver` and `thread_id`. |
| 7. Agents vs Deep Agents | `src/lessons/05-research-agent.ts`, `src/lessons/06-deep-agent.ts` | Covers ordinary research Agent vs Deep Agent comparison. |
| 8. Tracing | `src/lessons/07-langsmith-tracing.ts`, `.env.example` | Covers LangSmith env variables and what to inspect in traces. |
| 9. Study route | `README.md`, `exercises/README.md` | Covers day-by-day learning tasks and per-lesson exercises. |
| 10. Expansion chapters | `src/lessons/09-structured-output.ts`, `src/lessons/10-local-file-qa.ts`, `src/lessons/11-database-tool.ts`, `docs/provider-switching.md` | Covers structured output, file QA, database tools, and provider switching guidance. |
| 11. First practical project | `src/lessons/08-url-research-project.ts` | Covers URL input, question input, URL fetching, grounded answer, evidence, and limitations. |
