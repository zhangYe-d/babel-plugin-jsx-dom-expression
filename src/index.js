import { addNamed } from "@babel/helper-module-imports";

export default () => {
  return {
    visitor: {
      JSXElement: {
        exit(path) {
          const id = addNamed(path, "createElement", "dom", {
            nameHint: `_$createElement`,
          });
          log(id);
          // log(path.scope.getProgramParent().data.imports);
        },
      },
    },
  };
};

const log = (content) => console.log(content);
