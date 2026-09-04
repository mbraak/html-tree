import DefaultTheme from "vitepress/theme";

import type { Theme } from "vitepress";

import TreeDemo from "./TreeDemo.vue";

import "../../../tree_element.css";
import "./demo.css";

export default {
  enhanceApp: ({ app }) => {
    app.component("TreeDemo", TreeDemo);
  },
  extends: DefaultTheme,
} satisfies Theme;
