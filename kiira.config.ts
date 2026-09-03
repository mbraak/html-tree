import { defineConfig } from "kiira-core";

// Type-checks the code snippets in the docs against the real source. Run it with
// `pnpm docs-check`.
export default defineConfig({
    include: ["docs/**/*.md", "README.md"],
    // The typedoc output contains signatures, not runnable examples.
    exclude: ["docs/reference/generated/**"],
    tsconfig: "tsconfig.docs.json",
    languages: ["ts", "js"],
    // Most snippets assume a tree and its element already exist, like the
    // examples in the reference pages of any library. The default fixture
    // provides them, in a block so that a snippet can declare its own.
    // Self-contained snippets that import tree-element themselves use the
    // `standalone` fixture: ```js fixture=standalone
    defaultFixture: "example",
    fixtures: {
        example: {
            type: "wrap",
            before: `
                import TreeElement from "tree-element";
                const element = document.createElement("div");
                const htmlElement = element;
                const data = [{ name: "node1", id: 1 }];
                const tree = new TreeElement({ data, htmlElement });
                {
            `,
            after: "}",
        },
        standalone: { type: "prepend", content: "" },
    },
});
