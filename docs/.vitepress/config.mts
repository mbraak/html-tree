import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/html-tree/",
  description: "Tree widget in plain javascript",
  themeConfig: {
    editLink: {
      pattern: "https://github.com/mbraak/html-tree/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    footer: {
      copyright: "Released under the Apache 2.0 License.",
    },
    nav: [
      { link: "/guide/getting-started", text: "Guide" },
      { link: "/reference/options", text: "Reference" },
      { link: "https://github.com/mbraak/html-tree", text: "GitHub" },
    ],
    search: {
      provider: "local",
    },
    sidebar: [
      {
        items: [
          { link: "/guide/getting-started", text: "Getting started" },
          { link: "/guide/data", text: "Data" },
          { link: "/guide/loading-on-demand", text: "Loading on demand" },
          { link: "/guide/selection", text: "Selection" },
          { link: "/guide/drag-and-drop", text: "Drag and drop" },
          { link: "/guide/saving-state", text: "Saving state" },
          { link: "/guide/styling", text: "Styling" },
        ],
        text: "Guide",
      },
      {
        items: [
          { link: "/reference/options", text: "Options" },
          { link: "/reference/methods", text: "Methods" },
          { link: "/reference/events", text: "Events" },
          { link: "/reference/node", text: "Node" },
        ],
        text: "Reference",
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/mbraak/html-tree" },
    ],
  },
  lang: "en-US",
  title: "html-tree",
});
