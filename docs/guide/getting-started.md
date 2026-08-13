# Getting started

## What you need

Build the distribution files from a checkout:

```sh
pnpm install
pnpm production
```

That produces:

| File                  | What it is                                                                  |
| --------------------- | --------------------------------------------------------------------------- |
| `html_tree.js`        | The bundle: an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) that defines a global `HtmlTree`. |
| `html_tree.debug.js`  | The same bundle, unminified.                                                |
| `html_tree.css`       | The stylesheet.                                                             |
| `lib/`                | The source compiled to ES modules, for bundlers.                            |

::: info
`html-tree` is not published on npm yet, so there is no `npm install html-tree`. Copy the built
files into your project, or point your bundler at a checkout.
:::

## Create a tree

`html-tree` renders into an element that you pass to the constructor. That element does not have
to contain anything; the tree fills it.

```html
<link rel="stylesheet" href="html_tree.css" />

<div id="tree1"></div>

<script src="html_tree.js"></script>
<script>
  const data = [
    {
      name: "Saurischia",
      id: 1,
      children: [
        { name: "Herrerasaurians", id: 2 },
        {
          name: "Theropods",
          id: 3,
          children: [
            { name: "Coelophysoids", id: 4 },
            { name: "Ceratosaurians", id: 5 },
          ],
        },
      ],
    },
    { name: "Ornithischia", id: 6 },
  ];

  const tree = new HtmlTree({
    autoOpen: 0,
    data,
    htmlElement: document.getElementById("tree1"),
  });
</script>
```

`htmlElement` is the only required option; everything else has a default. See
[Options](../reference/options) for the full list, and [Styling](./styling) for the class names
the stylesheet uses.

## With a bundler

`html_tree.js` is an IIFE, so importing it does not give you the class. Import from the `lib`
build instead, which is the source compiled to ES modules:

```js
import HtmlTree from "html-tree/lib/index.js";

const tree = new HtmlTree({
  data: [{ name: "node1" }, { name: "node2" }],
  htmlElement: document.getElementById("tree1"),
});
```

The stylesheet can be imported the same way:

```js
import "html-tree/html_tree.css";
```

## Try it in this repository

The repository contains a dev server with a working example
(`devserver/index.html` and `devserver/devserver.js`):

```sh
pnpm devserver
```

It builds the bundle, watches `src`, and serves the example on `http://localhost:8080`.

## React to what the user does

The tree dispatches [events](../reference/events) on its element. They are regular
`CustomEvent`s, so `addEventListener` is all you need:

```js
const element = document.getElementById("tree1");

element.addEventListener("tree.click", (e) => {
  console.log("clicked", e.detail.node.name);
});
```

## Change the tree from code

Every node is a [`Node`](../reference/node) object, and the tree has
[methods](../reference/methods) to find them and change them:

```js
const node = tree.getNodeByName("Theropods");

tree.openNode(node);
tree.selectNode(node);
tree.appendNode({ name: "Tyrannosauroids", id: 9 }, node);
```

## Clean up

Call `deinit` when you remove the tree from the page. It empties the element and removes the
document-level keyboard listener:

```js
tree.deinit();
```

## Next steps

- [Data](./data) — the node data format
- [Loading on demand](./loading-on-demand) — fetch subtrees from the server
- [Selection](./selection) — selecting nodes and keyboard navigation
- [Drag and drop](./drag-and-drop) — moving nodes
- [Saving state](./saving-state) — remember open and selected nodes
