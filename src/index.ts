import type { ClassNames } from "./classNames";
import type { MoveInfo, TreeEvent, TreeEventName, TreeEvents } from "./events";
import type { PositionInfo } from "./mouseUtils";
import type { NodeData, NodeId, Position } from "./node";
import type { HtmlTreeOptions } from "./options";
import type { SavedState } from "./saveStateHandler";
import type { SelectNodeOptions } from "./selectNodeHandler";

import createClassNames from "./classNames";
import DataLoader from "./dataLoader";
import { DragAndDropHandler } from "./dragAndDropHandler";
import ElementsRenderer from "./elementsRenderer";
import KeyHandler from "./keyHandler";
import MouseHandler from "./mouseHandler";
import { Node } from "./node";
import NodeElement from "./nodeElement";
import FolderElement from "./nodeElement/folderElement";
import { getOffsetTop } from "./positionUtils";
import RequestUrl from "./requestUrl";
import SaveStateHandler from "./saveStateHandler";
import ScrollHandler from "./scrollHandler";
import SelectNodeHandler from "./selectNodeHandler";
import setDefaultOptions from "./setDefaultOptions";
import triggerCustomEvent from "./triggerCustomEvent";
import __version__ from "./version";

// The types that appear in the public api. Consumers cannot import them from
// the submodules directly, because those are not exposed in package.json.
// Type only, so that the iife build keeps exposing the HtmlTree class itself
// as its global, instead of an object of named exports.
export type {
  HtmlTreeOptions,
  MoveInfo,
  Node,
  NodeData,
  NodeId,
  Position,
  SavedState,
  SelectNodeOptions,
  TreeEvent,
  TreeEventName,
  TreeEvents,
};

export type TriggerEventProvider = (
  element: HTMLElement,
  eventName: TreeEventName,
  values?: TreeEvents[TreeEventName],
) => boolean;

interface HtmlTreeParams extends Partial<HtmlTreeOptions> {
  htmlElement: HTMLElement;
  overrideTriggerEventProvider?: TriggerEventProvider,
}

export default class HtmlTree {
  public tree: Node;

  private classNames: ClassNames;
  private dataLoader: DataLoader;
  private dndHandler: DragAndDropHandler;
  private htmlElement: HTMLElement;
  private isInitialized: boolean;
  private keyHandler: KeyHandler;
  private mouseHandler: MouseHandler;
  private nodeMap: WeakMap<HTMLElement, Node>;
  private options: HtmlTreeOptions;
  private renderer: ElementsRenderer;
  private saveStateHandler: SaveStateHandler;
  private scrollHandler: ScrollHandler;
  private selectNodeHandler: SelectNodeHandler;
  private triggerEventProvider: TriggerEventProvider;

