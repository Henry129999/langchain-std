import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createCourseModel, printLessonHeader } from "../../shared/config.js";
import { asMessage, printJson, printSection } from "./shared.js";

printLessonHeader("进阶 02：模型、消息与 Invocation Config");

const stableModel = createCourseModel({ temperature: 0 });
const exploratoryModel = createCourseModel({ temperature: 0.8 });

const messages = [
  new SystemMessage("你是一个严谨的 LangChain.js 工程课程助教。"),
  new HumanMessage(
    "用两句话说明 invoke、stream、batch 的工程区别，不要写长篇解释。"
  ),
];

const stableResponse = await stableModel.invoke(messages, {
  runName: "advanced-02-stable-model",
  tags: ["advanced", "02", "model", "stable"],
  metadata: { lesson: "A02", temperature: 0 },
});

const exploratoryResponse = await exploratoryModel.invoke(messages, {
  runName: "advanced-02-exploratory-model",
  tags: ["advanced", "02", "model", "exploratory"],
  metadata: { lesson: "A02", temperature: 0.8 },
});

printSection("stable model content");
console.log(asMessage(stableResponse).content);

printJson("stable response metadata", {
  response_metadata: asMessage(stableResponse).response_metadata,
  usage_metadata: asMessage(stableResponse).usage_metadata,
});

printSection("exploratory model content");
console.log(asMessage(exploratoryResponse).content);

printJson("invocation config boundary", {
  modelFactoryOwns: ["provider", "baseURL", "model", "temperature", "timeout"],
  invocationConfigOwns: ["runName", "tags", "metadata", "callbacks"],
  businessRule: "业务规则不要散落在模型工厂里，通过 prompt、tool、schema 或 graph 表达。",
});
