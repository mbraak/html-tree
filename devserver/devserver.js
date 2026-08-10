const htmlElement = document.getElementById("tree1");

new HtmlTree({
  autoOpen: 0,
  data: ExampleData.exampleData,
  dragAndDrop: true,
  htmlElement,
});
