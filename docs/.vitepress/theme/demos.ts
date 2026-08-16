import { withBase } from "vitepress";

import type { DemoNodeData } from "./exampleData";

import { copyData, exampleData, smallData } from "./exampleData";

interface DemoNode {
  id?: number | string;
  name: string;
}

// The options of a demo. Kept loose on purpose: the demos are written against the
// documented option names, not against the internal types.
export type DemoOptions = Record<string, unknown>;

// Every demo used by <TreeDemo demo="..." />. Factories, so each tree gets its own data.
export const demos: Record<string, () => DemoOptions> = {
  basic: () => ({
    autoOpen: 0,
    data: copyData(exampleData),
  }),

  buttonRight: () => ({
    autoOpen: 0,
    buttonLeft: false,
    data: copyData(smallData),
  }),

  dragAndDrop: () => ({
    autoOpen: 1,
    data: copyData(exampleData),
    dragAndDrop: true,
  }),

  // Only allow dropping a node into a folder, never between two nodes.
  dragIntoFoldersOnly: () => ({
    autoOpen: 1,
    data: copyData(smallData),
    dragAndDrop: true,
    onCanMoveTo: (
      _movedNode: unknown,
      targetNode: { isFolder: () => boolean },
      position: string,
    ) => position === "inside" && targetNode.isFolder(),
  }),

  icons: () => ({
    autoOpen: 0,
    closedIcon: "+",
    data: copyData(smallData),
    openedIcon: "−",
  }),

  // Fetches every subtree when it is opened. The urls are static json files under
  // docs/public/demo/, which stand in for a server that answers ?node=<id>.
  loadOnDemand: () => ({
    dataUrl: (node?: DemoNode) =>
      withBase(node?.id ? `/demo/node-${node.id}.json` : "/demo/root.json"),
  }),

  // Folders only: leaves cannot be selected.
  onlyFoldersSelectable: () => ({
    autoOpen: 0,
    data: copyData(smallData),
    onCanSelectNode: (node: { isFolder: () => boolean }) => node.isFolder(),
  }),

  // Mirrored, and draggable: the drop hints mirror too.
  rtl: () => ({
    autoOpen: 0,
    data: copyData(exampleData),
    dragAndDrop: true,
    rtl: true,
  }),

  // Remembers the open and selected nodes across page loads, under its own key.
  saveState: () => ({
    autoOpen: 0,
    data: copyData(exampleData),
    saveState: "html-tree-docs-demo",
  }),

  // A node with an empty children array, rendered as a folder.
  showEmptyFolder: () => ({
    data: [
      { children: [], id: 1, name: "empty folder" },
      { id: 2, name: "leaf" },
    ] satisfies DemoNodeData[],
    showEmptyFolder: true,
  }),

  withoutSlide: () => ({
    autoOpen: 0,
    data: copyData(smallData),
    slide: false,
  }),
};

export const getDemoOptions = (name: string): DemoOptions => {
  const demo = demos[name];

  if (!demo) {
    throw new Error(
      `Unknown demo "${name}". Available demos: ${Object.keys(demos).join(", ")}.`,
    );
  }

  return demo();
};
