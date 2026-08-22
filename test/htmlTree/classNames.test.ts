import createClassNames, { DEFAULT_CLASS_PREFIX } from "htmlTree/classNames";

describe("createClassNames", () => {
    it("derives the class names from the prefix", () => {
        const classNames = createClassNames({
            classPrefix: DEFAULT_CLASS_PREFIX,
        });

        expect(classNames).toStrictEqual({
            border: "html-tree-border",
            circle: "html-tree-circle",
            closed: "html-tree-closed",
            common: "html-tree-common",
            dnd: "html-tree-dnd",
            dragging: "html-tree-dragging",
            element: "html-tree-element",
            folder: "html-tree-folder",
            ghost: "html-tree-ghost",
            inside: "html-tree-inside",
            line: "html-tree-line",
            loading: "html-tree-loading",
            moving: "html-tree-moving",
            rtl: "html-tree-rtl",
            selected: "html-tree-selected",
            title: "html-tree-title",
            titleButtonLeft: "html-tree-title-button-left",
            titleButtonRight: "html-tree-title-button-right",
            titleFolder: "html-tree-title-folder",
            toggler: "html-tree-toggler",
            togglerLeft: "html-tree-toggler-left",
            togglerRight: "html-tree-toggler-right",
            tree: "html-tree",
        });
    });

    it("uses a custom prefix", () => {
        const classNames = createClassNames({ classPrefix: "my-tree" });

        expect(classNames).toContainEntries([
            ["common", "my-tree-common"],
            ["element", "my-tree-element"],
            ["titleButtonLeft", "my-tree-title-button-left"],
            ["tree", "my-tree"],
        ]);
    });

    it("overrides the common and the tree class name", () => {
        const classNames = createClassNames({
            classPrefix: "my-tree",
            commonClassName: "my-common",
            treeClassName: "my-root",
        });

        expect(classNames).toContainEntries([
            ["common", "my-common"],
            ["element", "my-tree-element"],
            ["tree", "my-root"],
        ]);
    });
});
