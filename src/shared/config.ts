import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

export const modelName = process.env.GLM_MODEL || "glm-5.2";
export const glmBaseUrl =
  process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4";

/**
 * 检查当前环境是否配置了智谱 GLM API Key。
 *
 * 本课程统一使用智谱 GLM 模型。真实 Key 只应该放在本地 `.env` 中，
 * 不要写进 `.env.example`，也不要提交到 Git。
 */
export function requireModelEnvironment(): void {
  if (!process.env.GLM_API_KEY) {
    throw new Error(
      "没有找到 GLM_API_KEY。请复制 .env.example 为 .env，并填写智谱 GLM API Key。"
    );
  }
}

/**
 * 创建课程统一使用的 GLM 聊天模型。
 *
 * 智谱开放平台的 `/chat/completions` 接口兼容 OpenAI 风格请求，
 * 所以这里使用 `@langchain/openai` 的 ChatOpenAI 适配器，并把 baseURL
 * 指向 `https://open.bigmodel.cn/api/paas/v4`。
 */
export function createCourseModel(options?: {
  temperature?: number;
  timeout?: number;
  maxTokens?: number;
}): ChatOpenAI {
  requireModelEnvironment();

  return new ChatOpenAI({
    model: modelName,
    temperature: options?.temperature ?? 1,
    timeout: options?.timeout ?? 300_000,
    maxTokens: options?.maxTokens ?? 4096,
    apiKey: process.env.GLM_API_KEY,
    configuration: {
      baseURL: glmBaseUrl,
    },
    modelKwargs: {
      thinking: {
        type: "enabled",
      },
    },
  });
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
  console.log(`模型接口：${glmBaseUrl}`);
}
