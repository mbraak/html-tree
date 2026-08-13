# Styling

The widget needs `html_tree.css` to look like a tree: it removes the list bullets, indents the
levels, hides closed folders and draws the drag-and-drop hints. Everything else — colors, fonts,
spacing — is meant to be overridden.

The stylesheet is generated from `css/html_tree.postcss` by `pnpm production`.

## Markup

A tree renders as nested lists:

```html
<ul class="html-tree-common html-tree" role="tree">
  <li class="html-tree-common html-tree-folder" role="none">
    <div class="html-tree-element html-tree-common" role="none">
      <a class="html-tree-toggler html-tree-common html-tree-toggler-left">►</a>
      <span
        class="html-tree-title html-tree-common html-tree-title-folder html-tree-title-button-left"
        role="treeitem"
        >parent</span
      >
    </div>
    <ul class="html-tree-common" role="group">
      <li class="html-tree-common" role="none">
        <div class="html-tree-element html-tree-common" role="none">
          <span class="html-tree-title html-tree-common html-tree-title-button-left">child</span>
        </div>
      </li>
    </ul>
  </li>
</ul>
```

Note that all selectors in the stylesheet are nested under `ul.html-tree`, so your own rules should
be too — or be specific enough to win.

## Class names

| Class                       | Applied to                                                        |
| --------------------------- | ----------------------------------------------------------------- |
| `html-tree`                 | The root `ul`.                                                    |
| `html-tree-common`          | Every element the widget creates.                                 |
| `html-tree-element`         | The `div` that wraps a node's toggler and title.                  |
| `html-tree-title`           | The `span` with the node name.                                    |
| `html-tree-folder`          | An `li` for a node that has children.                             |
| `html-tree-closed`          | A closed folder — on the `li` and on its toggler.                 |
| `html-tree-toggler`         | The open/close button.                                            |
| `html-tree-toggler-left`    | The toggler when `buttonLeft` is true (the default).              |
| `html-tree-toggler-right`   | The toggler when `buttonLeft` is false.                           |
| `html-tree-title-folder`    | The title of a folder node.                                       |
| `html-tree-selected`        | The `li` of a selected node.                                      |
| `html-tree-loading`         | A node — or the tree — that is fetching data.                     |
| `html-tree-rtl`             | The root `ul` when `rtl` is true.                                 |
| `html-tree-dnd`             | The root `ul` when `dragAndDrop` is true.                          |
| `html-tree-ghost`           | The drop hint while dragging.                                     |
| `html-tree-inside`          | The drop hint for a drop *inside* a folder.                       |
| `html-tree-moving`          | The node that is being dragged.                                   |
| `html-tree-border`          | The border drawn around a folder that is being dropped into.      |

## Overriding styles

Selection colors, for example:

```css
ul.html-tree li.html-tree-selected > .html-tree-element,
ul.html-tree li.html-tree-selected > .html-tree-element:hover {
  background: #1c4257;
  color: #fff;
  text-shadow: none;
}
```

Indentation:

```css
ul.html-tree ul.html-tree-common {
  margin-left: 24px;
}
```

## Folder icons

The togglers are text by default: `►` for a closed folder and `▼` for an open one. Replace them with
`closedIcon` and `openedIcon`, which take an html string or an element:

```js
new HtmlTree({
  closedIcon: "+",
  data,
  htmlElement,
  openedIcon: "−",
});
```

<TreeDemo demo="icons" />

An element works too, which is how you use an svg or an icon font:

```js
const icon = document.createElement("i");
icon.className = "fa fa-folder";

new HtmlTree({
  closedIcon: icon,
  data,
  htmlElement,
});
```

Put the toggler after the title instead of before it with `buttonLeft: false`:

<TreeDemo demo="buttonRight" />

## Right to left

`rtl: true` mirrors the tree — the indentation, the togglers and the drag-and-drop hints all move to
the other side — and flips the default closed icon to `◀`:

```js
new HtmlTree({
  data,
  htmlElement,
  rtl: true,
});
```

<TreeDemo demo="rtl" />

You can also set it on the element:

```html
<div id="tree1" data-rtl="true"></div>
```

The mirroring comes from the `html-tree-rtl` class that the option adds to the root `ul`, so it is
all in `html_tree.css`: if you replace the stylesheet, carry those rules over.

## Customizing the markup

`onCreateLi` is called for every node, with the node, its `li` element and whether it is selected.
Use it to add your own content:

```js
new HtmlTree({
  data,
  htmlElement,
  onCreateLi: (node, li, isSelected) => {
    const title = li.querySelector(".html-tree-title");

    if (node.count) {
      const badge = document.createElement("span");
      badge.className = "count";
      badge.textContent = node.count;
      title.after(badge);
    }
  },
});
```

Keep in mind that the `li` is rebuilt whenever the node is refreshed, so `onCreateLi` has to be able
to run again — build the markup from the node data rather than mutating what is already there.

## Empty folders

A node with `children: []` is rendered as a leaf. Set `showEmptyFolder: true` to render it as a
folder that can be opened and closed:

```js
new HtmlTree({
  data: [
    { name: "empty folder", id: 1, children: [] },
    { name: "leaf", id: 2 },
  ],
  htmlElement,
  showEmptyFolder: true,
});
```

<TreeDemo demo="showEmptyFolder" />

## Animation

Opening and closing folders slides by default. Turn it off with `slide: false`, or change the speed
with `animationSpeed`, which takes `"fast"`, `"slow"` or a number of milliseconds:

```js
new HtmlTree({
  animationSpeed: 200,
  data,
  htmlElement,
});
```

This tree has `slide: false`, so folders open and close instantly:

<TreeDemo demo="withoutSlide" />
