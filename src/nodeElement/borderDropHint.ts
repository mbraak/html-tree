import type { DropHint } from "htmlTree/dragAndDropHandler/types";

class BorderDropHint implements DropHint {
    private hint?: HTMLElement;

    constructor(element: HTMLElement, scrollLeft: number) {
        const div = element.querySelector(":scope > .html-tree-element");

        if (!div) {
            this.hint = undefined;
            return;
        }

        const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
        const height = Math.max(element.clientHeight - 4, 0);

        const hint = document.createElement("span");
        hint.className = "html-tree-border";
        hint.style.width = `${width}px`;
        hint.style.height = `${height}px`;

        this.hint = hint;

        div.append(this.hint);
    }

    public remove(): void {
        this.hint?.remove();
    }
}

export default BorderDropHint;
