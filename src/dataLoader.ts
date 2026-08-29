import type { ClassNames } from "./classNames";
import type { LoadData, TriggerEvent } from "./methodTypes";
import type { Node, NodeData } from "./node";
import type { DataFilter, OnLoadFailed } from "./options";
import type RequestUrl from "./requestUrl";

interface DataLoaderParams {
    classNames: ClassNames;
    dataFilter?: DataFilter;
    loadData: LoadData;
    onLoadFailed?: OnLoadFailed;
    treeElement: HTMLElement;
    triggerEvent: TriggerEvent;
}

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

    public deinit(): void {
        this.abortController.abort();
    }

    public async loadFromUrl(
        url: RequestUrl,
        parentNode?: Node,
    ): Promise<void> {
        const element = parentNode?.element ?? this.treeElement;
        element.classList.add(this.classNames.loading);

        this.notifyLoading(true, element, parentNode);

        const stopLoading = (): void => {
            element.classList.remove(this.classNames.loading);
            this.notifyLoading(false, element, parentNode);
        };

        const handleResponse = async (response: Response): Promise<void> => {
            if (response.ok) {
                const data = (await response.json()) as NodeData[];

                stopLoading();
                this.loadData(
                    this.dataFilter ? this.dataFilter(data) : data,
                    parentNode
                );
            } else {
                stopLoading();

                if (this.onLoadFailed) {
                    this.onLoadFailed(response);
                }
            }
        };

        const signal = this.abortController.signal;
        url.setSearchParam("_", Date.now().toString());

        return fetch(url.toString(), { headers: { "Content-Type": "application/json" }, signal })
            .then(handleResponse)
            .catch((error: unknown) => {
                if (this.abortController.signal.aborted) {
                    // The request was aborted by deinit.
                    return;
                }

                throw error;
            });
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
}
