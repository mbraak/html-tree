import type { UserEvent } from "@testing-library/user-event";
import type { MoveInfo } from "htmlTree/events";
import type { HtmlTreeOptions } from "htmlTree/options";

import { screen, waitFor } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import HtmlTree from "htmlTree";
import { mockElementBoundingClientRect } from "jsdom-testing-mocks";
import { vi } from "vitest";

import exampleData from "../support/exampleData";

const rowHeight = 20;
const treeWidth = 100;

// Give the rendered nodes a layout: every visible node is a row of 20 pixels.
// Jsdom doesn't do layout, but drag and drop needs the positions of the nodes.
const mockLayout = (htmlElement: HTMLElement) => {
  const mockElement = (element: HTMLElement, top: number, height: number) => {
    vi.spyOn(element, "clientHeight", "get").mockReturnValue(height);
    vi.spyOn(element, "clientWidth", "get").mockReturnValue(treeWidth);
    vi.spyOn(element, "offsetParent", "get").mockReturnValue(
      element.parentElement, // eslint-disable-line testing-library/no-node-access
    );

    mockElementBoundingClientRect(element, {
      height,
      width: treeWidth,
      x: 0,
      y: top,
    });
  };

  // The list elements of the visible nodes, in the order in which they are displayed.
  const getVisibleListElements = (listElement: HTMLElement): HTMLElement[] => {
    // eslint-disable-next-line testing-library/no-node-access
    const listItemElements = listElement.querySelectorAll<HTMLElement>(
      ":scope > li",
    );

    return Array.from(listItemElements).flatMap((listItemElement) => {
      const isClosed = listItemElement.classList.contains("html-tree-closed");

      const childListElement = isClosed
        ? null
        : // eslint-disable-next-line testing-library/no-node-access
        listItemElement.querySelector<HTMLElement>(":scope > ul");

      return [
        listItemElement,
        ...(childListElement ? getVisibleListElements(childListElement) : []),
      ];
    });
  };

  // eslint-disable-next-line testing-library/no-node-access
  const treeListElement = htmlElement.querySelector<HTMLElement>(":scope > ul");

  if (!treeListElement) {
    throw new Error("Cannot find the list element of the tree");
  }

  const listElements = getVisibleListElements(treeListElement);

  listElements.forEach((listItemElement, index) => {
    // The height of a node includes the height of its visible children.
    const childCount = getVisibleListElements(listItemElement).length;

    mockElement(
      listItemElement,
      index * rowHeight,
      (childCount + 1) * rowHeight,
    );
  });

  mockElement(htmlElement, 0, listElements.length * rowHeight);
};

