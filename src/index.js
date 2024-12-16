import SyntaxJsx from "@babel/plugin-syntax-jsx";
import { transformJsx } from "./transform.js";
import { postprocess } from "./postprocess.js";

export default () => {
  return {
    inherits: SyntaxJsx.default,
    visitor: {
      JSXElement: transformJsx,
      Program: {
        exit: postprocess,
      },
    },
  };
};
