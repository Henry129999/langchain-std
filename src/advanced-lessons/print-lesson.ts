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

const runnableCommands: Record<string, string> = {
  A01: "npm run advanced:a01",
  A02: "npm run advanced:a02",
  A03: "npm run advanced:a03",
  A04: "npm run advanced:a04",
  A05: "npm run advanced:a05",
  A06: "npm run advanced:a06",
  A07: "npm run advanced:a07",
  A08: "npm run advanced:a08",
  A09: "npm run advanced:a09",
  A10: "npm run advanced:a10",
  A11: "npm run advanced:a11",
  A12: "npm run advanced:a12",
  A13: "npm run advanced:a13",
  B01: "npm run advanced:b01",
  B02: "npm run advanced:b02",
  B03: "npm run advanced:b03",
  B04: "npm run advanced:b04",
  B05: "npm run advanced:b05",
  B06: "npm run advanced:b06",
  B07: "npm run advanced:b07",
  B08: "npm run advanced:b08",
  B09: "npm run advanced:b09",
  B10: "npm run advanced:b10",
  B11: "npm run advanced:b11",
  B12: "npm run advanced:b12",
  C01: "npm run advanced:c01",
  C02: "npm run advanced:c02",
  C03: "npm run advanced:c03",
  C04: "npm run advanced:c04",
  C05: "npm run advanced:c05",
  C06: "npm run advanced:c06",
  C07: "npm run advanced:c07",
  C08: "npm run advanced:c08",
  C09: "npm run advanced:c09",
  C10: "npm run advanced:c10",
  C11: "npm run advanced:c11",
  C12: "npm run advanced:c12",
  D01: "npm run advanced:d01",
  D02: "npm run advanced:d02",
  D03: "npm run advanced:d03",
  D04: "npm run advanced:d04",
  D05: "npm run advanced:d05",
  D06: "npm run advanced:d06",
  D07: "npm run advanced:d07",
  D08: "npm run advanced:d08",
  D09: "npm run advanced:d09",
  D10: "npm run advanced:d10",
  D11: "npm run advanced:d11",
  D12: "npm run advanced:d12",
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
if (runnableCommands[lesson.id]) {
  console.log(`实战命令：${runnableCommands[lesson.id]}`);
}
console.log(`官方文档：${lesson.officialDocs.join(" | ")}`);
