function getMessageType(message: unknown): string {
  if (typeof message === "object" && message !== null && "_getType" in message) {
    const value = (message as { _getType?: unknown })._getType;
    if (typeof value === "function") {
      return String(value.call(message));
    }
  }

  if (typeof message === "object" && message !== null && "role" in message) {
    return String((message as { role?: unknown }).role ?? "message");
  }

  return "message";
}

function getMessageContent(message: unknown): unknown {
  if (typeof message === "object" && message !== null && "content" in message) {
    return (message as { content?: unknown }).content;
  }

  return message;
}

/**
 * 打印 Agent 返回结果中的最后一条消息。
 *
 * LangChain Agent 的返回结果通常包含完整 messages。学习阶段可以先看最后
 * 一条消息；调试工具调用时再使用 `printMessages` 查看完整过程。
 */
export function printLastMessage(result: { messages?: unknown[] }): void {
  const messages = result.messages ?? [];
  const last = messages[messages.length - 1];

  console.log("\n--- last message ---");
  console.dir(last, { depth: 6 });
}

/**
 * 打印完整消息轨迹，方便观察 model -> tool -> model 的 Agent loop。
 */
export function printMessages(result: { messages?: unknown[] }): void {
  const messages = result.messages ?? [];

  console.log("\n--- messages ---");
  messages.forEach((message, index) => {
    console.log(`\n[${index}] ${getMessageType(message)}`);
    console.dir(getMessageContent(message), { depth: 4 });
  });
}

/**
 * 打印 `createAgent({ responseFormat })` 返回的结构化结果。
 */
export function printStructuredResponse(result: {
  structuredResponse?: unknown;
}): void {
  console.log("\n--- structured response ---");
  console.dir(result.structuredResponse, { depth: 6 });
}
