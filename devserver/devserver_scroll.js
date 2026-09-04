const htmlElement = document.getElementById("tree1");

new TreeElement({
  autoOpen: true,
  data: ExampleData.exampleData,
  dragAndDrop: true,
  htmlElement,
  useContextMenu: false,
});
