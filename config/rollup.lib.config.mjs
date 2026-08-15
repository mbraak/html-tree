import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import tsConfigPaths from "rollup-plugin-tsconfig-paths";

import { getBanner } from "./banner.mjs";

// Marks the output as ES modules for node, without making the whole package
// "type": "module" - the main entry point is still a plain script.
const emitModuleType = () => ({
  name: "emit-module-type",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "package.json",
      source: `${JSON.stringify({ type: "module" }, null, 2)}\n`,
    });
  },
});

// Unbundled ES module build, used by the "module"/"exports" entry points so
// that consumers can bundle and tree shake the sources themselves.
export default {
  input: "src/index.ts",
  output: {
    // Only on the entry point: with preserveModules a plain banner would be
    // repeated in every output file.
    banner: (chunk) => (chunk.isEntry ? getBanner() : ""),
    dir: "lib",
    format: "es",
    // Keep one output file per source file, so imports stay meaningful.
    preserveModules: true,
    preserveModulesRoot: "src",
    sourcemap: true,
  },
  plugins: [
    emitModuleType(),
    // Rewrites the "htmlTree/..." path aliases to relative imports.
    tsConfigPaths(),
    resolve({ extensions: [".ts"] }),
    babel({
      babelHelpers: "bundled",
      configFile: "./config/babel.config.json",
      extensions: [".ts"],
    }),
  ],
};
