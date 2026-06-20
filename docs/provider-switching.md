# Provider Switching Notes

The runnable lessons use GLM through `@langchain/openai` because the GLM chat completions endpoint is OpenAI-compatible. The tutorial also mentions trying OpenAI, Gemini, and Ollama. Treat these as provider-specific extensions instead of mixing all dependencies into the base course.

## OpenAI-Compatible Providers

For OpenAI or another OpenAI-compatible endpoint, keep `ChatOpenAI` and change environment variables:

```text
GLM_API_KEY=your-provider-key
GLM_MODEL=your-model
GLM_BASE_URL=https://api.openai.com/v1
```

If you switch to the official OpenAI API, you may also rename these variables in `src/shared/config.ts` to generic names such as `MODEL_API_KEY`, `MODEL_NAME`, and `MODEL_BASE_URL`.

## Gemini

Gemini usually uses a dedicated LangChain integration package. Install the current package from LangChain documentation, then create a separate model factory, for example `createGeminiModel`, instead of changing every lesson file.

## Ollama

Ollama runs locally. Start the Ollama service, pull a local model, then create a separate model factory, for example `createOllamaModel`. Local models often have smaller context windows and weaker tool-calling behavior, so test lessons 01 to 03 before trying long-document lessons.

## Course Design Rule

Keep lesson logic independent of provider choice:

- Lesson files should import a model factory.
- Provider credentials should stay in `.env`.
- Tool definitions should not depend on a model provider.
- Provider-specific parameters should stay inside `src/shared/config.ts` or a dedicated provider config file.
