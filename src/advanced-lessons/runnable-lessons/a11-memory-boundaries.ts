import { printLessonHeader } from "../../shared/config.js";
import { printJson, printSection } from "./shared.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LongTermMemory {
  userId: string;
  key: string;
  value: string;
  reason: string;
  writable: boolean;
}

function trimMessages(messages: ChatMessage[], keepLast: number): ChatMessage[] {
  return messages.slice(Math.max(0, messages.length - keepLast));
}

function summarizeMessages(messages: ChatMessage[]): string {
  return messages
    .map((message) => `${message.role}: ${message.content}`)
    .join(" | ")
    .slice(0, 240);
}

function shouldWriteLongTermMemory(message: ChatMessage): boolean {
  return (
    message.role === "user" &&
    message.content.includes("以后") &&
    !message.content.includes("邮箱") &&
    !message.content.includes("token")
  );
}

printLessonHeader("进阶 11：短期记忆与长期记忆");

const threadMessages: ChatMessage[] = [
  { role: "user", content: "我已经学完基础 12 课。" },
  { role: "assistant", content: "下一步可以学习进阶 Agent 工程化。" },
  { role: "user", content: "以后解释课程时，请默认按照工程师视角。" },
  { role: "assistant", content: "已理解，会关注机制、边界和调试路径。" },
  { role: "user", content: "这节课讲一下 memory 的边界。" },
];

const shortTermWindow = trimMessages(threadMessages, 3);
const sessionSummary = summarizeMessages(threadMessages.slice(0, -3));

const longTermCandidates: LongTermMemory[] = threadMessages
  .filter(shouldWriteLongTermMemory)
  .map((message) => ({
    userId: "demo-user",
    key: "course_explanation_style",
    value: "默认按照工程师视角解释课程，关注机制、边界和调试路径。",
    reason: `从用户消息提取：${message.content}`,
    writable: true,
  }));

printJson("short-term memory window", shortTermWindow);
printJson("session summary", sessionSummary);
printJson("long-term memory candidates", longTermCandidates);

printSection("engineering rule");
console.log(
  "短期记忆服务当前 thread；长期记忆只写稳定、可复用、用户允许、非敏感的信息。"
);
