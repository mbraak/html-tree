import type { Node, NodeData, Position } from "./node";

export interface MoveInfo {
    doMove: () => void;
    movedNode: Node;
    originalEvent: Event;
    position: Position;
    previousParent: Node | null;
    targetNode: Node;
}

// The CustomEvent of a tree event, for example `TreeEvent<"tree.select">`.
export type TreeEvent<Name extends TreeEventName = TreeEventName> = CustomEvent<
    TreeEvents[Name]
>;

export type TreeEventName = keyof TreeEvents;

// The events that the tree dispatches, and the type of their `detail`.
// `undefined` means that the event has no `detail`.
export interface TreeEvents {
    "tree.click": {
        node: Node;
        originalEvent: MouseEvent;
    };
    "tree.close": {
        node: Node;
    };
    "tree.contextmenu": {
        node: Node;
        originalEvent: MouseEvent;
    };
    "tree.dblclick": {
        node: Node;
        originalEvent: MouseEvent;
    };
    "tree.deselect": {
        node: Node;
    };
    "tree.init": undefined;
    "tree.loaded_data": {
        element: HTMLElement;
        node?: Node;
    };
    "tree.loading_data": {
        element: HTMLElement;
        node?: Node;
    };
    "tree.move": {
        moveInfo: MoveInfo;
    };
    "tree.open": {
        node: Node;
    };
    "tree.refresh": undefined;
    "tree.select": {
        deselectedNode: Node | null;
        node: Node;
    };
    "tree.set_data": {
        node?: Node;
        treeData?: NodeData[];
    };

}

type TreeEventMap = {
    [Name in TreeEventName]: TreeEvent<Name>;
};

// Type `addEventListener("tree.select", ...)` on elements, the document and the window.
declare global {
    interface DocumentEventMap extends TreeEventMap { }

    interface HTMLElementEventMap extends TreeEventMap { }

    interface WindowEventMap extends TreeEventMap { }
}
