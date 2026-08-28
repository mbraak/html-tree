import type { ClassNames } from "./classNames";
import type { LoadData, TriggerEvent } from "./methodTypes";
import type { Node, NodeData } from "./node";
import type { DataFilter, OnLoadFailed } from "./options";
import type RequestUrl from "./requestUrl";

export type HandleFinishedLoading = () => void;

interface DataLoaderParams {
    classNames: ClassNames;
    dataFilter?: DataFilter;
    loadData: LoadData;
    onLoadFailed?: OnLoadFailed;
    treeElement: HTMLElement;
    triggerEvent: TriggerEvent;
}

type HandleSuccess = (data: NodeData[]) => void;

export default class DataLoader {
    private abortController: AbortController;
    private classNames: ClassNames;
    private dataFilter?: DataFilter;
    private loadData: LoadData;
    private onLoadFailed?: OnLoadFailed;
    private treeElement: HTMLElement;
    private triggerEvent: TriggerEvent;

    constructor({
        classNames,
        dataFilter,
        loadData,
        onLoadFailed,
        treeElement,
        triggerEvent,
    }: DataLoaderParams) {
        this.abortController = new AbortController();
        this.classNames = classNames;
        this.dataFilter = dataFilter;
        this.loadData = loadData;
        this.onLoadFailed = onLoadFailed;
        this.treeElement = treeElement;
        this.triggerEvent = triggerEvent;
    }

    // Abort pending requests; no more data is loaded and no more events are triggered.
    public deinit(): void {
        this.abortController.abort();
    }

    public loadFromUrl(
        url: RequestUrl,
        parentNode?: Node,
        onFinished?: HandleFinishedLoading,
    ): void {
        const element = this.getDomElement(parentNode);
        this.addLoadingClass(element);
        this.notifyLoading(true, element, parentNode);

        const stopLoading = (): void => {
            this.removeLoadingClass(element);
            this.notifyLoading(false, element, parentNode);
        };

        const handleSuccess = (data: NodeData[]): void => {
            stopLoading();
            this.loadData(this.parseData(data), parentNode);

            if (onFinished && typeof onFinished === "function") {
                onFinished();
            }
        };

        const handleError = (response: Response): void => {
            stopLoading();

            if (this.onLoadFailed) {
                this.onLoadFailed(response);
            }
        };

        void this.submitRequest(url, handleSuccess, handleError);
    }

    private addLoadingClass(element: HTMLElement): void {
        element.classList.add(this.classNames.loading);
    }

    private getDomElement(parentNode?: Node): HTMLElement {
        if (parentNode?.element) {
            return parentNode.element;
        } else {
            return this.treeElement;
        }
    }

    private notifyLoading(
        isLoading: boolean,
        element: HTMLElement,
        node?: Node,
    ): void {
        this.triggerEvent("tree.loading_data", {
            element,
            isLoading,
            node: node ?? null,
        });
    }

    private parseData(data: NodeData[]): NodeData[] {
        if (this.dataFilter) {
            return this.dataFilter(data);
        } else {
            return data;
        }
    }

    private removeLoadingClass(element: HTMLElement): void {
        element.classList.remove(this.classNames.loading);
    }

    private async submitRequest(
        url: RequestUrl,
        handleSuccess: HandleSuccess,
        handleError: OnLoadFailed,
    ): Promise<void> {
        const headers = { "Content-Type": "application/json" };
        const signal = this.abortController.signal;

        url.setSearchParam("_", Date.now().toString());

        let response;

        try {
            response = await fetch(url.toString(), { headers, signal });
        } catch (error) {
            if (signal.aborted) {
                // The request was aborted by deinit.
                return;
            }

            throw error;
        }

        if (response.ok) {
            const data = await response.json() as NodeData[];
            handleSuccess(data);
        } else {
            handleError(response);
        }
    }
}
