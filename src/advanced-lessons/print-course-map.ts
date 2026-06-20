import {
  advancedCurriculum,
  getAdvancedLessonCount,
} from "./curriculum.js";

console.log("\n=== LangChain 进阶课程地图 ===");
console.log(`模块数量：${advancedCurriculum.length}`);
console.log(`课程数量：${getAdvancedLessonCount()}`);
console.log("基础 12 课保持在 src/lessons，本进阶课程独立放在 src/advanced-lessons。\n");

for (const module of advancedCurriculum) {
  console.log(`\n${module.title}`);
  console.log(`目标：${module.outcome}`);

  for (const lesson of module.lessons) {
    console.log(`\n  ${lesson.id} ${lesson.title}`);
    console.log(`  工程重点：${lesson.engineerFocus}`);
    console.log(`  产物：${lesson.deliverable}`);
    console.log(`  官方文档：${lesson.officialDocs.join(" | ")}`);
  }
}
