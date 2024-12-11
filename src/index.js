import SyntaxJsx from "@babel/plugin-syntax-jsx";
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
