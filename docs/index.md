---
layout: home
hero:
  name: tree-element
  text: Tree widget in plain javascript
  tagline: A dependency-free tree view with drag and drop, keyboard navigation, lazy loading and state persistence.
  actions:
    - theme: brand
      text: Getting started
      link: /guide/getting-started
    - theme: alt
      text: Reference
      link: /reference/options
    - theme: alt
      text: GitHub
      link: https://github.com/mbraak/tree-element
features:
  - title: No dependencies
    details: Plain javascript and plain css. Drop in a script tag or import it from your bundler.
  - title: Drag and drop
    details: Move nodes with the mouse or by touch, with hooks to allow or veto every move.
  - title: Lazy loading
    details: Load the whole tree up front, or fetch subtrees from a url when a folder is opened.
  - title: Typed
    details: Written in TypeScript, so options, methods and node data are checked in your editor.
---

## Try it

This is the widget itself, built from `src` in this repository. Open the folders, select a node, walk
through it with the arrow keys, and drag a node somewhere else.

<TreeDemo demo="dragAndDrop" />

```js
new TreeElement({
  autoOpen: 1,
  data,
  dragAndDrop: true,
  htmlElement: document.getElementById("tree1"),
});
```

Start with the [guide](./guide/getting-started), or go straight to the
[options](./reference/options).
