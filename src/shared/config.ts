import "dotenv/config";

export const modelName = process.env.LANGCHAIN_MODEL || "gpt-5.5";

/**
 * 检查当前环境是否配置了至少一个模型服务商的 API Key。
 *
 * LangChain 可以连接多个模型服务商；课程脚本不绑定某一个服务商，
 * 因此这里统一检查常见环境变量，只要存在一个就允许继续运行。
 */
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
      "没有找到模型服务商 API Key。请复制 .env.example 为 .env，并至少填写一个服务商的 Key。"
    );
  }
}

/**
 * 打印课程标题和当前模型名称。
 *
 * 每节课开始时都调用它，方便你在终端里确认正在运行哪一课，
 * 以及当前 `.env` 中选择的是哪个模型。
 */
export function printLessonHeader(title: string): void {
  console.log(`\n=== ${title} ===`);
  console.log(`当前模型：${modelName}`);
}
