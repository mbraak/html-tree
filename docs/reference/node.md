# Node

Every node in the tree is a `Node` object. You get them from the tree —
`getNodeById`, `getSelectedNode`, an event's `detail.node` — and they are what you pass back into the
tree's [methods](./methods).

```js
const node = tree.getNodeById(1);

node.name; // "node1"
node.isFolder(); // true
node.getLevel(); // 1
```

The root node is not rendered; it is a container for the top-level nodes:

```js
tree.getTree().children; // the top-level nodes
```

## Properties

| Property         | Type                    | Meaning                                                     |
| ---------------- | ----------------------- | ----------------------------------------------------------- |
| `name`           | `string`                | The label. Also settable from the `label` key in node data. |
| `id`             | `NodeId \| undefined`   | The id from the node data.                                  |
| `children`       | `Node[]`                | The child nodes.                                            |
| `parent`         | `Node \| null`          | The parent; `null` for the root node.                       |
| `tree`           | `Node \| undefined`     | The root node.                                              |
| `element`        | `HTMLElement \| undefined` | The `li` element, once the node is rendered.              |
| `is_open`        | `boolean`               | Whether the folder is open.                                 |
| `is_loading`     | `boolean`               | Whether the node's children are being fetched.              |
| `load_on_demand` | `boolean`               | Whether the children still have to be fetched.              |
| `isEmptyFolder`  | `boolean`               | Whether the node data had an empty `children` array.        |

Any other key in the node data is copied onto the node, so `{ name: "node1", color: "green" }`
gives you `node.color`.

## Inspecting a node

### isFolder()

- Returns: `boolean`

`true` when the node has children, or is marked `load_on_demand`.

### hasChildren()

- Returns: `boolean`

### getLevel()

- Returns: `number`

The depth of the node, counting the top level as `1`.

### isParentOf(node)

- `node`: `Node`
- Returns: `boolean`

Whether this node is an ancestor of the other node.

### getChildIndex(node)

- `node`: `Node`
- Returns: `number`

The position of a child in `children`, or `-1`.

## Moving around the tree

### getParent()

- Returns: `Node | null`

`null` for a top-level node — the root node is not returned.

### getPreviousSibling() / getNextSibling()

- Returns: `Node | null`

### getLastChild()

- Returns: `Node | null`

### getPreviousNode() / getNextNode(includeChildren?)

- `includeChildren`: `boolean` — default `true`
- Returns: `Node | null`

The previous or next node in the tree, regardless of whether it is visible. `getNextNode(false)`
skips the node's own children.

### getPreviousVisibleNode() / getNextVisibleNode()

- Returns: `Node | null`

The same, but skipping nodes inside closed folders — this is what the arrow keys use.

## Searching

These work on any node, and search that node's subtree. Called on the root node, they search the
whole tree — which is what the tree's own methods of the same name do.

### getNodeById(id)

- `id`: `number | string`
- Returns: `Node | null`

Only available on the root node, which keeps the id index.

### getNodeByName(name) / getNodeByNameMustExist(name)

- `name`: `string`
- Returns: `Node | null` / `Node`

### getNodeByCallback(callback)

- `callback`: `(node: Node) => boolean`
- Returns: `Node | null`

### getNodesByProperty(key, value)

- `key`: `string`
- `value`: `unknown`
- Returns: `Node[]`

### filter(callback)

- `callback`: `(node: Node) => boolean`
- Returns: `Node[]`

All nodes in the subtree for which the callback returns `true`.

```js
const folders = tree.getTree().filter((node) => node.isFolder());
```

### iterate(callback)

- `callback`: `(node: Node, level: number) => boolean`

Walks the subtree. Return `false` from the callback to stop descending into that node:

```js
tree.getTree().iterate((node, level) => {
  console.log(" ".repeat(level) + node.name);
  return level <= 2; // don't go deeper than level 2
});
```

## Changing the tree

::: warning
These methods change the data without re-rendering. The tree's [methods](./methods) —
`appendNode`, `removeNode`, `moveNode` and friends — do the same and refresh the display, so prefer
those. If you do use these, call `tree.refresh()` afterwards.
:::

### append(nodeData) / prepend(nodeData)

- `nodeData`: `NodeData`
- Returns: `Node`

Adds a child at the end or at the start.

### addBefore(nodeData) / addAfter(nodeData)

- `nodeData`: `NodeData`
- Returns: `Node | null`

Adds a sibling. `null` when the node has no parent.

### addParent(nodeData)

- `nodeData`: `NodeData`
- Returns: `Node | null`

Inserts a new parent between this node and its current parent.

### addChild(node) / addChildAtPosition(node, index)

- `node`: `Node`

Adds an existing `Node` object as a child.

### moveNode(movedNode, targetNode, position)

- `movedNode`: `Node`
- `targetNode`: `Node`
- `position`: `"before" | "after" | "inside"`
- Returns: `boolean` — `false` when the move is impossible, for instance moving a node into its own
  subtree

Called on the root node.

### remove()

Removes this node from its parent.

### removeChild(node) / removeChildren()

- `node`: `Node`

### setData(data)

- `data`: `NodeData`

Updates the node's properties from node data. `children` and `parent` are ignored. A string sets the
name.

### loadFromData(data)

- `data`: `NodeData[]`
- Returns: `this`

Replaces the children with new node data.

## Reading data back

### getData(includeParent?)

- `includeParent`: `boolean` — default `false`
- Returns: `NodeRecord[]`

The subtree as plain data, ready for `JSON.stringify`. Internal properties (`parent`, `children`,
`element`, `tree`, `idMapping`, `nodeClass`, `load_on_demand`, `isEmptyFolder`) are left out; your own
properties are kept.

```js
tree.getTree().getData();
// [{ name: "node1", id: 1, children: [{ name: "child1", id: 2 }] }]
```

With `includeParent: true`, the result is the node itself rather than its children.
