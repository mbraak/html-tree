import createClassNames, { DEFAULT_CLASS_PREFIX } from "htmlTree/classNames";

/* The class names of a tree with the default options; use it for the components
 * that are created directly in a test, instead of by HtmlTree.
 */
const defaultClassNames = createClassNames({
    classPrefix: DEFAULT_CLASS_PREFIX,
});

export default defaultClassNames;
