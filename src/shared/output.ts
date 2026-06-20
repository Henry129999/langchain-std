/**
 * 打印 Agent 返回结果中的最后一条消息。
 *
 * LangChain 的调用结果通常包含完整消息列表；学习阶段先关注最后一条，
 * 可以最快看到模型最终给用户的回答。
 */
export function printLastMessage(result: { messages?: unknown[] }): void {
  const messages = result.messages ?? [];
  const last = messages[messages.length - 1];
  console.dir(last, { depth: 6 });
}
