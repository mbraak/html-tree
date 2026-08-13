// Generates the static json files that the load-on-demand demo fetches.
// Each file holds the children of one node, the way a server would answer ?node=<id>.
import fs from "node:fs";
import path from "node:path";

// Usage: node docs/scripts/makeDemoFixtures.mjs docs/public/demo
const source = fs.readFileSync(
  new URL("../.vitepress/theme/exampleData.ts", import.meta.url),
  "utf8",
);

// Pull the exampleData literal out of the TypeScript module.
const start = source.indexOf("export const exampleData: DemoNodeData[] = ");
const literal = source.slice(
  source.indexOf("[", start),
  source.indexOf("\n];", start) + 2,
);
const exampleData = eval(literal);

const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });

const toFirstLevel = (nodes) =>
  nodes.map((node) => ({
    id: node.id,
    name: node.name,
    ...(node.children ? { load_on_demand: true } : {}),
  }));

const write = (name, data) => {
  fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);
  console.log(name, `(${data.length} node(s))`);
};

write("root.json", toFirstLevel(exampleData));

const writeChildren = (nodes) => {
  for (const node of nodes) {
    if (node.children) {
      write(`node-${node.id}.json`, toFirstLevel(node.children));
      writeChildren(node.children);
    }
  }
};

writeChildren(exampleData);
