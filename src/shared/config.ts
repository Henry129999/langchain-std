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
  /** 控制模型输出随机性；越低越稳定，越高越发散。 */
  temperature?: number;
  /** 单次模型请求的超时时间，单位是毫秒。 */
  timeout?: number;
  /** 模型单次回复最多生成的 token 数，不是输入上下文长度。 */
  maxTokens?: number;
}): ChatOpenAI {
  requireModelEnvironment();

  return new ChatOpenAI({
    // 实际请求的模型名，优先来自 `.env` 的 GLM_MODEL，默认使用 glm-5.2。
    model: modelName,

    // 采样温度；课程默认偏开放，严谨抽取或结构化输出时建议传入更低值。
    temperature: options?.temperature ?? 1,

    // HTTP 请求超时；长文本研究和 Deep Agent 任务可能需要更长等待时间。
    timeout: options?.timeout ?? 300_000,

    // 输出长度上限；回答被截断时通常需要提高这个值并检查 finish_reason。
    maxTokens: options?.maxTokens ?? 4096,

    // 智谱 GLM API Key；requireModelEnvironment 会在缺失时提前抛出清晰错误。
    apiKey: process.env.GLM_API_KEY,

    // OpenAI SDK 底层配置；baseURL 指向 GLM 的 OpenAI-compatible endpoint。
    configuration: {
      // 最终请求会发送到 `${baseURL}/chat/completions` 这一类兼容接口。
      baseURL: glmBaseUrl,
    },

    // 透传给模型服务商的非标准扩展参数；这里启用 GLM 的 thinking 能力。
    modelKwargs: {
      thinking: {
        // 启用后响应中可能出现 reasoning_content 和 reasoning token 统计。
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
