import type { Node, NodeData, Position } from "./node";

export interface MoveInfo {
    do_move: () => void;
    moved_node: Node;
    original_event: Event;
    position: Position;
    previous_parent: Node | null;
    target_node: Node;
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
        click_event: MouseEvent;
        node: Node;
    };
    "tree.close": {
        node: Node;
    };
    "tree.contextmenu": {
        click_event: MouseEvent;
        node: Node;
    };
    "tree.dblclick": {
        click_event: MouseEvent;
        node: Node;
    };
    "tree.init": undefined;
    "tree.load_data": {
        parent_node: Node | undefined;
        tree_data: NodeData[] | null;
    };
    "tree.loading_data": {
        element: HTMLElement;
        isLoading: boolean;
        node: Node | null;
    };
    "tree.move": {
        move_info: MoveInfo;
    };
    "tree.open": {
        node: Node;
    };
    "tree.refresh": undefined;
    "tree.select": TreeSelectDetail;
}

export type TreeSelectDetail =
    | {
          // A node is selected.
          deselected_node: Node | null;
          node: Node;
      }
    | {
          // The selected node is deselected.
          node: null;
          previous_node: Node;
      };

type TreeEventMap = {
    [Name in TreeEventName]: TreeEvent<Name>;
};

// Type `addEventListener("tree.select", ...)` on elements, the document and the window.
declare global {
    interface DocumentEventMap extends TreeEventMap {}

    interface HTMLElementEventMap extends TreeEventMap {}

    interface WindowEventMap extends TreeEventMap {}
}
