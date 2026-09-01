// The entry point for typedoc, which generates the methods, options, events
// and node references in the documentation. It exports only what those pages
// document, so nothing else gets a page.
export { default as HtmlTree } from "../src/index";
export type { HtmlTreeOptions, TreeEvents } from "../src/index";
export { Node } from "../src/node";
