import SyntaxJsx from "@babel/plugin-syntax-jsx";
import { types as t } from "@babel/core";
import { addNamed } from "@babel/helper-module-imports";
import { transformJsx } from "./transform.js";

export default () => {
  return {
    inherits: SyntaxJsx.default,
    visitor: {
      JSXElement: transformJsx,
    },
  };
};

const log = (content) => console.log(content);
