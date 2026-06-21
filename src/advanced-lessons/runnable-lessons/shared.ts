export interface ToolCallLike {
  id?: string;
  name?: string;
  args?: unknown;
}

export interface MessageLike {
  _getType?: () => string;
  content?: unknown;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCallLike[];
  response_metadata?: {
    finish_reason?: string;
    tokenUsage?: unknown;
  };
  usage_metadata?: unknown;
}

export interface AgentResultLike {
  messages?: unknown[];
  structuredResponse?: unknown;
}

export interface ChecklistItem {
  check: string;
  passed: boolean;
  why: string;
}

export function asMessage(message: unknown): MessageLike {
  return typeof message === "object" && message !== null
    ? (message as MessageLike)
    : {};
}

export function getMessageType(message: unknown): string {
  const value = asMessage(message);

  if (typeof value._getType === "function") {
    return value._getType();
  }

  if ("role" in value && typeof value.role === "string") {
    return value.role;
  }

  return "message";
}

export function getTextContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  return JSON.stringify(content);
}

export function getToolCalls(message: unknown): ToolCallLike[] {
  const value = asMessage(message);

  return Array.isArray(value.tool_calls) ? value.tool_calls : [];
}

export function getFinalAiMessage(result: AgentResultLike): MessageLike {
  const finalMessage = [...(result.messages ?? [])]
    .reverse()
    .find((message) => getMessageType(message) === "ai");

  return asMessage(finalMessage);
}

export function printSection(title: string): void {
  console.log(`\n--- ${title} ---`);
}

export function printChecklist(items: ChecklistItem[]): void {
  printSection("engineering checklist");
  console.table(items);
}

export function printAgentTrace(result: AgentResultLike): void {
  const messages = result.messages ?? [];

  printSection("step-by-step trace");
  messages.forEach((message, index) => {
    const value = asMessage(message);
    const type = getMessageType(message);
    const toolCalls = getToolCalls(message);

    console.log(`\n[${index}] ${type}`);

    if (toolCalls.length > 0) {
      console.log("tool_calls:");
      for (const toolCall of toolCalls) {
        console.log(`- ${toolCall.name}(${JSON.stringify(toolCall.args)})`);
      }
    }

    if (type === "tool") {
      console.log(`tool name: ${value.name ?? "unknown"}`);
      console.log(`tool_call_id: ${value.tool_call_id ?? "unknown"}`);
    }

    if (value.response_metadata?.finish_reason) {
      console.log(`finish_reason: ${value.response_metadata.finish_reason}`);
    }

    console.log(`content: ${getTextContent(value.content).slice(0, 700)}`);
  });
}

export function printAgentSummary(result: AgentResultLike): void {
  const messages = result.messages ?? [];
  const toolCalls = messages.flatMap(getToolCalls);
  const toolMessages = messages.filter((message) => getMessageType(message) === "tool");

  printSection("agent summary");
  console.log(`message count: ${messages.length}`);
  console.log(`message types: ${messages.map(getMessageType).join(" -> ")}`);
  console.log(
    `requested tools: ${
      toolCalls.map((toolCall) => toolCall.name ?? "unknown").join(", ") || "none"
    }`
  );
  console.log(`tool result count: ${toolMessages.length}`);
}

export function printFinalAnswer(result: AgentResultLike): void {
  printSection("final answer field");
  console.log(getTextContent(getFinalAiMessage(result).content));
}

export function printStructuredResponse(result: AgentResultLike): void {
  printSection("structured response");
  console.dir(result.structuredResponse, { depth: 8 });
}

export function printJson(title: string, value: unknown): void {
  printSection(title);
  console.dir(value, { depth: 8 });
}

export function printLearningFocus(items: string[]): void {
  printSection("this lesson focuses on");
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
}

export function printModelMessage(message: unknown): void {
  const value = asMessage(message);

  printSection("real model response");
  console.log(getTextContent(value.content));

  printSection("model metadata");
  console.dir(
    {
      response_metadata: value.response_metadata,
      usage_metadata: value.usage_metadata,
    },
    { depth: 6 }
  );
}
