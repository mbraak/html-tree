import type { DropHint } from "htmlTree/dragAndDropHandler/types";
import type { GetScrollLeft } from "htmlTree/methodTypes";
import type { Node, Position } from "htmlTree/node";

import BorderDropHint from "./borderDropHint";
import GhostDropHint from "./ghostDropHint";

export interface NodeElementParams {
    getScrollLeft: GetScrollLeft;
    node: Node;
    tabIndex?: number;
    treeElement: HTMLElement;
}

class NodeElement {
    public element: HTMLElement;
    public node: Node;
    private getScrollLeft: GetScrollLeft;
    private tabIndex?: number;
    private treeElement: HTMLElement;

    constructor({
        getScrollLeft,
        node,
        tabIndex,
        treeElement,
    }: NodeElementParams) {
        this.getScrollLeft = getScrollLeft;
        this.node = node;
        this.tabIndex = tabIndex;
        this.treeElement = treeElement;

        node.element ??= this.treeElement;
        this.element = node.element;

    }

    public addDropHint(position: Position): DropHint {
        if (this.mustShowBorderDropHint(position)) {
            return new BorderDropHint(this.element, this.getScrollLeft());
        } else {
            return new GhostDropHint(this.node, this.element, position);
        }
    }

    public deselect(): void {
        this.element.classList.remove("html-tree-selected");

        const titleSpan = this.getTitleSpan();
        titleSpan.removeAttribute("tabindex");
        titleSpan.setAttribute("aria-selected", "false");

        titleSpan.blur();
    }

    public select(mustSetFocus: boolean): void {
        this.element.classList.add("html-tree-selected");

        const titleSpan = this.getTitleSpan();
        const tabIndex = this.tabIndex;

        // Check for null or undefined
        if (tabIndex != null) {
            titleSpan.setAttribute("tabindex", tabIndex.toString());
        }

        titleSpan.setAttribute("aria-selected", "true");

        if (mustSetFocus) {
            titleSpan.focus();
        }
    }

    protected getTitleSpan(): HTMLSpanElement {
        return this.element.querySelector(
            ":scope > .html-tree-element > span.html-tree-title",
        ) as HTMLSpanElement;
    }

    protected getUl(): HTMLUListElement {
        return this.element.querySelector(":scope > ul") as HTMLUListElement;
    }

    protected mustShowBorderDropHint(position: Position): boolean {
        return position === "inside";
    }
}

export default NodeElement;
