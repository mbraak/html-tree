const htmlElement = document.getElementById("tree1");

new HtmlTree({
  autoOpen: true,
  data: ExampleData.exampleData,
  dragAndDrop: true,
  htmlElement,
  useContextMenu: false,
});
