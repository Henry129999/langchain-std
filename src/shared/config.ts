import "dotenv/config";

export const modelName = process.env.LANGCHAIN_MODEL || "gpt-5.5";

export function requireModelEnvironment(): void {
  const hasProviderKey = [
    "OPENAI_API_KEY",
    "GOOGLE_API_KEY",
    "ANTHROPIC_API_KEY",
    "OPENROUTER_API_KEY",
    "FIREWORKS_API_KEY",
    "BASETEN_API_KEY",
    "OLLAMA_API_KEY",
    "AZURE_OPENAI_API_KEY",
    "AWS_ACCESS_KEY_ID",
    "HUGGINGFACEHUB_API_TOKEN",
  ].some((key) => Boolean(process.env[key]));

  if (!hasProviderKey) {
    throw new Error(
      "No model provider API key found. Copy .env.example to .env and set at least one provider key."
    );
  }
}

export function printLessonHeader(title: string): void {
  console.log(`\n=== ${title} ===`);
  console.log(`Model: ${modelName}`);
}
