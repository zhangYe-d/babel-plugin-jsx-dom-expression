import { pluginTester } from "babel-plugin-tester";
import plugin from "../src/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

pluginTester({
  plugin,
  pluginOptions: {
    moduleName: `../../mockModule`,
  },
  title: "transform jsx",
  fixtures: path.join(__dirname, "__fixtures__"),
  snapshot: true,
  fixtureOutputExt: "js",
});
