import type { Node, NodeData } from "htmlTree/node";
import type { HtmlTreeOptions } from "htmlTree/options";

import { screen } from "@testing-library/dom";
import { userEvent } from "@testing-library/user-event";
import HtmlTree from "htmlTree";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { vi } from "vitest";

import exampleData from "../support/exampleData";
import { getTreeButton, getTreeListElement } from "../support/queries";

const server = setupServer();

describe("options", () => {
    let htmlElement: HTMLElement;
    let htmlTree: HtmlTree | undefined;

    const createHtmlTree = (options: Partial<HtmlTreeOptions> = {}) => {
        htmlTree = new HtmlTree({ htmlElement, ...options });

        return htmlTree;
    };

    beforeAll(() => {
        server.listen();
    });

    beforeEach(() => {
        document.body.innerHTML = "";

        htmlElement = document.createElement("div");
        document.body.append(htmlElement);
    });

    afterEach(() => {
        server.resetHandlers();

        htmlTree?.deinit();
        htmlTree = undefined;

        document.body.innerHTML = "";
        localStorage.clear();
    });

    afterAll(() => {
        server.close();
    });

    describe("autoEscape", () => {
        it("escapes the node name when autoEscape is true", () => {
            createHtmlTree({
                autoEscape: true,
                data: ["<span>test</span>"],
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    name: "&lt;span&gt;test&lt;/span&gt;",
                }),
            ]);
        });

        it("doesn't escape the node name when autoEscape is false", () => {
            createHtmlTree({
                autoEscape: false,
                data: ["<span>test</span>"],
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    name: "<span>test</span>",
                }),
            ]);
        });
    });

    describe("autoOpen", () => {
        it("doesn't open any nodes with autoOpen false", () => {
            createHtmlTree({
                autoOpen: false,
                data: exampleData,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: false }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);
        });

        it("opens all nodes with autoOpen true", () => {
            createHtmlTree({
                autoOpen: true,
                data: exampleData,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens level 0 with autoOpen 0", () => {
            createHtmlTree({
                autoOpen: 0,
                data: exampleData,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: false,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens levels 1 with autoOpen 1", () => {
            createHtmlTree({
                autoOpen: 1,
                data: exampleData,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });

        it("opens levels 1 with autoOpen '1'", () => {
            const tree = createHtmlTree({ data: [] });

            tree.setOption("autoOpen", "1");
            tree.loadData(exampleData);

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1", open: true }),
                expect.objectContaining({
                    children: [
                        expect.objectContaining({
                            name: "node3",
                            open: true,
                        }),
                    ],
                    name: "node2",
                    open: true,
                }),
            ]);
        });
    });

    describe("buttonLeft", () => {
        it("renders the button on the right when buttonLeft is false", () => {
            createHtmlTree({
                buttonLeft: false,
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            // eslint-disable-next-line testing-library/no-node-access
            const nextSibling = treeItem.nextSibling as HTMLElement;

            expect(nextSibling).toHaveClass("html-tree-toggler");
        });

        it("renders the button on the left when buttonLeft is true", () => {
            createHtmlTree({
                buttonLeft: true,
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            // eslint-disable-next-line testing-library/no-node-access
            const previousSibling = treeItem.previousSibling as HTMLElement;

            expect(previousSibling).toHaveClass("html-tree-toggler");
        });
    });

    describe("classPrefix", () => {
        it("renders the elements with the prefix", () => {
            createHtmlTree({
                classPrefix: "my-tree",
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const listElement = getTreeListElement(treeItem);
            const ulElement = listElement.parentElement as HTMLElement; // eslint-disable-line testing-library/no-node-access

            expect(ulElement).toHaveClass("my-tree", "my-tree-common");
            expect(listElement).toHaveClass(
                "my-tree-closed",
                "my-tree-common",
                "my-tree-folder",
            );
            expect(treeItem).toHaveClass(
                "my-tree-common",
                "my-tree-title",
                "my-tree-title-button-left",
                "my-tree-title-folder",
            );
            expect(htmlElement.innerHTML).not.toContain("html-tree");
        });

        it("opens a folder when its toggler is clicked", async () => {
            const tree = createHtmlTree({
                classPrefix: "my-tree",
                data: exampleData,
                slide: false,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const toggler = treeItem.previousSibling as HTMLElement; // eslint-disable-line testing-library/no-node-access

            expect(toggler).toHaveClass(
                "my-tree-common",
                "my-tree-toggler",
                "my-tree-toggler-left",
            );

            await userEvent.click(toggler);

            expect(tree.getNodeByNameMustExist("node1").is_open).toBeTrue();
            expect(getTreeListElement(treeItem)).not.toHaveClass(
                "my-tree-closed",
            );
        });
    });

    describe("closedIcon", () => {
        it("renders a string", () => {
            createHtmlTree({
                closedIcon: "closed",
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("closed");
        });

        it("escapes html", () => {
            createHtmlTree({
                closedIcon: "<span>test</span>",
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("<span>test</span>");
        });

        it("renders a html element", () => {
            const icon = document.createElement("span");
            icon.className = "abc";
            icon.textContent = "test";

            createHtmlTree({
                closedIcon: icon,
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);
            const span = button.querySelector("span.abc"); // eslint-disable-line testing-library/no-node-access

            expect(span).toHaveTextContent("test");
        });

        it("renders a default when the option is empty", () => {
            createHtmlTree({
                closedIcon: undefined,
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("►");
        });
    });

    describe("commonClassName", () => {
        it("overrides the class of every element", () => {
            createHtmlTree({
                commonClassName: "my-common",
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toHaveClass("html-tree-title", "my-common");
            expect(treeItem).not.toHaveClass("html-tree-common");
        });

        it("selects a node when it is clicked", async () => {
            createHtmlTree({
                commonClassName: "my-common",
                data: exampleData,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            await userEvent.click(treeItem);

            expect(treeItem).toBeAriaSelected();
        });
    });

    describe("dataFilter", () => {
        it("changes the loaded data", async () => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );

            const dataFilter = vi.fn((data) => [
                (data as NodeData[])[1] as NodeData,
            ]);

            createHtmlTree({
                dataFilter,
                dataUrl: "/tree/",
            });

            await screen.findByRole("treeitem", { name: "node2" });

            expect(
                screen.queryByRole("treeitem", { name: "node1" }),
            ).not.toBeInTheDocument();
            expect(dataFilter).toHaveBeenCalledExactlyOnceWith(exampleData);
        });
    });

    describe("dataUrl", () => {
        const exampleStructure = [
            expect.objectContaining({ name: "node1" }),
            expect.objectContaining({ name: "node2" }),
        ];

        const testCases = [
            {
                dataUrl: "/tree/",
                expectedNode: "node1",
                expectedStructure: exampleStructure,
                name: "string",
            },
            {
                dataUrl: () => "/tree/",
                expectedNode: "node1",
                expectedStructure: exampleStructure,
                name: "function",
            },
        ];

        beforeEach(() => {
            server.use(
                http.get("/tree/", () => HttpResponse.json(exampleData)),
            );
        });

        testCases.forEach(
            ({ dataUrl, expectedNode, expectedStructure, name }) => {
                it(`loads the data from the url with ${name}`, async () => {
                    createHtmlTree({ dataUrl });
                    await screen.findByRole("treeitem", { name: expectedNode });

                    expect(htmlElement).toHaveTreeStructure(expectedStructure);
                });
            },
        );

        it("loads the data and selects the node when the state contains a selected node", async () => {
            localStorage.setItem("tree", '{"selected_node":[124]}');

            const tree = createHtmlTree({
                dataUrl: "/tree/",
                saveState: true,
            });

            await screen.findByRole("treeitem", { name: "node1" });

            expect(tree.getSelectedNode()).toMatchObject({ name: "node2" });
        });

        it("loads the data and doesn't select a node when the state doesn't contain a selected node", async () => {
            localStorage.setItem("tree", "{}");

            const tree = createHtmlTree({
                dataUrl: "/tree/",
                saveState: true,
            });

            await screen.findByRole("treeitem", { name: "node1" });

            expect(tree.getSelectedNode()).toBeFalse();
        });

        it("loads the data and doesn't select a node when saveState is false", async () => {
            localStorage.setItem("tree", '{"selected_node":[124]}');

            const tree = createHtmlTree({
                dataUrl: "/tree/",
                saveState: false,
            });

            await screen.findByRole("treeitem", { name: "node1" });

            expect(tree.getSelectedNode()).toBeFalse();
        });
    });

    describe("data-url in html", () => {
        it("loads the data from the url", async () => {
            server.use(http.get("/tree", () => HttpResponse.json(exampleData)));

            htmlElement.dataset.url = "/tree";

            createHtmlTree();

            await screen.findByRole("treeitem", { name: "node1" });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "node1" }),
                expect.objectContaining({ name: "node2" }),
            ]);
        });
    });

    describe("onCanSelectNode", () => {
        it("doesn't select the node", () => {
            const tree = createHtmlTree({
                data: exampleData,
                onCanSelectNode: (node: Node) => node.name !== "node1",
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);

            expect(tree.getSelectedNode()).toBeFalse();
        });
    });

    describe("onCreateLi", () => {
        it("is called when creating a node", () => {
            createHtmlTree({
                data: exampleData,
                onCreateLi: (node: Node, element: HTMLElement) => {
                    // eslint-disable-next-line testing-library/no-node-access
                    const titleElement = element.querySelector(
                        ":scope > .html-tree-element > .html-tree-title",
                    ) as HTMLElement;
                    titleElement.innerHTML = `_${node.name}_`;
                },
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "_node1_" }),
                expect.objectContaining({ name: "_node2_" }),
            ]);
        });
    });

    describe("onGetStateFromStorage and onSetStateFromStorage", () => {
        let savedState = "";

        const setState = (state: string): void => {
            savedState = state;
        };

        const getState = (): string => savedState;

        const createTree = () =>
            createHtmlTree({
                autoOpen: false,
                data: exampleData,
                onGetStateFromStorage: getState,
                onSetStateFromStorage: setState,
                saveState: true,
            });

        beforeEach(() => {
            savedState = "";
        });

        it("saves the state with an open and a selected node", async () => {
            const tree = createTree();
            const node1 = tree.getNodeByNameMustExist("node1");

            tree.selectNode(node1);
            await tree.openNode(node1);

            expect(savedState).toBe(
                '{"open_nodes":[123],"selected_node":[123]}',
            );
        });

        it("restores the state with a saved state", () => {
            savedState = '{"open_nodes":[123],"selected_node":[123]}';

            createTree();

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                }),
                expect.objectContaining({ name: "node2", open: false }),
            ]);

            const treeItem = screen.getByRole("treeitem", { name: "node1" });

            expect(treeItem).toBeAriaSelected();
        });
    });

    describe("onIsMoveHandle", () => {
        it("is called with an html element", () => {
            const onIsMoveHandle = vi.fn(() => true);

            createHtmlTree({
                data: exampleData,
                dragAndDrop: true,
                onIsMoveHandle,
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            treeItem.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true, button: 0 }),
            );

            expect(onIsMoveHandle).toHaveBeenCalledExactlyOnceWith(treeItem);
        });
    });

    describe("rtl", () => {
        it("has a different closed icon when the rtl option is true", () => {
            createHtmlTree({ data: exampleData, rtl: true });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("◀");
        });

        it("has the default closed icon when the rtl option is false", () => {
            createHtmlTree({ data: exampleData, rtl: false });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("►");
        });

        it("has a different closed icon when the rtl data option is true", () => {
            htmlElement.dataset.rtl = "true";
            createHtmlTree({ data: exampleData });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("◀");
        });

        it("has the default closed icon when the rtl data option is false", () => {
            htmlElement.dataset.rtl = "false";
            createHtmlTree({ data: exampleData });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("►");
        });

        it("has a different closed icon when the rtl data option has no value", () => {
            htmlElement.dataset.rtl = "";
            createHtmlTree({ data: exampleData });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const button = getTreeButton(treeItem);

            expect(button).toHaveTextContent("◀");
        });
    });

    describe("saveState", () => {
        const createTreeWithOpenSelectedNode = async (
            saveState: boolean | string,
        ) => {
            const tree = createHtmlTree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState,
            });

            const node1 = tree.getNodeByNameMustExist("node1");
            tree.selectNode(node1);
            await tree.openNode(node1);

            return tree;
        };

        it("saves the state to local storage when saveState is true", async () => {
            await createTreeWithOpenSelectedNode(true);

            expect(localStorage.getItem("tree")).toBe(
                '{"open_nodes":[123],"selected_node":[123]}',
            );
        });

        it("uses the string as a key when saveState is a string", async () => {
            await createTreeWithOpenSelectedNode("my-state");

            expect(localStorage.getItem("my-state")).toBe(
                '{"open_nodes":[123],"selected_node":[123]}',
            );
        });

        it("doesn't save to local storage when saveState is false", async () => {
            await createTreeWithOpenSelectedNode(false);

            expect(localStorage.getItem("tree")).toBeNull();
        });

        it("restores the state when there is a state in the local storage", () => {
            localStorage.setItem(
                "tree",
                '{"open_nodes":[123],"selected_node":[123]}',
            );

            createHtmlTree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: true,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: true,
                    selected: true,
                }),
                expect.objectContaining({
                    name: "node2",
                    open: false,
                    selected: false,
                }),
            ]);
        });

        it("doesn't restore the state when saveState is false", () => {
            localStorage.setItem(
                "tree",
                '{"open_nodes":[123],"selected_node":[123]}',
            );

            createHtmlTree({
                animationSpeed: 0,
                autoOpen: false,
                data: exampleData,
                saveState: false,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    name: "node1",
                    open: false,
                    selected: false,
                }),
                expect.objectContaining({
                    name: "node2",
                    open: false,
                    selected: false,
                }),
            ]);
        });
    });

    describe("showEmptyFolder", () => {
        it("creates a child node with showEmptyFolder false", () => {
            createHtmlTree({
                data: [{ children: [], name: "parent1" }],
                showEmptyFolder: false,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({ name: "parent1" }),
            ]);
        });

        it("creates a folder with showEmptyFolder true", () => {
            createHtmlTree({
                data: [{ children: [], name: "parent1" }],
                showEmptyFolder: true,
            });

            expect(htmlElement).toHaveTreeStructure([
                expect.objectContaining({
                    children: [],
                    name: "parent1",
                }),
            ]);
        });
    });

    describe("treeClassName", () => {
        it("overrides the class of the root element", () => {
            createHtmlTree({
                data: exampleData,
                treeClassName: "my-tree",
            });

            const treeItem = screen.getByRole("treeitem", { name: "node1" });
            const ulElement = getTreeListElement(treeItem)
                .parentElement as HTMLElement; // eslint-disable-line testing-library/no-node-access

            expect(ulElement).toHaveClass("html-tree-common", "my-tree");
            expect(ulElement).not.toHaveClass("html-tree");
        });
    });
});
