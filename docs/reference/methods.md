# Methods

Methods are called on the object returned by the constructor:

```js
const tree = new HtmlTree({ data, htmlElement });

tree.openNode(tree.getNodeById(1));
```

Select a node and try them here — the buttons call `appendNode`, `updateNode`, `removeNode`,
`openNode` and `closeNode`:

<TreeDemo demo="basic" api events />

## Finding nodes

### getNodeById(id)

- `id`: `number | string`
- Returns: `Node | null`

```js
const node = tree.getNodeById(1);
```

### getNodeByName(name)

- `name`: `string`
- Returns: `Node | null`

The first node with this name.

### getNodeByNameMustExist(name)

- `name`: `string`
- Returns: `Node`

Like `getNodeByName`, but throws when there is no such node. Convenient in tests and when a missing
node is a bug.

### getNodeByCallback(callback)

- `callback`: `(node: Node) => boolean`
- Returns: `Node | null`

The first node for which the callback returns `true`.

```js
const node = tree.getNodeByCallback((node) => node.id > 10);
```

### getNodesByProperty(key, value)

- `key`: `string`
- `value`: `unknown`
- Returns: `Node[]`

All nodes with this property value.

```js
tree.getNodesByProperty("color", "green");
```

### getNode(element)

- `element`: `HTMLElement`
- Returns: `Node | null`

The node that belongs to a `li` element the tree rendered.

### getTree()

- Returns: `Node`

The root node. It is not rendered; its `children` are the top-level nodes. Also available as the
`tree` property.

## Opening and closing

### openNode(node, slide?, onFinished?)

- `node`: `Node`
- `slide`: `boolean` — override the `slide` option for this call
- `onFinished`: `(node: Node) => void`

Opens a folder, and the folders above it. A node marked `load_on_demand` is fetched first, so use
`onFinished` when you need to know it is really open:

```js
tree.openNode(node, () => {
  console.log("open");
});
```

`slide` may be omitted, so both `openNode(node, onFinished)` and `openNode(node, false, onFinished)`
work.

### closeNode(node, slide?)

- `node`: `Node`
- `slide`: `boolean`

### toggle(node, slide?)

- `node`: `Node`
- `slide`: `boolean`

Closes an open node and opens a closed one.

## Selection

### selectNode(node, options?)

- `node`: `Node | null` — `null` clears the selection
- `options.mustSetFocus`: `boolean` — move focus to the node; default `true`
- `options.mustToggle`: `boolean` — deselect the node if it is already selected; default `false`

Replaces the selection, and opens the parents of the node.

### getSelectedNode()

- Returns: `Node | false`

The selected node, or `false` when nothing is selected.

### getSelectedNodes()

- Returns: `Node[]`

### addToSelection(node, mustSetFocus?)

- `node`: `Node`
- `mustSetFocus`: `boolean` — default `true`

Adds a node to the selection instead of replacing it.

### removeFromSelection(node)

- `node`: `Node`

### isNodeSelected(node)

- `node`: `Node`
- Returns: `boolean`

### moveUp() / moveDown()

Selects the previous or next visible node, like the arrow keys.

### scrollToNode(node)

- `node`: `Node`

Scrolls the node into view.

## Changing the tree

### appendNode(nodeData, parentNode)

- `nodeData`: `NodeData`
- `parentNode`: `Node`
- Returns: `Node`

Adds a node as the last child of a parent.

```js
tree.appendNode({ name: "child", id: 5 }, tree.getNodeById(1));
```

### prependNode(nodeData, parentNode)

- `nodeData`: `NodeData`
- `parentNode`: `Node`
- Returns: `Node`

Adds a node as the first child of a parent.

### addNodeBefore(nodeData, existingNode)

- Returns: `Node | null`

Adds a sibling before a node. Returns `null` when the node has no parent.

### addNodeAfter(nodeData, existingNode)

- Returns: `Node | null`

Adds a sibling after a node.

### addParentNode(nodeData, existingNode)

- Returns: `Node | null`

Inserts a new node between a node and its parent, taking the node as its child.

### updateNode(node, data)

- `node`: `Node`
- `data`: `NodeData`

Updates the data of a node and re-renders it. A string updates just the name:

```js
tree.updateNode(node, "new name");
tree.updateNode(node, { name: "new name", color: "red" });
```

Changing the `id` re-indexes the node. `children` and `parent` are ignored — use `loadData` or
`moveNode` for those.

### removeNode(node)

- `node`: `Node`

Removes a node and its children.

### moveNode(node, targetNode, position)

- `node`: `Node`
- `targetNode`: `Node`
- `position`: `"before" | "after" | "inside"`

```js
tree.moveNode(tree.getNodeById(2), tree.getNodeById(1), "inside");
```

### refresh()

Re-renders the whole tree. Needed after changing node data directly instead of through these
methods.

## Loading data

### loadData(data, parentNode?)

- `data`: `NodeData[] | null`
- `parentNode`: `Node` — replace this node's children instead of the whole tree

### loadDataFromUrl(url?, parentNode?, onFinished?)

- `url`: `string` — defaults to the `dataUrl` option
- `parentNode`: `Node`
- `onFinished`: `() => void`

Fetches data and loads it into the tree, or into `parentNode`.

## State

### getState()

- Returns: `{ open_nodes: NodeId[], selected_node: NodeId[] } | null`

The current state, whether or not `saveState` is enabled.

### getStateFromStorage()

- Returns: `SavedState | null`

The state as it is stored.

### setState(state)

- `state`: `SavedState`

Applies a state to the tree.

## Other

### toJson()

- Returns: `string`

The tree as a json string, including changes made through the api.

### isDragging()

- Returns: `boolean`

### refreshHitAreas()

Recomputes the drop targets. Call this if the layout changes during a drag.

### setOption(option, value)

- `option`: `string`
- `value`: `unknown`

Changes an option after construction. See [Options](./options#changing-an-option-later) for the
caveats.

### getVersion()

- Returns: `string`

### deinit()

Empties the element and removes the tree's document-level keyboard listener. Call it when you remove
the tree from the page.
