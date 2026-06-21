import { z } from "zod";
import { printLessonHeader } from "../../shared/config.js";
import { printJson, printSection } from "./shared.js";

const McpToolPolicySchema = z.object({
  serverName: z.string(),
  transport: z.enum(["stdio", "http"]),
  toolNamespace: z.string(),
  exposedToModel: z.boolean(),
  timeoutMs: z.number().int().positive(),
  allowedRoles: z.array(z.enum(["engineer", "reviewer", "operator"])),
  auditFields: z.array(z.string()),
});

const candidatePolicies = [
  {
    serverName: "filesystem-readonly",
    transport: "stdio",
    toolNamespace: "fs_read",
    exposedToModel: true,
    timeoutMs: 10_000,
    allowedRoles: ["engineer", "reviewer"],
    auditFields: ["serverName", "toolName", "argsHash", "durationMs", "resultSize"],
  },
  {
    serverName: "external-writer",
    transport: "http",
    toolNamespace: "external_write",
    exposedToModel: false,
    timeoutMs: 5_000,
    allowedRoles: ["operator"],
    auditFields: [
      "serverName",
      "toolName",
      "argsHash",
      "approvalId",
      "durationMs",
      "status",
    ],
  },
];

printLessonHeader("进阶 13：MCP 集成与工具边界");

const parsed = candidatePolicies.map((policy) =>
  McpToolPolicySchema.parse(policy)
);

printJson("validated mcp tool policies", parsed);

printSection("engineering boundary");
console.log(
  "MCP 只是工具接入协议，不等于信任边界。远程工具仍需要 namespace、权限、超时、错误映射和审计字段。"
);
