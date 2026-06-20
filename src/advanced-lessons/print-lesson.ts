import { advancedCurriculum } from "./curriculum.js";

const lessonId = process.argv[2]?.toUpperCase();

const lessonFiles: Record<string, string> = {
  A: "src/advanced-lessons/lessons/01-langchain-agent-engineering-lessons.md",
  B: "src/advanced-lessons/lessons/02-rag-engineering-lessons.md",
  C: "src/advanced-lessons/lessons/03-langgraph-workflows-lessons.md",
  D: "src/advanced-lessons/lessons/04-deep-agents-lessons.md",
  E: "src/advanced-lessons/lessons/05-langsmith-evaluation-lessons.md",
  F: "src/advanced-lessons/lessons/06-production-capstone-lessons.md",
};

if (!lessonId) {
  console.log("\n请指定课程编号，例如：npm run advanced:lesson -- A01\n");
  console.log("可用课程：");

  for (const module of advancedCurriculum) {
    const ids = module.lessons.map((lesson) => lesson.id).join(", ");
    console.log(`${module.title}: ${ids}`);
  }

  process.exit(0);
}

const lesson = advancedCurriculum
  .flatMap((module) =>
    module.lessons.map((item) => ({
      ...item,
      moduleTitle: module.title,
      moduleOutcome: module.outcome,
    }))
  )
  .find((item) => item.id === lessonId);

if (!lesson) {
  throw new Error(`没有找到课程编号：${lessonId}`);
}

const lessonFile = lessonFiles[lessonId.slice(0, 1)];

console.log(`\n=== ${lesson.id} ${lesson.title} ===`);
console.log(`模块：${lesson.moduleTitle}`);
console.log(`模块目标：${lesson.moduleOutcome}`);
console.log(`工程重点：${lesson.engineerFocus}`);
console.log(`实操产物：${lesson.deliverable}`);
console.log(`课程文件：${lessonFile}`);
console.log(`官方文档：${lesson.officialDocs.join(" | ")}`);
