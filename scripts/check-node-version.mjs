const requiredMajor = 22;
const [major] = process.versions.node.split(".").map(Number);

console.log(`Node.js ${process.versions.node}`);

if ((major ?? 0) < requiredMajor) {
  console.error(
    `This project follows the LangChain JavaScript quickstart and requires Node.js ${requiredMajor}+.`
  );
  console.error("Install or switch to Node.js 22+ before running the lesson scripts.");
  process.exitCode = 1;
} else {
  console.log("Node.js version is compatible.");
}
