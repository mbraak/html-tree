import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";
import serve from "rollup-plugin-serve";
import terser from "@rollup/plugin-terser";

import { getBanner } from "./banner.mjs";

const debugBuild = Boolean(process.env.DEBUG_BUILD);
const devServer = Boolean(process.env.SERVE);
const includeCoverage = Boolean(process.env.COVERAGE);

const resolvePlugin = resolve({ extensions: [".ts"] });

const babelConfigFile = includeCoverage
  ? "babel.coverage.config.json"
  : "babel.config.json";

const babelPlugin = babel({
  babelHelpers: "bundled",
  configFile: `./config/${babelConfigFile}`,
  extensions: [".ts"],
});

const plugins = [tsConfigPaths(), resolvePlugin, babelPlugin];

if (!debugBuild) {
  const terserPlugin = terser({
    mangle: {
      properties: {
        regex: /^_/,
      },
    },
    output: {
      comments: /@license/,
    },
  });
  plugins.push(terserPlugin);
}

if (devServer) {
  const servePlugin = serve({
    contentBase: ["./devserver", "./"],
    port: 8080,
  });
  plugins.push(servePlugin);
}

export default {
  input: "src/index.ts",
  output: {
    banner: getBanner(),
    file: debugBuild ? "html_tree.debug.js" : "html_tree.js",
    format: "iife",
    name: "HtmlTree",
    sourcemap: true,
  },
  plugins,
};
