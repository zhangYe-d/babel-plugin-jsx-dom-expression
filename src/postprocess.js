import { callExpression } from "@babel/types";
import { registerImportMethod } from "./transform.js";
import { types as t } from "@babel/core";
export const postprocess = (path) => {
  const templateInfos = path.scope.getProgramParent().data.templateInfos;

  if (templateInfos) {
    const templateMethod = registerImportMethod(path, "template", "solid/web");
    const declarators = templateInfos.map(({ identifier, template }) =>
      t.variableDeclarator(
        identifier,
        callExpression(templateMethod, [
          t.templateLiteral([t.templateElement({ raw: template })], []),
        ])
      )
    );

    path.node.body.unshift(t.variableDeclaration("var", declarators));
  }
};
