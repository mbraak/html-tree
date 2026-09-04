const htmlElement = document.getElementById("tree1");

new TreeElement({
  autoOpen: 0,
  data: ExampleData.exampleData,
  dragAndDrop: true,
  htmlElement,
});
