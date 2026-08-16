import type { GetTree, IsNodeSelected } from "./methodTypes";
import type { Node } from "./node";
import type { IconElement, OnCreateLi } from "./options";

import { getBoolString } from "./util";

interface ElementsRendererParams {
    autoEscape: boolean;
    buttonLeft: boolean;
    closedIcon?: IconElement;
    dragAndDrop: boolean;
    getTree: GetTree;
    htmlElement: HTMLElement;
    isNodeSelected: IsNodeSelected;
    onCreateLi?: OnCreateLi;
    openedIcon?: IconElement;
    rtl?: boolean;
    setNodeElement: (element: HTMLElement, node: Node) => void;
    showEmptyFolder: boolean;
    tabIndex?: number;
}

export default class ElementsRenderer {
    public closedIconElement?: HTMLElement | Text;
    public openedIconElement?: HTMLElement | Text;
    private autoEscape: boolean;
    private buttonLeft: boolean;
    private dragAndDrop: boolean;
    private getTree: GetTree;
    private htmlElement: HTMLElement;
    private isNodeSelected: IsNodeSelected;
    private onCreateLi?: OnCreateLi;
    private rtl?: boolean;
    private setNodeElement: (element: HTMLElement, node: Node) => void;
    private showEmptyFolder: boolean;
    private tabIndex?: number;

    constructor({
        autoEscape,
        buttonLeft,
        closedIcon,
        dragAndDrop,
        getTree,
        htmlElement,
        isNodeSelected,
        onCreateLi,
        openedIcon,
        rtl,
        setNodeElement,
        showEmptyFolder,
        tabIndex,
    }: ElementsRendererParams) {
        this.autoEscape = autoEscape;
        this.buttonLeft = buttonLeft;
        this.dragAndDrop = dragAndDrop;
        this.getTree = getTree;
        this.htmlElement = htmlElement;
        this.isNodeSelected = isNodeSelected;
        this.onCreateLi = onCreateLi;
        this.rtl = rtl;
        this.setNodeElement = setNodeElement;
        this.showEmptyFolder = showEmptyFolder;
        this.tabIndex = tabIndex;
        this.openedIconElement = this.createButtonElement(openedIcon ?? "+");
        this.closedIconElement = this.createButtonElement(closedIcon ?? "-");
    }

    public render(fromNode: Node | null): void {
        if (fromNode?.parent) {
            this.renderFromNode(fromNode);
        } else {
            this.renderFromRoot();
        }
    }

    public renderFromNode(node: Node): void {
        if (!node.element) {
            return;
        }

        const currentLi = node.element;
        const newLi = this.createLi(node, node.getLevel());
        currentLi.replaceWith(newLi);

        // create children
        this.createDomElements(newLi, node.children, false, node.getLevel() + 1);
    }

    public renderFromRoot(): void {
        this.htmlElement.textContent = '';

        const tree = this.getTree();

        if (tree) {
            this.createDomElements(this.htmlElement, tree.children, true, 1);
        }
    }

    private attachNodeData(node: Node, li: HTMLElement): void {
        node.element = li;
        this.setNodeElement(li, node);
    }

    private createButtonElement(
        value: IconElement,
    ): HTMLElement | Text | undefined {
        if (typeof value === "string") {
            // convert value to html
            const div = document.createElement("div");
            div.innerHTML = value;

            return document.createTextNode(div.innerHTML);
        } else if (value.nodeType) {
            return value;
        } else {
            return undefined;
        }
    }

    private createDomElements(
        element: Element,
        children: Node[],
        isRootNode: boolean,
        level: number,
    ): void {
        const ul = this.createUl(isRootNode);
        element.appendChild(ul);

        for (const child of children) {
            const li = this.createLi(child, level);
            ul.appendChild(li);

            if (child.hasChildren()) {
                this.createDomElements(li, child.children, false, level + 1);
            }
        }
    }