  constructor({ htmlElement, overrideTriggerEventProvider, ...options }: HtmlTreeParams) {
    this.htmlElement = htmlElement;
    this.options = setDefaultOptions(htmlElement, options);
    this.classNames = createClassNames(this.options);
    this.triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;

    this.isInitialized = false;
    this.tree = new Node({}, true);
    this.nodeMap = new WeakMap();

    const {
      autoEscape,
      buttonLeft,
      closedIcon,
      dataFilter,
      dragAndDrop,
      keyboardSupport,
      onCanMove,
      onCanMoveTo,
      onCreateLi,
      onDragMove,
      onDragStop,
      onGetStateFromStorage,
      onIsMoveHandle,
      onLoadFailed,
      onSetStateFromStorage,
      openedIcon,
      openFolderDelay,
      rtl,
      saveState: saveStateOption,
      showEmptyFolder,
      slide,
      tabIndex,
    } = this.options;

    const classNames = this.classNames;
    const closeNode = this.closeNode.bind(this);
    const getNodeElement = this.getNodeElement.bind(this);
    const getNodeElementForNode = this.getNodeElementForNode.bind(this);
    const getNodeById = this.getNodeById.bind(this);
    const getSelectedNode = this.getSelectedNode.bind(this);
    const getTree = this.getTree.bind(this);
    const isFocusOnTree = this.isFocusOnTree.bind(this);
    const loadData = this.loadData.bind(this);
    const openNode = this.openNode.bind(this);
    const openParents = this.openParents.bind(this);
    const refreshElements = this.refreshElements.bind(this);
    const refreshHitAreas = this.refreshHitAreas.bind(this);
    const setNodeElement = this.setNodeElement.bind(this);
    const treeElement = this.htmlElement;
    const triggerEvent = this.triggerEvent.bind(this);

    const saveState = () => {
      saveStateHandler.saveState();
    }

    const selectNodeHandler = new SelectNodeHandler({
      getNodeById,
      getNodeElementForNode,
      getOnCanSelectNode: () => this.options.onCanSelectNode,
      getSelectable: () => this.options.selectable,
      openParents,
      saveState,
      triggerEvent
    });

    const addToSelection =
      selectNodeHandler.addToSelection.bind(selectNodeHandler);
    const getSelectedNodes =
      selectNodeHandler.getSelectedNodes.bind(selectNodeHandler);
    const isNodeSelected =
      selectNodeHandler.isNodeSelected.bind(selectNodeHandler);
    const removeFromSelection =
      selectNodeHandler.removeFromSelection.bind(selectNodeHandler);
    const selectNode = selectNodeHandler.selectSingleNode.bind(selectNodeHandler);

    const getMouseDelay = () => this.options.startDndDelay ?? 0;

    const dataLoader = new DataLoader({
      classNames,
      dataFilter,
      loadData,
      onLoadFailed,
      treeElement,
      triggerEvent,
    });

    const saveStateHandler = new SaveStateHandler({
      addToSelection,
      getNodeById,
      getSelectedNodes,
      getTree,
      onGetStateFromStorage,
      onSetStateFromStorage,
      openNode,
      refreshElements,
      removeFromSelection,
      saveState: saveStateOption,
    });

    const scrollHandler = new ScrollHandler({
      refreshHitAreas,
      treeElement,
    });

    const getScrollLeft = scrollHandler.getScrollLeft.bind(scrollHandler);

    const dndHandler = new DragAndDropHandler({
      autoEscape,
      classNames,
      getNodeElement,
      getNodeElementForNode,
      getScrollLeft,
      getTree,
      onCanMove,
      onCanMoveTo,
      onDragMove,
      onDragStop,
      onIsMoveHandle,
      openFolderDelay,
      openNode,
      refreshElements,
      slide,
      treeElement,
      triggerEvent,
    });

    const keyHandler = new KeyHandler({
      closeNode,
      getSelectedNode,
      isFocusOnTree,
      keyboardSupport,
      openNode,
      selectNode,
    });

    const renderer = new ElementsRenderer({
      autoEscape,
      buttonLeft,
      classNames,
      closedIcon,
      dragAndDrop,
      getTree,
      htmlElement: treeElement,
      isNodeSelected,
      onCreateLi,
      openedIcon,
      rtl,
      setNodeElement,
      showEmptyFolder,
      tabIndex,
    });

    const getNode = this.getNode.bind(this);
    const onMouseCapture = this.mouseCapture.bind(this);
    const onMouseDrag = this.mouseDrag.bind(this);
    const onMouseStart = this.mouseStart.bind(this);
    const onMouseStop = this.mouseStop.bind(this);

    const mouseHandler = new MouseHandler({
      classNames,
      element: treeElement,
      getMouseDelay,
      getNode,
      onClickButton: this.toggle.bind(this),
      onClickTitle: selectNode,
      onMouseCapture,
      onMouseDrag,
      onMouseStart,
      onMouseStop,
      triggerEvent,
      useContextMenu: this.options.useContextMenu,
    });

    this.dataLoader = dataLoader;
    this.dndHandler = dndHandler;
    this.keyHandler = keyHandler;
    this.mouseHandler = mouseHandler;
    this.renderer = renderer;
    this.saveStateHandler = saveStateHandler;
    this.scrollHandler = scrollHandler;
    this.selectNodeHandler = selectNodeHandler;

    this.initData();
  }

  // Add a node after an existing node.
  public addNodeAfter(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addAfter(newNodeInfo);

    if (newNode) {
      this.refreshElements(existingNode.parent);
    }

    return newNode;
  }

  // Add a node before another node.
  public addNodeBefore(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addBefore(newNodeInfo);

    if (newNode) {
      this.refreshElements(existingNode.parent);
    }

    return newNode;
  }

  // Add a node as parent node of an existing node.
  public addParentNode(
    newNodeInfo: NodeData,
    existingNode: Node,
  ): Node | null {
    const newNode = existingNode.addParent(newNodeInfo);

    if (newNode) {
      this.refreshElements(newNode.parent);
    }

    return newNode;
  }

