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
 *
 * ChatOpenAI 常用学习索引：
 *
 * 构造参数：
 * - model：模型名称，例如 glm-5.2、gpt-4o、gpt-4.1。
 * - apiKey：模型服务商 API Key。
 * - temperature：采样温度，控制输出随机性。
 * - timeout：请求超时时间，单位毫秒。
 * - maxRetries：请求失败后的最大重试次数，适合处理临时网络或限流问题。
 * - stop：停止词，模型生成到指定字符串时停止。
 * - streaming：是否启用 token 流式输出；也可以直接调用 stream()。
 * - callbacks：LangChain 回调，用于日志、追踪、自定义监控。
 * - configuration.baseURL：OpenAI-compatible endpoint 地址。
 * - configuration.defaultHeaders：给底层 HTTP 请求追加默认请求头。
 * - configuration.defaultQuery：给底层 HTTP 请求追加默认 query 参数。
 * - modelKwargs：透传给具体模型服务商的非标准扩展参数。
 *
 * 实例方法：
 * - invoke(input)：单次调用模型，返回一条 AIMessage。
 * - stream(input)：流式调用模型，返回可异步迭代的消息 chunk。
 * - batch(inputs)：批量调用同一个模型配置。
 * - bindTools(tools)：把工具绑定到模型，常用于 function/tool calling。
 * - withStructuredOutput(schema)：约束模型按结构化 schema 输出。
 * - withConfig(config)：给 Runnable 附加 tags、metadata、runName 等运行配置。
 * - withRetry(options)：给模型调用加重试策略。
 * - withFallbacks(models)：主模型失败时切换到备用模型。
 * - pipe(next)：把模型输出接到下一个 Runnable，组成链式流程。
 */
export function createCourseModel(options?: {
  /** 控制模型输出随机性；越低越稳定，越高越发散。 */
  temperature?: number;
  /** 单次模型请求的超时时间，单位是毫秒。 */
  timeout?: number;
}): ChatOpenAI {
  requireModelEnvironment();

  return new ChatOpenAI({
    // 实际请求的模型名，优先来自 `.env` 的 GLM_MODEL，默认使用 glm-5.2。
    model: modelName,

    // 采样温度；课程默认偏开放，严谨抽取或结构化输出时建议传入更低值。
    temperature: options?.temperature ?? 1,

    // HTTP 请求超时；长文本研究任务可能需要更长等待时间。
    timeout: options?.timeout ?? 300_000,

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
