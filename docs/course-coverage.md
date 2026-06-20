# Course Coverage

This file maps the LangChain-only curriculum to runnable lessons or project files.

| Curriculum chapter | Covered by | Notes |
| --- | --- | --- |
| 01. Environment, model, project skeleton | `src/lessons/01-environment-model.ts`, `src/shared/config.ts` | Covers provider isolation, env config, and first model call. |
| 02. Messages and model calls | `src/lessons/02-messages-and-model.ts` | Covers messages as explicit context and direct model invocation. |
| 03. Prompt and context engineering | `src/lessons/03-prompt-context.ts`, `src/prompts/research-assistant.ts` | Covers role, data boundaries, refusal behavior, and prompt injection awareness. |
| 04. Tool design basics | `src/lessons/04-tool-design.ts`, `src/tools/weather.ts` | Covers multi-tool selection, Zod schemas, and tool descriptions. |
| 05. First LangChain Agent | `src/lessons/05-first-agent.ts` | Covers `createAgent`, tool-calling loop, tags, metadata, and message trace. |
| 06. Tool engineering best practices | `src/lessons/06-tool-engineering.ts`, `src/tools/fetch-text-from-url.ts`, `src/tools/local-file.ts` | Covers protocol/path limits, timeouts, size limits, and stable error payloads. |
| 07. Structured output | `src/lessons/07-structured-output.ts`, `src/shared/schemas.ts` | Covers `responseFormat`, `toolStrategy`, and `structuredResponse`. |
| 08. URL research project | `src/lessons/08-url-research-project.ts` | Covers URL input, tool-backed reading, grounded answer, evidence, and limitations. |
| 09. Local file QA | `src/lessons/09-local-file-qa.ts` | Covers safe local file reading and file-grounded answers. |
| 10. RAG intro | `src/lessons/10-rag-intro.ts`, `src/rag/simple-rag.ts` | Covers load, split, retrieve, cite, and answer. |
| 11. Streaming | `src/lessons/11-streaming.ts` | Covers streaming state updates for user-facing progress. |
| 12. LangSmith debugging and testing | `src/lessons/12-langsmith-debugging-testing.ts` | Covers trace flags and fake-model testing. |
