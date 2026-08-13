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
the time the constructor returns. Add the listener to the element *before* creating the tree:

```js
const element = document.getElementById("tree1");

element.addEventListener("tree.init", () => {
  /* ... */
});

const tree = new HtmlTree({ data, htmlElement: element });
```

## tree.click

Dispatched when a node title is clicked.

| `detail`      | Type         |
| ------------- | ------------ |
| `node`        | `Node`       |
| `click_event` | `MouseEvent` |

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

| `detail`      | Type         |
| ------------- | ------------ |
| `node`        | `Node`       |
| `click_event` | `MouseEvent` |

## tree.select

Dispatched when the selection changes.

| `detail`          | Type           | When                                             |
| ----------------- | -------------- | ------------------------------------------------ |
| `node`            | `Node \| null` | The selected node; `null` when it was deselected. |
| `deselected_node` | `Node \| null` | The node that was selected before, if any.        |
| `previous_node`   | `Node`         | Only on deselection: the node that was selected.  |

```js
element.addEventListener("tree.select", (e) => {
  if (e.detail.node) {
    console.log("selected", e.detail.node.name);
  } else {
    console.log("deselected", e.detail.previous_node.name);
  }
});
```

## tree.open

Dispatched when a folder is opened, after the animation.

| `detail` | Type   |
| -------- | ------ |
| `node`   | `Node` |

## tree.close

Dispatched when a folder is closed, after the animation. Same `detail` as `tree.open`.

## tree.move

Dispatched when a node is dropped after a drag.

| `detail`                     | Type                              |
| ---------------------------- | --------------------------------- |
| `move_info.moved_node`       | `Node`                            |
| `move_info.target_node`      | `Node`                            |
| `move_info.position`         | `"before" \| "after" \| "inside"` |
| `move_info.previous_parent`  | `Node \| null`                    |
| `move_info.original_event`   | `Event`                           |
| `move_info.do_move`          | `() => void`                      |

Call `preventDefault()` to keep the tree as it is, and `move_info.do_move()` to apply the move later.
See [Drag and drop](../guide/drag-and-drop#reacting-to-a-move).

## tree.load_data

Dispatched when data is loaded into the tree, both from the `data` option and from a url.

| `detail`      | Type                | Notes                                                     |
| ------------- | ------------------- | --------------------------------------------------------- |
| `tree_data`   | `NodeData[] \| null` |                                                          |
| `parent_node` | `Node \| undefined` | The node whose children were replaced, if it was a subtree. |

## tree.loading_data

Dispatched when a request starts and when it finishes.

| `detail`    | Type           |
| ----------- | -------------- |
| `isLoading` | `boolean`      |
| `node`      | `Node \| null` |
| `element`   | `HTMLElement`  |

## tree.refresh

Dispatched after the tree has been re-rendered. No `detail`.

## Dispatching events differently

The `overrideTriggerEventProvider` option replaces the whole mechanism, if you want the tree to
report to something other than DOM events. See
[Options](./options#overridetriggereventprovider).