  public addToSelection(node: Node, mustSetFocus?: boolean) {
    this.selectNodeHandler.addToSelection(node);
    this.openParents(node);

    this.getNodeElementForNode(node).select(mustSetFocus ?? true);

    this.saveState();
  }

  // Add a node as child of another node.
  public appendNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.append(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  public closeNode(node: Node, slideParam?: boolean): void {
    const slide = slideParam ?? this.options.slide;

    if (node.isFolder() || node.isEmptyFolder) {
      this.createFolderElement(node).close(
        slide,
        this.options.animationSpeed,
      );

      this.saveState();
    }
  }

  public deinit(): void {
    this.htmlElement.textContent = '';

    this.dataLoader.deinit();
    this.keyHandler.deinit();
    this.mouseHandler.deinit();

    this.tree = new Node({}, true);
  }

  // Return the tree node for an HTMl element.
  public getNode(element: HTMLElement): Node | null {
    const liElement = element.closest<HTMLElement>(
      `li.${this.classNames.common}`,
    );

    if (liElement) {
      return this.nodeMap.get(liElement) ?? null;
    } else {
      return null;
    }
  }

  public getNodeByCallback(callback: (node: Node) => boolean): Node | null {
    return this.tree.getNodeByCallback(callback);
  }

  public getNodeById(nodeId: NodeId): Node | null {
    return this.tree.getNodeById(nodeId);
  }

  public getNodeByName(name: string): Node | null {
    return this.tree.getNodeByName(name);
  }

  public getNodeByNameMustExist(name: string): Node {
    return this.tree.getNodeByNameMustExist(name);
  }

  public getNodesByProperty(key: string, value: unknown): Node[] {
    return this.tree.getNodesByProperty(key, value);
  }

  // Return the node that is selected.
  public getSelectedNode(): false | Node {
    return this.selectNodeHandler.getSelectedNode();
  }

  public getSelectedNodes(): Node[] {
    return this.selectNodeHandler.getSelectedNodes();
  }

  public getState(): null | SavedState {
    return this.saveStateHandler.getState();
  }

  public getStateFromStorage(): null | SavedState {
    return this.saveStateHandler.getStateFromStorage();
  }

  public getTree(): Node {
    return this.tree;
  }

  public getVersion(): string {
    return __version__;
  }

  public isDragging(): boolean {
    return this.dndHandler.isDragging;
  }

  public isNodeSelected(node: Node): boolean {
    return this.selectNodeHandler.isNodeSelected(node);
  }

  public loadData(data: NodeData[] | null, parentNode?: Node): void {
    if (data) {
      if (parentNode) {
        this.deselectNodes(parentNode);
        this.loadSubtree(data, parentNode);
      } else {
        this.initTree(data);
      }

      if (this.isDragging()) {
        this.dndHandler.refresh();
      }
    }

    this.triggerEvent("tree.set_data", {
      node: parentNode,
      treeData: data ?? undefined,
    });
  }

  public async loadDataFromUrl(
    inputUrl?: string,
    parentNode?: Node
  ): Promise<void> {
    const url = inputUrl ? new RequestUrl(inputUrl) : this.createRequestUrl(parentNode);

    if (url) {
      await this.dataLoader.loadFromUrl(url, parentNode);
    }
  }

  public moveDown() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveDown(selectedNode);
    }
  }

  // Move a node inside the tree.
  public moveNode(
    node: Node,
    targetNode: Node,
    position: Position,
  ): void {
    this.tree.moveNode(node, targetNode, position);
    this.refreshElements(null);
  }

  public moveUp() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this.keyHandler.moveUp(selectedNode);
    }
  }

  public async openNode(
    inputNode: Node,
    inputSlide?: boolean
  ): Promise<void> {
    const slide = inputSlide ?? this.options.slide;

    const doOpenNode = async (
      node: Node,
      slideOption: boolean
    ): Promise<void> => {
      if (!inputNode.children.length) {
        return;
      }

      const folderElement = this.createFolderElement(node);

      await folderElement.open(
        slideOption,
        this.options.animationSpeed,
      );
    };

    if (inputNode.isFolder() || inputNode.isEmptyFolder) {
      if (inputNode.load_on_demand) {
        await this.loadFolderOnDemand(inputNode, slide);
      } else {
        let parent = inputNode.parent;

        while (parent) {
          // nb: do not open root element
          if (parent.parent) {
            await doOpenNode(parent, false);
          }
          parent = parent.parent;
        }

        await doOpenNode(inputNode, slide);

        this.saveState();
      }
    }
  }

  // Add a node before another node.
  public prependNode(newNodeInfo: NodeData, parentNode: Node): Node {
    const node = parentNode.prepend(newNodeInfo);

    this.refreshElements(parentNode);

    return node;
  }

  public refresh() {
    this.refreshElements(null);
  }

  public refreshHitAreas() {
    this.dndHandler.refresh();
  }

  public removeFromSelection(node: Node) {
    this.selectNodeHandler.removeFromSelection(node);

    this.getNodeElementForNode(node).deselect();
    this.saveState();
  }

  // Remove the node from the tree.
  public removeNode(node: Node): void {
    this.selectNodeHandler.removeFromSelection(node, true); // including children

    const parent = node.parent;
    node.remove();
    this.refreshElements(parent);
  }

  public scrollToNode(node: Node) {
    if (!node.element) {
      return;
    }

    const top =
      getOffsetTop(node.element) -
      getOffsetTop(this.htmlElement);

    this.scrollHandler.scrollToY(top);
  }

  public selectNode(
    node: Node | null,
    options?: SelectNodeOptions,
  ): void {
    if (!node) {
      // Called with empty node -> deselect current node
      this.deselectCurrentNode();
      this.saveStateHandler.saveState();
      return;
    }

    this.selectNodeHandler.selectSingleNode(node, options);
  }

  public setOption(option: string, value: unknown) {
    (this.options as unknown as Record<string, unknown>)[option] = value;
  }

  public setState(state: SavedState) {
    this.saveStateHandler.setInitialState(state);
    this.refreshElements(null);
  }

  public toggle(node: Node, slideParam: boolean | null = null) {
    const slide = slideParam ?? this.options.slide;

    if (node.is_open) {
      this.closeNode(node, slide);
    } else {
      void this.openNode(node, slide);
    }
  }

  // Return tree as json string.
  public toJson(): string {
    return JSON.stringify(this.tree.getData());
  }

  // Update the data of a node in the tree.
  public updateNode(node: Node, data: NodeData): void {
    const idIsChanged =
      typeof data === "object" && data.id && data.id !== node.id;

    if (idIsChanged) {
      this.tree.removeNodeFromIndex(node);
    }

    node.setData(data);

    if (idIsChanged) {
      this.tree.addNodeToIndex(node);
    }

    if (
      typeof data === "object" &&
      data.children &&
      data.children instanceof Array
    ) {
      node.removeChildren();

      if (data.children.length) {
        node.loadFromData(data.children);
      }
    }

    this.refreshElements(node);
  }

  private createFolderElement(node: Node) {
    const classNames = this.classNames;
    const closedIconElement = this.renderer.closedIconElement;
    const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
      this.scrollHandler,
    );
    const openedIconElement = this.renderer.openedIconElement;
    const tabIndex = this.options.tabIndex;
    const treeElement = this.htmlElement;
    const triggerEvent = this.triggerEvent.bind(this);

    return new FolderElement({
      classNames,
      closedIconElement,
      getScrollLeft,
      node,
      openedIconElement,
      tabIndex,
      treeElement,
      triggerEvent,
    });
  }

  private createNodeElement(node: Node) {
    const classNames = this.classNames;
    const getScrollLeft = this.scrollHandler.getScrollLeft.bind(
      this.scrollHandler,
    );
    const tabIndex = this.options.tabIndex;
    const treeElement = this.htmlElement;

    return new NodeElement({
      classNames,
      getScrollLeft,
      node,
      tabIndex,
      treeElement,
    });
  }

  /* Create a RequestUrl based on the url in the options.
    * Add a 'node' query parameter for loading on demand
    * Add a 'selected_node' query parameter if a node is selected.
  */
  private createRequestUrl(node?: Node): null | RequestUrl {
    const dataUrl = this.options.dataUrl;

    let url;

    if (typeof dataUrl === "function") {
      url = dataUrl(node);
    } else {
      url = dataUrl;
    }

    if (!url) {
      return null;
    }

    const requestUrl = new RequestUrl(url);

    if (node?.id) {
      // Load on demand of a subtree; add node parameter
      requestUrl.setSearchParam('node', node.id.toString());
    } else {
      // Add selected_node parameter
      const selectedNodeId = this.getNodeIdToBeSelected();
      if (selectedNodeId) {
        requestUrl.setSearchParam('selected_node', selectedNodeId.toString());
      }
    }

    return requestUrl;
  }

  private deselectCurrentNode(): void {
    const node = this.getSelectedNode();
    if (node) {
      this.removeFromSelection(node);
    }
  }

  // Deselect the children of the node.
  private deselectNodes(parentNode: Node): void {
    const selectedNodesUnderParent =
      this.selectNodeHandler.getSelectedNodesUnder(parentNode);
    for (const n of selectedNodesUnderParent) {
      this.selectNodeHandler.removeFromSelection(n);
    }
  }

  // Get the maximum level for auto open
  private getAutoOpenMaxLevel(): number {
    if (this.options.autoOpen === true) {
      return -1;
    } else if (typeof this.options.autoOpen === "number") {
      return this.options.autoOpen;
    } else if (typeof this.options.autoOpen === "string") {
      return parseInt(this.options.autoOpen, 10);
    }

    /* istanbul ignore next @preserve */
    return 0;
  }

  private getNodeElement(element: HTMLElement): NodeElement | null {
    const node = this.getNode(element);
    if (node) {
      return this.getNodeElementForNode(node);
    } else {
      return null;
    }
  }

  private getNodeElementForNode(node: Node): NodeElement {
    if (node.isFolder()) {
      return this.createFolderElement(node);
    } else {
      return this.createNodeElement(node);
    }
  }

  private getNodeIdToBeSelected(): NodeId | null {
    return this.saveStateHandler.getNodeIdToBeSelected();
  }

  private initData(): void {
    if (this.options.data) {
      this.loadData(this.options.data);
    } else {
      const dataUrl = this.createRequestUrl();

      if (dataUrl) {
        void this.loadDataFromUrl();
      } else {
        this.loadData([]);
      }
    }
  }

  private initTree(data: NodeData[]): void {
    const doInit = (): void => {
      if (!this.isInitialized) {
        this.isInitialized = true;
        this.triggerEvent("tree.init");
      }
    };

    this.tree = new this.options.nodeClass(
      null,
      true,
      this.options.nodeClass,
    );

    this.selectNodeHandler.clear();

    this.tree.loadFromData(data);

    const mustLoadOnDemand = this.setInitialState();

    this.refreshElements(null);

    if (mustLoadOnDemand) {
      // Load data on demand and then init the tree
      void this.setInitialStateOnDemand().then(doInit);
    } else {
      doInit();
    }
  }

  // Does an HTML element of the tree have the focus?
  private isFocusOnTree(): boolean {
    const activeElement = document.activeElement;

    /* istanbul ignore if */
    if (!activeElement) {
      return false;
    }

    // The keyboard must still work for input elements.
    const tagName = activeElement.tagName;
    if (tagName !== "A" && tagName !== "SPAN") {
      return false;
    }

    const node = this.getNode(activeElement as HTMLElement);
    return node?.tree === this.tree;
  }

  private isSelectedNodeInSubtree(subtree: Node): boolean {
    const selectedNode = this.getSelectedNode();

    if (!selectedNode) {
      return false;
    } else {
      return subtree === selectedNode || subtree.isParentOf(selectedNode);
    }
  }

  private async loadFolderOnDemand(
    node: Node,
    slide: boolean,
  ): Promise<void> {
    node.is_loading = true;

    await this.loadDataFromUrl(undefined, node);

    await this.openNode(node, slide);
  }

  private loadSubtree(data: NodeData[], parentNode: Node): void {
    parentNode.loadFromData(data);

    parentNode.load_on_demand = false;
    parentNode.is_loading = false;

    this.refreshElements(parentNode);
  }

  private mouseCapture(positionInfo: PositionInfo): boolean | null {
    if (!this.options.dragAndDrop) {
      return false;
    }

    return this.dndHandler.mouseCapture(positionInfo);
  }

  private mouseDrag(positionInfo: PositionInfo): boolean {
    /* istanbul ignore if */
    if (!this.options.dragAndDrop) {
      return false;
    }

    const result = this.dndHandler.mouseDrag(positionInfo);
    this.scrollHandler.checkScrolling(positionInfo);
    return result;
  }

  private mouseStart(positionInfo: PositionInfo): boolean {
    /* istanbul ignore if */
    if (!this.options.dragAndDrop) {
      return false;
    }

    return this.dndHandler.mouseStart(positionInfo);
  }

  private mouseStop(positionInfo: PositionInfo): boolean {
    /* istanbul ignore if */
    if (!this.options.dragAndDrop) {
      return false;
    }

    this.scrollHandler.stopScrolling();
    return this.dndHandler.mouseStop(positionInfo);
  }

  private openParents(node: Node) {
    const parent = node.parent;

    if (parent?.parent && !parent.is_open) {
      void this.openNode(parent, false);
    }
  }

  /*
  Redraw the tree or part of the tree.
    from_node: redraw this subtree
  */
  private refreshElements(fromNode: Node | null): void {
    const mustSetFocus = this.isFocusOnTree();
    const mustSelect = fromNode
      ? this.isSelectedNodeInSubtree(fromNode)
      : false;

    this.renderer.render(fromNode);

    if (mustSelect) {
      this.selectCurrentNode(mustSetFocus);
    }

    this.triggerEvent("tree.refresh");
  }

  private saveState(): void {
    this.saveStateHandler.saveState();
  }

  private selectCurrentNode(mustSetFocus: boolean): void {
    const node = this.getSelectedNode();
    if (node) {
      const nodeElement = this.getNodeElementForNode(node);
      nodeElement.select(mustSetFocus);
    }
  }

  // Set initial state, either by restoring the state or auto-opening nodes
  // result: must load nodes on demand?
  private setInitialState(): boolean {
    const restoreState = (): [boolean, boolean] => {
      // result: is state restored, must load on demand?
      const state = this.saveStateHandler.getStateFromStorage();

      if (!state) {
        return [false, false];
      } else {
        const mustLoadOnDemand =
          this.saveStateHandler.setInitialState(state);

        // return true: the state is restored
        return [true, mustLoadOnDemand];
      }
    };

    const autoOpenNodes = (): boolean => {
      // result: must load on demand?
      if (this.options.autoOpen === false) {
        return false;
      }

      const maxLevel = this.getAutoOpenMaxLevel();
      let mustLoadOnDemand = false;

      this.tree.iterate((node: Node, level: number) => {
        if (node.load_on_demand) {
          mustLoadOnDemand = true;
          return false;
        } else if (!node.hasChildren()) {
          return false;
        } else {
          node.is_open = true;
          return level !== maxLevel;
        }
      });

      return mustLoadOnDemand;
    };

    let [isRestored, mustLoadOnDemand] = restoreState(); // eslint-disable-line prefer-const

    if (!isRestored) {
      mustLoadOnDemand = autoOpenNodes();
    }

    return mustLoadOnDemand;
  }

  // Set the initial state for nodes that are loaded on demand
  private async setInitialStateOnDemand(): Promise<void> {
    return new Promise(resolve => {
      const restoreState = (): boolean => {
        const state = this.saveStateHandler.getStateFromStorage();

        if (!state) {
          return false;
        } else {
          void this.saveStateHandler.setInitialStateOnDemand(
            state,
          ).then(() => {
            resolve();
          });

          return true;
        }
      };

      const autoOpenNodes = (): void => {
        const maxLevel = this.getAutoOpenMaxLevel();
        let loadingCount = 0;

        const loadAndOpenNode = (node: Node): void => {
          loadingCount += 1;
          void this.openNode(node, false).then(() => {
            loadingCount -= 1;
            openNodes();
          });
        };

        const openNodes = (): void => {
          this.tree.iterate((node: Node, level: number) => {
            if (node.load_on_demand) {
              if (!node.is_loading) {
                loadAndOpenNode(node);
              }

              return false;
            } else {
              void this.openNode(node, false);

              return level !== maxLevel;
            }
          });

          if (loadingCount === 0) {
            resolve();
          }
        };

        openNodes();
      };

      if (!restoreState()) {
        autoOpenNodes();
      }
    });
  }

  // Set this HTML element to this node in the node map.
  private setNodeElement(element: HTMLElement, node: Node) {
    this.nodeMap.set(element, node);
  }

  private triggerEvent<Name extends TreeEventName>(eventName: Name, values?: TreeEvents[Name]): boolean {
    return this.triggerEventProvider(this.htmlElement, eventName, values)
  }
}