describe("drag and drop", () => {
  let htmlElement: HTMLElement;
  let htmlTree: HtmlTree | undefined;
  let user: UserEvent;

  const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
    htmlTree = new HtmlTree({
      data: exampleData,
      dragAndDrop: true,
      htmlElement,
      startDndDelay: 0,
      ...options,
    });

    mockLayout(htmlElement);

    return htmlTree;
  };

  // A position in the horizontal middle of the tree. Keep the mouse away from
  // the edges of the window, because the tree scrolls when it comes near them.
  const x = 50;

  const coordinates = (y: number) => ({
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
  });

  // Press the mouse button on a node and move the mouse; this starts dragging the node.
  const startDragging = async (name: string, y: number) => {
    const title = screen.getByRole("treeitem", { name });

    await user.pointer([
      { coords: coordinates(10), keys: "[MouseLeft>]", target: title },
      { coords: coordinates(y), target: htmlElement },
    ]);
  };

  // Release the mouse button.
  const drop = async () => {
    await user.pointer({ keys: "[/MouseLeft]", target: htmlElement });
  };

  // Drag a node and drop it at a vertical position in the tree.
  const dragAndDropNode = async (name: string, y: number) => {
    await startDragging(name, y);
    await drop();
  };

  beforeEach(() => {
    document.body.innerHTML = "";

    // The user must be set up once, so that the mouse stays pressed between
    // the pointer actions of a drag.
    user = userEvent.setup();

    htmlElement = document.createElement("div");
    document.body.append(htmlElement);
  });

  afterEach(() => {
    htmlTree?.deinit();
    htmlTree = undefined;

    document.body.innerHTML = "";

    vi.restoreAllMocks();
  });

  it("moves a node inside a folder", async () => {
    createHtmlTree();

    // Drop node1 on the first half of node2; this moves it inside node2.
    await dragAndDropNode("node1", 25);

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({
        children: [
          expect.objectContaining({ name: "node1" }),
          expect.objectContaining({ name: "node3" }),
        ],
        name: "node2",
        open: true,
      }),
    ]);
  });

  it("moves a node after another node", async () => {
    createHtmlTree();

    // Drop node1 on the second half of node2; this moves it after node2.
    await dragAndDropNode("node1", 45);

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({ name: "node2" }),
      expect.objectContaining({ name: "node1" }),
    ]);
  });

  it("fires the tree.move event", async () => {
    const tree = createHtmlTree();

    const listener = vi.fn<(moveInfo: MoveInfo) => void>();

    htmlElement.addEventListener("tree.move", (e) => {
      listener(e.detail.moveInfo);
    });

    await dragAndDropNode("node1", 25);

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      doMove: expect.any(Function) as unknown,
      movedNode: tree.getNodeByNameMustExist("node1"),
      originalEvent: expect.any(MouseEvent) as unknown,
      position: "inside",
      previousParent: tree.getTree(),
      targetNode: tree.getNodeByNameMustExist("node2"),
    });
  });

  it("doesn't move a node when the tree.move event is cancelled", async () => {
    createHtmlTree();

    htmlElement.addEventListener("tree.move", (e) => {
      e.preventDefault();
    });

    await dragAndDropNode("node1", 25);

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({ name: "node1" }),
      expect.objectContaining({ name: "node2" }),
    ]);
  });

  it("moves the node when do_move is called after the tree.move event", async () => {
    createHtmlTree();

    const doMoveFunctions: (() => void)[] = [];

    htmlElement.addEventListener("tree.move", (e) => {
      e.preventDefault();
      doMoveFunctions.push(e.detail.moveInfo.doMove);
    });

    await dragAndDropNode("node1", 25);

    expect(doMoveFunctions).toHaveLength(1);

    doMoveFunctions[0]?.();

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({
        children: [
          expect.objectContaining({ name: "node1" }),
          expect.objectContaining({ name: "node3" }),
        ],
        name: "node2",
      }),
    ]);
  });

  it("doesn't move a node when the dragAndDrop option is false", async () => {
    createHtmlTree({ dragAndDrop: false });

    await dragAndDropNode("node1", 25);

    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({ name: "node1" }),
      expect.objectContaining({ name: "node2" }),
    ]);
  });

  it("doesn't move a node when onCanMove returns false", async () => {
    const onCanMove = vi.fn(() => false);

    const tree = createHtmlTree({ onCanMove });

    await dragAndDropNode("node1", 25);

    expect(onCanMove).toHaveBeenCalledWith(
      tree.getNodeByNameMustExist("node1"),
    );
    expect(htmlElement).toHaveTreeStructure([
      expect.objectContaining({ name: "node1" }),
      expect.objectContaining({ name: "node2" }),
    ]);
  });

  it("doesn't move a node to a position for which onCanMoveTo returns false", async () => {
    const tree = createHtmlTree({ onCanMoveTo: () => false });

    await dragAndDropNode("node1", 25);

    expect(tree.getNodeByNameMustExist("node1").parent).toBe(tree.getTree());
  });

  it("shows the dragged node next to the mouse while dragging", async () => {
    createHtmlTree();

    await startDragging("node1", 25);

    const dragElement = screen.getByText("node1", {
      selector: ".html-tree-dragging",
    });

    expect(dragElement).toBeInTheDocument();

    await drop();

    expect(dragElement).not.toBeInTheDocument();
  });

  it("opens a closed folder when the mouse hovers over it", async () => {
    createHtmlTree({ openFolderDelay: 0 });

    // Hover over the first half of node2; this opens node2.
    await startDragging("node1", 25);

    await waitFor(() => {
      expect(
        screen.getByRole("treeitem", { name: "node2" }),
      ).toBeAriaExpanded();
    });

    await drop();
  });

  it("calls onDragStop when the node is dropped outside of the tree", async () => {
    const onDragStop = vi.fn();

    const tree = createHtmlTree({ onDragStop });

    await dragAndDropNode("node1", 300);

    expect(onDragStop).toHaveBeenCalledExactlyOnceWith(
      tree.getNodeByNameMustExist("node1"),
      expect.any(MouseEvent),
    );
  });

  it("calls onDragMove while the mouse is outside of the tree", async () => {
    const onDragMove = vi.fn();

    const tree = createHtmlTree({ onDragMove });

    await startDragging("node1", 300);

    expect(onDragMove).toHaveBeenCalledExactlyOnceWith(
      tree.getNodeByNameMustExist("node1"),
      expect.any(MouseEvent),
    );

    await drop();
  });
});