    private createFolderLi(
        node: Node,
        level: number,
        isSelected: boolean,
    ): HTMLLIElement {
        const buttonClasses = this.getButtonClasses(node);
        const folderClasses = this.getFolderClasses(node, isSelected);

        const iconElement = node.is_open
            ? this.openedIconElement
            : this.closedIconElement;

        // li
        const li = document.createElement("li");
        li.className = `html-tree-common ${folderClasses}`;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "html-tree-element html-tree-common";
        div.setAttribute("role", "none");

        li.appendChild(div);

        // button link
        const buttonLink = document.createElement("a");
        buttonLink.className = buttonClasses;

        if (iconElement) {
            buttonLink.appendChild(iconElement.cloneNode(true));
        }

        if (this.buttonLeft) {
            div.appendChild(buttonLink);
        }

        // title span
        const titleSpan = this.createTitleSpan(
            node.name,
            isSelected,
            true,
            level,
        );
        titleSpan.setAttribute("aria-expanded", getBoolString(node.is_open));
        div.appendChild(titleSpan);

        if (!this.buttonLeft) {
            div.appendChild(buttonLink);
        }

        return li;
    }

    /* Create the <li> element
     * Attach it to node.element.
     * Call onCreateLi
     */
    private createLi(node: Node, level: number): HTMLLIElement {
        const isSelected = this.isNodeSelected(node);

        const mustShowFolder =
            node.isFolder() || (node.isEmptyFolder && this.showEmptyFolder);

        const li = mustShowFolder
            ? this.createFolderLi(node, level, isSelected)
            : this.createNodeLi(node, level, isSelected);

        this.attachNodeData(node, li);

        if (this.onCreateLi) {
            this.onCreateLi(node, li, isSelected);
        }

        return li;
    }

    private createNodeLi(
        node: Node,
        level: number,
        isSelected: boolean,
    ): HTMLLIElement {
        const liClasses = ["html-tree-common"];

        if (isSelected) {
            liClasses.push("html-tree-selected");
        }

        const classString = liClasses.join(" ");

        // li
        const li = document.createElement("li");
        li.className = classString;
        li.setAttribute("role", "none");

        // div
        const div = document.createElement("div");
        div.className = "html-tree-element html-tree-common";
        div.setAttribute("role", "none");

        li.appendChild(div);

        // title span
        const titleSpan = this.createTitleSpan(
            node.name,
            isSelected,
            false,
            level,
        );
        div.appendChild(titleSpan);

        return li;
    }

    private createTitleSpan(
        nodeName: string,
        isSelected: boolean,
        isFolder: boolean,
        level: number,
    ): HTMLSpanElement {
        const titleSpan = document.createElement("span");

        let classes = "html-tree-title html-tree-common";

        if (isFolder) {
            classes += " html-tree-title-folder";
        }

        classes += ` html-tree-title-button-${this.buttonLeft ? "left" : "right"}`;

        titleSpan.className = classes;

        if (isSelected) {
            const tabIndex = this.tabIndex;

            if (tabIndex !== undefined) {
                titleSpan.setAttribute("tabindex", `${tabIndex}`);
            }
        }

        this.setTreeItemAriaAttributes(titleSpan, nodeName, level, isSelected);

        if (this.autoEscape) {
            titleSpan.textContent = nodeName;
        } else {
            titleSpan.innerHTML = nodeName;
        }

        return titleSpan;
    }

    private createUl(isRootNode: boolean): HTMLUListElement {
        let classString;
        let role;

        if (!isRootNode) {
            classString = "";
            role = "group";
        } else {
            classString = "html-tree";
            role = "tree";

            if (this.rtl) {
                classString += " html-tree-rtl";
            }
        }

        if (this.dragAndDrop) {
            classString += " html-tree-dnd";
        }

        const ul = document.createElement("ul");
        ul.className = `html-tree-common ${classString}`;

        ul.setAttribute("role", role);

        return ul;
    }

    private getButtonClasses(node: Node): string {
        const classes = ["html-tree-toggler", "html-tree-common"];

        if (!node.is_open) {
            classes.push("html-tree-closed");
        }

        if (this.buttonLeft) {
            classes.push("html-tree-toggler-left");
        } else {
            classes.push("html-tree-toggler-right");
        }

        return classes.join(" ");
    }

    private getFolderClasses(node: Node, isSelected: boolean): string {
        const classes = ["html-tree-folder"];

        if (!node.is_open) {
            classes.push("html-tree-closed");
        }

        if (isSelected) {
            classes.push("html-tree-selected");
        }

        if (node.is_loading) {
            classes.push("html-tree-loading");
        }

        return classes.join(" ");
    }

    private setTreeItemAriaAttributes(
        element: HTMLElement,
        name: string,
        level: number,
        isSelected: boolean,
    ) {
        element.setAttribute("aria-label", name);
        element.setAttribute("aria-level", `${level}`);
        element.setAttribute("aria-selected", getBoolString(isSelected));
        element.setAttribute("role", "treeitem");
    }
}
