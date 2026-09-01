/* Rewrites the cross-reference links in the typedoc output.
 *
 * Typedoc links between the generated files, for example from a method's
 * `Node` return type to classes/Node.md. The generated files are not pages of
 * their own: each one is included into a page under docs/reference. This
 * script points the links at those pages instead.
 */
import fs from "node:fs/promises";
import path from "node:path";

const generatedDirectory = path.join(
    import.meta.dirname,
    "../reference/generated",
);

const files = {
    "classes/HtmlTree.md": "/reference/methods",
    "classes/Node.md": "/reference/node",
    "interfaces/HtmlTreeOptions.md": "/reference/options",
    "interfaces/TreeEvents.md": "/reference/events",
};

const pageForBasename = Object.fromEntries(
    Object.entries(files).map(([file, page]) => [path.basename(file), page]),
);

// Matches the target of a markdown link to a generated file, up to an
// optional #anchor. Typedoc writes the target relative to the linking file,
// for example "Node.md#getlevel" or "../classes/Node.md#getlevel".
const linkRegExp =
    /\]\((?:\.\.\/)?(?:(?:classes|interfaces)\/)?([A-Za-z]+\.md)(#[^)]*)?\)/g;

for (const file of Object.keys(files)) {
    const filePath = path.join(generatedDirectory, file);
    const content = await fs.readFile(filePath, "utf8");

    const newContent = content.replaceAll(
        linkRegExp,
        (match, basename, anchor) => {
            const page = pageForBasename[basename];

            if (!page) {
                throw new Error(`Unknown link target: ${match}`);
            }

            return `](${page}${anchor ?? ""})`;
        },
    );

    await fs.writeFile(filePath, newContent);
}
