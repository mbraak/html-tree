# Options

All options are passed to the constructor:

```js
const tree = new HtmlTree({
  autoOpen: 0,
  data,
  dragAndDrop: true,
  htmlElement: document.getElementById("tree1"),
});
```

`htmlElement` is required; the rest is optional.

## Data

### htmlElement

- Type: `HTMLElement`
- Required

The element the tree is rendered into. Its content is replaced.

### data

- Type: `NodeData[]`
- Default: `undefined`

The nodes of the tree. See [Data](../guide/data) for the format.

### dataUrl

- Type: `string | ((node?: Node) => string)`
- Default: the element's `data-url` attribute

A url to fetch the data from, or a function that returns one. The function is called with the node
that is being loaded, and without an argument for the initial load. See
[Loading on demand](../guide/loading-on-demand).

### dataFilter

- Type: `(data: unknown) => NodeData[]`
- Default: `undefined`

Transforms a response from `dataUrl` into node data. Use it when the server wraps the nodes in
another object.

### autoEscape

- Type: `boolean`
- Default: `true`

Escape node names. With `false`, names are inserted as html — only do that for data you control.

## Appearance

### autoOpen

- Type: `boolean | number`
- Default: `false`

Which levels are open initially: `false` none, `true` all, a number that many levels starting at
`0` (so `0` opens the top level, `1` the first two levels).

### buttonLeft

- Type: `boolean`
- Default: `true`

Put the open/close button before the node title. With `false` it goes after it.

### closedIcon

- Type: `HTMLElement | string`
- Default: `"&#x25ba;"` (`►`), or `"&#x25c0;"` (`◀`) when `rtl` is true

The icon of a closed folder. A string is inserted as html; an element is cloned for every node.

### openedIcon

- Type: `HTMLElement | string`
- Default: `"&#x25bc;"` (`▼`)

The icon of an open folder.

### rtl

- Type: `boolean`
- Default: the element's `data-rtl` attribute, otherwise `false`

Mirror the tree for right-to-left languages.

### showEmptyFolder

- Type: `boolean`
- Default: `false`

Render a node with `children: []` as a folder instead of as a leaf.

### slide

- Type: `boolean`
- Default: `true`

Animate opening and closing folders.

### animationSpeed

- Type: `"fast" | "slow" | number`
- Default: `"fast"`

The duration of the slide animation: `"fast"` is 200ms, `"slow"` is 600ms, a number is milliseconds.

### onCreateLi

- Type: `(node: Node, li: HTMLElement, isSelected: boolean) => void`
- Default: `undefined`

Called after the `li` of a node is created, so you can add to it. See
[Styling](../guide/styling#customizing-the-markup).

### classPrefix

- Type: `string`
- Default: `"html-tree"`

The prefix of the css classes the widget puts on the elements it creates: with `"my-tree"` a title
gets `my-tree-title` instead of `html-tree-title`. The bundled stylesheet uses the default prefix, so
change it only if you bring your own css. See
[Styling](../guide/styling#changing-the-class-names).

### commonClassName

- Type: `string`
- Default: `"<classPrefix>-common"`

The class that every element of the widget gets.

### treeClassName

- Type: `string`
- Default: the value of `classPrefix`

The class of the root `ul`.

## Selection

### selectable

- Type: `boolean`
- Default: `true`

Allow the user to select nodes.

### onCanSelectNode

- Type: `(node: Node) => boolean`
- Default: `undefined`

Called before a node is selected. Return `false` to refuse.

### keyboardSupport

- Type: `boolean`
- Default: `true`

Handle the arrow keys when the focus is on the tree. See
[Selection](../guide/selection#keyboard-navigation).

### tabIndex

- Type: `number`
- Default: `0`

The `tabindex` of the selected node's title, which is what makes the tree focusable.

### useContextMenu

- Type: `boolean`
- Default: `true`

Handle right clicks on a node: the browser menu is suppressed and
[`tree.contextmenu`](./events#tree-contextmenu) is dispatched instead.

## Drag and drop

### dragAndDrop

- Type: `boolean`
- Default: `false`

Let the user move nodes by dragging them.

### onCanMove

- Type: `(node: Node) => boolean`
- Default: `undefined`

Called before a drag starts. Return `false` to keep the node in place.

### onCanMoveTo

- Type: `(movedNode: Node, targetNode: Node, position: string) => boolean`
- Default: `undefined`

Called for a possible drop. `position` is `"before"`, `"after"` or `"inside"`. Return `false` to
refuse the drop.

### onIsMoveHandle

- Type: `(element: HTMLElement) => boolean`
- Default: `undefined`

Decides whether an element inside a node starts a drag. Without it, the whole node is a handle.

### onDragMove

- Type: `(node: Node, event: Event | Touch) => void`
- Default: `undefined`

Called while a node is being dragged.

### onDragStop

- Type: `(node: Node, event: Event | Touch) => void`
- Default: `undefined`

Called when a drag ends.

### openFolderDelay

- Type: `number | false`
- Default: `500`

How long, in milliseconds, a closed folder has to be hovered during a drag before it opens. `false`
never opens folders while dragging.

### startDndDelay

- Type: `number`
- Default: `300`

How long, in milliseconds, the mouse has to be held down on a node before a drag starts.

## State

### saveState

- Type: `boolean | string`
- Default: `false`

Remember the open and selected nodes in `localStorage`. A string is used as the storage key;
`true` uses `tree`. See [Saving state](../guide/saving-state).

### onGetStateFromStorage

- Type: `() => string`
- Default: `undefined`

Read the saved state, as a json string, from somewhere other than `localStorage`.

### onSetStateFromStorage

- Type: `(state: string) => void`
- Default: `undefined`

Write the state, as a json string, to somewhere other than `localStorage`.

## Loading

### onLoading

- Type: `(isLoading: boolean, node: Node | undefined, element: HTMLElement) => void`
- Default: `undefined`

Called when a request starts and when it finishes. `node` is undefined for the initial load, and
`element` is the element that is loading.

### onLoadFailed

- Type: `(response: Response) => void`
- Default: `undefined`

Called with the `Response` when a request fails.

## Advanced

### nodeClass

- Type: `typeof Node`
- Default: `Node`

The class used to create nodes. Subclass [`Node`](./node) to add your own methods:

```js
import HtmlTree from "html-tree/lib/index.js";
import { Node } from "html-tree/lib/node.js";

class MyNode extends Node {
  fullName() {
    return this.getParent() ? `${this.getParent().name}/${this.name}` : this.name;
  }
}

new HtmlTree({ data, htmlElement, nodeClass: MyNode });
```

The `Node` class is not exposed on the global `HtmlTree`, so this option needs the `lib` build.

### overrideTriggerEventProvider

- Type: `(element: HTMLElement, eventName: TreeEventName, values?: TreeEvents[TreeEventName]) => boolean`
- Default: dispatches a cancelable, bubbling `CustomEvent`

Replaces how [events](./events) are dispatched. It must return whether the event was *not*
cancelled. This exists for tests and for integrating with another event system.

## Changing an option later

`setOption` updates an option after construction:

```js
tree.setOption("dragAndDrop", false);
```

Options are read when they are used, so some take effect on the next render and others — like
`keyboardSupport`, which installs its listener in the constructor — do not take effect at all. Call
`refresh()` after changing an option that affects rendering.
