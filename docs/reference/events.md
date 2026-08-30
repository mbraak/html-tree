# Events

The tree dispatches `CustomEvent`s on the element it was created in. They bubble and they are
cancelable, and their data is in `event.detail`:

```js
const element = document.getElementById("tree1");

element.addEventListener("tree.click", (e) => {
  console.log(e.detail.node.name);
});
```

Everything you do in this tree is logged below it, most recent first:

<TreeDemo demo="dragAndDrop" events />

Because the events bubble, you can also listen higher up in the document, which is handy when the
tree is re-created:

```js
document.addEventListener("tree.select", (e) => {
  console.log(e.detail.node);
});
```

## tree.init

Dispatched once, after the tree is rendered for the first time. With `dataUrl` this is after the data
has arrived, so it is the moment the api is safe to use:

```js
element.addEventListener("tree.init", () => {
  tree.selectNode(tree.getNodeByName("node1"));
});
```

No `detail`.

With inline `data`, the tree is rendered inside the constructor, so this event has already fired by
the time the constructor returns. Add the listener to the element _before_ creating the tree:

```js
const element = document.getElementById("tree1");

element.addEventListener("tree.init", () => {
  /* ... */
});

const tree = new HtmlTree({ data, htmlElement: element });
```

## tree.click

Dispatched when a node title is clicked.

| `detail`        | Type         |
| --------------- | ------------ |
| `node`          | `Node`       |
| `originalEvent` | `MouseEvent` |

Call `preventDefault()` to stop the tree from selecting the node:

```js
element.addEventListener("tree.click", (e) => {
  e.preventDefault();
  console.log("clicked", e.detail.node.name, "but not selected");
});
```

## tree.dblclick

Dispatched when a node title is double clicked. Same `detail` as `tree.click`.

## tree.contextmenu

Dispatched on a right click on a node, unless `useContextMenu` is `false`. The browser's own menu is
suppressed.

| `detail`        | Type         |
| --------------- | ------------ |
| `node`          | `Node`       |
| `originalEvent` | `MouseEvent` |

## tree.select

Dispatched when a node is selected. A deselection is [`tree.deselect`](#tree-deselect) instead, so
`node` is always a node here.

| `detail`         | Type           | When                                       |
| ---------------- | -------------- | ------------------------------------------ |
| `node`           | `Node`         | The node that is now selected.             |
| `deselectedNode` | `Node \| null` | The node that was selected before, if any. |

```js
element.addEventListener("tree.select", (e) => {
  console.log("selected", e.detail.node.name);
});
```

## tree.deselect

Dispatched when the selected node is deselected, which happens when it is clicked again or passed to
`selectNode` again. No `tree.select` is dispatched for it.

| `detail` | Type   |
| -------- | ------ |
| `node`   | `Node` |

```js
element.addEventListener("tree.deselect", (e) => {
  console.log("deselected", e.detail.node.name);
});
```

Selecting another node does not dispatch it — that is a `tree.select` with the previous node in
`deselectedNode`. It is also not dispatched with `mustToggle: false`, or by `selectNode(null)`,
`removeFromSelection`, `removeNode`, `loadData` and restoring a saved state.

## tree.open

Dispatched when a folder is opened, after the animation.

| `detail` | Type   |
| -------- | ------ |
| `node`   | `Node` |

## tree.close

Dispatched when a folder is closed, after the animation. Same `detail` as `tree.open`.

## tree.move

Dispatched when a node is dropped after a drag.

| `detail`                  | Type                              |
| ------------------------- | --------------------------------- |
| `moveInfo.movedNode`      | `Node`                            |
| `moveInfo.targetNode`     | `Node`                            |
| `moveInfo.position`       | `"before" \| "after" \| "inside"` |
| `moveInfo.previousParent` | `Node \| null`                    |
| `moveInfo.originalEvent`  | `Event`                           |
| `moveInfo.doMove`         | `() => void`                      |

Call `preventDefault()` to keep the tree as it is, and `moveInfo.doMove()` to apply the move later.
See [Drag and drop](../guide/drag-and-drop#reacting-to-a-move).

## tree.set_data

Dispatched when data is set on the tree, both from the `data` option and from a url.

| `detail`   | Type                      | Notes                                                       |
| ---------- | ------------------------- | ----------------------------------------------------------- |
| `treeData` | `NodeData[] \| undefined` |                                                             |
| `node`     | `Node \| undefined`       | The node whose children were replaced, if it was a subtree. |

## tree.loading_data

Dispatched when a request starts.

| `detail`  | Type                | Description                                              |
| --------- | ------------------- | -------------------------------------------------------- |
| `node`    | `Node \| undefined` | The node whose children are loading, if it is a subtree. |
| `element` | `HTMLElement`       |                                                          |

## tree.loaded_data

Dispatched when a request finishes.

| `detail`  | Type                | Description                                                |
| --------- | ------------------- | ---------------------------------------------------------- |
| `node`    | `Node \| undefined` | The node whose children were loaded, if it was a subtree.  |
| `element` | `HTMLElement`       |                                                            |

## tree.refresh

Dispatched after the tree has been re-rendered. No `detail`.

## Types

The package types the events by their name, so in TypeScript the `detail` needs no cast:

```ts
element.addEventListener("tree.click", (e) => {
  console.log(e.detail.node.name, e.detail.originalEvent.button);
});
```

This works on elements, on `document` and on `window`, in any file that imports `html-tree`.

Each event has its own `detail`, so a listener only sees the properties of the event it listens to:

```ts
element.addEventListener("tree.select", (e) => {
  console.log(
    "selected",
    e.detail.node.name,
    "instead of",
    e.detail.deselectedNode,
  );
});

element.addEventListener("tree.deselect", (e) => {
  console.log("deselected", e.detail.node.name);
});
```

The types are also exported, for a listener that is written separately:

```ts
import type { MoveInfo, TreeEvent, TreeEventName, TreeEvents } from "html-tree";

// TreeEvent<Name> is the CustomEvent, TreeEvents[Name] is its detail.
const onMove = (e: TreeEvent<"tree.move">): void => {
  const moveInfo: MoveInfo = e.detail.moveInfo;
  console.log(moveInfo.movedNode.name);
};

element.addEventListener("tree.move", onMove);

// TreeEventName is the name of any event: "tree.click" | "tree.close" | ...
const log = <Name extends TreeEventName>(
  name: Name,
  detail: TreeEvents[Name],
) => {
  console.log(name, detail);
};
```

## Dispatching events differently

The `overrideTriggerEventProvider` option replaces the whole mechanism, if you want the tree to
report to something other than DOM events. See
[Options](./options#overridetriggereventprovider).
