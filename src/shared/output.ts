export function printLastMessage(result: { messages?: unknown[] }): void {
  const messages = result.messages ?? [];
  const last = messages[messages.length - 1];
  console.dir(last, { depth: 6 });
}
